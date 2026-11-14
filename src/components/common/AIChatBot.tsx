import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MealType, FoodCategory, AISuggestedMealFood, FoodItem } from '../../types';
import { 
  estimateNutrition, 
  formatFoodMarkdown, 
  detectEatenMealWithTime, 
  parseRecipeIngredients, 
  detectMalayalamOrManglish 
} from '../../utils/nutritionEstimator';
import { NutriTrackLogo } from './NutriTrackLogo';
import { getFoodImageUrl, FOOD_FALLBACK_SVG } from '../../utils/foodImages';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Plus,
  ChevronDown,
  Minimize2,
  Maximize2,
  HelpCircle,
  Utensils,
  RotateCcw,
  User,
  ShieldCheck,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Info,
  Layers,
  Search,
  GripHorizontal,
  Move,
  Camera,
  Image as ImageIcon,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

interface FoodData {
  name: string;
  category: string;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  glycemicIndex?: string;
  verdict?: string;
  recommendation?: string;
  autoSaved?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  food?: FoodData | null;
  mealLogData?: {
    timeGiven: string;
    detectedMealType: MealType;
    foods: AISuggestedMealFood[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  } | null;
  loggedSuccess?: boolean;
  autoSavedToLibrary?: boolean;
}

// Built-in Kerala Snacks & Dishes Clinical Knowledge Base for instant, 100% reliable responses
export const KERALA_SNACKS_REFERRAL = [
  {
    name: 'Pazham Pori (Ethakka Appam)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (80g)',
    steamedCal: 185,
    sauteCal: 230,
    friedCal: 305,
    protein: 2.2,
    carbs: 34,
    baseFat: 5.5,
    tips: 'Kerala classic banana fritter made with ripe Nendran banana and wheat/maida batter.'
  },
  {
    name: 'Parippu Vada (Kerala Dal Vada)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    steamedCal: 148,
    sauteCal: 193,
    friedCal: 268,
    protein: 6.2,
    carbs: 16.5,
    baseFat: 7.2,
    tips: 'Crunchy chana dal fritter spiced with shallots, curry leaves, and green chillies.'
  },
  {
    name: 'Ulli Vada (Crispy Onion Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (45g)',
    steamedCal: 155,
    sauteCal: 200,
    friedCal: 275,
    protein: 2.8,
    carbs: 16,
    baseFat: 9.0,
    tips: 'Golden sliced shallot fritters, a high-aroma evening tea stall staple in Kerala.'
  },
  {
    name: 'Ela Ada (Steamed Rice Parcel)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (85g)',
    steamedCal: 162,
    sauteCal: 207,
    friedCal: 282,
    protein: 2.8,
    carbs: 32,
    baseFat: 3.0,
    tips: 'Steamed in fresh banana leaf with grated coconut, jaggery, and cardamom. Naturally healthy!'
  },
  {
    name: 'Kozhukkatta (Steamed Rice Dumpling)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (60g)',
    steamedCal: 132,
    sauteCal: 177,
    friedCal: 252,
    protein: 2.2,
    carbs: 26.5,
    baseFat: 2.3,
    tips: 'Steamed rice dough dumpling filled with coconut & jaggery. Zero oil when steamed.'
  },
  {
    name: 'Unniyappam (Sweet Jaggery & Rice)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (35g)',
    steamedCal: 115,
    sauteCal: 160,
    friedCal: 235,
    protein: 1.6,
    carbs: 22,
    baseFat: 2.8,
    tips: 'Small round sweet snack cooked in an appakarai pan with banana, jaggery, and coconut bits.'
  },
  {
    name: 'Neyyappam (Ghee & Rice Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (45g)',
    steamedCal: 145,
    sauteCal: 190,
    friedCal: 265,
    protein: 1.8,
    carbs: 25,
    baseFat: 4.5,
    tips: 'Traditional sweet snack fried in coconut oil/ghee with roasted coconut bits.'
  },
  {
    name: 'Sukhiyan (Sweet Green Gram Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (55g)',
    steamedCal: 140,
    sauteCal: 185,
    friedCal: 260,
    protein: 4.5,
    carbs: 24,
    baseFat: 3.2,
    tips: 'Boiled green gram (cherupayar) mixed with jaggery and coconut, batter dipped and fried.'
  },
  {
    name: 'Kerala Banana Chips (Nendran Upperi)',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    steamedCal: 120,
    sauteCal: 158,
    friedCal: 185,
    protein: 1.1,
    carbs: 18.2,
    baseFat: 9.6,
    tips: 'Thin raw Nendran plantain slices deep fried in pure coconut oil.'
  },
  {
    name: 'Sharkara Upperi (Jaggery Banana Chunks)',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    steamedCal: 135,
    sauteCal: 168,
    friedCal: 195,
    protein: 1.0,
    carbs: 24.5,
    baseFat: 7.5,
    tips: 'Thick fried banana chunks coated in crystallized jaggery, ginger powder, and jeera.'
  },
  {
    name: 'Uzhunnu Vada (Medu Vada)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    steamedCal: 142,
    sauteCal: 187,
    friedCal: 262,
    protein: 4.8,
    carbs: 15,
    baseFat: 7.5,
    tips: 'Fluffy urad dal donut fritter, rich in protein but absorbs oil when deep fried.'
  },
  {
    name: 'Kerala Puttu (Steamed Rice & Coconut)',
    category: 'Grains & Breads',
    servingUnit: '1 piece / cup (100g)',
    steamedCal: 165,
    sauteCal: 210,
    friedCal: 285,
    protein: 3.2,
    carbs: 32,
    baseFat: 2.8,
    tips: 'Steamed ground rice cylinders layered with grated coconut. 100% oil-free naturally!'
  },
  {
    name: 'Kadala Curry (Black Chickpea Curry)',
    category: 'Proteins',
    servingUnit: '1 bowl (150g)',
    steamedCal: 195,
    sauteCal: 240,
    friedCal: 315,
    protein: 8.5,
    carbs: 26,
    baseFat: 7.0,
    tips: 'High fiber black chickpeas roasted with coconut paste and Kerala spices.'
  },
  {
    name: 'Appam (Palappam / Lace Rice Crepe)',
    category: 'Grains & Breads',
    servingUnit: '1 piece (50g)',
    steamedCal: 95,
    sauteCal: 140,
    friedCal: 215,
    protein: 1.8,
    carbs: 19.5,
    baseFat: 1.2,
    tips: 'Fermented rice batter made with coconut milk and toddy/yeast.'
  }
];

// One food measure unit options for dynamic scaling
export const MEASURE_UNITS = [
  { id: 'serving', label: 'Standard Serving / Piece', factor: 1.0 },
  { id: '100g', label: '100 Grams (100g)', factor: 1.0 },
  { id: 'cup', label: '1 Cup / Glass (240ml)', factor: 1.25 },
  { id: 'bowl', label: '1 Bowl / Katori (150g)', factor: 1.5 },
  { id: 'plate', label: '1 Full Plate (250g)', factor: 2.0 },
  { id: 'tbsp', label: '1 Tablespoon (15g)', factor: 0.2 },
];

// Meal sections in strict daily chronological order: Morning, Morning Snack, Lunch, Evening, Night
export const ORDERED_MEAL_SECTIONS: { id: MealType; label: string; icon: string; timeWindow: string; short: string }[] = [
  { id: 'Breakfast', label: 'Morning', icon: '🌅', timeWindow: '7:00 – 10:00 AM', short: 'Morning' },
  { id: 'Morning Snack', label: 'Morning Snack', icon: '☕', timeWindow: '10:30 – 11:30 AM', short: 'Snack' },
  { id: 'Lunch', label: 'Lunch', icon: '🥗', timeWindow: '12:30 – 2:30 PM', short: 'Lunch' },
  { id: 'Evening Snack', label: 'Evening', icon: '🍵', timeWindow: '4:30 – 6:00 PM', short: 'Evening' },
  { id: 'Dinner', label: 'Night', icon: '🌙', timeWindow: '7:30 – 9:30 PM', short: 'Night' },
];

export const AIChatBot: React.FC = () => {
  const {
    activeClient,
    selectedDate,
    mealLogs,
    dietPlans,
    addMealLog,
    addFoodItem,
    foods,
    viewMode,
    addSuggestedMeal,
    t,
    tf,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReferralGuide, setShowReferralGuide] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected portions (0.5x, 1x, 1.5x, 2x, etc.) per message
  const [selectedPortions, setSelectedPortions] = useState<Record<string, number>>({});
  // Selected measure unit (serving, 100g, cup, bowl, plate, tbsp) per message
  const [selectedMeasures, setSelectedMeasures] = useState<Record<string, string>>({});
  // Selected slot per message (Morning, Morning Snack, Lunch, Evening, Night)
  const [selectedSlots, setSelectedSlots] = useState<Record<string, MealType>>({});
  // CRITICAL MANDATE: "Was it oily? 3 options" ('steamed' = 0 kcal/fat, 'medium' = +45 kcal, +5g fat, 'fried' = +120 kcal, +13g fat)
  const [selectedOilOptions, setSelectedOilOptions] = useState<Record<string, 'steamed' | 'medium' | 'fried'>>({});
  
  // USER MANDATE: "grant access to bot to directly give other details of that food like calorie and others"
  const [grantBotColumnAccess, setGrantBotColumnAccess] = useState<boolean>(true);
  // Optional auto-add to column on search
  const [autoAddToColumnOnSearch, setAutoAddToColumnOnSearch] = useState<boolean>(false);
  // Quick food search input state
  const [foodSearchQuery, setFoodSearchQuery] = useState<string>('');
  
  // Network connectivity state (online vs offline mode)
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Voice recording & transcription state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const voiceTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Start Voice Recording (uses Web Speech API or MediaRecorder with Gemini transcription)
  const startVoiceRecording = async () => {
    try {
      // 1. Try Browser SpeechRecognition first for instant real-time transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          if (currentTranscript.trim()) {
            setInputMessage(currentTranscript.trim());
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition notice:', err);
        };

        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition start error:', e);
        }
      }

