# NutriTrack v2 — Clinical Nutrition, Activity & Adaptive Wellness Platform

**Eat smart. Live strong.**

NutriTrack v2 is a full-stack nutrition, lifestyle, and clinic accountability platform connecting clients and registered dietitians/coaches. Built on React 19, TypeScript, Tailwind CSS v4, Express, Recharts, MediaPipe Face Landmarker, Google Gemini API, and Firebase Firestore.

---

## Key Features (v2 Upgrade)

### 1. Wellness Brand, Design Tokens & Bilingual Support
- **Editorial Wellness Palette**: Deep forest emerald (`#064e3b`), sage (`#6ee7b7`), warm ivory (`#fafaf8`), and refined gold/coral accents via CSS design tokens with full **Light & Dark mode** and custom accent themes.
- **Typography**: `Playfair Display` headings paired with `Inter` UI copy and `tabular-nums` alignment across nutrition metrics.
- **Custom SVG Identity**: Leaf + heartbeat + progress ring emblem (`NutriTrackLogo`), favicon, and monochrome variants with subtle botanical wellness backdrops.
- **Bilingual EN / മലയാളം**: Complete English and Malayalam UI translation (`i18n.ts`) plus bilingual **NutriAI** voice/text/photo food coach (`/api/ai-chat`, `/api/ai-detect-food`).

### 2. Solo Client Login & Centered Selected-Date Action Bar
- **Client-First Authentication**: Solo client sign-in screen by default; tapping the NutriTrack logo unlocks the Coach / Dietitian Team Portal.
- **Centered Action Bar**: Directly below the Date Selector (`Log Meal`, `Log Workout`, `Diet Plan`), synced to `selectedDate` across modals and panels, staying single-row even on `360px` mobile screens.
- **Focused Tools Launcher**: Cleaned up redundant modal links while preserving Calorie Detect, Theme Customizer, Coach Messaging, Body Composition, Reminders, and Health Device Sync.

### 3. Profile Studio & On-Device Face-Matched Avatar
- **Profile & Picture Editor (`ProfileEditorModal`)**: Upload, crop, zoom, and rotate profile photos with client-side validation & compression, Metric/Imperial toggles, dietary preferences, and allergies. Privacy-first: photos personalize your avatar and are processed on-device.
- **MediaPipe Face Landmarker (`faceLandmarker.ts`)**: Extracts face shape, skin tone, hair color/style, eye color, eyebrows, facial hair, and eyewear on-device, paired with a manual **Fine-Tune** drawer.
- **Dynamic Body & Nutrient Avatar (`BodyNutritionAvatar`)**: Smoothly adapts body composition/posture to logged daily calories and macro distribution while keeping the user's face fixed.

### 4. Clinical Safety Caps, Nutrient Rings, Sugar & Water Tracking
- **Evidence-Based Safety Limits (`clinicalSafety.ts`)**:
  - Calorie floor enforcement (`>= 1200 kcal` Female, `>= 1500 kcal` Male, `>= 1350 kcal` Other).
  - Weekly weight-loss pace capped at `<= 1.0 kg/week` (~1,100 kcal/day max deficit).
  - Minimum safe target weight floored at **BMI 18.5** with supportive, non-punitive alerts if an unhealthy target is entered.
- **Interactive Nutrient Dashboard (`DailyNutrientsCard`)**:
  - 6 SVG circular progress rings (`Calories`, `Protein`, `Carbs`, `Fats`, `Fiber`, `Sugar`) + quick `+250 ml Water` tracker & clickable micronutrients (`Iron`, `Vitamin D`, `Magnesium`, `Calcium`) opening `NutrientSourceBreakdownModal`.
  - **Recharts Macro Split Donut** and collapsible **Meal-by-Meal Nutrient Breakdown**.
- **Trajectory & BMI Card (`CalorieWeightTrajectoryCard`)**:
  - `8,000 kcal = 1 kg` cumulative calorie projection + 3-tab analytics strip: **7d Calories (`BarChart`)**, **Weight Curve (`LineChart` + Projected Goal Date)**, and interactive **Metric/Imperial BMI Calculator** with WHO spectrum gauge.

### 5. Monthly Cheat Meal Limit, Accountability Challenges & Weekly Digest
- **1 Allowed Treat / Calendar Month (`CheatAccountabilityCard`)**:
  - Tracks monthly treat availability (`0/1 used` or `1/1 used`).
  - Logging a 2nd+ cheat meal in the same month triggers an automated **Next-Day Accountability Challenge** (e.g., *50 Push-Ups + 50 Squats*), persisted in Firestore (`/challenges`) and synced across the dashboard, workout modal, and notification center.
  - Supports **Split into 5×10 Sets** (interactive set bubbles), **Beginner / Joint-Friendly** swaps (wall push-ups + chair squats), or **Single Session**.
- **Weekly 7-Day Digest**: Compares rolling 7-day cheat calories and days over target against the previous 7 days.

### 6. Adaptive Onboarding, Personalized Diet & Workout Engine & Unified Notifications
- **4-Step Adaptive Calibration Wizard (`OnboardingModal`)**: Captures unit preferences, safe calorie/pace calibration, dietary style, allergies, equipment access, weekly schedule, and initial fitness baseline.
- **Dynamic Diet Plan (`DietPlanPanel`)**: Generates allergy-safe, goal-aligned daily Kerala & international meal slots with per-meal **Swap**, **Regenerate Day**, and **1-Tap Add to Log** for `selectedDate`.
- **Today's Adaptive Workout (`TodayPlanCard`)**: Evaluates 14-day consistency (`Beginner` / `Intermediate` / `Advanced`), displays Warm-up / Main / Cool-down or active Rest Day recovery, and logs directly to `activities`.
- **Unified Notification Center (`NotificationsModal`)**: Combines Web Push / Mobile OS reminder toggles, active accountability challenges, weekly 7-day digest, and supportive BMI check-ins.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide Icons, Recharts, Motion
- **On-Device ML**: `@mediapipe/tasks-vision` (Face Landmarker)
- **Backend / APIs**: Express (`server.ts`), `@google/genai` (server-side Gemini proxy routes), `web-push` (VAPID Web Push)
- **Persistence**: Dual persistence via Firebase Firestore (`firebase` v13) + `/api/sync` (`clinic_database.json`) + `localStorage` fallback

---

## Setup & Scripts

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (see `.env.example`):
   - `GEMINI_API_KEY`: Google Gemini API key (server-side only; never exposed to the browser)
   - `APP_URL`: Public URL of the deployed app (used for push/self links)
3. Run development server (Express + Vite middleware on port `3000`):
   ```bash
   npm run dev
   ```
4. Type-check & build for production:
   ```bash
   npm run lint
   npm run build
   npm start
   ```

---

## Clinical Disclaimer

NutriTrack provides evidence-informed nutrition, fitness, and lifestyle tracking for general wellness and clinic coaching support. It is not a substitute for individualized medical diagnosis or emergency clinical care. Always consult a qualified physician or registered dietitian regarding medical conditions or specialized therapeutic diets.
