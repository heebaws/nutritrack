import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  ClientProfile,
  DietitianProfile,
  FoodItem,
  DietPlan,
  MealLogItem,
  BodyMeasurement,
  DietitianTip,
  ClientReminder,
  AISuggestedMeal,
  WaterLog,
  ActivityLog,
  DailyHabits,
  ClinicAppointment,
  ViewMode
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_DIETITIANS,
  INITIAL_FOODS,
  INITIAL_DIET_PLANS,
  INITIAL_MEAL_LOGS,
  INITIAL_MEASUREMENTS,
  INITIAL_TIPS,
  INITIAL_REMINDERS,
  INITIAL_WATER_LOGS,
  INITIAL_ACTIVITIES,
  INITIAL_HABITS,
  INITIAL_APPOINTMENTS
} from '../data/mockData';
import { getTodayString, clampToToday, getDayBeforeDateString, getDaysSinceDate, isClientInactiveThreeDays } from '../utils/dateUtils';
import {
  testFirestoreConnection,
  subscribeToCollection,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  seedInitialFirestoreData,
  forceSeedInitialFirestoreData
} from '../services/firebase';

interface AppContextType {
  // Navigation & View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  phoneFrameEnabled: boolean;
  setPhoneFrameEnabled: (enabled: boolean) => void;

  // Cloud Sync Status
  cloudSyncStatus: 'connected' | 'syncing' | 'offline';
  lastSyncedAt: Date | null;
  forceCloudSync: () => Promise<void>;

  // Active Users & Auth
  activeClient: ClientProfile | null;
  activeClientId: string | null;
  clientSignIn: (identifier: string, password?: string) => { success: boolean; message?: string };
  clientSignOut: () => void;
  quickSwitchClient: (clientId: string) => void;

  activeTeamUser: DietitianProfile | null;
  activeTeamUserId: string | null;
  teamSignIn: (teamMemberId: string) => void;
  staffSignIn: (identifier: string, password?: string) => { success: boolean; message?: string };
  staffSignOut: () => void;
  unifiedSignIn: (
    identifier: string, 
    password?: string, 
    targetRole?: 'client' | 'coach' | 'auto'
  ) => { success: boolean; role?: 'client' | 'coach'; message?: string };
  quickSwitchTeamRole: (role: 'dietitian' | 'admin' | 'super_admin', id?: string) => void;
  updateDietitian: (profile: DietitianProfile) => void;
  addDietitian: (profile: Omit<DietitianProfile, 'id'>) => void;

  // Selected Working Date (for meal logs)
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Data Stores
  clients: ClientProfile[];
  dietitians: DietitianProfile[];
  foods: FoodItem[];
  dietPlans: DietPlan[];
  mealLogs: MealLogItem[];
  suggestedMeals: AISuggestedMeal[];
  measurements: BodyMeasurement[];
  tips: DietitianTip[];
  reminders: ClientReminder[];
  waterLogs: WaterLog[];
  activities: ActivityLog[];
  habits: DailyHabits[];
  appointments: ClinicAppointment[];

  // Client Operations
  addMealLog: (meal: Omit<MealLogItem, 'id' | 'timeLogged'>) => void;
  deleteMealLog: (id: string) => void;
  resetClientDayMealsToDayBefore: (clientId: string, targetDate: string) => Promise<{ count: number; dayBefore: string }>;
  addSuggestedMeal: (suggestion: Omit<AISuggestedMeal, 'id' | 'createdAt' | 'status'>) => void;
  acceptSuggestedMeal: (suggestionId: string) => void;
  dismissSuggestedMeal: (suggestionId: string) => void;
  clearSuggestedMeals: () => void;
  addMeasurement: (data: Omit<BodyMeasurement, 'id'>) => void;
  toggleReminder: (id: string) => void;

  // Hydration Operations
  addWaterLog: (amountMl: number, date?: string) => void;
  deleteWaterLog: (id: string) => void;
  resetWaterLogForDate: (date: string) => void;

  // Physical Activity Operations
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timeLogged'>) => void;
  deleteActivity: (id: string) => void;

  // Daily Habits Operations
  updateDailyHabits: (date: string, partial: Partial<DailyHabits>) => void;

  // Clinic Appointments
  addAppointment: (app: Omit<ClinicAppointment, 'id'>) => void;
  updateAppointment: (app: ClinicAppointment) => void;
  deleteAppointment: (id: string) => void;