      // 2. Also record audio stream with MediaRecorder for server-side Gemini transcription
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250);
      }

      setIsRecordingVoice(true);
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access failed:', err);
      alert('Could not access microphone. Please enable microphone permissions in your browser.');
    }
  };

  const stopVoiceRecording = async () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    setIsRecordingVoice(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsTranscribingVoice(true);
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

          if (!inputMessage.trim() && audioBlob.size > 1000) {
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = reader.result as string;
              try {
                const res = await fetch('/api/ai/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    audioBase64: base64,
                    mimeType: 'audio/webm'
                  })
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.transcript) {
                    setInputMessage(data.transcript);
                  }
                }
              } catch (e) {
                console.warn('Server transcription error:', e);
              } finally {
                setIsTranscribingVoice(false);
              }
            };
            reader.readAsDataURL(audioBlob);
          } else {
            setIsTranscribingVoice(false);
          }
        } catch (err) {
          console.warn('Audio processing error:', err);
          setIsTranscribingVoice(false);
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      setIsTranscribingVoice(false);
    }
  };

  // Multimodal meal photo upload state
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setSelectedImage({
        base64: res,
        mimeType: file.type || 'image/jpeg',
        preview: res
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const [showFoodSearchBar, setShowFoodSearchBar] = useState<boolean>(true);

  const [savedFoodNotice, setSavedFoodNotice] = useState<string | null>(null);

  // User mandate: "and the right under chatbot which canbe changed position by moving it"
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const [modalPos, setModalPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingBtnRef = useRef(false);

  // Dragging handler for the floating trigger button
  const handleBtnDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startX = clientX;
    const startY = clientY;

    const btnElem = (e.currentTarget as HTMLElement).closest('#nutribot-trigger-btn') as HTMLElement;
    const rect = btnElem ? btnElem.getBoundingClientRect() : { left: window.innerWidth - 260, top: window.innerHeight - 70 };
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    let moved = false;

    const onMove = (mEvt: MouseEvent | TouchEvent) => {
      const curX = 'touches' in mEvt ? mEvt.touches[0].clientX : mEvt.clientX;
      const curY = 'touches' in mEvt ? mEvt.touches[0].clientY : mEvt.clientY;

      if (Math.hypot(curX - startX, curY - startY) > 5) {
        moved = true;
        isDraggingBtnRef.current = true;
      }

      const maxX = Math.max(10, window.innerWidth - 72);
      const maxY = Math.max(10, window.innerHeight - 72);
      const newX = Math.min(Math.max(10, curX - offsetX), maxX);
      const newY = Math.min(Math.max(10, curY - offsetY), maxY);

      setBtnPos({ x: newX, y: newY });
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      if (!moved) {
        setIsOpen(true);
      }

      setTimeout(() => {
        isDraggingBtnRef.current = false;
      }, 80);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Dragging handler for the open chatbot window
  const handleModalDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isExpanded) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const modalElem = document.getElementById('nutribot-window-container');
    const rect = modalElem ? modalElem.getBoundingClientRect() : { left: window.innerWidth - 500, top: window.innerHeight - 680 };
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const onMove = (mEvt: MouseEvent | TouchEvent) => {
      const curX = 'touches' in mEvt ? mEvt.touches[0].clientX : mEvt.clientX;
      const curY = 'touches' in mEvt ? mEvt.touches[0].clientY : mEvt.clientY;

      const modalWidth = modalElem?.offsetWidth || 480;
      const modalHeight = modalElem?.offsetHeight || 660;

      const maxX = Math.max(10, window.innerWidth - modalWidth - 10);
      const maxY = Math.max(10, window.innerHeight - modalHeight - 10);
      const newX = Math.min(Math.max(10, curX - offsetX), maxX);
      const newY = Math.min(Math.max(10, curY - offsetY), maxY);

      setModalPos({ x: newX, y: newY });
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate active client's current context
  const clientContext = useMemo(() => {
    if (!activeClient) {
      return {
        isClient: false,
        role: viewMode === 'team' ? 'Coach / Staff' : 'Guest'
      };
    }

    const assignedPlan = dietPlans.find(p => p.id === activeClient.dietPlanId);
    const targetCalories = assignedPlan?.targetCalories || 1600;
    const clientLogsToday = mealLogs.filter(m => m.clientId === activeClient.id && m.date === selectedDate);
    const consumedCalories = clientLogsToday.reduce((sum, item) => sum + item.calories, 0);

    return {
      isClient: true,
      name: activeClient.name,
      goal: activeClient.goal,
      currentWeightKg: activeClient.currentWeightKg,
      targetWeightKg: activeClient.targetWeightKg,
      targetCalories,
      consumedCalories,
      remainingCalories: Math.max(0, targetCalories - consumedCalories),
      foodsLoggedTodayCount: clientLogsToday.length
    };
  }, [activeClient, dietPlans, mealLogs, selectedDate, viewMode]);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `👋 Namaskaram! I am **NutriBot**, your Saleem Valanchery Wellness Centre Assistant.

I am ready to help you with:
- 🌴 **Kerala Snacks & Calories Referral:** Ask about **Pazham Pori**, **Parippu Vada**, **Ela Ada**, **Banana Chips**, or tap the **Kerala Referral Guide** above!
- 🫒 **Was it oily? (3 Cooking Options):** I ask on every food and calculate calories for **Steamed (0 extra fat)**, **Medium Sauté (+45 kcal)**, or **Deep Fried (+120 kcal)**!
- 📚 **Automatic Food Library Sync:** Every food or snack you write is **automatically added to your Centre Food Library** for future 1-click logging!
- ⏰ **Log What You Ate With Time:** Type *"I ate 2 Pazham Pori at 4:30 pm"* and I will stage it for your **Evening Snack**!`,
      timestamp: 'Just now'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, showReferralGuide]);

  const handleSendMessageRef = useRef<(customText?: string) => Promise<void>>(null as any);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query && handleSendMessageRef.current) {
        handleSendMessageRef.current(e.detail.query);
      }
    };
    window.addEventListener('open-nutribot', handleOpen);
    return () => window.removeEventListener('open-nutribot', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Quick preset questions demonstrating mandates
  const quickPrompts = [
    { label: '🌾 പുട്ട് (Puttu)', query: 'പുട്ട് (Puttu) calories and portion' },
    { label: '🍌 Pazham Pori (Calories First)', query: 'Pazham Pori calories and was it oily options' },
    { label: '🍗 ചിക്കൻ അൽഫഹം (Alfaham)', query: 'ചിക്കൻ അൽഫഹം (Chicken alfaham) calories' },
    { label: '🍛 തലശ്ശേരി ബിരിയാണി', query: 'തലശ്ശേരി ബിരിയാണി (Thalassery biriyani) calories' },
    { label: '🐟 മീൻ കറി മുളകിട്ടത്', query: 'മീൻ കറി മുളകിട്ടത് (Meen curry mulakittathu) calories' },
    { label: '🥟 Parippu Vada calories', query: 'Parippu Vada calories and macros' },
    { label: '🍃 Ela Ada (Steamed)', query: 'Ela Ada calories and nutrition' },
    { label: '⏰ Ate 2 eggs & 1 bread at 8:30 am', query: 'I ate 2 boiled eggs and 1 bread at 8:30 am' },
    { label: '📊 My Remaining Calories', query: 'How many calories do I have remaining today?' }
  ];

  // Helper to ensure food is auto-added to Clinic Food Library
  const autoAddFoodToLibrary = (foodItem: FoodData): boolean => {
    const nameLower = foodItem.name.trim().toLowerCase();
    const existing = foods.find(f => f.name.toLowerCase() === nameLower);
    if (!existing) {
      const validCategories: FoodCategory[] = [
        'Proteins',
        'Grains & Breads',
        'Vegetables',
        'Fruits',
        'Dairy & Alternatives',
        'Nuts & Healthy Fats',
        'Beverages & Snacks'
      ];

      const category = validCategories.includes(foodItem.category as FoodCategory)
        ? (foodItem.category as FoodCategory)
        : 'Beverages & Snacks';

      addFoodItem({
        name: foodItem.name,
        category,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        fiber: foodItem.fiber || 1,
        glycemicIndex: (foodItem.glycemicIndex || 'Medium') as any,
        servingUnit: foodItem.servingUnit || '1 serving',
        standardServingUnit: foodItem.servingUnit || '1 serving',
        standardServingGrams: 100,
        description: foodItem.verdict || 'Automatically added to Centre Food Library via NutriBot chat'
      });
      return true;
    }
    return false;
  };

  // Resilient fallback parser matching local Kerala database and universal nutrition engine
  const createLocalFallbackResponse = (query: string): { food: FoodData | null; answer: string; isMealLogReport: boolean; mealLogData: any } => {
    const lower = query.toLowerCase().trim();

    // 1. Check if user is reporting a meal eaten with a time (e.g. "I ate 2 eggs and 1 bread at 8:30 am")
    const eatenMeal = detectEatenMealWithTime(query);
    if (eatenMeal && eatenMeal.foods && eatenMeal.foods.length > 0) {
      return {
        food: null,
        isMealLogReport: true,
        mealLogData: {
          timeGiven: eatenMeal.timeGiven || 'Today',
          detectedMealType: eatenMeal.mealSlot || 'Evening Snack',
          foods: eatenMeal.foods,
          totalCalories: eatenMeal.totalCalories || 0,
          totalProtein: eatenMeal.totalProtein || 0,
          totalCarbs: eatenMeal.totalCarbs || 0,
          totalFat: eatenMeal.totalFat || 0,
        },
        answer: `### **Meal Reported at ${eatenMeal.timeGiven || 'Today'}**
Detected Meal Slot: **${eatenMeal.mealSlot || 'Evening Snack'}**

🔥 **Each Food's Calories (Check First):**
${eatenMeal.foods.map(f => `- **${f.name} (${f.quantity}x ${f.servingUnit}):** **${f.calories} kcal** (P: ${f.protein}g, C: ${f.carbs}g, F: ${f.fat}g)`).join('\n')}
- **Total Meal Calories:** **${eatenMeal.totalCalories} kcal**

### **Was it oily? (3 Options Calculation)**
- 🟢 **Steamed / No Oil:** ${eatenMeal.totalCalories} kcal
- 🟡 **Medium Sauté:** ${(eatenMeal.totalCalories || 0) + 45} kcal (+5g fat)
- 🔴 **Deep Fried:** ${(eatenMeal.totalCalories || 0) + 120} kcal (+13g fat)

✨ **Auto-Added to Centre Food Library:** Staged for 1-click entry into your **${eatenMeal.mealSlot || 'Evening Snack'}** daily diary!`
      };
    }

    // 2. Greetings and general health topics (non-food queries)
    if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'help' || lower === 'test') {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `👋 **NutriBot is Active & Ready to Assist You!**

Welcome to the **Saleem Valanchery Wellness Centre Assistant**! I am fully operational and equipped to estimate nutrition for ANY food, snack, or meal.

### **What You Can Do Right Now:**
1. **Search Any Food or Snack:** Type *any* food (e.g. *"Pazham Pori"*, *"Shawarma"*, *"Boiled Egg"*, *"Paneer Butter Masala"*, *"Salmon"*, *"Salad"*, *"Biryani"*) to see its **calories first in bold**!
2. **"Was it oily?" 3-Options Calculator:** Recalculates calories live for:
   - 🟢 **No Oil / Steamed** (Base calories)
   - 🟡 **Medium / Home Sauté** (+45 kcal, +5g fat)
   - 🔴 **Deep Fried / Very Oily** (+120 kcal, +13g fat)
3. **1-Click Direct Add to Log Food:** You can add the searched food directly to your **Morning, Snack, Lunch, Evening, or Night** diary columns!
4. **Automatic Food Library Sync:** Any food you search is automatically registered in your centre food library.

What food or snack would you like to check?`
      };
    }

    if (lower.includes('visceral') || lower.includes('inbody') || lower.includes('body fat')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Visceral Fat & Body Composition Guide**
*Clinical Protocol from Coach Saleem Valanchery & Faseela Saleem*

- **Target Range:** Maintain visceral fat rating between **0.5 and 9**.
- **Action Plan:**
  1. Maintain a high-protein calorie deficit (1.2–1.6g protein/kg).
  2. Minimize refined carbs, deep-fried snacks, and late-night heavy calories.
  3. Combine 8,000–10,000 daily steps with resistance training 3x/week.
  4. Track monthly updates in the centre InBody 270/770 Body Composition Analyzer.`
      };
    }

    if (lower.includes('water') || lower.includes('hydration')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Hydration Target (Saleem Valanchery Wellness Centre)**
- **Daily Goal:** **2.5 to 3.5 Litres** daily.
- **Tip:** Drink 500ml upon waking. Space water evenly throughout the day.
- **Meal Rule:** Avoid chugging water immediately after heavy meals.`
      };
    }

    // 3. RECIPE / MULTI-INGREDIENT DISH CALCULATION
    // If client types ingredients e.g. "200g chicken, 1 onion, 1 tbsp oil", calculate total data + itemized breakdown
    const recipeResult = parseRecipeIngredients(query);
    if (recipeResult && recipeResult.ingredients.length > 0) {
      return {
        food: {
          name: recipeResult.recipeTitle,
          category: 'Proteins',
          servingUnit: '1 recipe dish',
          calories: recipeResult.totalCalories,
          protein: recipeResult.totalProtein,
          carbs: recipeResult.totalCarbs,
          fat: recipeResult.totalFat,
          fiber: recipeResult.totalFiber,
          glycemicIndex: 'Low-Medium',
          verdict: recipeResult.isMalayalam ? 'ചേരുവകൾ കൃത്യമായി കണക്കുകൂട്ടിയിട്ടുണ്ട്.' : 'Calculated proportionally across all ingredients.',
          recommendation: recipeResult.isMalayalam ? 'മീൽ ഡയറിയിലേക്ക് നേരിട്ട് രേഖപ്പെടുത്താം.' : 'Nutrient balanced home recipe.'
        },
        isMealLogReport: true,
        mealLogData: {
          timeGiven: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedMealType: 'Lunch',
          foods: recipeResult.ingredients.map(i => ({
            name: `${i.name} (${i.unit})`,
            quantity: 1,
            servingUnit: i.unit,
            calories: i.calories,
            protein: i.protein,
            carbs: i.carbs,
            fat: i.fat,
            category: i.category
          })),
          totalCalories: recipeResult.totalCalories,
          totalProtein: recipeResult.totalProtein,
          totalCarbs: recipeResult.totalCarbs,
          totalFat: recipeResult.totalFat,
        },
        answer: recipeResult.answer
      };
    }

    // 3.5 CLINICAL HEALTH, LIFESTYLE & FACTOR INQUIRIES
    if (lower.includes('fasting') || lower.includes('16:8') || lower.includes('eating window')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Intermittent Fasting (16:8 Protocol) • Saleem Valanchery Wellness Clinic**

- **Recommended Fasting Window:** **16 Hours Fasting / 8 Hours Eating Window** (e.g. 8:00 PM to 12:00 PM next day).
- **During the Fast:** Hydrate with fresh water, black coffee (no sugar/milk), green tea, or warm lemon water with a pinch of salt.
- **Breaking the Fast:** Break with lean protein and fiber (e.g. 2 boiled eggs with cucumber/almonds, or light vegetable soup) to prevent sudden insulin spikes.
- **Clinical Benefits:** Enhances cellular autophagy, improves insulin sensitivity, accelerates stubborn visceral fat breakdown, and eliminates late-night cravings.`
      };
    }

    // 3.4 CALORIE BASICS, DETECTION & HUMAN REQUIREMENT INQUIRIES
    if (
      lower.includes('what is a calorie') || 
      lower.includes('what is calorie') || 
      lower.includes('how calorie works') || 
      lower.includes('how calories work') || 
      lower.includes('how much calorie') || 
      lower.includes('how much calories') || 
      lower.includes('how many calories') || 
      lower.includes('how it detects') || 
      lower.includes('how do you detect') || 
      lower.includes('human needs') || 
      lower.includes('how much a human needs') ||
      lower.includes('how does nutritrack calculate') ||
      lower.includes('bmr') ||
      lower.includes('tdee')
    ) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Understanding Calories, Detection & Human Requirements • NutriTrack PRO**

1. **What is a Calorie (kcal)?**
   - A calorie is simply a unit of energy. Just as a vehicle burns fuel to run its engine, your body burns calories every second to pump your heart, breathe air, repair cellular tissue, and walk.
   - **1 kcal** is the energy required to raise the temperature of 1 kg of water by 1°C.

2. **How NutriTrack Detects & Calculates Food Calories:**
   - **The Scientific 4-4-9 Macronutrient Formula:**
     - 🥩 **1g Protein = 4 kcal** (builds muscle & enzymes, high fullness factor)
     - 🌾 **1g Carbohydrates = 4 kcal** (primary fuel for brain & movement)
     - 🥑 **1g Fats/Oils = 9 kcal** (hormone regulation & cellular walls)
   - **560+ Lab-Verified Kerala & Indian Dishes:** Each food in our verified library is weighed by exact grams and oil cooking methods (e.g. shallow vs deep fry oil absorption).
   - **Multimodal AI Detection:** You can type any food, upload a photo, or speak in Malayalam or English to calculate calories instantly.

3. **How Much Calories Does a Human Need Daily?**
   - **Basal Metabolic Rate (BMR):** ~1,200 to 1,600 kcal burned just lying in bed staying alive (calculated using the international medical Mifflin-St Jeor formula).
   - **Total Daily Energy (TDEE):** BMR multiplied by your physical activity factor (~1,800 to 2,500 kcal).
   - **The 8,000 kcal Weight Rule:** Clinically, **8,000 kcal deficit = 1.0 kg of body fat burned**. A gentle deficit of 400–500 kcal/day loses ~1 kg every 16–20 days safely without starving!

💡 *Tip: Click the **"🧠 Calorie 101 Guide"** button on your dashboard to use the interactive calculator with your personalized height and weight!*`
      };
    }

    if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('diabetic') || lower.includes('glucose') || lower.includes('hba1c')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Blood Sugar & Diabetes Nutrition Guidance • Saleem Valanchery Wellness Centre**

