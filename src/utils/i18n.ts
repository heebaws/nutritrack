export type AppLanguage = 'en' | 'ml';

const EN_TO_ML: Record<string, string> = {
  // Navigation & Global Header
  'NutriTrack': 'ന്യൂട്രിട്രാക്ക്',
  'Connected Nutrition & Lifestyle Portal': 'കണക്റ്റഡ് ന്യൂട്രീഷൻ & ലൈഫ്സ്റ്റൈൽ പോർട്ടൽ',
  'Clinical Nutrition & Diet Management System': 'ക്ലിനിക്കൽ ന്യൂട്രീഷൻ & ഡയറ്റ് മാനേജ്‌മെന്റ് സിസ്റ്റം',
  'Login Portal': 'ലോഗിൻ പോർട്ടൽ',
  'Auth': 'ലോഗിൻ',
  'Calorie 101': 'കലോറി 101',
  'Sign Out': 'സൈൻ ഔട്ട്',
  'Cloud Sync: Live': 'ക്ലൗഡ് സിങ്ക്: ലൈവ്',
  'Syncing...': 'സിങ്ക് ചെയ്യുന്നു...',
  'Local': 'ലോക്കൽ',
  'Ask AI Bot': 'AI ബോട്ടിനോട് ചോദിക്കുക',
  'Ask NutriAI': 'ന്യൂട്രിAI-യോട് ചോദിക്കുക',
  'Ask NutriBot': 'ന്യൂട്രിബോട്ടിനോട് ചോദിക്കുക',
  'Sign In with Username & Password': 'യൂസർനെയിമും പാസ്‌വേഡും ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുക',

  // Client Hero & Status
  'Welcome': 'സ്വാഗതം',
  'Active': 'സജീവം',
  'Inactive': 'നിഷ്ക്രിയം',
  'Goal': 'ലക്ഷ്യം',
  'Coach': 'കോച്ച്',
  'Daily Calorie Budget': 'പ്രതിദിന കലോറി ബജറ്റ്',
  'Next Appointment': 'അടുത്ത അപ്പോയിന്റ്മെന്റ്',
  'View Details': 'വിവരങ്ങൾ കാണുക',
  'Next Window': 'അടുത്ത ഭക്ഷണ സമയം',
  'Breakfast': 'പ്രഭാതഭക്ഷണം',
  'Morning Snack': 'രാവിലത്തെ ലഘുഭക്ഷണം',
  'Lunch': 'ഉച്ചഭക്ഷണം',
  'Evening Snack': 'വൈകുന്നേരത്തെ ലഘുഭക്ഷണം',
  'Dinner': 'രാത്രി ഭക്ഷണം',
  'Morning': 'രാവിലെ',
  'Evening': 'വൈകുന്നേരം',
  'Night': 'രാത്രി',

  // Square Icon Grid Labels (Client)
  'Log Meal': 'ഭക്ഷണം ചേർക്കുക',
  'Morning Weight': 'രാവിലത്തെ ഭാരം',
  'Daily Hydration': 'ദിവസേന വെള്ളം',
  'Log Workout': 'വ്യായാമം ചേർക്കുക',
  'Appointments': 'അപ്പോയിന്റ്മെന്റുകൾ',
  'Meal Diary': 'ഭക്ഷണ ഡയറി',
  '8,000 kcal': '8,000 കലോറി',
  '8,000 kcal Projection': '8,000 കലോറി പ്രൊജക്ഷൻ',
  'Coach & Profile': 'കോച്ചും പ്രൊഫൈലും',
  'Diet Plan': 'ഡയറ്റ് പ്ലാൻ',
  'Progress': 'പുരോഗതി',
  'App Tour': 'ആപ്പ് ഗൈഡ്',
  'More Tools': 'കൂടുതൽ ടൂളുകൾ',
  'Notifications': 'അറിയിപ്പുകൾ',
  'Daily Habits': 'ദിവസേന ശീലങ്ങൾ',
  'Food Rules': 'ഭക്ഷണ നിയമങ്ങൾ',
  'Print Report': 'റിപ്പോർട്ട് പ്രിന്റ്',
  'Language: English': 'ഭാഷ: മലയാളം (EN)',
  'Malayalam / EN': 'മലയാളം ↔ English',
  'Switch to English': 'English-ലേക്ക് മാറ്റുക',
  'Switch to Malayalam': 'മലയാളത്തിലേക്ക് മാറ്റുക',

  // 8,000 kcal Projection & Hide Line
  'Calorie Trajectory & Weight Projection': 'കലോറി ട്രാജക്ടറിയും ഭാര പ്രൊജക്ഷനും',
  '8,000 kcal = 1 kg Rule': '8,000 കലോറി = 1 കിലോ നിയമം',
  'Weight Gain': 'ഭാരം കൂട്ടൽ',
  'Weight Loss': 'ഭാരം കുറയ്ക്കൽ',
  'Hide Line': 'വരി മറയ്ക്കുക',
  'Tap to open': 'തുറക്കാൻ തൊടുക',
  'Celebrated On Track': 'ലക്ഷ്യത്തിൽ മുന്നേറുന്നു',
  'Regression Notice': 'ശ്രദ്ധിക്കേണ്ട മുന്നറിയിപ്പ്',
  'Daily Needed Target': 'പ്രതിദിന ആവശ്യമായ ലക്ഷ്യം',
  'Touch for Details': 'വിശദാംശങ്ങൾക്ക് തൊടുക',
  'Hide Details': 'വിശദാംശങ്ങൾ മറയ്ക്കുക',
  'Every 8,000 kcal excess = 1 kg gained • Every 8,000 kcal deficit = 1 kg lost':
    'ഓരോ 8,000 കലോറി അധികവും = 1 കിലോ ഭാരം കൂടും • ഓരോ 8,000 കലോറി കുറവും = 1 കിലോ ഭാരം കുറയും',
  'Clinical Cumulative Progress Analysis': 'ക്ലിനിക്കൽ സഞ്ചിത പുരോഗതി വിശകലനം',
  'Daily Calorie Balance & Running Cumulative Table': 'പ്രതിദിന കലോറി ബാലൻസും ആകെ പട്ടികയും',
  'Add Data for Yesterday': 'ഇന്നലത്തെ വിവരങ്ങൾ ചേർക്കുക',
  'Collapse': 'ചുരുക്കുക',
  'Collapse Detailed Data': 'വിശദമായ വിവരങ്ങൾ മറയ്ക്കുക',
  'Date': 'തീയതി',
  'Normal Baseline': 'സാധാരണ ലക്ഷ്യം',
  'Good Cal': 'നല്ല കലോറി',
  'Bad Cal': 'മോശം കലോറി',
  'Total Eaten': 'ആകെ കഴിച്ചത്',
  'Sports Burn': 'വ്യായാമം കത്തിച്ചത്',
  'Net Intake': 'നെറ്റ് കലോറി',
  'Day Balance': 'ഇന്നത്തെ ബാലൻസ്',
  'Cumulative Balance': 'ആകെ ബാലൻസ്',
  'Projected Weight Impact': 'ഭാരത്തിലുള്ള മാറ്റം',
  'Goal Evaluation': 'ലക്ഷ്യ വിലയിരുത്തൽ',
  'Action': 'നടപടി',
  'Log Food': 'ഭക്ഷണം ചേർക്കുക',
  'Today': 'ഇന്ന്',
  'Yesterday': 'ഇന്നലെ',
  '2 Days Ago': '2 ദിവസം മുമ്പ്',
  'Celebrated': 'മികച്ചത്',
  'Regression': 'ശ്രദ്ധിക്കുക',

  // Meal Log Modal
  "Add Day's Calories & Meals": 'ഇന്നത്തെ കലോറിയും ഭക്ഷണവും ചേർക്കുക',
  'Pick from food database or add a new food with calories': 'ഭക്ഷണ ലിസ്റ്റിൽ നിന്ന് തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ പുതിയത് ചേർക്കുക',
  'Centre Food Library': 'സെന്റർ ഫുഡ് ലൈബ്രറി',
  'Add Custom Food & Calories': 'പുതിയ ഭക്ഷണം & കലോറി ചേർക്കുക',
  'Meal Slot': 'ഭക്ഷണ സമയം',
  'Search food database...': 'ഭക്ഷണം തിരയുക (ഉദാ: പുട്ട്, അപ്പം, മുട്ട)...',
  'All Categories': 'എല്ലാ വിഭാഗങ്ങളും',
  'All': 'എല്ലാം',
  'Kerala Snacks': 'കേരള പലഹാരങ്ങൾ',
  'Proteins': 'പ്രോട്ടീൻ',
  'Grains & Breads': 'ധാന്യങ്ങൾ & അപ്പം',
  'Vegetables': 'പച്ചക്കറികൾ',
  'Fruits': 'പഴങ്ങൾ',
  'Dairy & Alternatives': 'പാലും പാലുൽപ്പന്നങ്ങളും',
  'Nuts & Healthy Fats': 'നട്സ് & നല്ല കൊഴുപ്പുകൾ',
  'Beverages & Snacks': 'പാനീയങ്ങളും ലഘുഭക്ഷണവും',
  'Previously in this meal': 'മുമ്പ് ഈ സമയത്ത് കഴിച്ചവ',
  'Usual': 'പതിവ് ഭക്ഷണം',
  'Change Food': 'ഭക്ഷണം മാറ്റുക',
  'Portions / Servings:': 'അളവ് / എണ്ണം:',
  'Portions consumed:': 'കഴിച്ച അളവ്:',
  'Was it oily? (3 Options):': 'എണ്ണ ഉപയോഗിച്ചോ? (3 ഓപ്ഷനുകൾ):',
  'Was this food oily? (3 Options):': 'ഈ ഭക്ഷണം എണ്ണയിലാണോ ഉണ്ടാക്കിയത്?',
  'Steamed / No Oil': 'ആവിയിൽ / എണ്ണയില്ല',
  'Medium Sauté': 'മിതമായ എണ്ണ',
  'Deep Fried': 'എണ്ണയിൽ പൊരിച്ചത്',
  'Calorie Quality:': 'കലോറി നിലവാരം:',
  'Good Calories': 'നല്ല കലോറി',
  'Bad / Treat': 'ട്രീറ്റ് / മോശം',
  'Bad / Cheat Calories': 'ചീറ്റ് / അധിക കലോറി',
  "Added to Today's Calories:": 'ഇന്നത്തെ കലോറിയിലേക്ക് ചേർക്കുന്നത്:',
  'Cancel': 'റദ്ദാക്കുക',
  'Review Day': 'ഇന്നത്തെ ഡയറി കാണുക',
  'Recorded!': 'രേഖപ്പെടുത്തി!',
  'Save to Breakfast': 'പ്രഭാതഭക്ഷണത്തിൽ ചേർക്കുക',
  'Save to Morning Snack': 'രാവിലത്തെ സ്നാക്കിൽ ചേർക്കുക',
  'Save to Lunch': 'ഉച്ചഭക്ഷണത്തിൽ ചേർക്കുക',
  'Save to Evening Snack': 'വൈകുന്നേരത്തെ സ്നാക്കിൽ ചേർക്കുക',
  'Save to Dinner': 'രാത്രി ഭക്ഷണത്തിൽ ചേർക്കുക',
  'Food Name': 'ഭക്ഷണത്തിന്റെ പേര്',
  'Category': 'വിഭാഗം',
  'Serving Unit': 'അളവ് യൂണിറ്റ്',
  'Calories (kcal)': 'കലോറി (kcal)',
  'Protein (g)': 'പ്രോട്ടീൻ (g)',
  'Carbs (g)': 'കാർബ്സ് (g)',
  'Fat (g)': 'കൊഴുപ്പ് (g)',

  // Hydration Modal & Card
  'Daily Hydration Tracker': 'ദിവസേന വെള്ളം കുടി ട്രാക്കർ',
  'Consumed': 'കുടിച്ചത്',
  'Goal Met': 'ലക്ഷ്യം നേടി',
  'Quick 1-Tap Log:': 'ഒറ്റ ടാപ്പിൽ ചേർക്കുക:',
  'Glass': 'ഗ്ലാസ്',
  'Bottle': 'ബോട്ടിൽ',
  'Gym Sipper': 'ജിം സിപ്പർ',
  '1 Liter Flask': '1 ലിറ്റർ ഫ്ലാസ്ക്',
  'Add Water': 'വെള്ളം ചേർക്കുക',
  '3-Hour Hydration Alert': '3-മണിക്കൂർ വെള്ളം മുന്നറിയിപ്പ്',
  'Drink 250 ml Now': 'ഇപ്പോൾ 250 ml കുടിക്കൂ',
  'Dismiss': 'ഒഴിവാക്കുക',
  'Enable 3-Hour Browser Alert': '3-മണിക്കൂർ അലേർട്ട് ഓൺ ചെയ്യുക',
  'Browser Alerts Active': 'ബ്രൗസർ അലേർട്ടുകൾ സജീവമാണ്',
  'Hide Entries': 'രേഖകൾ മറയ്ക്കുക',
  'Close': 'അടയ്ക്കുക',
  'Back': 'തിരികെ',

  // Workout & Weight Modals
  'Log Physical Activity & Burn': 'വ്യായാമവും കത്തിച്ച കലോറിയും ചേർക്കുക',
  'Select Activity Type': 'വ്യായാമം തിരഞ്ഞെടുക്കുക',
  'Duration (Minutes)': 'സമയം (മിനിറ്റ്)',
  'Workout Intensity': 'തീവ്രത',
  'Estimated Energy Burned': 'കണക്കാക്കിയ കലോറി ചെലവ്',
  'Record Workout': 'വ്യായാമം രേഖപ്പെടുത്തുക',
  'Morning Weight Check-in': 'രാവിലത്തെ ഭാരം രേഖപ്പെടുത്തുക',
  'Weight Today (kg)': 'ഇന്നത്തെ ഭാരം (kg)',
  'Vs Starting': 'ആരംഭ ഭാരവുമായി',
  'To Goal': 'ലക്ഷ്യത്തിലേക്ക്',
  'Save Weigh-in': 'ഭാരം സേവ് ചെയ്യുക',

  // Additional Tools & Panels
  'Additional Health Tools & Profile': 'കൂടുതൽ ആരോഗ്യ ടൂളുകളും പ്രൊഫൈലും',
  'Your Profile': 'നിങ്ങളുടെ പ്രൊഫൈൽ',
  'Assigned Wellness Coach': 'ചുമതലയുള്ള വെൽനെസ് കോച്ച്',
  'Height': 'ഉയരം',
  'Age': 'പ്രായം',
  'BMI': 'ബി.എം.ഐ (BMI)',
  'Notifications & Coach Reminders': 'അറിയിപ്പുകളും കോച്ച് സന്ദേശങ്ങളും',
  'Phone Notification Delivery': 'ഫോൺ നോട്ടിഫിക്കേഷൻ സംവിധാനം',
  'Enable Phone Alerts': 'ഫോൺ അലേർട്ടുകൾ ഓൺ ചെയ്യുക',
  'Test Alert': 'ടെസ്റ്റ് അലേർട്ട്',
  'Quick Actions from Alerts': 'പെട്ടെന്നുള്ള നടപടികൾ',
  'Coach Reminders & Live Guidance': 'കോച്ച് നിർദ്ദേശങ്ങളും അലേർട്ടുകളും',
  'Scheduled Phone Notification Times': 'നിശ്ചയിച്ച ഫോൺ അലേർട്ട് സമയങ്ങൾ',

  // Meal Diary & Macro Breakdown
  'Meal Diary & Macro Breakdown': 'ഭക്ഷണ ഡയറിയും മാക്രോ വിവരങ്ങളും',
  'Daily Calorie Balance & Targets': 'പ്രതിദിന കലോറി ബാലൻസും ലക്ഷ്യങ്ങളും',
  'Total Food Eaten': 'ആകെ കഴിച്ച ഭക്ഷണം',
  'Bad Calories': 'മോശം കലോറി',
  'Calorie Burn': 'കലോറി ബേൺ',
  "Today's Meals Timeline": 'ഇന്നത്തെ ഭക്ഷണ സമയക്രമം',
  "Reset to Yesterday's Foods": 'ഇന്നലത്തെ ഭക്ഷണത്തിലേക്ക് റീസെറ്റ് ചെയ്യുക',
  'Protein': 'പ്രോട്ടീൻ',
  'Carbohydrates': 'കാർബോഹൈഡ്രേറ്റ്സ്',
  'Healthy Fats': 'ആരോഗ്യകരമായ കൊഴുപ്പ്',
  'Activity Burn:': 'വ്യായാമം വഴി കുറഞ്ഞത്:',
  'Net Energy:': 'നെറ്റ് കലോറി:',

  // Chatbot
  'NutriBot': 'ന്യൂട്രിബോട്ട്',
  'Kerala Food AI · Vision & Voice': 'കേരള ഫുഡ് AI · ഫോട്ടോ & ശബ്ദം',
  'Verified Library Mode': 'വെരിഫൈഡ് ലൈബ്രറി മോഡ്',
  'Column Access': 'ഡയറി അനുമതി',
  'Access Off': 'അനുമതി ഓഫ്',
  'Referral': 'ഗൈഡ്',
  'Quick:': 'പെട്ടെന്ന്:',
  'Ask in English or Malayalam, speak with mic, or snap plate photo...':
    'മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ചോദിക്കുക, മൈക്കിൽ സംസാരിക്കുക, അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക...',
  'All foods auto-saved to library': 'എല്ലാ ഭക്ഷണവും ലൈബ്രറിയിൽ സേവ് ചെയ്യുന്നു',
  'Click & Drag to Move': 'നീക്കാൻ ഇവിടെ പിടിച്ച് വലിക്കുക',

  // Coach / Team Portal
  'Coach Workspace': 'കോച്ച് വർക്ക്‌സ്‌പേസ്',
  'Tap any square icon to open tools or client records': 'ടൂളുകളോ ക്ലയന്റ് വിവരങ്ങളോ തുറക്കാൻ ഐക്കണിൽ തൊടുക',
  'Minimize Open View': 'തുറന്ന വിൻഡോ ചുരുക്കുക',
  'Enrolled': 'ആകെ ക്ലയന്റുകൾ',
  '3+ Days Away': '3+ ദിവസമായി നിഷ്ക്രിയം',
  'Clients': 'ക്ലയന്റുകൾ',
  'Inactive Alerts': 'നിഷ്ക്രിയ അലേർട്ടുകൾ',
  'Live Feed': 'ലൈവ് ഫീഡ്',
  'Add Client': 'പുതിയ ക്ലയന്റ്',
  'Send Alert': 'അലേർട്ട് അയയ്ക്കുക',
  'Diet Plans': 'ഡയറ്റ് പ്ലാനുകൾ',
  'Food Library': 'ഫുഡ് ലൈബ്രറി',
  'Centre Scan': 'സെന്റർ സ്കാൻ',
  'Staff & Roles': 'സ്റ്റാഫും റോളുകളും',
  'More & Admin': 'കൂടുതൽ & അഡ്മിൻ',
  'Back to Icons': 'ഐക്കണുകളിലേക്ക് തിരികെ',
  'Additional Admin & Broadcast Controls': 'കൂടുതൽ അഡ്മിൻ & ബ്രോഡ്കാസ്റ്റ് ടൂളുകൾ',
  'Edit Profile': 'പ്രൊഫൈൽ എഡിറ്റ്',
  'Add Coach': 'കോച്ചിനെ ചേർക്കുക',
  'New Scan': 'പുതിയ സ്കാൻ',
  'Reset Centre': 'സെന്റർ റീസെറ്റ്',
  'Centre Administrator': 'സെന്റർ അഡ്മിനിസ്ട്രേറ്റർ',
  'Clinical Dietitian': 'ക്ലിനിക്കൽ ഡയറ്റീഷ്യൻ',

  // Login Portal
  'Secure Portal Access': 'സുരക്ഷിത പോർട്ടൽ ലോഗിൻ',
  'Client Login': 'ക്ലയന്റ് ലോഗിൻ',
  'Coach & Admin': 'കോച്ച് & അഡ്മിൻ',
  'Username or Mobile Number': 'യൂസർനെയിം അല്ലെങ്കിൽ മൊബൈൽ നമ്പർ',
  'Coach / Admin Username': 'കോച്ച് / അഡ്മിൻ യൂസർനെയിം',
  'Password': 'പാസ്‌വേഡ്',
  'Remember me on this browser': 'ലോഗിൻ ഓർത്തിരിക്കുക',
  'Sign In to Client Portal': 'ക്ലയന്റ് പോർട്ടലിലേക്ക് ലോഗിൻ ചെയ്യുക',
  'Sign In to Coach & Admin Portal': 'കോച്ച് & അഡ്മിൻ പോർട്ടലിലേക്ക് ലോഗിൻ ചെയ്യുക',

  // Notifications & Mark as Read
  'Mark as Read': 'വായിച്ചതായി രേഖപ്പെടുത്തുക',
  'Mark All as Read': 'എല്ലാം വായിച്ചതായി മാറ്റുക',
  'Unread': 'വായിക്കാത്തവ',
  'Read': 'വായിച്ചു',
  'All Caught Up': 'എല്ലാം വായിച്ചു കഴിഞ്ഞു',
  'No notifications right now': 'ഇപ്പോൾ പുതിയ അറിയിപ്പുകളൊന്നുമില്ല',
  'Log Today\'s Meals Now →': 'ഇന്നത്തെ ഭക്ഷണം ഇപ്പോൾ ചേർക്കുക →',
  'Active: Scheduled meal times & coach reminders trigger native alerts directly on your phone.':
    'സജീവം: ഭക്ഷണ സമയങ്ങളിലും കോച്ച് നിർദ്ദേശങ്ങളിലും നിങ്ങളുടെ ഫോണിൽ നേരിട്ട് അലേർട്ടുകൾ ലഭിക്കും.',
  'Notifications are blocked in your browser settings. Enable them in site permissions to receive phone alerts.':
    'ബ്രൗസർ സെറ്റിംഗ്സിൽ നോട്ടിഫിക്കേഷനുകൾ ബ്ലോക്ക് ചെയ്തിരിക്കുകയാണ്. ഫോൺ അലേർട്ടുകൾ ലഭിക്കാൻ അനുമതി നൽകുക.',
  'Allow notifications so meal check-ins and coach alerts arrive on your phone on time — without cluttering the app.':
    'കൃത്യസമയത്ത് ഭക്ഷണ ഓർമ്മപ്പെടുത്തലുകളും കോച്ച് നിർദ്ദേശങ്ങളും ഫോണിൽ ലഭിക്കാൻ നോട്ടിഫിക്കേഷൻ അനുവദിക്കുക.',
  'Test notification sent! Scheduled reminders will alert your phone at exact meal times.':
    'ടെസ്റ്റ് നോട്ടിഫിക്കേഷൻ അയച്ചു! നിശ്ചയിച്ച ഭക്ഷണ സമയങ്ങളിൽ ഫോണിൽ അലേർട്ട് ലഭിക്കും.',

  // Steps, Sleep, OS Sync & Habits
  'Daily Clinical Habits & Recovery': 'ദിവസേനയുള്ള ആരോഗ്യ ശീലങ്ങളും വിശ്രമവും',
  'Daily lifestyle factors essential for hormone balance, metabolic rate, and fat oxidation':
    'ഹോർമോൺ ബാലൻസിനും മെറ്റബോളിസത്തിനും കൊഴുപ്പ് കത്തുന്നതിനും അത്യന്താപേക്ഷിതമായ ദിനചര്യകൾ',
  'Habits Score': 'ശീല സ്കോർ',
  'Daily Steps Target': 'ദിവസേനയുള്ള നടപ്പ് (Steps)',
  'Achieved': 'ലക്ഷ്യം നേടി',
  'steps': 'ചുവടുകൾ',
  'Restful Sleep': 'നല്ല ഉറക്കം',
  '7h+ Optimal': '7+ മണിക്കൂർ ഉത്തമം',
  'hours': 'മണിക്കൂർ',
  'Goal: 7 - 8.5 hrs': 'ലക്ഷ്യം: 7 - 8.5 മണിക്കൂർ',
  'Prescribed Vitamins': 'നിർദ്ദേശിച്ച വിറ്റാമിനുകൾ',
  'Daily multivitamin, Omega-3 fish oil, Vitamin D3, and probiotic as recommended by coach.':
    'കോച്ച് നിർദ്ദേശിച്ച മൾട്ടിവിറ്റാമിൻ, ഒമേഗ-3, വിറ്റാമിൻ D3, പ്രോബയോട്ടിക് എന്നിവ.',
  '✓ Taken Today': '✓ ഇന്ന് കഴിച്ചു',
  'Tap to mark as taken': 'കഴിച്ചതായി രേഖപ്പെടുത്താൻ തൊടുക',
  'Raw Greens & Salad': 'പച്ചക്കറി സാലഡും ഇലക്കറികളും',
  'A bowl of cucumber, tomato, carrot, and fresh greens eaten before major meals for gut satiety.':
    'ഭക്ഷണത്തിന് മുമ്പ് ഒരു ബൗൾ വെള്ളരിക്ക, തക്കാളി, ക്യാരറ്റ്, ഇലക്കറികൾ എന്നിവ കഴിക്കുക.',
  '✓ Eaten Today': '✓ ഇന്ന് കഴിച്ചു',
  'Tap to mark as completed': 'പൂർത്തിയായതായി രേഖപ്പെടുത്താൻ തൊടുക',
  '10-Min Post-Meal Walk': 'ഭക്ഷണശേഷം 10 മിനിറ്റ് നടത്തം',
  'Light 10-15 min stroll immediately after lunch or dinner to blunt postprandial glucose spike.':
    'ഉച്ചഭക്ഷണത്തിനും രാത്രി ഭക്ഷണത്തിനും ശേഷം 10-15 മിനിറ്റ് ലഘു നടത്തം (രക്തത്തിലെ പഞ്ചസാര കുറയ്ക്കാൻ).',
  '✓ Completed': '✓ പൂർത്തിയാക്കി',
  'Tap to mark as done': 'ചെയ്തതായി രേഖപ്പെടുത്താൻ തൊടുക',
  'Phone OS Sensor Sync': 'ഫോൺ OS സെൻസർ സിങ്ക്',
  'Live Pedometer On': 'ലൈവ് സ്റ്റെപ്പ് സെൻസർ ഓൺ',
  'Start Phone Step Sensor': 'ഫോൺ സ്റ്റെപ്പ് സെൻസർ ഓൺ ചെയ്യുക',
  'Stop Sensor': 'സെൻസർ നിർത്തുക',
  'Import Health File': 'ഹെൽത്ത് ഫയൽ ചേർക്കുക',
  'Auto-detected sleep': 'ഫോൺ വഴി കണക്കാക്കിയ ഉറക്കം',
  'Step Burn Added': 'നടപ്പിലൂടെ കത്തിച്ച കലോറി',
  'Exact steps': 'കൃത്യമായ ചുവടുകൾ',
  'Apply': 'സേവ്',

  // Meal Diary & Progress Extras
  'Deficit Remaining': 'ബാക്കിയുള്ള കലോറി',
  'Calorie Surplus Needed': 'ഇനി വേണ്ട അധിക കലോറി',
  'Gross food intake': 'ആകെ കഴിച്ച ഭക്ഷണം',
  'Wholesome & Nutritious': 'പോഷകസമൃദ്ധവും നല്ലതും',
  'Fried / Refined / Treats': 'വറുത്തതും മധുരമുള്ളതുമായവ',
  'Exercise': 'വ്യായാമം & നടപ്പ്',
  'Deducted from total': 'ആകെ കലോറിയിൽ നിന്ന് കുറച്ചത്',
  'Log Burn (e.g. Football)': 'വ്യായാമം ചേർക്കുക',
  'Log Workout / Burn': 'വ്യായാമം ചേർക്കുക',
  'Workout + Steps Burn': 'വ്യായാമം + നടപ്പ് കലോറി',
  'Body Composition & Progress History': 'ശരീര ഘടനയും പുരോഗതിയും',
  'Track weight, BMI, body fat %, and centre device InBody scans': 'ഭാരം, BMI, കൊഴുപ്പ് %, ഇൻബോഡി സ്കാനുകൾ കാണുക',
  'Record New Reading': 'പുതിയ റീഡിംഗ് ചേർക്കുക',
  'Starting Weight': 'ആരംഭ ഭാരം',
  'Current Weight': 'ഇപ്പോഴത്തെ ഭാരം',
  'Target Goal': 'ലക്ഷ്യ ഭാരം',
  'Total Weight Lost': 'ആകെ കുറഞ്ഞ ഭാരം',
  'Weight Progression Timeline': 'ഭാരത്തിലെ മാറ്റങ്ങളുടെ ചാർട്ട്',
  'Historical weigh-ins with goal marker': 'മുൻകാല ഭാര പരിശോധനകൾ',
  'Measurement Logs & Centre InBody Scans': 'അളവുകളും ഇൻബോഡി സ്കാൻ വിവരങ്ങളും',
  'Centre Consultations & Checkups': 'സെന്റർ പരിശോധനകളും അപ്പോയിന്റ്മെന്റുകളും',
  'Scheduled Appointments': 'നിശ്ചയിച്ച അപ്പോയിന്റ്മെന്റുകൾ',
  'Request Next Review Appointment': 'അടുത്ത പരിശോധന ബുക്ക് ചെയ്യുക',
  'Confirm Appointment': 'അപ്പോയിന്റ്മെന്റ് ഉറപ്പാക്കുക',
  'Record Measurements': 'ശരീര അളവുകൾ രേഖപ്പെടുത്തുക',
  'Save Reading': 'റീഡിംഗ് സേവ് ചെയ്യുക',
  'Saved!': 'സേവ് ചെയ്തു!',

  // Dark / Light Mode & Theme
  'Dark Mode': 'ഡാർക്ക് മോഡ്',
  'Light Mode': 'ലൈറ്റ് മോഡ്',
  'Theme': 'തീം',

  // Mobile OS Auto-Sync (Home & Habits)
  'Enable iPhone Step Sensor': 'iPhone സ്റ്റെപ്പ് സെൻസർ ഓൺ ചെയ്യുക',
  'Tap once to let your iPhone auto-count walking steps & add calorie burn':
    'നടക്കുമ്പോൾ ചുവടുകളും കലോറിയും താനേ കണക്കാക്കാൻ ഒരിക്കൽ തൊടുക',
  'Phone OS Auto-Sync Active': 'ഫോൺ OS ഓട്ടോ-സിങ്ക് സജീവം',
  'Steps & Sleep Synced': 'ചുവടുകളും ഉറക്കവും സിങ്ക് ചെയ്തു',

  // NutriBot Redesigned Bento Grid
  'Kerala Food AI · Vision': 'കേരള ഫുഡ് AI · വിഷൻ',
  'Kerala Food Guide': 'കേരള ഫുഡ് ഗൈഡ്',
  'Snacks & calorie chart': 'പലഹാരങ്ങളും കലോറിയും',
  'Oil & Prep Calc': 'എണ്ണ & പാചക കണക്ക്',
  'Steamed vs Fried fat': 'ആവി vs വറുത്ത കൊഴുപ്പ്',
  'Quick Meal Log': 'ഭക്ഷണം വേഗം ചേർക്കുക',
  'Log with meal time': 'സമയത്തോടെ ചേർക്കുക',
  'Centre Library': 'സെന്റർ ഫുഡ് ലൈബ്രറി',
  'Auto-synced foods': 'ഓട്ടോ-സേവ് ചെയ്തവ',
  'Type, speak, or snap a meal (EN / മലയാളം)...': 'ഭക്ഷണം ടൈപ്പ് ചെയ്യുക, പറയുക അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക...',
};