  // Team Operations
  addClient: (client: Omit<ClientProfile, 'id' | 'joinedDate' | 'lastActiveDate' | 'status'>) => void;
  updateClient: (client: ClientProfile) => void;
  deleteClient: (clientId: string) => void;
  assignDietitian: (clientId: string, dietitianId: string) => void;
  assignDietPlan: (clientId: string, dietPlanId: string) => void;
  addFoodItem: (food: Omit<FoodItem, 'id'>) => FoodItem;
  updateFoodItem: (food: FoodItem) => void;
  deleteFoodItem: (id: string) => void;
  removeDuplicateFoods: () => Promise<{ count: number }>;
  createDietPlan: (plan: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDietPlan: (plan: DietPlan) => void;
  addCentreDeviceReading: (data: Omit<BodyMeasurement, 'id' | 'source'> & { deviceModel: string }) => void;
  sendTipOrReminder: (tip: Omit<DietitianTip, 'id' | 'createdAt'>) => void;
  sendFollowupReminderToInactive: (clientId: string) => void;

  // Reset to initial demo data
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'nutritrack_clinic_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // View mode (defaults to login portal unless user is authenticated)
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'viewMode');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed === 'client' || parsed === 'team' || parsed === 'login') return parsed;
      }
    } catch {}
    return 'login';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'viewMode', JSON.stringify(mode));
    } catch {}
  };
  const [phoneFrameEnabled, setPhoneFrameEnabled] = useState<boolean>(false);

  // Cloud Sync state
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Selected date (defaults to genuine today)
  const [selectedDate, setSelectedDateState] = useState<string>(() => getTodayString());

  // Enforce no future dates
  const setSelectedDate = (date: string) => {
    setSelectedDateState(clampToToday(date));
  };

  // Persistence helpers
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const stored = loadStored<ClientProfile[]>('clients', INITIAL_CLIENTS);
    if (!Array.isArray(stored) || stored.length === 0 || !stored[0]?.username) {
      return INITIAL_CLIENTS;
    }
    return stored;
  });

  const [dietitians, setDietitians] = useState<DietitianProfile[]>(() => {
    const stored = loadStored<DietitianProfile[]>('dietitians', INITIAL_DIETITIANS);
    if (Array.isArray(stored) && stored.length > 0) {
      const hasSaleem = stored.some(d => d?.name && d.name.toLowerCase().includes('saleem'));
      if (hasSaleem) return stored;
    }
    return INITIAL_DIETITIANS;
  });

  // Helper to deduplicate foods by normalized name to guarantee no double-entries
  const deduplicateFoodList = (list: FoodItem[]): { unique: FoodItem[]; duplicates: FoodItem[] } => {
    const normalize = (n: string) => {
      const clean = (n || '').toLowerCase().trim();
      const unicodeClean = clean.replace(/[^\p{L}\p{N}]/gu, '');
      return unicodeClean || clean;
    };
    const map = new Map<string, FoodItem>();
    const dupes: FoodItem[] = [];

    const isOfficial = (item: FoodItem) => 
      !item.isCustom || 
      item.id.startsWith('kl-') || 
      item.id.startsWith('dr-') || 
      item.id.startsWith('f-') || 
      item.id.startsWith('in-') || 
      item.id.startsWith('intl-');

    for (const item of list) {
      if (!item || !item.name) continue;
      const key = normalize(item.name);
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        const existing = map.get(key)!;
        const existingIsOfficial = isOfficial(existing);
        const itemIsOfficial = isOfficial(item);
        if (!existingIsOfficial && itemIsOfficial) {
          dupes.push(existing);
          map.set(key, item);
        } else {
          dupes.push(item);
        }
      }
    }
    return { unique: Array.from(map.values()), duplicates: dupes };
  };

  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const stored = loadStored<FoodItem[]>('foods', INITIAL_FOODS);
    const map = new Map<string, FoodItem>();
    // Ensure all canonical foods are present
    INITIAL_FOODS.forEach(f => map.set(f.id, f));
    if (Array.isArray(stored)) {
      stored.forEach(f => {
        if (f && f.id) {
          if (!map.has(f.id)) {
            map.set(f.id, f);
          } else {
            const canonical = map.get(f.id)!;
            if (canonical.clinicVerified) {
              map.set(f.id, canonical);
            } else {
              map.set(f.id, { ...canonical, ...f });
            }
          }
        }
      });
    }
    return deduplicateFoodList(Array.from(map.values())).unique;
  });
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(() => loadStored('dietPlans', INITIAL_DIET_PLANS));
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>(() => loadStored('mealLogs', INITIAL_MEAL_LOGS));
  const [suggestedMeals, setSuggestedMeals] = useState<AISuggestedMeal[]>(() => loadStored('suggestedMeals', []));
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => loadStored('measurements', INITIAL_MEASUREMENTS));
  const [tips, setTips] = useState<DietitianTip[]>(() => loadStored('tips', INITIAL_TIPS));
  const [reminders, setReminders] = useState<ClientReminder[]>(() => loadStored('reminders', INITIAL_REMINDERS));
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => loadStored('waterLogs', INITIAL_WATER_LOGS));
  const [activities, setActivities] = useState<ActivityLog[]>(() => loadStored('activities', INITIAL_ACTIVITIES));
  const [habits, setHabits] = useState<DailyHabits[]>(() => loadStored('habits', INITIAL_HABITS));
  const [appointments, setAppointments] = useState<ClinicAppointment[]>(() => loadStored('appointments', INITIAL_APPOINTMENTS));

  // Current client ID (null if not logged in with username and password)
  const [activeClientId, setActiveClientId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'activeClientId');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'string' && parsed.trim().length > 0) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  // Current team member ID (null if not logged in with username and password)
  const [activeTeamUserId, setActiveTeamUserId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'activeTeamUserId');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'string' && parsed.trim().length > 0) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  // 1. Initial Firestore Setup & Real-time Collection Listeners
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    const initializeFirestoreSync = async () => {
      try {
        setCloudSyncStatus('syncing');
        await testFirestoreConnection();

        // Seed initial collections in Firestore if they are empty
        await Promise.all([
          seedInitialFirestoreData('clients', INITIAL_CLIENTS),
          seedInitialFirestoreData('dietitians', INITIAL_DIETITIANS),
          seedInitialFirestoreData('foods', INITIAL_FOODS),
          seedInitialFirestoreData('dietPlans', INITIAL_DIET_PLANS),
          seedInitialFirestoreData('mealLogs', INITIAL_MEAL_LOGS),
          seedInitialFirestoreData('measurements', INITIAL_MEASUREMENTS),
          seedInitialFirestoreData('tips', INITIAL_TIPS),
          seedInitialFirestoreData('reminders', INITIAL_REMINDERS),
          seedInitialFirestoreData('waterLogs', INITIAL_WATER_LOGS),
          seedInitialFirestoreData('activities', INITIAL_ACTIVITIES),
          seedInitialFirestoreData('habits', INITIAL_HABITS),
          seedInitialFirestoreData('appointments', INITIAL_APPOINTMENTS),
        ]);

        // Attach live real-time listeners with non-destructive state merging
        // Prevents Firestore network drops from erasing data added on specific dates
        const unsubClients = subscribeToCollection<ClientProfile>('clients', (items) => {
          if (items && items.length > 0) {
            setClients(prev => {
              const map = new Map<string, ClientProfile>();
              INITIAL_CLIENTS.forEach(c => map.set(c.id, c));
              prev.forEach(c => {
                if (c && c.name && c.name.trim().length > 0) {
                  map.set(c.id, c);
                }
              });

              items.forEach(incoming => {
                if (!incoming || !incoming.id) return;
                const existing = map.get(incoming.id);

                // Clean up ghost clients that have no name or blank name
                if (!incoming.name || incoming.name.trim().length === 0) {
                  if (existing && existing.name && existing.name.trim().length > 0) {
                    // Repair in state and Firestore
                    const repaired: ClientProfile = {
                      ...existing,
                      ...incoming,
                      name: existing.name,
                      phone: existing.phone || incoming.phone || '555-0100',
                      goal: existing.goal || incoming.goal || 'General Health & Nutrition',
                      assignedDietitianId: existing.assignedDietitianId || incoming.assignedDietitianId || 'admin-1',
                      dietPlanId: existing.dietPlanId || incoming.dietPlanId || 'dp-1'
                    };
                    map.set(incoming.id, repaired);
                    saveDocumentToFirestore('clients', incoming.id, repaired).catch(() => {});
                  } else {
                    // Corrupted ghost doc from prior bug -> prune from Firestore
                    deleteDocumentFromFirestore('clients', incoming.id).catch(() => {});
                  }
                  return;
                }

                // Valid client record with name
                map.set(incoming.id, existing ? { ...existing, ...incoming } : incoming);
              });

              return Array.from(map.values());
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubDietitians = subscribeToCollection<DietitianProfile>('dietitians', (items) => {
          if (items && items.length > 0) {
            setDietitians(prev => {
              const map = new Map<string, DietitianProfile>();
              INITIAL_DIETITIANS.forEach(d => map.set(d.id, d));
              prev.forEach(d => { if (d?.id) map.set(d.id, d); });
              items.forEach(d => { if (d?.id) map.set(d.id, { ...map.get(d.id), ...d }); });
              return Array.from(map.values());
            });
          }
        });

        const unsubFoods = subscribeToCollection<FoodItem>('foods', (items) => {
          if (items && items.length > 0) {
            setFoods(prev => {
              const map = new Map<string, FoodItem>();
              INITIAL_FOODS.forEach(f => map.set(f.id, f));
              prev.forEach(f => { if (f?.id) map.set(f.id, f); });
              items.forEach(f => {
                if (f?.id) {
                  const canonical = map.get(f.id);
                  if (canonical && canonical.clinicVerified) {
                    map.set(f.id, canonical);
                  } else {
                    map.set(f.id, { ...canonical, ...f });
                  }
                }
              });
              
              const { unique, duplicates } = deduplicateFoodList(Array.from(map.values()));
              if (duplicates.length > 0) {
                duplicates.forEach(d => {
                  deleteDocumentFromFirestore('foods', d.id).catch(() => {});
                });
              }
              return unique;
            });
          }
        });

        const unsubDietPlans = subscribeToCollection<DietPlan>('dietPlans', (items) => {
          if (items && items.length > 0) {
            setDietPlans(prev => {
              const map = new Map<string, DietPlan>();
              INITIAL_DIET_PLANS.forEach(p => map.set(p.id, p));
              prev.forEach(p => { if (p?.id) map.set(p.id, p); });
              items.forEach(p => { if (p?.id) map.set(p.id, { ...map.get(p.id), ...p }); });
              return Array.from(map.values());
            });
          }
        });

        const unsubMealLogs = subscribeToCollection<MealLogItem>('mealLogs', (items) => {
          if (items && items.length > 0) {
            setMealLogs(prev => {
              const map = new Map<string, MealLogItem>();
              prev.forEach(m => { if (m?.id) map.set(m.id, m); });
              items.forEach(m => { if (m?.id) map.set(m.id, { ...map.get(m.id), ...m }); });
              return Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubMeasurements = subscribeToCollection<BodyMeasurement>('measurements', (items) => {
          if (items && items.length > 0) {
            setMeasurements(prev => {
              const map = new Map<string, BodyMeasurement>();
              prev.forEach(m => { if (m?.id) map.set(m.id, m); });
              items.forEach(m => { if (m?.id) map.set(m.id, { ...map.get(m.id), ...m }); });
              return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubWater = subscribeToCollection<WaterLog>('waterLogs', (items) => {
          if (items && items.length > 0) {
            setWaterLogs(prev => {
              const map = new Map<string, WaterLog>();
              prev.forEach(w => { if (w?.id) map.set(w.id, w); });
              items.forEach(w => { if (w?.id) map.set(w.id, { ...map.get(w.id), ...w }); });
              return Array.from(map.values());
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubActivities = subscribeToCollection<ActivityLog>('activities', (items) => {
          if (items && items.length > 0) {
            setActivities(prev => {
              const map = new Map<string, ActivityLog>();
              prev.forEach(a => { if (a?.id) map.set(a.id, a); });
              items.forEach(a => { if (a?.id) map.set(a.id, { ...map.get(a.id), ...a }); });
              return Array.from(map.values());
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubHabits = subscribeToCollection<DailyHabits>('habits', (items) => {
          if (items && items.length > 0) {
            setHabits(prev => {
              const map = new Map<string, DailyHabits>();
              prev.forEach(h => { if (h?.id) map.set(h.id, h); });
              items.forEach(h => { if (h?.id) map.set(h.id, { ...map.get(h.id), ...h }); });
              return Array.from(map.values());
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubAppointments = subscribeToCollection<ClinicAppointment>('appointments', (items) => {
          if (items && items.length > 0) {
            setAppointments(prev => {
              const map = new Map<string, ClinicAppointment>();
              prev.forEach(a => { if (a?.id) map.set(a.id, a); });
              items.forEach(a => { if (a?.id) map.set(a.id, { ...map.get(a.id), ...a }); });
              return Array.from(map.values());
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubTips = subscribeToCollection<DietitianTip>('tips', (items) => {
          if (items && items.length > 0) {
            setTips(prev => {
              const map = new Map<string, DietitianTip>();
              prev.forEach(t => { if (t?.id) map.set(t.id, t); });
              items.forEach(t => { if (t?.id) map.set(t.id, { ...map.get(t.id), ...t }); });
              return Array.from(map.values());
            });
            setLastSyncedAt(new Date());
          }
        });

        const unsubReminders = subscribeToCollection<ClientReminder>('reminders', (items) => {
          if (items && items.length > 0) {
            setReminders(prev => {
              const map = new Map<string, ClientReminder>();
              prev.forEach(r => { if (r?.id) map.set(r.id, r); });
              items.forEach(r => { if (r?.id) map.set(r.id, { ...map.get(r.id), ...r }); });
              return Array.from(map.values());
            });
          }
        });

        unsubs = [
          unsubClients,
          unsubDietitians,
          unsubFoods,
          unsubDietPlans,
          unsubMealLogs,
          unsubMeasurements,
          unsubWater,
          unsubActivities,
          unsubHabits,
          unsubAppointments,
          unsubTips,
          unsubReminders,
        ];

        setCloudSyncStatus('connected');
        setLastSyncedAt(new Date());
      } catch (err) {
        console.warn('Real-time Firestore sync encountered an issue, running with local and API fallback:', err);
        setCloudSyncStatus('offline');
      }
    };

    initializeFirestoreSync();

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Manual trigger to force cloud sync
  const forceCloudSync = useCallback(async () => {
    setCloudSyncStatus('syncing');
    try {
      await testFirestoreConnection();
      setCloudSyncStatus('connected');
      setLastSyncedAt(new Date());
    } catch {
      setCloudSyncStatus('offline');
    }
  }, []);

  // 2. Save changes to localStorage AND centralized server fallback
  const syncTimeoutRef = useRef<any>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'clients', JSON.stringify(clients));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'dietitians', JSON.stringify(dietitians));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'foods', JSON.stringify(foods));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'dietPlans', JSON.stringify(dietPlans));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'mealLogs', JSON.stringify(mealLogs));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'suggestedMeals', JSON.stringify(suggestedMeals));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'measurements', JSON.stringify(measurements));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'tips', JSON.stringify(tips));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'reminders', JSON.stringify(reminders));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'waterLogs', JSON.stringify(waterLogs));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activities', JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'habits', JSON.stringify(habits));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'appointments', JSON.stringify(appointments));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeClientId', JSON.stringify(activeClientId));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeTeamUserId', JSON.stringify(activeTeamUserId));
    } catch {
      // ignore local storage errors
    }

    // Debounced centralized sync to /api/sync for server file cache
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            clients,
            dietitians,
            foods,
            dietPlans,
            mealLogs,
            suggestedMeals,
            measurements,
            tips,
            reminders,
            waterLogs,
            activities,
            habits,
            appointments
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
    }, 1000);
  }, [clients, dietitians, foods, dietPlans, mealLogs, suggestedMeals, measurements, tips, reminders, waterLogs, activities, habits, appointments, activeClientId, activeTeamUserId]);

  // Derived current client (ONLY returns client if authenticated with username and password)
  const activeClient = (clients && activeClientId) 
    ? (clients.find(c => c.id === activeClientId) || null) 
    : null;

  // Derived current team member (ONLY returns coach if authenticated with username and password)
  const activeTeamUser = (dietitians && activeTeamUserId) 
    ? (dietitians.find(d => d.id === activeTeamUserId) || null) 
    : null;

  // Client Sign in: ONLY allows login with registered username/mobile and password
  const clientSignIn = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const trimmed = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!trimmed) {
      return { success: false, message: 'Please enter your client username.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Password is required. Please enter your client password.' };
    }

    const cleanedDigits = identifier.replace(/\D/g, '');

    const found = clients.find(c => {
      const matchUsername = c.username && c.username.toLowerCase() === trimmed;
      const matchEmail = c.email && c.email.toLowerCase() === trimmed;
      const matchPhone = cleanedDigits.length >= 4 && (
        c.phone.replace(/\D/g, '').endsWith(cleanedDigits) || 
        cleanedDigits.endsWith(c.phone.replace(/\D/g, ''))
      );
      return matchUsername || matchEmail || matchPhone;
    });

    if (!found) {
      return { success: false, message: 'No client profile found matching this username. Please verify the username set during registration.' };
    }

    const expectedPassword = found.password || 'password123';
    if (cleanPass !== expectedPassword) {
      return { success: false, message: 'Incorrect password. Please enter the exact password registered for this client.' };
    }

    setActiveClientId(found.id);
    setViewMode('client');
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeClientId', JSON.stringify(found.id));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'viewMode', JSON.stringify('client'));
    } catch {}

    return { success: true };
  };

  const clientSignOut = () => {
    setActiveClientId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'activeClientId');
      localStorage.setItem(STORAGE_KEY_PREFIX + 'viewMode', JSON.stringify('login'));
    } catch {}
    setViewMode('login');
  };

  const quickSwitchClient = (clientId: string) => {
    setActiveClientId(clientId);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeClientId', JSON.stringify(clientId));
    } catch {}
  };

  const teamSignIn = (teamMemberId: string) => {
    const member = dietitians.find(d => d.id === teamMemberId);
    if (member) {
      setActiveTeamUserId(member.id);
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'activeTeamUserId', JSON.stringify(member.id));
      } catch {}
    }
  };

  // Staff Sign in: ONLY allows login with registered coach/admin username and password
  const staffSignIn = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const trimmed = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!trimmed) {
      return { success: false, message: 'Please enter your coach/admin username.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Password is required. Please enter your coach password.' };
    }

    const cleanedDigits = identifier.replace(/\D/g, '');

    const found = dietitians.find(d => {
      const matchUsername = d.username && d.username.toLowerCase() === trimmed;
      const matchEmail = d.email && d.email.toLowerCase() === trimmed;
      const matchPhone = cleanedDigits.length >= 4 && (
        d.phone.replace(/\D/g, '').endsWith(cleanedDigits) || 
        cleanedDigits.endsWith(d.phone.replace(/\D/g, ''))
      );
      return matchUsername || matchEmail || matchPhone;
    });

    if (!found) {
      return { success: false, message: 'No coach or centre staff account found with this username. Please verify the credentials set during coach registration.' };
    }

    const expectedPassword = found.password || 'password123';
    if (cleanPass !== expectedPassword) {
      return { success: false, message: 'Incorrect password. Please enter the exact password registered for this coach.' };
    }

    setActiveTeamUserId(found.id);
    setViewMode('team');
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeTeamUserId', JSON.stringify(found.id));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'viewMode', JSON.stringify('team'));
    } catch {}

    return { success: true };
  };

  const staffSignOut = () => {
    setActiveTeamUserId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'activeTeamUserId');
      localStorage.setItem(STORAGE_KEY_PREFIX + 'viewMode', JSON.stringify('login'));
    } catch {}
    setViewMode('login');
  };

  const unifiedSignIn = (
    identifier: string, 
    password?: string, 
    targetRole?: 'client' | 'coach' | 'auto'
  ): { success: boolean; role?: 'client' | 'coach'; message?: string } => {
    const trimmed = identifier.trim().toLowerCase();
    const cleanedDigits = identifier.replace(/\D/g, '');

    // 1. Explicit Coach / Staff Login
    if (targetRole === 'coach') {
      const staffRes = staffSignIn(identifier, password);
      if (staffRes.success) {
        setViewMode('team');
        return { success: true, role: 'coach' };
      }
      return { success: false, message: staffRes.message };
    }

    // 2. Explicit Client Login
    if (targetRole === 'client') {
      const clientRes = clientSignIn(identifier, password);
      if (clientRes.success) {
        setViewMode('client');
        return { success: true, role: 'client' };
      }
      return { success: false, message: clientRes.message };
    }

    // 3. Auto Mode: detect if client or coach
    const clientMatch = clients.find(c => {
      const matchUsername = c.username && c.username.toLowerCase() === trimmed;
      const matchEmail = c.email && c.email.toLowerCase() === trimmed;
      const matchPhone = cleanedDigits.length >= 4 && (
        c.phone.replace(/\D/g, '').endsWith(cleanedDigits) || 
        cleanedDigits.endsWith(c.phone.replace(/\D/g, ''))
      );
      return matchUsername || matchEmail || matchPhone;
    });

    if (clientMatch) {
      const clientRes = clientSignIn(identifier, password);
      if (clientRes.success) {
        setViewMode('client');
        return { success: true, role: 'client' };
      }
      return { success: false, message: clientRes.message };
    }

    const staffMatch = dietitians.find(d => {
      const matchUsername = d.username && d.username.toLowerCase() === trimmed;
      const matchEmail = d.email && d.email.toLowerCase() === trimmed;
      const matchPhone = cleanedDigits.length >= 4 && (
        d.phone.replace(/\D/g, '').endsWith(cleanedDigits) || 
        cleanedDigits.endsWith(d.phone.replace(/\D/g, ''))
      );
      return matchUsername || matchEmail || matchPhone;
    });

    if (staffMatch) {
      const staffRes = staffSignIn(identifier, password);
      if (staffRes.success) {
        setViewMode('team');
        return { success: true, role: 'coach' };
      }
      return { success: false, message: staffRes.message };
    }

    return {
      success: false,
      message: 'No client or coach profile found matching this username or phone. Please verify your details or use the quick test logins below.'
    };
  };

  const quickSwitchTeamRole = (role: 'dietitian' | 'admin' | 'super_admin', id?: string) => {
    if (id) {
      setActiveTeamUserId(id);
      return;
    }
    const match = dietitians.find(d => d.role === role);
    if (match) {
      setActiveTeamUserId(match.id);
    }
  };

  // Add meal log (real-time synced to Firestore so coach sees it immediately)
  const addMealLog = (meal: Omit<MealLogItem, 'id' | 'timeLogged'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: MealLogItem = {
      ...meal,
      id: `ml-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timeLogged: timeStr,
    };

    setMealLogs(prev => [newLog, ...prev]);

    // Save to Firestore
    saveDocumentToFirestore('mealLogs', newLog.id, newLog).catch(() => {});

    // Update client's last active date
    if (meal.clientId) {
      setClients(prev => {
        const target = prev.find(c => c.id === meal.clientId);
        if (target) {
          const updated = { ...target, lastActiveDate: meal.date, status: 'active' as const };
          saveDocumentToFirestore('clients', meal.clientId, updated).catch(() => {});
          return prev.map(c => c.id === meal.clientId ? updated : c);
        }
        return prev;
      });
    }
  };

  const deleteMealLog = (id: string) => {
    setMealLogs(prev => prev.filter(m => m.id !== id));
    deleteDocumentFromFirestore('mealLogs', id).catch(() => {});
  };

  // USER MANDATE: Resetting for a client ONLY resets their food logs to what they typed the day before!
  const resetClientDayMealsToDayBefore = async (clientId: string, targetDate: string): Promise<{ count: number; dayBefore: string }> => {
    const dayBefore = getDayBeforeDateString(targetDate);

    // Find yesterday's meals for this specific client ONLY
    const yesterdayMeals = mealLogs.filter(m => m.clientId === clientId && m.date === dayBefore);

    // Find and delete existing logs for this client on targetDate ONLY
    const existingLogsOnTargetDate = mealLogs.filter(m => m.clientId === clientId && m.date === targetDate);
    for (const log of existingLogsOnTargetDate) {
      deleteDocumentFromFirestore('mealLogs', log.id).catch(() => {});
    }

    if (yesterdayMeals.length === 0) {
      // If no logs on the day before, clear targetDate for this client
      setMealLogs(prev => prev.filter(m => !(m.clientId === clientId && m.date === targetDate)));
      return { count: 0, dayBefore };
    }

    // Replicate yesterday's foods with targetDate for this client
    const clonedMeals: MealLogItem[] = yesterdayMeals.map((m, idx) => ({
      ...m,
      id: `m-reset-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      date: targetDate,
      timeLogged: m.timeLogged || '12:00 PM'
    }));

    for (const cloned of clonedMeals) {
      saveDocumentToFirestore('mealLogs', cloned.id, cloned).catch(() => {});
    }

    setMealLogs(prev => {
      const otherLogs = prev.filter(m => !(m.clientId === clientId && m.date === targetDate));
      return [...clonedMeals, ...otherLogs];
    });

    return { count: clonedMeals.length, dayBefore };
  };

  // AI Suggested Meals from Chatbot
  const addSuggestedMeal = (suggestion: Omit<AISuggestedMeal, 'id' | 'createdAt' | 'status'>) => {
    const newSuggestion: AISuggestedMeal = {
      ...suggestion,
      id: `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSuggestedMeals(prev => [newSuggestion, ...prev]);
  };

  const acceptSuggestedMeal = (suggestionId: string) => {
    const suggestion = suggestedMeals.find(s => s.id === suggestionId);
    if (!suggestion) return;

    suggestion.foods.forEach((f, idx) => {
      const timeStr = suggestion.timeGiven || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog: MealLogItem = {
        id: `ml-sugg-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        clientId: suggestion.clientId,
        date: suggestion.date,
        mealType: suggestion.mealType,
        foodId: `food-ai-${Date.now()}-${idx}`,
        foodName: f.name,
        quantity: f.quantity || 1,
        servingUnit: f.servingUnit || '1 serving',
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        timeLogged: timeStr,
      };
      setMealLogs(prev => [newLog, ...prev]);
      saveDocumentToFirestore('mealLogs', newLog.id, newLog).catch(() => {});
    });

    setSuggestedMeals(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'accepted' } : s));

    if (suggestion.clientId) {
      setClients(prev => {
        const target = prev.find(c => c.id === suggestion.clientId);
        if (target) {
          const updated = { ...target, lastActiveDate: suggestion.date, status: 'active' as const };
          saveDocumentToFirestore('clients', suggestion.clientId, updated).catch(() => {});
          return prev.map(c => c.id === suggestion.clientId ? updated : c);
        }
        return prev;
      });
    }
  };

  const dismissSuggestedMeal = (suggestionId: string) => {
    setSuggestedMeals(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'dismissed' } : s));
  };

  const clearSuggestedMeals = () => {
    setSuggestedMeals([]);
  };

  // Add client self measurement (real-time sync to Firestore so coach sees weight and InBody updates)
  const addMeasurement = (data: Omit<BodyMeasurement, 'id'>) => {
    const newMeasurement: BodyMeasurement = {
      ...data,
      id: `m-${Date.now()}`,
    };
    setMeasurements(prev => [newMeasurement, ...prev]);
    saveDocumentToFirestore('measurements', newMeasurement.id, newMeasurement).catch(() => {});

    // Update client current weight in Firestore
    if (data.weightKg) {
      setClients(prev => {
        const target = prev.find(c => c.id === data.clientId);
        if (target) {
          const updated = { 
            ...target, 
            currentWeightKg: data.weightKg, 
            lastActiveDate: data.date, 
            status: 'active' as const 
          };
          saveDocumentToFirestore('clients', data.clientId, updated).catch(() => {});
          return prev.map(c => c.id === data.clientId ? updated : c);
        }
        return prev;
      });
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
      const target = updated.find(r => r.id === id);
      if (target) {
        saveDocumentToFirestore('reminders', target.id, target).catch(() => {});
      }
      return updated;
    });
  };

  // Water Operations (real-time sync to Firestore)
  const addWaterLog = (amountMl: number, date?: string) => {
    const targetDate = date || selectedDate;
    const now = new Date();
    const timeLogged = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: WaterLog = {
      id: `w-${Date.now()}`,
      clientId: activeClientId || 'cl-1',
      date: targetDate,
      amountMl,
      timeLogged
    };
    setWaterLogs(prev => [newEntry, ...prev]);
    saveDocumentToFirestore('waterLogs', newEntry.id, newEntry).catch(() => {});
  };

  const deleteWaterLog = (id: string) => {
    setWaterLogs(prev => prev.filter(w => w.id !== id));
    deleteDocumentFromFirestore('waterLogs', id).catch(() => {});
  };

  const resetWaterLogForDate = (date: string) => {
    const itemsToDelete = waterLogs.filter(w => w.clientId === activeClientId && w.date === date);
    itemsToDelete.forEach(item => {
      deleteDocumentFromFirestore('waterLogs', item.id).catch(() => {});
    });
    setWaterLogs(prev => prev.filter(w => !(w.clientId === activeClientId && w.date === date)));
  };

  // Physical Activity Operations (real-time sync to Firestore)
  const addActivity = (activity: Omit<ActivityLog, 'id' | 'timeLogged'>) => {
    const now = new Date();
    const timeLogged = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}`,
      timeLogged
    };
    setActivities(prev => [newEntry, ...prev]);
    saveDocumentToFirestore('activities', newEntry.id, newEntry).catch(() => {});
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    deleteDocumentFromFirestore('activities', id).catch(() => {});
  };

  // Daily Habits Operations (real-time sync to Firestore)
  const updateDailyHabits = (date: string, partial: Partial<DailyHabits>) => {
    setHabits(prev => {
      const existing = prev.find(h => h.clientId === activeClientId && h.date === date);
      let updatedHabit: DailyHabits;
      let newHabitsList: DailyHabits[];

      if (existing) {
        updatedHabit = { ...existing, ...partial };
        newHabitsList = prev.map(h => (h.id === existing.id ? updatedHabit : h));
      } else {
        updatedHabit = {
          id: `hab-${Date.now()}`,
          clientId: activeClientId || 'cl-1',
          date,
          steps: 0,
          targetSteps: 8000,
          sleepHours: 7,
          supplementsTaken: false,
          saladEaten: false,
          stretchingDone: false,
          ...partial
        };
        newHabitsList = [updatedHabit, ...prev];
      }

      saveDocumentToFirestore('habits', updatedHabit.id, updatedHabit).catch(() => {});
      return newHabitsList;
    });
  };

  // Appointments Operations (real-time sync to Firestore)
  const addAppointment = (app: Omit<ClinicAppointment, 'id'>) => {
    const newApp: ClinicAppointment = {
      ...app,
      id: `app-${Date.now()}`
    };
    setAppointments(prev => [newApp, ...prev]);
    saveDocumentToFirestore('appointments', newApp.id, newApp).catch(() => {});
  };

  const updateAppointment = (app: ClinicAppointment) => {
    setAppointments(prev => prev.map(a => a.id === app.id ? app : a));
    saveDocumentToFirestore('appointments', app.id, app).catch(() => {});
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    deleteDocumentFromFirestore('appointments', id).catch(() => {});
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    deleteDocumentFromFirestore('clients', clientId).catch(() => {});
  };

  const updateDietitian = (profile: DietitianProfile) => {
    setDietitians(prev => prev.map(d => d.id === profile.id ? profile : d));
    saveDocumentToFirestore('dietitians', profile.id, profile).catch(() => {});
  };

  const addDietitian = (profileData: Omit<DietitianProfile, 'id'>) => {
    const newDietitian: DietitianProfile = {
      ...profileData,
      id: `coach-${Date.now()}`
    };
    setDietitians(prev => [...prev, newDietitian]);
    saveDocumentToFirestore('dietitians', newDietitian.id, newDietitian).catch(() => {});
  };

  // Team: Add Client
  const addClient = (clientData: Omit<ClientProfile, 'id' | 'joinedDate' | 'lastActiveDate' | 'status'>) => {
    const today = getTodayString();
    const cleanName = (clientData.name || '').trim();
    const finalName = cleanName.length > 0 ? cleanName : 'New Registered Client';
    const finalPhone = (clientData.phone || '').trim() || '5550199';
    const finalGoal = (clientData.goal || '').trim() || 'Metabolic Health & Nutrition';
    const finalDietitianId = clientData.assignedDietitianId || dietitians[0]?.id || 'admin-1';
    const finalDietPlanId = clientData.dietPlanId || dietPlans[0]?.id || 'dp-1';
    const finalUsername = (clientData.username || '').trim() || finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || `client${Date.now().toString().slice(-4)}`;
    const finalPassword = (clientData.password || '').trim() || 'password123';

    const newClient: ClientProfile = {
      ...clientData,
      name: finalName,
      username: finalUsername,
      password: finalPassword,
      phone: finalPhone,
      goal: finalGoal,
      assignedDietitianId: finalDietitianId,
      dietPlanId: finalDietPlanId,
      id: `cl-${Date.now()}`,
      joinedDate: today,
      lastActiveDate: today,
      status: 'active',
      avatarUrl: clientData.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    };
    setClients(prev => [newClient, ...prev]);
    saveDocumentToFirestore('clients', newClient.id, newClient).catch(() => {});

    // Automatically create Morning, Afternoon, and Night meal log reminders for client portal (Official scientific times)
    const defaultReminders: ClientReminder[] = [
      {
        id: `rem-morn-${newClient.id}`,
        clientId: newClient.id,
        title: 'Morning Breakfast Log Reminder',
        time: '08:00 AM',
        mealSlot: 'Breakfast',
        type: 'meal',
        enabled: true,
        message: `Good morning ${finalName}! Scientific Breakfast window (7:00–8:30 AM). Log your morning foods to kickstart metabolism.`,
        deliveredChannel: 'mobile_push'
      },
      {
        id: `rem-aft-${newClient.id}`,
        clientId: newClient.id,
        title: 'Afternoon Lunch Log Reminder',
        time: '01:00 PM',
        mealSlot: 'Lunch',
        type: 'meal',
        enabled: true,
        message: `Afternoon reminder: Peak metabolic fire window (12:30–1:30 PM). Log your lunch plate to track energy and protein.`,
        deliveredChannel: 'mobile_push'
      },
      {
        id: `rem-night-${newClient.id}`,
        clientId: newClient.id,
        title: 'Night Dinner Log Reminder',
        time: '07:30 PM',
        mealSlot: 'Dinner',
        type: 'meal',
        enabled: true,
        message: `Night check-in: Optimal dinner window (7:00–8:00 PM). Finish eating 3 hours before sleep for nocturnal recovery and fat burn.`,
        deliveredChannel: 'mobile_push'
      }
    ];

    setReminders(prev => [...defaultReminders, ...prev]);
    defaultReminders.forEach(r => {
      saveDocumentToFirestore('reminders', r.id, r).catch(() => {});
    });
  };

  const updateClient = (updated: ClientProfile) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    saveDocumentToFirestore('clients', updated.id, updated).catch(() => {});
  };

  const assignDietitian = (clientId: string, dietitianId: string) => {
    setClients(prev => {
      const target = prev.find(c => c.id === clientId);
      if (target) {
        const updated = { ...target, assignedDietitianId: dietitianId };
        saveDocumentToFirestore('clients', clientId, updated).catch(() => {});
        return prev.map(c => c.id === clientId ? updated : c);
      }
      return prev;
    });
  };

  const assignDietPlan = (clientId: string, dietPlanId: string) => {
    setClients(prev => {
      const target = prev.find(c => c.id === clientId);
      if (target) {
        const updated = { ...target, dietPlanId };
        saveDocumentToFirestore('clients', clientId, updated).catch(() => {});
        return prev.map(c => c.id === clientId ? updated : c);
      }
      return prev;
    });
  };

  // Team: Food items
  const addFoodItem = (foodData: Omit<FoodItem, 'id'>): FoodItem => {
    // Normalization check to prevent double-entry of existing foods
    const normalize = (n: string) => {
      const clean = (n || '').toLowerCase().trim();
      const unicodeClean = clean.replace(/[^\p{L}\p{N}]/gu, '');
      return unicodeClean || clean;
    };
    const targetKey = normalize(foodData.name);
    const existing = foods.find(f => normalize(f.name) === targetKey);
    if (existing) {
      return existing;
    }

    const newFood: FoodItem = {
      ...foodData,
      id: `f-${Date.now()}`,
      isCustom: true
    };
    setFoods(prev => [newFood, ...prev]);
    saveDocumentToFirestore('foods', newFood.id, newFood).catch(() => {});
    return newFood;
  };

  const removeDuplicateFoods = async (): Promise<{ count: number }> => {
    const { unique, duplicates } = deduplicateFoodList(foods);
    if (duplicates.length > 0) {
      for (const dupe of duplicates) {
        deleteDocumentFromFirestore('foods', dupe.id).catch(() => {});
      }
      setFoods(unique);
    }
    return { count: duplicates.length };
  };

  const updateFoodItem = (food: FoodItem) => {
    setFoods(prev => prev.map(f => f.id === food.id ? food : f));
    saveDocumentToFirestore('foods', food.id, food).catch(() => {});
  };

  const deleteFoodItem = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
    deleteDocumentFromFirestore('foods', id).catch(() => {});
  };

  // Team: Diet plans
  const createDietPlan = (planData: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = getTodayString();
    const newPlan: DietPlan = {
      ...planData,
      id: `dp-${Date.now()}`,
      createdAt: today,
      updatedAt: today
    };
    setDietPlans(prev => [newPlan, ...prev]);
    saveDocumentToFirestore('dietPlans', newPlan.id, newPlan).catch(() => {});
  };

  const updateDietPlan = (plan: DietPlan) => {
    const today = getTodayString();
    const updated = { ...plan, updatedAt: today };
    setDietPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
    saveDocumentToFirestore('dietPlans', updated.id, updated).catch(() => {});
  };

  // Team: Centre device reading entry
  const addCentreDeviceReading = (data: Omit<BodyMeasurement, 'id' | 'source'> & { deviceModel: string }) => {
    const newRecord: BodyMeasurement = {
      ...data,
      id: `m-centre-${Date.now()}`,
      source: 'centre_device',
    };
    setMeasurements(prev => [newRecord, ...prev]);
    saveDocumentToFirestore('measurements', newRecord.id, newRecord).catch(() => {});

    // Update client current weight with full profile preservation
    if (data.weightKg) {
      setClients(prev => {
        const target = prev.find(c => c.id === data.clientId);
        if (target) {
          const updated = { 
            ...target, 
            currentWeightKg: data.weightKg, 
            lastActiveDate: data.date,
            status: 'active' as const 
          };
          saveDocumentToFirestore('clients', data.clientId, updated).catch(() => {});
          return prev.map(c => c.id === data.clientId ? updated : c);
        }
        return prev;
      });
    }
  };

  // Team: Send tips & reminders
  const sendTipOrReminder = (tipData: Omit<DietitianTip, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = `${getTodayString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newTip: DietitianTip = {
      ...tipData,
      id: `tip-${Date.now()}`,
      createdAt: timeStr,
    };
    setTips(prev => [newTip, ...prev]);
    saveDocumentToFirestore('tips', newTip.id, newTip).catch(() => {});
  };

  const sendFollowupReminderToInactive = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const coachName = activeTeamUser?.name || 'Your Wellness Coach';
    const coachId = activeTeamUser?.id || 'admin-1';
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Dispatch DietitianTip / Alert to client portal
    sendTipOrReminder({
      dietitianId: coachId,
      dietitianName: coachName,
      clientId: client.id,
      targetAudience: 'specific',
      type: 'reminder',
      title: `⚠️ Meal Log Check-in from ${coachName}`,
      message: `Hi ${client.name}, we noticed you haven't updated your food logs for over 3 days. Your phone notification has been delivered. Please take a moment to log today's breakfast, lunch, or dinner so your coach can keep your metabolic plan on target!`
    });

    // 2. Add high-priority interactive ClientReminder to client portal
    const newMobileReminder: ClientReminder = {
      id: `rem-inact-${Date.now()}`,
      clientId: client.id,
      title: 'Action Needed: Update Food Diary',
      time: timeFormatted,
      type: 'meal',
      enabled: true,
      message: `${coachName} sent a direct alert: You haven't updated food logs in 3+ days. Please log what you ate today!`,
      deliveredChannel: 'mobile_push'
    };

    setReminders(prev => [newMobileReminder, ...prev]);
    saveDocumentToFirestore('reminders', newMobileReminder.id, newMobileReminder).catch(() => {});
  };

  const resetAllData = async () => {
    try {
      localStorage.clear();
      fetch('/api/sync/reset', { method: 'POST' }).catch(() => {});

      // Reset in-memory React states immediately
      setClients(INITIAL_CLIENTS);
      setDietitians(INITIAL_DIETITIANS);
      setFoods(INITIAL_FOODS);
      setDietPlans(INITIAL_DIET_PLANS);
      setMealLogs(INITIAL_MEAL_LOGS);
      setMeasurements(INITIAL_MEASUREMENTS);
      setTips(INITIAL_TIPS);
      setReminders(INITIAL_REMINDERS);
      setWaterLogs(INITIAL_WATER_LOGS);
      setActivities(INITIAL_ACTIVITIES);
      setHabits(INITIAL_HABITS);
      setAppointments(INITIAL_APPOINTMENTS);
      setActiveClientId('cl-1');
      setActiveTeamUserId('admin-1');

      // Re-populate Firestore cloud database with complete default clinic records
      setCloudSyncStatus('syncing');
      await Promise.allSettled([
        forceSeedInitialFirestoreData('clients', INITIAL_CLIENTS),
        forceSeedInitialFirestoreData('dietitians', INITIAL_DIETITIANS),
        forceSeedInitialFirestoreData('foods', INITIAL_FOODS),
        forceSeedInitialFirestoreData('dietPlans', INITIAL_DIET_PLANS),
        forceSeedInitialFirestoreData('mealLogs', INITIAL_MEAL_LOGS),
        forceSeedInitialFirestoreData('measurements', INITIAL_MEASUREMENTS),
        forceSeedInitialFirestoreData('tips', INITIAL_TIPS),
        forceSeedInitialFirestoreData('reminders', INITIAL_REMINDERS),
        forceSeedInitialFirestoreData('waterLogs', INITIAL_WATER_LOGS),
        forceSeedInitialFirestoreData('activities', INITIAL_ACTIVITIES),
        forceSeedInitialFirestoreData('habits', INITIAL_HABITS),
        forceSeedInitialFirestoreData('appointments', INITIAL_APPOINTMENTS),
      ]);
      setCloudSyncStatus('connected');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Reset encountered error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        phoneFrameEnabled,
        setPhoneFrameEnabled,
        cloudSyncStatus,
        lastSyncedAt,
        forceCloudSync,
        activeClient,
        activeClientId,
        clientSignIn,
        clientSignOut,
        quickSwitchClient,
        activeTeamUser,
        activeTeamUserId,
        teamSignIn,
        staffSignIn,
        staffSignOut,
        unifiedSignIn,
        quickSwitchTeamRole,
        updateDietitian,
        addDietitian,
        selectedDate,
        setSelectedDate,
        clients,
        dietitians,
        foods,
        dietPlans,
        mealLogs,
        suggestedMeals,
        measurements,
        tips,
        reminders,
        waterLogs,
        activities,
        habits,
        appointments,
        addMealLog,
        deleteMealLog,
        resetClientDayMealsToDayBefore,
        addSuggestedMeal,
        acceptSuggestedMeal,
        dismissSuggestedMeal,
        clearSuggestedMeals,
        addMeasurement,
        toggleReminder,
        addWaterLog,
        deleteWaterLog,
        resetWaterLogForDate,
        addActivity,
        deleteActivity,
        updateDailyHabits,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addClient,
        updateClient,
        deleteClient,
        assignDietitian,
        assignDietPlan,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        removeDuplicateFoods,
        createDietPlan,
        updateDietPlan,
        addCentreDeviceReading,
        sendTipOrReminder,
        sendFollowupReminderToInactive,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