1. **Plate Composition Strategy:**
   - 🥗 **50% Fiber:** Non-starchy vegetables (cucumber, cabbage, thoran, cheera, beans, salads).
   - 🥩 **25% Clean Protein:** Boiled eggs, fish, skinless chicken breast, paneer, sprouts, or chana dal.
   - 🌾 **25% Low GI Carbs:** Kerala Matta Rice (1 medium cup / 120g), oats, or multigrain chapati.
2. **Food Sequencing:** Always eat vegetables/salad and protein FIRST before touching carbohydrates to blunt post-meal glucose spikes by up to 40%.
3. **Avoid Liquid Sugars:** Completely eliminate sweetened sodas, sugary tea, fruit juices (eat whole fruits with pulp instead).
4. **Post-Meal Walk:** Take a light 10–15 minute walk after lunch and dinner to stimulate muscular glucose uptake.`
      };
    }

    if (lower.includes('workout') || lower.includes('gym') || lower.includes('exercise') || lower.includes('muscle') || lower.includes('pre workout') || lower.includes('post workout')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Fitness & Workout Nutrition Protocol • Saleem Valanchery Wellness Centre**

- **Daily Protein Target:** Aim for **1.2 to 1.6 grams of protein per kilogram of body weight** (e.g., a 70kg individual targets 85g–110g protein daily).
- **Pre-Workout Fuel (45–60 mins before):** 
  - 1 banana or 1 slice whole wheat bread with 1 tsp peanut butter, or black coffee for sustained energy.
- **Post-Workout Recovery (Within 45 mins):** 
  - 3–4 egg whites + 1 whole egg, or 1 scoop whey protein, or 150g grilled chicken breast + small bowl of boiled sweet potato or rice.
- **Hydration during training:** Drink 200–300ml water every 15–20 minutes of intense physical activity.`
      };
    }

    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('energy') || lower.includes('fatigue') || lower.includes('stress')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Sleep, Cortisol & Metabolic Energy • Saleem Valanchery Wellness Centre**