const FOOD_KEYWORD_ML: Array<[RegExp, string]> = [
  [/kerala puttu/i, 'കേരള പുട്ട്'],
  [/puttu/i, 'പുട്ട്'],
  [/idiyappam|noolappam/i, 'ഇടിയപ്പം'],
  [/palappam|paalappam/i, 'പാലപ്പം'],
  [/appam/i, 'അപ്പം'],
  [/dosa/i, 'ദോശ'],
  [/idli/i, 'ഇഡലി'],
  [/chapati/i, 'ചപ്പാത്തി'],
  [/parotta/i, 'പൊറോട്ട'],
  [/matta rice|red rice/i, 'മട്ട അരി ചോറ്'],
  [/white rice|boiled rice/i, 'വെള്ള ചോറ്'],
  [/biryani|biriyani/i, 'ബിരിയാണി'],
  [/pazham pori|ethakka appam/i, 'പഴംപൊരി'],
  [/parippu vada/i, 'പരിപ്പ് വട'],
  [/ulli vada/i, 'ഉള്ളി വട'],
  [/uzhunnu vada|medu vada/i, 'ഉഴുന്ന് വട'],
  [/ela ada/i, 'ഇല അട'],
  [/unniyappam/i, 'ഉണ്ണിയപ്പം'],
  [/neyyappam/i, 'നെയ്യപ്പം'],
  [/banana chips|upperi/i, 'നേന്ത്രക്കായ ഉപ്പേരി'],
  [/boiled egg/i, 'പുഴുങ്ങിയ മുട്ട'],
  [/egg white/i, 'മുട്ടയുടെ വെള്ള'],
  [/omelette/i, 'ഓംലെറ്റ്'],
  [/chicken breast/i, 'ചിക്കൻ ബ്രെസ്റ്റ്'],
  [/chicken curry/i, 'ചിക്കൻ കറി'],
  [/grilled chicken/i, 'ഗ്രിൽഡ് ചിക്കൻ'],
  [/alfaham/i, 'ചിക്കൻ അൽഫഹം'],
  [/ayala|mackerel/i, 'അയല മീൻ'],
  [/mathi|sardine/i, 'മത്തി (ചാള)'],
  [/meen curry/i, 'മീൻ കറി'],
  [/fish curry/i, 'മീൻ കറി'],
  [/kadala curry/i, 'കടല കറി'],
  [/sambar/i, 'സാമ്പാർ'],
  [/thoran/i, 'തോരൻ'],
  [/avial/i, 'അവിയൽ'],
  [/black tea/i, 'കട്ടൻ ചായ'],
  [/milk tea/i, 'പാൽ ചായ'],
  [/black coffee/i, 'കട്ടൻ കാപ്പി'],
  [/buttermilk|sambharam/i, 'സംഭാരം (മോര്)'],
  [/curd|yogurt/i, 'തൈര്'],
  [/banana/i, 'പഴം'],
  [/apple/i, 'ആപ്പിൾ'],
  [/papaya/i, 'പപ്പായ'],
  [/mango/i, 'മാങ്ങ'],
  [/oats/i, 'ഓട്സ്'],
  [/almonds/i, 'ബദാം'],
  [/cucumber salad/i, 'വെള്ളരിക്ക സാലഡ്'],
];

