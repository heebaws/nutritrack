import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClientProfile,
  DietitianProfile,
  FoodItem,
  DietPlan,
  MealLogItem,
  BodyMeasurement,
  DietitianTip,
  ClientReminder,
  MealType,
  AISuggestedMeal
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_DIETITIANS,
  INITIAL_FOODS,
  INITIAL_DIET_PLANS,
  INITIAL_MEAL_LOGS,
  INITIAL_MEASUREMENTS,
  INITIAL_TIPS,
  INITIAL_REMINDERS
} from '../data/mockData';

interface AppContextType {
  // Navigation & View Mode
  viewMode: 'client' | 'team';
  setViewMode: (mode: 'client' | 'team') => void;
  phoneFrameEnabled: boolean;
  setPhoneFrameEnabled: (enabled: boolean) => void;

  // Active Users & Auth
  activeClient: ClientProfile | null;
  activeClientId: string | null;
  clientSignIn: (identifier: string, password?: string) => { success: boolean; message?: string };
  clientSignOut: () => void;
  quickSwitchClient: (clientId: string) => void;

  activeTeamUser: DietitianProfile;
  teamSignIn: (teamMemberId: string) => void;
  quickSwitchTeamRole: (role: 'dietitian' | 'admin', id?: string) => void;
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

  // Client Operations
  addMealLog: (meal: Omit<MealLogItem, 'id' | 'timeLogged'>) => void;
  deleteMealLog: (id: string) => void;
  addSuggestedMeal: (suggestion: Omit<AISuggestedMeal, 'id' | 'createdAt' | 'status'>) => void;
  acceptSuggestedMeal: (suggestionId: string) => void;
  dismissSuggestedMeal: (suggestionId: string) => void;
  clearSuggestedMeals: () => void;
  addMeasurement: (data: Omit<BodyMeasurement, 'id'>) => void;
  toggleReminder: (id: string) => void;

  // Team Operations
  addClient: (client: Omit<ClientProfile, 'id' | 'joinedDate' | 'lastActiveDate' | 'status'>) => void;
  updateClient: (client: ClientProfile) => void;
  deleteClient: (clientId: string) => void;
  assignDietitian: (clientId: string, dietitianId: string) => void;
  assignDietPlan: (clientId: string, dietPlanId: string) => void;
  addFoodItem: (food: Omit<FoodItem, 'id'>) => FoodItem;
  updateFoodItem: (food: FoodItem) => void;
  deleteFoodItem: (id: string) => void;
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
  // View mode
  const [viewMode, setViewMode] = useState<'client' | 'team'>('client');
  const [phoneFrameEnabled, setPhoneFrameEnabled] = useState<boolean>(false);