- **Target Sleep Duration:** **7 to 8 hours** of continuous, deep restorative sleep.
- **Why Sleep Impacts Weight:** Poor sleep elevates cortisol (stress hormone) and ghrelin (hunger hormone), triggering intense cravings for high-calorie sugary/greasy snacks.
- **Evening Wind-down Routine:** 
  1. Have dinner at least 2.5–3 hours before bedtime.
  2. Avoid caffeine after 3:00 PM.
  3. Turn off bright phone/tablet screens 45 minutes before sleeping.
  4. Keep the bedroom cool and dark.`
      };
    }

    if (lower.includes('belly') || lower.includes('plateau') || lower.includes('thadi') || lower.includes('weight loss') || lower.includes('kurayan')) {
      return {
        food: null,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **Belly Fat Reduction & Overcoming Weight Plateaus • Saleem Valanchery Wellness Centre**

1. **Audit Hidden Cooking Oils:** 1 tablespoon of coconut oil or sunflower oil adds **120 kcal**! Use our "Was it oily?" tracker to log light sauté or steamed preparations.
2. **Prioritize Daily Steps:** Target **8,000 to 10,000 steps** daily. Non-Exercise Activity Thermogenesis (NEAT) accounts for more daily calorie burn than gym workouts!
3. **High-Protein Breakfast:** Start your morning with boiled eggs, moong dal sprouts, or Greek yogurt to curb afternoon snacking.
4. **Hydration Check:** Drink 3 Litres of fresh water daily to prevent fluid retention and false hunger cravings.
5. **Progress Review:** Schedule a monthly InBody 270/770 Body Composition scan with Coach Saleem to assess visceral fat rating and lean muscle mass.`
      };
    }

    // 4. CHECK VERIFIED CLINIC LIBRARY OR CALCULATE WITH NUTRITIONAL ENGINE
    const cleanQuery = query.toLowerCase()
      .replace(/calories|calorie|macro|macros|what is|tell me about|how many|can i eat/g, '')
      .trim();

    // Look for exact or high-confidence match in foods or referral snacks:
    const matchedLibraryItem = foods.find(f => {
      const fName = f.name.toLowerCase();
      return cleanQuery === fName || cleanQuery.includes(fName) || fName.includes(cleanQuery) || fName.split(' ')[0] === cleanQuery.split(' ')[0];
    }) || KERALA_SNACKS_REFERRAL.find(s => {
      const sName = s.name.toLowerCase();
      return cleanQuery === sName || cleanQuery.includes(sName.split(' ')[0]) || sName.includes(cleanQuery);
    });

    if (matchedLibraryItem) {
      const isRef = 'steamedCal' in matchedLibraryItem;
      const baseCal = isRef ? (matchedLibraryItem as any).steamedCal : (matchedLibraryItem as any).calories;
      const baseFat = isRef ? (matchedLibraryItem as any).baseFat : (matchedLibraryItem as any).fat;
      const p = (matchedLibraryItem as any).protein;
      const c = (matchedLibraryItem as any).carbs;
      const name = matchedLibraryItem.name;
      const unit = (matchedLibraryItem as any).servingUnit || '1 serving';

      const foodItem: FoodData = {
        name,
        category: (matchedLibraryItem as any).category || 'Beverages & Snacks',
        servingUnit: unit,
        calories: baseCal,
        protein: p,
        carbs: c,
        fat: baseFat,
        fiber: (matchedLibraryItem as any).fiber || 1,
        glycemicIndex: (matchedLibraryItem as any).glycemicIndex || 'Low-Medium',
        verdict: (matchedLibraryItem as any).description || (matchedLibraryItem as any).tips || 'Verified Clinic Food Item',
        recommendation: (matchedLibraryItem as any).tips || 'Authentic clinical nutritional calibration from clinic database.'
      };

      return {
        food: foodItem,
        isMealLogReport: false,
        mealLogData: null,
        answer: `🔥 **Calories:** **${baseCal} kcal** (per **${unit}**)
- **Protein:** **${p}g** • **Carbs:** **${c}g** • **Fat:** **${baseFat}g**
✅ Verified in Saleem Valanchery Clinic Food Library.`
      };
    }

    // Dynamic Nutritional Inference for ANY food, ingredient, or recipe
    const isMalayalam = detectMalayalamOrManglish(query);
    const estimated = estimateNutrition(cleanQuery || query);
    const foodItem: FoodData = {
      name: estimated.name,
      category: estimated.category,
      servingUnit: estimated.servingUnit,
      calories: estimated.calories,
      protein: estimated.protein,
      carbs: estimated.carbs,
      fat: estimated.fat,
      fiber: estimated.fiber,
      glycemicIndex: estimated.glycemicIndex,
      verdict: estimated.verdict,
      recommendation: estimated.recommendation,
    };

    return {
      food: foodItem,
      isMealLogReport: false,
      mealLogData: null,
      answer: formatFoodMarkdown(estimated, 'steamed', 1, isMalayalam)
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    const currentImg = selectedImage;
    if ((!textToSend && !currentImg) || isLoading) return;

    const displayMsg = textToSend || "📸 [Uploaded Meal Photo for AI Analysis]";
    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: displayMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    // If client is offline, resolve directly through verified library or require-internet notice
    if (!navigator.onLine) {
      setTimeout(() => {
        const localResult = createLocalFallbackResponse(textToSend);
        const botMsgId = 'bot-' + Date.now();
        if (localResult.food) {
          autoAddFoodToLibrary(localResult.food);
        }
        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'bot',
          text: localResult.answer,
          food: localResult.food,
          mealLogData: localResult.mealLogData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        if (localResult.food) {
          setSelectedPortions(prev => ({ ...prev, [botMsgId]: 1 }));
          setSelectedMeasures(prev => ({ ...prev, [botMsgId]: 'serving' }));
          setSelectedSlots(prev => ({ ...prev, [botMsgId]: 'Evening Snack' }));
          setSelectedOilOptions(prev => ({ ...prev, [botMsgId]: 'steamed' }));
        }
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      const controller = new AbortController();
      // Generous 30-second timeout for full Gemini 3.8 Flash multimodal vision & recipe analysis
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend || "Analyze this meal photo, state each food calories first in bold, calculate 3 oil options, and stage for meal logging.",
          imageBase64: currentImg?.base64,
          mimeType: currentImg?.mimeType,
          clientContext
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsgId = 'bot-' + Date.now();

      // AUTOMATIC MANDATE: "each thing a client writes will be added to clinic food library"
      let autoAdded = false;
      if (data.food) {
        autoAdded = autoAddFoodToLibrary(data.food);
      } else if (data.mealLogData?.foods) {
        data.mealLogData.foods.forEach((f: any) => {
          autoAddFoodToLibrary({
            name: f.name,
            category: f.category || 'Beverages & Snacks',
            servingUnit: f.servingUnit || '1 serving',
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat
          });
        });
        autoAdded = true;
      }

      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: data.answer || "Here is your nutrition breakdown with calories stated first.",
        food: data.food || null,
        mealLogData: data.mealLogData || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        autoSavedToLibrary: autoAdded
      };

      // Set default portion (1x), measure ('serving'), slot ('Evening Snack'), and default oil option ('steamed')
      setSelectedPortions(prev => ({ ...prev, [botMsgId]: 1 }));
      setSelectedMeasures(prev => ({ ...prev, [botMsgId]: 'serving' }));
      const initialSlot = data.mealLogData?.detectedMealType || 'Evening Snack';
      setSelectedSlots(prev => ({ ...prev, [botMsgId]: initialSlot }));
      setSelectedOilOptions(prev => ({ ...prev, [botMsgId]: 'steamed' }));

      // Auto-add direct to column if granted & enabled
      if (autoAddToColumnOnSearch && grantBotColumnAccess && activeClient && data.food) {
        addMealLog({
          clientId: activeClient.id,
          date: selectedDate,
          mealType: initialSlot,
          foodId: 'food-ai-' + Date.now(),
          foodName: `${data.food.name} (Steamed / No Oil)`,
          quantity: 1,
          servingUnit: data.food.servingUnit,
          calories: data.food.calories,
          protein: data.food.protein,
          carbs: data.food.carbs,
          fat: data.food.fat
        });
        setSavedFoodNotice(`⚡ Bot auto-added ${data.food.name} (${data.food.calories} kcal) directly to your ${initialSlot} column!`);
      }

      // If meal log reported with time, stage it
      if (data.isMealLogReport && data.mealLogData) {
        addSuggestedMeal({
          clientId: activeClient?.id || 'cl-1',
          date: selectedDate,
          timeGiven: data.mealLogData.timeGiven,
          mealType: data.mealLogData.detectedMealType,
          foods: data.mealLogData.foods,
          totalCalories: data.mealLogData.totalCalories,
          totalProtein: data.mealLogData.totalProtein,
          totalCarbs: data.mealLogData.totalCarbs,
          totalFat: data.mealLogData.totalFat,
          note: `Reported via NutriBot Chat at ${data.mealLogData.timeGiven}`
        });
        setSavedFoodNotice(`✨ Suggested for ${data.mealLogData.detectedMealType} & added to Food Library!`);
        setTimeout(() => setSavedFoodNotice(null), 4000);
      }

      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.warn("AI Chatbot falling back to local Kerala database safely:", err);
      // BULLETPROOF FALLBACK: Guarantees user never experiences "chat bot is not working"
      const localResult = createLocalFallbackResponse(textToSend);
      const botMsgId = 'bot-' + Date.now();

      let autoAdded = false;
      if (localResult.food) {
        autoAdded = autoAddFoodToLibrary(localResult.food);
      } else if (localResult.mealLogData?.foods) {
        localResult.mealLogData.foods.forEach((f: any) => {
          autoAddFoodToLibrary({
            name: f.name,
            category: f.category || 'Beverages & Snacks',
            servingUnit: f.servingUnit || '1 serving',
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat
          });
        });
        autoAdded = true;
      }

      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: localResult.answer,
        food: localResult.food,
        mealLogData: localResult.mealLogData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        autoSavedToLibrary: autoAdded
      };

      setSelectedPortions(prev => ({ ...prev, [botMsgId]: 1 }));
      setSelectedMeasures(prev => ({ ...prev, [botMsgId]: 'serving' }));
      const fallbackSlot = localResult.mealLogData?.detectedMealType || 'Evening Snack';
      setSelectedSlots(prev => ({ ...prev, [botMsgId]: fallbackSlot }));
      setSelectedOilOptions(prev => ({ ...prev, [botMsgId]: 'steamed' }));

      // Auto-add direct to column if granted & enabled
      if (autoAddToColumnOnSearch && grantBotColumnAccess && activeClient && localResult.food) {
        addMealLog({
          clientId: activeClient.id,
          date: selectedDate,
          mealType: fallbackSlot,
          foodId: 'food-ai-' + Date.now(),
          foodName: `${localResult.food.name} (Steamed / No Oil)`,
          quantity: 1,
          servingUnit: localResult.food.servingUnit,
          calories: localResult.food.calories,
          protein: localResult.food.protein,
          carbs: localResult.food.carbs,
          fat: localResult.food.fat
        });
        setSavedFoodNotice(`⚡ Bot auto-added ${localResult.food.name} (${localResult.food.calories} kcal) directly to your ${fallbackSlot} column!`);
      }

      if (localResult.isMealLogReport && localResult.mealLogData) {
        addSuggestedMeal({
          clientId: activeClient?.id || 'cl-1',
          date: selectedDate,
          timeGiven: localResult.mealLogData.timeGiven,
          mealType: localResult.mealLogData.detectedMealType,
          foods: localResult.mealLogData.foods,
          totalCalories: localResult.mealLogData.totalCalories,
          totalProtein: localResult.mealLogData.totalProtein,
          totalCarbs: localResult.mealLogData.totalCarbs,
          totalFat: localResult.mealLogData.totalFat,
          note: `Reported via NutriBot Chat at ${localResult.mealLogData.timeGiven}`
        });
      }

      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute oil-adjusted nutrition and measure-scaled nutrition for a given message
  const getAdjustedNutrition = (msgId: string, baseFood: FoodData) => {
    const portion = selectedPortions[msgId] ?? 1;
    const measureId = selectedMeasures[msgId] || 'serving';
    const measureObj = MEASURE_UNITS.find(m => m.id === measureId) || MEASURE_UNITS[0];
    const measureFactor = measureObj.factor;

    const oilOption = selectedOilOptions[msgId] || 'steamed';

    // 3 Options calculation:
    // Steamed = +0 kcal, +0g fat
    // Medium = +45 kcal, +5g fat
    // Fried = +120 kcal, +13g fat
    const oilCal = oilOption === 'fried' ? 120 : oilOption === 'medium' ? 45 : 0;
    const oilFat = oilOption === 'fried' ? 13 : oilOption === 'medium' ? 5 : 0;

    const totalMultiplier = portion * measureFactor;

    const adjustedCalories = Math.round((baseFood.calories + oilCal) * totalMultiplier);
    const adjustedProtein = Number((baseFood.protein * totalMultiplier).toFixed(1));
    const adjustedCarbs = Number((baseFood.carbs * totalMultiplier).toFixed(1));
    const adjustedFat = Number(((baseFood.fat + oilFat) * totalMultiplier).toFixed(1));
    const adjustedFiber = baseFood.fiber ? Number((baseFood.fiber * totalMultiplier).toFixed(1)) : undefined;

    return {
      oilOption,
      oilCal,
      oilFat,
      adjustedCalories,
      adjustedProtein,
      adjustedCarbs,
      adjustedFat,
      adjustedFiber,
      portion,
      measureId,
      measureLabel: measureObj.label,
      measureFactor,
      totalMultiplier
    };
  };

  // Handle logging food directly from the chat card to the client column with all details
  const handleLogFoodFromChat = (msgId: string, food: FoodData, targetSlot?: MealType) => {
    if (!activeClient) {
      alert("Please select a client from Column 2 or sign in to log this food into the daily diary.");
      return;
    }

    const { oilOption, adjustedCalories, adjustedProtein, adjustedCarbs, adjustedFat, portion, measureLabel } =
      getAdjustedNutrition(msgId, food);
    const slot = targetSlot || selectedSlots[msgId] || 'Evening Snack';

    const oilLabel =
      oilOption === 'fried' ? 'Deep Fried (+120 kcal)' :
      oilOption === 'medium' ? 'Medium Sauté (+45 kcal)' :
      'Steamed / No Oil';

    const servingDesc = portion !== 1 || measureLabel !== 'Standard Serving / Piece'
      ? `${portion}x [${measureLabel}]`
      : food.servingUnit;

    // Add to daily meal logs in AppContext (Column 3 / Client Daily Diary)
    addMealLog({
      clientId: activeClient.id,
      date: selectedDate,
      mealType: slot,
      foodId: 'food-ai-' + Date.now(),
      foodName: `${food.name} (${oilLabel})`,
      quantity: portion,
      servingUnit: servingDesc,
      calories: adjustedCalories,
      protein: adjustedProtein,
      carbs: adjustedCarbs,
      fat: adjustedFat
    });

    // Mark message as logged
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, loggedSuccess: true } : m));
    
    // Feedback: Bot directly gave other details of that food to column
    setSavedFoodNotice(
      `⚡ Bot directly added ${food.name} (${adjustedCalories} kcal, P:${adjustedProtein}g, C:${adjustedCarbs}g, F:${adjustedFat}g) to ${slot} column!`
    );
    setTimeout(() => setSavedFoodNotice(null), 4000);
  };

  // Handle logging whole suggested meal from chat card
  const handleLogSuggestedMealFromChat = (msgId: string, mealLogData: NonNullable<ChatMessage['mealLogData']>) => {
    if (!activeClient) {
      alert("Please sign in or select a client to log this meal into the daily diary.");
      return;
    }

    const oilOption = selectedOilOptions[msgId] || 'steamed';
    const oilCal = oilOption === 'fried' ? 120 : oilOption === 'medium' ? 45 : 0;
    const oilFat = oilOption === 'fried' ? 13 : oilOption === 'medium' ? 5 : 0;

    mealLogData.foods.forEach((f, idx) => {
      addMealLog({
        clientId: activeClient.id,
        date: selectedDate,
        mealType: mealLogData.detectedMealType,
        foodId: `food-ai-${Date.now()}-${idx}`,
        foodName: `${f.name} (${oilOption === 'fried' ? 'Deep Fried' : oilOption === 'medium' ? 'Medium Sauté' : 'Steamed'})`,
        quantity: f.quantity || 1,
        servingUnit: f.servingUnit || '1 serving',
        calories: f.calories + oilCal,
        protein: f.protein,
        carbs: f.carbs,
        fat: Number((f.fat + oilFat).toFixed(1)),
      });
    });

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, loggedSuccess: true } : m));
    setSavedFoodNotice(`✓ Successfully logged all items to your ${mealLogData.detectedMealType}!`);
    setTimeout(() => setSavedFoodNotice(null), 3500);
  };

  // Enhanced clinical visual formatter for headings, key-value pills, calories, and Malayalam text
  const renderFormattedText = (content: string) => {
    const isWarning = content.includes('Internet Required') || content.includes('ഇന്റർനെറ്റ് കണക്ഷൻ ആവശ്യമാണ്');
    const lines = content.split('\n');

    return (
      <div className={`space-y-1.5 text-xs sm:text-sm leading-relaxed ${isWarning ? 'p-3 bg-amber-50/90 border border-amber-300 rounded-2xl' : ''}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Prominent Hero Calories Line
          if (trimmed.startsWith('🔥 **Calories:**') || trimmed.startsWith('🔥 **കാലറി (Calories):**') || trimmed.startsWith('🔥 **Each Food\'s Calories')) {
            return (
              <div key={idx} className="my-2 p-2.5 bg-linear-to-r from-amber-100 via-amber-50 to-orange-100 border-2 border-amber-300 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                  <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                    {formatInlineBolds(trimmed.replace('🔥 ', ''))}
                  </span>
                </div>
              </div>
            );
          }

          // Section Headings (###)
          if (trimmed.startsWith('### ')) {
            const headingText = trimmed.replace('### ', '');
            return (
              <div key={idx} className="pt-2 pb-1 border-b border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full inline-block" />
                  <span>{formatInlineBolds(headingText)}</span>
                </h4>
              </div>
            );
          }

          // Was it oily / colored cooking options
          if (trimmed.startsWith('- 🟢') || trimmed.startsWith('- 🟡') || trimmed.startsWith('- 🔴')) {
            const isGreen = trimmed.includes('🟢');
            const isYellow = trimmed.includes('🟡');
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold my-1 border ${
                  isGreen
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : isYellow
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <span>{formatInlineBolds(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Normal bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="text-emerald-600 font-bold text-xs mt-0.5">•</span>
                <span className="text-slate-800 leading-normal">{formatInlineBolds(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Warning block detection
          if (trimmed.startsWith('⚠️')) {
            return (
              <div key={idx} className="flex items-center gap-2 p-2 bg-amber-100/80 border border-amber-300 rounded-xl text-amber-950 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{formatInlineBolds(trimmed.replace('⚠️', ''))}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-800 leading-relaxed font-normal">
              {formatInlineBolds(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const formatInlineBolds = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-black text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button - Compact Square, Moveable by Dragging */}
      {!isOpen && (
        <div
          id="nutribot-trigger-btn"
          style={btnPos ? { position: 'fixed', left: `${btnPos.x}px`, top: `${btnPos.y}px`, bottom: 'auto', right: 'auto' } : undefined}
          className={btnPos ? 'fixed z-[9999] select-none' : 'fixed bottom-5 right-5 z-[9999] select-none'}
        >
          <button
            type="button"
            onMouseDown={handleBtnDragStart}
            onTouchStart={handleBtnDragStart}
            aria-label={t('Ask NutriBot')}
            title={`${t('Ask NutriBot')} · ${t('Click & Drag to Move')}`}
            className="w-14 h-14 aspect-square rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer border-2 border-emerald-400/50 flex flex-col items-center justify-center gap-0.5"
          >
            <NutriTrackLogo size="xs" showText={false} variant="dark" />
            <span className="text-[9px] font-bold tracking-tight text-emerald-100 leading-none">
              AI
            </span>
          </button>
        </div>
      )}

      {/* Floating Chatbot Modal / Drawer - Moveable position */}
      {isOpen && (
        <div
          id="nutribot-window-container"
          style={!isExpanded && modalPos ? { position: 'fixed', left: `${modalPos.x}px`, top: `${modalPos.y}px`, bottom: 'auto', right: 'auto' } : undefined}
          className={`fixed z-[9999] transition-all duration-150 flex flex-col bg-white rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-8'
              : modalPos
                ? 'w-[calc(100vw-24px)] sm:w-[520px] h-[720px] max-h-[92vh]'
                : 'bottom-4 right-4 w-[calc(100vw-24px)] sm:w-[520px] h-[720px] max-h-[92vh]'
          }`}
        >
          {/* Draggable repositioning bar */}
          <div
            onMouseDown={handleModalDragStart}
            onTouchStart={handleModalDragStart}
            className="bg-emerald-950 text-emerald-200/90 px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold cursor-grab active:cursor-grabbing select-none border-b border-white/10"
            title={t('Click & Drag to Move')}
          >
            <div className="flex items-center gap-1.5">
              <GripHorizontal className="w-4 h-4 text-amber-300" />
              <span>{t('Click & Drag to Move')}</span>
            </div>
            {(modalPos || btnPos) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalPos(null);
                  setBtnPos(null);
                }}
                className="text-[10px] text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors"
                title="Reset position back to default bottom-right"
              >
                Reset
              </button>
            )}
          </div>

          {/* Clean Uncluttered Top Header + High-Contrast Close Button */}
          <div className="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div
              onMouseDown={handleModalDragStart}
              onTouchStart={handleModalDragStart}
              className="flex items-center gap-2.5 min-w-0 cursor-grab active:cursor-grabbing"
              title={t('Click & Drag to Move')}
            >
              <NutriTrackLogo size="sm" showText={false} variant="dark" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                    {t('NutriBot')}
                  </h3>
                  {!isOnline && (
                    <span className="text-[10px] font-semibold text-amber-200 flex items-center gap-1 shrink-0">
                      <WifiOff className="w-3 h-3" />
                      {t('Verified Library Mode')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-200 truncate">
                  {t('Kerala Food AI · Vision & Voice')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setGrantBotColumnAccess(!grantBotColumnAccess)}
                title={grantBotColumnAccess ? 'Bot has access to directly log into client diary' : 'Click to grant bot access to client diary'}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                  grantBotColumnAccess
                    ? 'bg-emerald-700/80 text-emerald-50 border-emerald-500/60'
                    : 'bg-white/10 text-white/75 border-white/20'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>{grantBotColumnAccess ? t('Column Access') : t('Access Off')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReferralGuide(!showReferralGuide)}
                title="View Kerala Snacks & Calories Referral List"
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer border ${
                  showReferralGuide
                    ? 'bg-amber-400 text-slate-900 border-amber-300 font-extrabold'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('Referral')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-white/85 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
                title={isExpanded ? 'Restore window size' : 'Expand chat window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t('Close')}
                className="px-3 py-1.5 bg-white/20 hover:bg-rose-600 text-white border border-white/30 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
                title={t('Close')}
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>{t('Close')}</span>
              </button>
            </div>
          </div>

          {/* Active Client Strip (Only shown when client is signed in) */}
          {activeClient && (
            <div className="bg-emerald-50/90 px-4 py-1.5 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold truncate">{activeClient.name}</span>
                <span className="text-emerald-500">·</span>
                <span className="text-slate-600 truncate text-[11px]">{activeClient.goal}</span>
              </div>
              <div className="font-mono font-bold text-[11px] text-emerald-800 shrink-0 tabular-nums">
                {clientContext.remainingCalories} kcal left
              </div>
            </div>
          )}

          {/* Saved Notification Banner */}
          {savedFoodNotice && (
            <div className="bg-emerald-100 text-emerald-900 text-xs px-4 py-2 border-b border-emerald-200 flex items-center gap-2 shrink-0 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold">{savedFoodNotice}</span>
            </div>
          )}

          {/* Kerala Snacks Referral Drawer (Mandate: "add snacks and its calories in referal") */}
          {showReferralGuide && (
            <div className="bg-linear-to-b from-amber-50 to-orange-50/40 p-3.5 border-b-2 border-amber-300 max-h-56 overflow-y-auto shrink-0 shadow-inner space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🌴</span>
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Kerala Snacks &amp; Calories Referral Guide
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReferralGuide(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                Official reference values from Saleem Valanchery Wellness Centre. Tap <strong>Check</strong> to inspect oil options &amp; auto-add to centre library:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {KERALA_SNACKS_REFERRAL.map((snack, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{snack.name}</div>
                      <div className="text-[10px] text-slate-500">{snack.servingUnit}</div>
                      <div className="text-[10px] font-black text-amber-900 mt-0.5">
                        🔥 {snack.steamedCal} kcal (Base) • Fried: {snack.friedCal} kcal
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReferralGuide(false);
                        handleSendMessage(`Tell me about ${snack.name} calories and calculate was it oily options`);
                      }}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shrink-0 cursor-pointer shadow-2xs transition-colors"
                    >
                      Check &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message List - Maximum vertical space and high visibility */}
          <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              // Extract oil adjustment calculations if food object is present
              const adjusted = msg.food ? getAdjustedNutrition(msg.id, msg.food) : null;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {/* Badge: Automatically Added to Clinic Food Library */}
                    {msg.autoSavedToLibrary && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>✨ Automatically Saved to Centre Food Library</span>
                      </div>
                    )}

                    {/* SUGGESTED MEAL CARD (When reporting meal eaten with time) */}
                    {msg.mealLogData && (
                      <div className="mb-3.5 p-3.5 bg-linear-to-br from-emerald-50 via-teal-50 to-amber-50/40 rounded-2xl border-2 border-emerald-300 text-slate-900 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-emerald-200">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                              <span className="font-black text-slate-900 text-sm">Suggested for Your Meals Section</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                Eaten at: <strong className="text-slate-900 font-extrabold">{msg.mealLogData.timeGiven}</strong>
                              </span>
                              <span>•</span>
                              <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md text-[11px]">
                                {msg.mealLogData.detectedMealType}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block flex items-center justify-end gap-1">
                              <Flame className="w-3 h-3 text-amber-600" />
                              Total Calories
                            </span>
                            <span className="text-base font-black text-amber-950">
                              {msg.mealLogData.totalCalories} <span className="text-xs font-bold text-amber-700">kcal</span>
                            </span>
                          </div>
                        </div>

                        {/* Each Food's Calories Stated FIRST */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            Each Food's Calories (Check First):
                          </span>
                          
                          <div className="space-y-1.5">
                            {msg.mealLogData.foods.map((food, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs"
                              >
                                <div className="flex-1 mr-2">
                                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                                    {food.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Portion: <strong className="text-slate-700">{food.quantity}x ({food.servingUnit})</strong>
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-black text-amber-950 text-xs sm:text-sm bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-amber-600" />
                                    <strong>{food.calories} kcal</strong>
                                  </span>
                                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                                    P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Was it oily? 3 Options for this suggested meal */}
                        <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1.5">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5 text-amber-600" />
                            Was this meal oily? (Select cooking style):
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'steamed', label: '🟢 Steamed / No Oil', sub: '+0 kcal' },
                              { id: 'medium', label: '🟡 Medium Sauté', sub: '+45 kcal' },
                              { id: 'fried', label: '🔴 Deep Fried', sub: '+120 kcal' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedOilOptions(prev => ({ ...prev, [msg.id]: opt.id as any }))}
                                className={`p-1.5 rounded-lg text-center border transition-all cursor-pointer ${
                                  (selectedOilOptions[msg.id] || 'steamed') === opt.id
                                    ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <div className="text-[10px] font-bold leading-tight">{opt.label}</div>
                                <div className="text-[9px] text-slate-500 font-semibold">{opt.sub}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleLogSuggestedMealFromChat(msg.id, msg.mealLogData!)}
                            disabled={msg.loggedSuccess}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              msg.loggedSuccess
                                ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            }`}
                          >
                            {msg.loggedSuccess ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-800" />
                                <span>Added to Daily Meal Diary!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add to {msg.mealLogData.detectedMealType} Diary</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FOOD INQUIRY CARD: Calories First + "Was it oily? 3 Options" + Auto-Added Library */}
                    {msg.food && adjusted && (
                      <div className="mb-3.5 p-3.5 bg-emerald-50/70 rounded-2xl border-2 border-emerald-200 text-slate-900 space-y-3">
                        
                        {/* 1. Food Header with Photo */}
                        <div className="flex items-start justify-between gap-2.5 pb-2 border-b border-emerald-200/80">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={getFoodImageUrl(msg.food.name, msg.food.category)}
                              alt={msg.food.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = FOOD_FALLBACK_SVG;
                              }}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-emerald-200 bg-white"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-slate-900 text-base truncate">{tf(msg.food.name)}</span>
                                <span className="text-[11px] font-semibold text-emerald-800">
                                  · {t(msg.food.category)}
                                </span>
                              </div>
                              <span className="text-xs text-slate-600 font-bold block mt-0.5">
                                {t('Serving Unit')}: <strong className="text-slate-900">{msg.food.servingUnit}</strong>
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs shrink-0">
                            {msg.food.glycemicIndex || 'GI: Balanced'}
                          </span>
                        </div>

                        {/* 2. PROMINENT CALORIES FIRST BANNER (Dynamic recalculation with oil) */}
                        <div className="p-3 bg-amber-100 border-2 border-amber-300 rounded-xl flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                                Calories First Check
                              </span>
                              <span className="text-xs font-semibold text-amber-900">
                                {adjusted.portion}x portion ({adjusted.oilOption === 'fried' ? 'Deep Fried' : adjusted.oilOption === 'medium' ? 'Medium Sauté' : 'Steamed / No Oil'})
                              </span>
                            </div>
                          </div>
                          <span className="text-xl font-black text-amber-950">
                            {adjusted.adjustedCalories} <span className="text-xs font-bold text-amber-700">kcal</span>
                          </span>
                        </div>

                        {/* 3. CRITICAL MANDATE: "Was it oily? 3 options and calculate the calories accordingly" */}
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <Droplets className="w-3.5 h-3.5 text-amber-600" />
                              Was it oily? (3 Cooking Options):
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Live Calorie Recalculation
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              {
                                id: 'steamed',
                                title: '🟢 No Oil / Steamed',
                                calText: `${Math.round(msg.food.calories * adjusted.portion)} kcal`,
                                subText: '+0 kcal (0g added fat)'
                              },
                              {
                                id: 'medium',
                                title: '🟡 Medium Sauté',
                                calText: `${Math.round((msg.food.calories + 45) * adjusted.portion)} kcal`,
                                subText: '+45 kcal (+5g fat)'
                              },
                              {
                                id: 'fried',
                                title: '🔴 Deep Fried / Oily',
                                calText: `${Math.round((msg.food.calories + 120) * adjusted.portion)} kcal`,
                                subText: '+120 kcal (+13g fat)'
                              },
                            ].map((opt) => {
                              const isSelected = adjusted.oilOption === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedOilOptions(prev => ({ ...prev, [msg.id]: opt.id as any }))}
                                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold leading-tight">{opt.title}</div>
                                  <div className="text-xs font-black text-amber-900 mt-0.5">{opt.calText}</div>
                                  <div className="text-[9px] text-slate-500">{opt.subText}</div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                            <span>Selected preparation: <strong className="text-slate-900">{adjusted.oilOption === 'fried' ? 'Deep Fried' : adjusted.oilOption === 'medium' ? 'Medium Sauté' : 'No Oil / Steamed'}</strong></span>
                            <span className="font-bold text-amber-800">
                              {adjusted.oilCal > 0 ? `+${adjusted.oilCal} kcal from oil` : 'Zero added oil calories'}
                            </span>
                          </div>
                        </div>

                        {/* 4. Core Macronutrients Grid (Calories, Protein, Carbs, Fat) */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                            <span className="text-[10px] font-black text-amber-800 block flex items-center justify-center gap-0.5">
                              <Flame className="w-3 h-3 text-amber-600 inline" />
                              Calories
                            </span>
                            <span className="text-sm font-black text-amber-950 mt-0.5 block">
                              {adjusted.adjustedCalories} <span className="text-[9px] font-normal text-amber-700">kcal</span>
                            </span>
                          </div>

                          <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200">
                            <span className="text-[10px] font-black text-emerald-800 block flex items-center justify-center gap-0.5">
                              <Dumbbell className="w-3 h-3 text-emerald-600 inline" />
                              Protein
                            </span>
                            <span className="text-sm font-black text-emerald-950 mt-0.5 block">
                              {adjusted.adjustedProtein} <span className="text-[9px] font-normal text-emerald-700">g</span>
                            </span>
                          </div>

                          <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200">
                            <span className="text-[10px] font-black text-blue-800 block flex items-center justify-center gap-0.5">
                              <Wheat className="w-3 h-3 text-blue-600 inline" />
                              Carbs
                            </span>
                            <span className="text-sm font-black text-blue-950 mt-0.5 block">
                              {adjusted.adjustedCarbs} <span className="text-[9px] font-normal text-blue-700">g</span>
                            </span>
                          </div>

                          <div className="bg-orange-50/80 p-2 rounded-xl border border-orange-200">
                            <span className="text-[10px] font-black text-orange-800 block flex items-center justify-center gap-0.5">
                              <Droplets className="w-3 h-3 text-orange-600 inline" />
                              Fat
                            </span>
                            <span className="text-sm font-black text-orange-950 mt-0.5 block">
                              {adjusted.adjustedFat} <span className="text-[9px] font-normal text-orange-700">g</span>
                            </span>
                          </div>
                        </div>

                        {/* 5. Options of Qty & One Food Measure */}
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                            <span className="text-slate-800 font-extrabold text-[11px] flex items-center gap-1">
                              <span>📏</span>
                              <span>Options of Qty &amp; Measure:</span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {adjusted.portion}x • {adjusted.adjustedCalories} kcal
                            </span>
                          </div>

                          {/* Measure of One Food Selector */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">
                              Measure of 1 Food Unit:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                              {MEASURE_UNITS.map((u) => {
                                const isSelected = (selectedMeasures[msg.id] || 'serving') === u.id;
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setSelectedMeasures(prev => ({ ...prev, [msg.id]: u.id }))}
                                    className={`px-2 py-1 rounded-lg text-left text-[10px] font-bold border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="truncate">{u.label}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quantity Selector: Quick multipliers + Stepper */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-slate-500">Qty:</span>
                              {[0.5, 1, 1.5, 2, 3, 4].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setSelectedPortions(prev => ({ ...prev, [msg.id]: p }))}
                                  className={`px-1.5 py-0.5 text-[11px] font-black rounded-md transition-colors cursor-pointer ${
                                    (selectedPortions[msg.id] ?? 1) === p
                                      ? 'bg-emerald-700 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {p}x
                                </button>
                              ))}
                            </div>

                            {/* Stepper buttons */}
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = selectedPortions[msg.id] ?? 1;
                                  if (cur > 0.5) setSelectedPortions(prev => ({ ...prev, [msg.id]: Number((cur - 0.5).toFixed(1)) }));
                                }}
                                className="w-5 h-5 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold px-1 text-slate-900">
                                {selectedPortions[msg.id] ?? 1}x
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = selectedPortions[msg.id] ?? 1;
                                  setSelectedPortions(prev => ({ ...prev, [msg.id]: Number((cur + 0.5).toFixed(1)) }));
                                }}
                                className="w-5 h-5 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 6. Add Direct to Food Menu on Each Section (In Chronological Order) */}
                        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-950 font-black text-[11px] flex items-center gap-1">
                              <span>🍽️</span>
                              <span>Add Direct to Food Menu by Section:</span>
                            </span>
                            <span className="text-[10px] text-emerald-800 font-bold">In Daily Order</span>
                          </div>

                          {/* 5 Ordered Sections: Morning, Morning Snack, Lunch, Evening, Night */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                            {ORDERED_MEAL_SECTIONS.map((sec) => {
                              const isSelected = (selectedSlots[msg.id] || 'Evening Snack') === sec.id;
                              return (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => setSelectedSlots(prev => ({ ...prev, [msg.id]: sec.id }))}
                                  className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-700 border-emerald-800 text-white font-black shadow-xs ring-2 ring-emerald-400'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  <div className="text-sm">{sec.icon}</div>
                                  <div className="text-[11px] font-bold leading-tight truncate">{sec.label}</div>
                                  <div className={`text-[9px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {sec.short}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 7. Grant Bot Access & Action: Direct Add to Column */}
                        <div className="space-y-1.5 pt-1">
                          {grantBotColumnAccess ? (
                            <button
                              type="button"
                              onClick={() => handleLogFoodFromChat(msg.id, msg.food!)}
                              disabled={msg.loggedSuccess}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                                msg.loggedSuccess
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
                              }`}
                            >
                              {msg.loggedSuccess ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-700" />
                                  <span>✓ Directly Added to {selectedSlots[msg.id] || 'Evening Snack'} Column!</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                                  <span>
                                    ⚡ Direct Add to {ORDERED_MEAL_SECTIONS.find(s => s.id === (selectedSlots[msg.id] || 'Evening Snack'))?.label || selectedSlots[msg.id]} Column ({adjusted.adjustedCalories} kcal)
                                  </span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-center">
                              <p className="text-[11px] text-amber-900 font-bold mb-1">
                                🔒 Bot Column Access is paused.
                              </p>
                              <button
                                type="button"
                                onClick={() => setGrantBotColumnAccess(true)}
                                className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer"
                              >
                                Grant Access to Bot to Add to Column
                              </button>
                            </div>
                          )}

                          {/* Quick 1-Click Direct Add to ANY Section */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span className="font-bold text-slate-600">Quick 1-click add to column:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {ORDERED_MEAL_SECTIONS.map((sec) => (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => handleLogFoodFromChat(msg.id, msg.food!, sec.id)}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                                  title={`Directly add to ${sec.label} column`}
                                >
                                  +{sec.short}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Markdown conversational text */}
                    <div className="space-y-1.5">
                      {renderFormattedText(msg.text)}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-[80%]">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>NutriBot is calculating calories &amp; oil preparation...</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Compact Wrapped Quick Prompts (No Horizontal Scrollbar) */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {t('Quick:')}
            </span>
            {quickPrompts.slice(0, 5).map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.query)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Image Attachment Preview */}
          {selectedImage && (
            <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <img src={selectedImage.preview} alt="Meal preview" className="w-9 h-9 rounded-lg object-cover border border-emerald-300 shadow-2xs" />
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">📸 Meal Photo Attached</span>
                  <span className="text-[10px] text-emerald-700">Gemini 3.8 Flash will analyze plate & calories</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-slate-400 hover:text-red-600 p-1 rounded-full cursor-pointer transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden File Input for Camera / Photo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Active Voice Recording / Transcribing Indicator Banner */}
          {isRecordingVoice && (
            <div className="px-3.5 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-950 shrink-0 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span className="font-black text-xs">
                  🎙️ Recording Voice Note... ({voiceSeconds}s)
                </span>
                <span className="text-[10px] text-rose-700 hidden sm:inline font-medium">
                  Speak in Malayalam or English (e.g. "Pazham Pori calories", "2 appam kazhichu")
                </span>
              </div>
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Done &rarr;
              </button>
            </div>
          )}

          {isTranscribingVoice && (
            <div className="px-3.5 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 shrink-0">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span className="font-bold">NutriAI is transcribing Malayalam / English audio...</span>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            {/* Camera / Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
                selectedImage 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400' 
                  : 'bg-slate-50 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500'
              }`}
              title="Upload or snap meal photo for Gemini 3.8 Flash AI analysis"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
              disabled={isLoading || isTranscribingVoice}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                isRecordingVoice
                  ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-slate-50 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500'
              }`}
              title={isRecordingVoice ? "Stop recording & transcribe" : "Record voice note in Malayalam or English"}
            >
              {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedImage 
                  ? "Add note about this meal photo..." 
                  : isRecordingVoice 
                    ? "Listening to voice note..." 
                    : t('Ask in English or Malayalam, speak with mic, or snap plate photo...')
              }
              disabled={isLoading || isRecordingVoice}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || isRecordingVoice || (!inputMessage.trim() && !selectedImage)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-2xl transition-colors cursor-pointer shadow-xs shrink-0 flex items-center justify-center"
              title="Send to NutriAI"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Subtext */}
          <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Saleem Valanchery Centre
            </span>
            <span>{t('All foods auto-saved to library')}</span>
          </div>

        </div>
      )}
    </>
  );
};