/**
 * Translates UI strings cleanly between English and Malayalam.
 */
export function translateText(text: string, lang: AppLanguage): string {
  if (lang === 'en' || !text) return text;

  const trimmed = text.trim();
  if (EN_TO_ML[trimmed]) return EN_TO_ML[trimmed];

  // Dynamic patterns with values
  if (trimmed.startsWith('Welcome, ')) {
    const name = trimmed.slice('Welcome, '.length);
    return `സ്വാഗതം, ${name}`;
  }
  if (trimmed.startsWith('Save to ')) {
    const slot = trimmed.slice('Save to '.length);
    return `${translateText(slot, lang)}-ൽ ചേർക്കുക`;
  }
  if (trimmed.startsWith('Goal:')) {
    return trimmed.replace(/^Goal:/, 'ലക്ഷ്യം:');
  }
  if (trimmed.startsWith('Coach:')) {
    return trimmed.replace(/^Coach:/, 'കോച്ച്:');
  }

  return text;
}

/**
 * Translates food names and common serving units into Malayalam when lang === 'ml'.
 * Leaves names intact if already containing Malayalam script.
 */
export function translateFoodLabel(name: string, lang: AppLanguage): string {
  if (lang === 'en' || !name) return name;
  // Already contains Malayalam unicode
  if (/[\u0D00-\u0D7F]/.test(name)) return name;

  for (const [regex, ml] of FOOD_KEYWORD_ML) {
    if (regex.test(name)) {
      return `${ml} (${name})`;
    }
  }
  return name;
}