  // Selected date (defaults to current demo day 2026-09-15)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-15');

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
    if (Array.isArray(stored) && stored.length > 0 && !stored[0].username) {
      return INITIAL_CLIENTS;
    }
    return stored;
  });

  const [dietitians, setDietitians] = useState<DietitianProfile[]>(() => {
    const stored = loadStored<DietitianProfile[]>('dietitians', INITIAL_DIETITIANS);
    if (Array.isArray(stored)) {
      const hasSaleem = stored.some(d => d.name.toLowerCase().includes('saleem'));
      if (hasSaleem) return stored;
    }
    return INITIAL_DIETITIANS;
  });

  const [foods, setFoods] = useState<FoodItem[]>(() => loadStored('foods', INITIAL_FOODS));
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(() => loadStored('dietPlans', INITIAL_DIET_PLANS));
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>(() => loadStored('mealLogs', INITIAL_MEAL_LOGS));
  const [suggestedMeals, setSuggestedMeals] = useState<AISuggestedMeal[]>(() => loadStored('suggestedMeals', []));
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => loadStored('measurements', INITIAL_MEASUREMENTS));
  const [tips, setTips] = useState<DietitianTip[]>(() => loadStored('tips', INITIAL_TIPS));
  const [reminders, setReminders] = useState<ClientReminder[]>(() => loadStored('reminders', INITIAL_REMINDERS));

  // Current client ID (defaults to null so login columns appear first as requested)
  const [activeClientId, setActiveClientId] = useState<string | null>(() => {
    return loadStored('activeClientId', null);
  });

  // Current team member (defaults to Saleem Valanchery 'admin-1')
  const [activeTeamUserId, setActiveTeamUserId] = useState<string>(() => {
    return loadStored('activeTeamUserId', 'admin-1');
  });

  // Save changes to localStorage
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
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeClientId', JSON.stringify(activeClientId));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeTeamUserId', JSON.stringify(activeTeamUserId));
    } catch {
      // ignore storage errors
    }
  }, [clients, dietitians, foods, dietPlans, mealLogs, suggestedMeals, measurements, tips, reminders, activeClientId, activeTeamUserId]);

  // Derived current client
  const activeClient = clients.find(c => c.id === activeClientId) || null;

  // Derived current team member
  const activeTeamUser = dietitians.find(d => d.id === activeTeamUserId) || dietitians[0];

  // Client Sign in with username/phone/email and password
  const clientSignIn = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const trimmed = identifier.trim().toLowerCase();
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
      return { success: false, message: 'No client profile found matching this username or phone number.' };
    }

    if (password !== undefined && password !== '') {
      const expectedPassword = found.password || 'password123';
      if (password !== expectedPassword) {
        return { success: false, message: 'Incorrect password. Please verify your credentials.' };
      }
    }

    setActiveClientId(found.id);
    return { success: true };
  };

  const clientSignOut = () => {
    setActiveClientId(null);
  };

  const quickSwitchClient = (clientId: string) => {
    setActiveClientId(clientId);
  };

  const teamSignIn = (teamMemberId: string) => {
    const member = dietitians.find(d => d.id === teamMemberId);
    if (member) {
      setActiveTeamUserId(member.id);
    }
  };

  const quickSwitchTeamRole = (role: 'dietitian' | 'admin', id?: string) => {
    if (id) {
      setActiveTeamUserId(id);
      return;
    }
    const match = dietitians.find(d => d.role === role);
    if (match) {
      setActiveTeamUserId(match.id);
    }
  };

  // Add meal log
  const addMealLog = (meal: Omit<MealLogItem, 'id' | 'timeLogged'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: MealLogItem = {
      ...meal,
      id: `ml-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timeLogged: timeStr,
    };
    setMealLogs(prev => [newLog, ...prev]);

    // Update client's last active date
    if (meal.clientId) {
      setClients(prev => prev.map(c => c.id === meal.clientId ? { ...c, lastActiveDate: meal.date, status: 'active' } : c));
    }
  };

  const deleteMealLog = (id: string) => {
    setMealLogs(prev => prev.filter(m => m.id !== id));
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
    });

    // Mark suggestion as accepted
    setSuggestedMeals(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'accepted' } : s));

    if (suggestion.clientId) {
      setClients(prev => prev.map(c => c.id === suggestion.clientId ? { ...c, lastActiveDate: suggestion.date, status: 'active' } : c));
    }
  };

  const dismissSuggestedMeal = (suggestionId: string) => {
    setSuggestedMeals(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'dismissed' } : s));
  };

  const clearSuggestedMeals = () => {
    setSuggestedMeals([]);
  };

  // Add client self measurement
  const addMeasurement = (data: Omit<BodyMeasurement, 'id'>) => {
    const newMeasurement: BodyMeasurement = {
      ...data,
      id: `m-${Date.now()}`,
    };
    setMeasurements(prev => [newMeasurement, ...prev]);

    // Update client current weight
    if (data.weightKg) {
      setClients(prev => prev.map(c => c.id === data.clientId ? { 
        ...c, 
        currentWeightKg: data.weightKg, 
        lastActiveDate: data.date, 
        status: 'active' 
      } : c));
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const updateDietitian = (profile: DietitianProfile) => {
    setDietitians(prev => prev.map(d => d.id === profile.id ? profile : d));
  };

  const addDietitian = (profileData: Omit<DietitianProfile, 'id'>) => {
    const newDietitian: DietitianProfile = {
      ...profileData,
      id: `coach-${Date.now()}`
    };
    setDietitians(prev => [...prev, newDietitian]);
  };

  // Team: Add Client
  const addClient = (clientData: Omit<ClientProfile, 'id' | 'joinedDate' | 'lastActiveDate' | 'status'>) => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cl-${Date.now()}`,
      joinedDate: '2026-09-15',
      lastActiveDate: '2026-09-15',
      status: 'active'
    };
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (updated: ClientProfile) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const assignDietitian = (clientId: string, dietitianId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedDietitianId: dietitianId } : c));
  };

  const assignDietPlan = (clientId: string, dietPlanId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, dietPlanId } : c));
  };

  // Team: Food items
  const addFoodItem = (foodData: Omit<FoodItem, 'id'>): FoodItem => {
    const newFood: FoodItem = {
      ...foodData,
      id: `f-${Date.now()}`,
      isCustom: true
    };
    setFoods(prev => [newFood, ...prev]);
    return newFood;
  };

  const updateFoodItem = (food: FoodItem) => {
    setFoods(prev => prev.map(f => f.id === food.id ? food : f));
  };

  const deleteFoodItem = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  // Team: Diet plans
  const createDietPlan = (planData: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: DietPlan = {
      ...planData,
      id: `dp-${Date.now()}`,
      createdAt: '2026-09-15',
      updatedAt: '2026-09-15'
    };
    setDietPlans(prev => [newPlan, ...prev]);
  };

  const updateDietPlan = (plan: DietPlan) => {
    setDietPlans(prev => prev.map(p => p.id === plan.id ? { ...plan, updatedAt: '2026-09-15' } : p));
  };

  // Team: Centre device reading entry
  const addCentreDeviceReading = (data: Omit<BodyMeasurement, 'id' | 'source'> & { deviceModel: string }) => {
    const newRecord: BodyMeasurement = {
      ...data,
      id: `m-centre-${Date.now()}`,
      source: 'centre_device',
    };
    setMeasurements(prev => [newRecord, ...prev]);

    // Update client current weight
    if (data.weightKg) {
      setClients(prev => prev.map(c => c.id === data.clientId ? { 
        ...c, 
        currentWeightKg: data.weightKg, 
        lastActiveDate: data.date 
      } : c));
    }
  };

  // Team: Send tips & reminders
  const sendTipOrReminder = (tipData: Omit<DietitianTip, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-09-15 ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newTip: DietitianTip = {
      ...tipData,
      id: `tip-${Date.now()}`,
      createdAt: timeStr,
    };
    setTips(prev => [newTip, ...prev]);
  };

  const sendFollowupReminderToInactive = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    sendTipOrReminder({
      dietitianId: activeTeamUser.id,
      dietitianName: activeTeamUser.name,
      clientId: client.id,
      targetAudience: 'specific',
      type: 'reminder',
      title: `Quick Check-in from ${activeTeamUser.name}`,
      message: `Hi ${client.name}, we noticed you haven't logged your meals in a few days. How are you feeling? Take a moment to log today's meals or message us if you need any adjustments!`
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    setClients(INITIAL_CLIENTS);
    setDietitians(INITIAL_DIETITIANS);
    setFoods(INITIAL_FOODS);
    setDietPlans(INITIAL_DIET_PLANS);
    setMealLogs(INITIAL_MEAL_LOGS);
    setMeasurements(INITIAL_MEASUREMENTS);
    setTips(INITIAL_TIPS);
    setReminders(INITIAL_REMINDERS);
    setActiveClientId('cl-1');
    setActiveTeamUserId('admin-1');
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        phoneFrameEnabled,
        setPhoneFrameEnabled,
        activeClient,
        activeClientId,
        clientSignIn,
        clientSignOut,
        quickSwitchClient,
        activeTeamUser,
        teamSignIn,
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
        addMealLog,
        deleteMealLog,
        addSuggestedMeal,
        acceptSuggestedMeal,
        dismissSuggestedMeal,
        clearSuggestedMeals,
        addMeasurement,
        toggleReminder,
        addClient,
        updateClient,
        deleteClient,
        assignDietitian,
        assignDietPlan,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
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
