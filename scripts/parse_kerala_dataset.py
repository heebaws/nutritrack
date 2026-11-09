import json
import re

# Data exactly from the 9 pages of the user's PDF: Kerala_Food_Nutrition_Expanded_02d68119.pdf

page1_items = [
    ("Rotti & breads", "പുട്ട് (Puttu)", "1 medium (150 g)"),
    ("Rotti & breads", "ഇടിയപ്പം / നൂൽപ്പുട്ട് (Idiyappam)", "2 pieces (120 g)"),
    ("Rotti & breads", "അപ്പം / വെള്ളയപ്പം (Appam)", "2 medium (120 g)"),
    ("Rotti & breads", "പാലപ്പം (Paalappam)", "2 medium (120 g)"),
    ("Rotti & breads", "പത്തിരി (Pathiri)", "2 pieces (100 g)"),
    ("Rotti & breads", "മലബാർ പൊറോട്ട (Malabar porotta)", "1 medium (80 g)"),
    ("Rotti & breads", "ചപ്പാത്തി (Chapathi)", "1 medium (40 g)"),
    ("Rotti & breads", "നെയ്റോസ്റ്റ് (Ghee roast dosa)", "1 medium (120 g)"),
    ("Rotti & breads", "ദോശ (Dosa)", "1 medium (90 g)"),
    ("Rotti & breads", "മസാല ദോശ (Masala dosa)", "1 medium (180 g)"),
    ("Rotti & breads", "ഇഡലി (Idli)", "2 pieces (100 g)"),
    ("Rotti & breads", "പൂരി (Poori)", "2 small (70 g)"),
    ("Rotti & breads", "നൂൽപ്പൊറോട്ട (Nool porotta)", "1 medium (90 g)"),
    ("Rotti & breads", "ചട്ടിപ്പത്തിരി (Chatti pathiri)", "1 slice (150 g)"),
    ("Rotti & breads", "പത്തൽ (Pathal)", "2 pieces (100 g)"),
    ("Rotti & breads", "ബട്ടർ നാൻ (Butter naan)", "1 medium (100 g)"),
    ("Rotti & breads", "തന്തൂരി റൊട്ടി (Tandoori roti)", "1 medium (60 g)"),
    ("Rotti & breads", "സാധാ റൊട്ടി (Plain roti)", "1 medium (60 g)"),
    ("Rotti & breads", "കുബ്ബൂസ് (Kubboos)", "1 medium (70 g)"),
    ("Rotti & breads", "ബ്രെഡ് (Bread)", "2 slices (60 g)"),
    ("Rotti & breads", "ബൺ (Bun)", "1 medium (60 g)"),
    ("Rotti & breads", "റവ ദോശ (Rava dosa)", "1 medium (100 g)"),
    ("Rotti & breads", "ഉപ്പുമാവ് (Upma)", "1 cup (200 g)"),
    ("Rice & biriyani", "മട്ട അരി ചോറ് (Kerala matta rice)", "1 cup cooked (180 g)"),
    ("Rice & biriyani", "വെള്ള ചോറ് (White rice)", "1 cup cooked (160 g)"),
    ("Rice & biriyani", "കഞ്ഞി (Rice gruel/kanji)", "1 bowl (250 ml)"),
    ("Rice & biriyani", "നെയ്ച്ചോർ (Ghee rice)", "1 cup (200 g)"),
    ("Rice & biriyani", "ചിക്കൻ ബിരിയാണി (Chicken biriyani)", "1 plate (350 g)"),
    ("Rice & biriyani", "മട്ടൺ ബിരിയാണി (Mutton biriyani)", "1 plate (350 g)"),
    ("Rice & biriyani", "ബീഫ് ബിരിയാണി (Beef biriyani)", "1 plate (350 g)"),
    ("Rice & biriyani", "തലശ്ശേരി ബിരിയാണി (Thalassery biriyani)", "1 plate (350 g)"),
    ("Rice & biriyani", "ചിക്കൻ മന്തി (Chicken mandi)", "1 plate (400 g)"),
    ("Rice & biriyani", "അൽഫഹം മന്തി (Alfaham mandi)", "1 plate (400 g)"),
    ("Rice & biriyani", "സാധാ മന്തി (Plain mandi rice)", "1 cup (200 g)"),
    ("Rice & biriyani", "ഖുഷ്ക (Khushka)", "1 cup (200 g)"),
    ("Rice & biriyani", "സുബർബാനി (Zurbiyani)", "1 plate (350 g)"),
    ("Rice & biriyani", "അഫ്ഗാനി റൈസ് (Afghani rice)", "1 cup (200 g)"),
    ("Rice & biriyani", "ഫ്രൈഡ് റൈസ് (Fried rice)", "1 plate (300 g)"),
    ("Rice & biriyani", "നൂഡിൽസ് (Noodles)", "1 plate (250 g)"),
    ("Curry & gravy", "നാടൻ ചിക്കൻ കറി (Chicken curry)", "1 bowl (150 g; 1 piece)"),
    ("Curry & gravy", "മട്ടൺ കറി (Mutton curry)", "1 bowl (150 g)"),
    ("Curry & gravy", "ബീഫ് കറി (Beef curry)", "1 bowl (150 g)"),
    ("Curry & gravy", "മീൻ കറി മുളകിട്ടത് (Meen curry mulakittathu)", "1 bowl (150 g; 1 piece)"),
    ("Curry & gravy", "മീൻ കറി തേങ്ങ അരച്ചത് (Meen curry thengayarachathu)", "1 bowl (150 g; 1 piece)"),
    ("Curry & gravy", "മുട്ട കറി (Mutta curry)", "1 bowl (1 egg; 150 g)"),
    ("Curry & gravy", "കടല കറി (Kadala curry)", "1 bowl (180 g)"),
    ("Curry & gravy", "വെള്ള കടല കറി (White chana curry)", "1 bowl (180 g)")
]

page4_nutrition = [
    (260.0, 5.5, 5.0, 48.0, 25.0),
    (170.0, 0.8, 3.0, 37.0, 8.0),
    (220.0, 3.0, 4.0, 44.0, 12.0),
    (225.0, 3.5, 4.0, 44.0, 15.0),
    (190.0, 1.0, 4.0, 40.0, 8.0),
    (260.0, 10.0, 5.0, 37.0, 20.0),
    (120.0, 3.0, 3.5, 20.0, 12.0),
    (260.0, 9.0, 5.0, 38.0, 25.0),
    (150.0, 4.0, 3.5, 24.0, 12.0),
    (330.0, 11.0, 6.0, 49.0, 45.0),
    (130.0, 0.8, 4.0, 27.0, 10.0),
    (210.0, 10.0, 4.0, 27.0, 18.0),
    (290.0, 12.0, 5.0, 40.0, 18.0),
    (330.0, 15.0, 12.0, 36.0, 75.0),
    (180.0, 2.0, 4.0, 36.0, 12.0),
    (310.0, 9.0, 9.0, 48.0, 80.0),
    (180.0, 3.0, 6.0, 32.0, 25.0),
    (170.0, 3.0, 5.0, 30.0, 20.0),
    (190.0, 2.0, 6.0, 36.0, 25.0),
    (160.0, 2.0, 5.5, 29.0, 85.0),
    (190.0, 4.0, 5.0, 33.0, 55.0),
    (190.0, 7.0, 4.0, 28.0, 20.0),
    (230.0, 8.0, 6.0, 34.0, 30.0),
    (215.0, 1.5, 4.5, 45.0, 12.0),
    (205.0, 0.4, 4.0, 45.0, 10.0),
    (90.0, 0.3, 1.8, 20.0, 5.0),
    (360.0, 12.0, 6.0, 55.0, 20.0),
    (570.0, 20.0, 25.0, 68.0, 55.0),
    (640.0, 27.0, 27.0, 68.0, 50.0),
    (620.0, 25.0, 27.0, 68.0, 45.0),
    (590.0, 21.0, 25.0, 70.0, 55.0),
    (650.0, 22.0, 30.0, 78.0, 45.0),
    (690.0, 26.0, 34.0, 78.0, 50.0),
    (330.0, 8.0, 5.0, 58.0, 18.0),
    (330.0, 9.0, 5.0, 58.0, 18.0),
    (600.0, 22.0, 24.0, 75.0, 45.0),
    (390.0, 14.0, 7.0, 56.0, 65.0),
    (450.0, 14.0, 10.0, 68.0, 35.0),
    (380.0, 12.0, 9.0, 57.0, 25.0),
    (240.0, 14.0, 22.0, 6.0, 30.0),
    (290.0, 20.0, 22.0, 5.0, 25.0),
    (280.0, 18.0, 23.0, 5.0, 20.0),
    (190.0, 10.0, 20.0, 5.0, 35.0),
    (250.0, 17.0, 19.0, 6.0, 45.0),
    (180.0, 12.0, 8.0, 7.0, 55.0),
    (240.0, 9.0, 12.0, 29.0, 65.0),
    (250.0, 8.0, 12.0, 33.0, 70.0)
]

page2_items = [
    ("Curry & gravy", "ചെറുപയർ കറി (Green gram curry)", "1 bowl (180 g)"),
    ("Curry & gravy", "ഗ്രീൻ പീസ് കറി (Green peas curry)", "1 bowl (180 g)"),
    ("Curry & gravy", "സാമ്പാർ (Sambar)", "1 bowl (180 ml)"),
    ("Curry & gravy", "രസം (Rasam)", "1 bowl (180 ml)"),
    ("Curry & gravy", "അവിയൽ (Avial)", "1 bowl (150 g)"),
    ("Curry & gravy", "തീയൽ (Theeyal)", "1 small bowl (120 g)"),
    ("Curry & gravy", "മോർ കറി (Moru curry)", "1 bowl (150 ml)"),
    ("Curry & gravy", "വെജിറ്റബിൾ കുറുമ (Vegetable kurma)", "1 bowl (180 g)"),
    ("Curry & gravy", "ചിക്കൻ സ്റ്റ്യൂ (Chicken stew)", "1 bowl (200 g)"),
    ("Curry & gravy", "മട്ടൺ സ്റ്റ്യൂ (Mutton stew)", "1 bowl (200 g)"),
    ("Curry & gravy", "കുമ്പളങ്ങ കറി (Ash gourd curry)", "1 bowl (180 g)"),
    ("Curry & gravy", "കോളിഫ്ലവർ കറി (Cauliflower curry)", "1 bowl (180 g)"),
    ("Curry & gravy", "തക്കാളി കറി (Tomato curry)", "1 bowl (150 g)"),
    ("Curry & gravy", "പനീർ കറി (Paneer curry)", "1 bowl (180 g)"),
    ("Curry & gravy", "ബട്ടർ ചിക്കൻ (Butter chicken)", "1 bowl (180 g)"),
    ("Curry & gravy", "ചിക്കൻ ചില്ലി (Chicken chilli)", "1 serving (180 g)"),
    ("Fry & roast", "ചിക്കൻ ഫ്രൈ (Chicken fry)", "1 serving (120 g)"),
    ("Fry & roast", "ചിക്കൻ വരട്ടിയത് (Chicken varattiyathu)", "1 serving (150 g)"),
    ("Fry & roast", "ബീഫ് ഫ്രൈ (Beef fry)", "1 serving (120 g)"),
    ("Fry & roast", "ബീഫ് റോസ്റ്റ് (Beef roast)", "1 serving (150 g)"),
    ("Fry & roast", "ബീഫ് വരട്ടിയത് (Beef varattiyathu)", "1 serving (150 g)"),
    ("Fry & roast", "ചിക്കൻ കൊണ്ടാട്ടം (Chicken kondattam)", "1 serving (150 g)"),
    ("Fry & roast", "ബീഫ് കൊണ്ടാട്ടം (Beef kondattam)", "1 serving (150 g)"),
    ("Fry & roast", "ചിക്കൻ ബ്രോസ്റ്റ് (Chicken broast)", "1 piece (150 g)"),
    ("Fry & roast", "ചിക്കൻ ലോലിപോപ്പ് (Chicken lollipop)", "2 pieces (100 g)"),
    ("Fry & roast", "മസാല ബോണ്ട (Masala bonda)", "2 small (100 g)"),
    ("Fry & roast", "ബോണ്ട (Bonda)", "2 small (90 g)"),
    ("Fry & roast", "ഉഴുന്ന് വട (Uzhunnu vada)", "1 medium (60 g)"),
    ("Fry & roast", "പരിപ്പ് വട (Parippu vada)", "1 medium (50 g)"),
    ("Fry & roast", "ഉള്ളി വട (Ulli vada)", "2 pieces (80 g)"),
    ("Fry & roast", "പഴംപൊരി (Pazham pori)", "1 piece (75 g)"),
    ("Fry & roast", "കല്ലുമ്മക്കായ ഫ്രൈ (Kallummakkaya fry)", "1 serving (100 g)"),
    ("Fry & roast", "മസാല ഷവായ (Masala shawaya)", "1 serving (150 g)"),
    ("Alfaham & grilled", "ചിക്കൻ അൽഫഹം (Chicken alfaham)", "1/4 chicken edible portion (180 g)"),
    ("Alfaham & grilled", "ബീഫ് അൽഫഹം (Beef alfaham)", "1 serving (180 g)"),
    ("Alfaham & grilled", "ചിക്കൻ തന്തൂരി (Chicken tandoori)", "1 leg quarter edible (170 g)"),
    ("Alfaham & grilled", "ഷവായ ചിക്കൻ (Shawaya chicken)", "1 serving (180 g)"),
    ("Salna, chutney & sides", "സാൽന (Salna)", "1 small bowl (150 ml)"),
    ("Salna, chutney & sides", "ചമ്മന്തി (Chammandi)", "2 tbsp (30 g)"),
    ("Salna, chutney & sides", "തേങ്ങ ചമ്മന്തി (Thenga chammandi)", "2 tbsp (30 g)"),
    ("Salna, chutney & sides", "പച്ച ചട്ണി (Green chutney)", "2 tbsp (30 g)"),
    ("Salna, chutney & sides", "അച്ചാർ (Achar)", "1 tbsp (15 g)"),
    ("Salna, chutney & sides", "മയോണൈസ് (Mayonnaise)", "1 tbsp (15 g)"),
    ("Salna, chutney & sides", "തക്കാളി സോസ് (Tomato sauce)", "1 tbsp (17 g)"),
    ("Salna, chutney & sides", "തോരൻ (Thoran; mixed vegetable)", "1 serving (100 g)"),
    ("Salna, chutney & sides", "കാബേജ് തോരൻ (Cabbage thoran)", "1 serving (100 g)"),
    ("Salna, chutney & sides", "ബീൻസ് തോരൻ (Beans thoran)", "1 serving (100 g)"),
    ("Salna, chutney & sides", "ഓലൻ (Olan)", "1 serving (150 g)"),
    ("Salna, chutney & sides", "കിച്ചടി (Kichadi)", "1 serving (100 g)"),
    ("Snacks & sweets", "ഉസ്മാനിയ ബിസ്കറ്റ് (Usmaniya biscuit)", "2 biscuits (30 g)"),
    ("Snacks & sweets", "കപ്പ് കേക്ക് (Cupcake)", "1 small (50 g)")
]

page5_nutrition = [
    (190.0, 6.0, 12.0, 23.0, 45.0),
    (200.0, 8.0, 9.0, 25.0, 45.0),
    (120.0, 4.0, 6.0, 16.0, 45.0),
    (45.0, 1.5, 1.5, 7.0, 15.0),
    (180.0, 12.0, 4.0, 15.0, 55.0),
    (160.0, 12.0, 3.0, 12.0, 25.0),
    (90.0, 5.0, 4.0, 7.0, 110.0),
    (210.0, 14.0, 5.0, 17.0, 55.0),
    (270.0, 16.0, 19.0, 10.0, 55.0),
    (300.0, 19.0, 20.0, 10.0, 45.0),
    (110.0, 6.0, 2.0, 13.0, 35.0),
    (150.0, 8.0, 4.0, 16.0, 45.0),
    (100.0, 6.0, 2.0, 11.0, 25.0),
    (300.0, 22.0, 14.0, 10.0, 280.0),
    (340.0, 23.0, 23.0, 9.0, 75.0),
    (310.0, 17.0, 23.0, 15.0, 40.0),
    (310.0, 19.0, 27.0, 6.0, 25.0),
    (330.0, 21.0, 28.0, 6.0, 30.0),
    (360.0, 27.0, 24.0, 5.0, 20.0),
    (340.0, 24.0, 25.0, 7.0, 25.0),
    (370.0, 27.0, 25.0, 7.0, 25.0),
    (350.0, 22.0, 26.0, 10.0, 35.0),
    (380.0, 28.0, 25.0, 9.0, 25.0),
    (390.0, 22.0, 28.0, 20.0, 35.0),
    (290.0, 18.0, 19.0, 13.0, 25.0),
    (280.0, 15.0, 6.0, 30.0, 35.0),
    (250.0, 13.0, 5.0, 28.0, 30.0),
    (150.0, 8.0, 5.0, 16.0, 20.0),
    (140.0, 7.0, 5.0, 16.0, 25.0),
    (220.0, 12.0, 4.0, 24.0, 25.0),
    (190.0, 9.0, 2.0, 27.0, 8.0),
    (220.0, 12.0, 17.0, 9.0, 60.0),
    (330.0, 20.0, 30.0, 5.0, 30.0),
    (390.0, 21.0, 43.0, 3.0, 25.0),
    (430.0, 28.0, 38.0, 3.0, 20.0),
    (320.0, 13.0, 43.0, 4.0, 30.0),
    (360.0, 17.0, 44.0, 3.0, 25.0),
    (130.0, 9.0, 3.0, 10.0, 25.0),
    (85.0, 7.0, 1.5, 4.0, 10.0),
    (100.0, 9.0, 1.5, 4.0, 12.0),
    (25.0, 1.0, 1.0, 4.0, 20.0),
    (35.0, 3.0, 0.5, 2.0, 15.0),
    (100.0, 11.0, 0.2, 0.5, 2.0),
    (18.0, 0.1, 0.2, 4.5, 3.0),
    (120.0, 8.0, 3.0, 10.0, 45.0),
    (110.0, 7.0, 2.5, 9.0, 45.0),
    (115.0, 7.0, 3.0, 10.0, 55.0),
    (100.0, 6.0, 2.0, 11.0, 25.0),
    (95.0, 6.0, 3.0, 8.0, 55.0),
    (145.0, 7.0, 2.0, 19.0, 20.0),
    (190.0, 9.0, 2.5, 26.0, 35.0)
]

page3_items = [
    ("Snacks & sweets", "മിക്സ്ചർ (Mixture)", "1 handful (30 g)"),
    ("Snacks & sweets", "റവ ലഡ്ഡു (Rava laddu)", "1 piece (35 g)"),
    ("Snacks & sweets", "മൈസൂർ പാക്ക് (Mysore pak)", "1 piece (30 g)"),
    ("Snacks & sweets", "കൊഴുക്കട്ട (Kozhukatta)", "1 medium (60 g)"),
    ("Snacks & sweets", "കണ്ണൂരപ്പം (Kannur appam)", "1 piece (60 g)"),
    ("Snacks & sweets", "ജിലേബി (Jalebi)", "2 small (50 g)"),
    ("Snacks & sweets", "മധുര പലഹാരം (Sweet puff)", "1 piece (60 g)"),
    ("Snacks & sweets", "മുട്ട പഫ്‌സ് (Egg puffs)", "1 piece (80 g)"),
    ("Snacks & sweets", "ചിക്കൻ പഫ്‌സ് (Chicken puffs)", "1 piece (80 g)"),
    ("Snacks & sweets", "നുറുക്ക് (Nurukku; savoury snack)", "1 handful (30 g)"),
    ("Snacks & sweets", "ബനാന ചിപ്സ് (Banana chips)", "1 handful (30 g)"),
    ("Snacks & sweets", "ലേയ്സ് (Potato chips)", "1 small pack (28 g)"),
    ("Fruits", "നേന്ത്രപ്പഴം (Nendran banana)", "1 medium (100 g)"),
    ("Fruits", "പാളയംകോടൻ പഴം (Palayankodan banana)", "1 medium (80 g)"),
    ("Fruits", "മാങ്ങ (Mango)", "1 cup pieces (165 g)"),
    ("Fruits", "പപ്പായ (Papaya)", "1 cup pieces (145 g)"),
    ("Fruits", "ചക്ക (Jackfruit)", "1 cup bulbs (150 g)"),
    ("Fruits", "പേരയ്ക്ക (Guava)", "1 medium (100 g)"),
    ("Fruits", "മാതളം (Pomegranate)", "1/2 cup arils (87 g)"),
    ("Fruits", "തണ്ണിമത്തൻ (Watermelon)", "1 cup cubes (150 g)"),
    ("Fruits", "മുന്തിരി (Grapes)", "1 cup (150 g)"),
    ("Fruits", "ഓറഞ്ച് (Orange)", "1 medium (130 g)"),
    ("Fruits", "ഇളനീർ (Tender coconut water)", "1 glass (250 ml)"),
    ("Vegetables", "വെണ്ടയ്ക്ക (Vendakka/okra)", "1 cup cooked (100 g)"),
    ("Vegetables", "മുരിങ്ങക്കായ (Drumstick)", "1 cup cooked (100 g)"),
    ("Vegetables", "മത്തൻ (Pumpkin)", "1 cup cooked (100 g)"),
    ("Vegetables", "കുമ്പളങ്ങ (Ash gourd)", "1 cup (100 g)"),
    ("Vegetables", "വഴുതനങ്ങ (Brinjal)", "1 cup cooked (100 g)"),
    ("Vegetables", "ചീര (Amaranth leaves)", "1 cup cooked (100 g)"),
    ("Vegetables", "ക്യാരറ്റ് (Carrot)", "1 medium (60 g)"),
    ("Vegetables", "ബീറ്റ്റൂട്ട് (Beetroot)", "1/2 cup cooked (85 g)"),
    ("Vegetables", "കാബേജ് (Cabbage)", "1 cup chopped (90 g)"),
    ("Vegetables", "ഉരുളക്കിഴങ്ങ് (Potato)", "1 medium boiled (150 g)"),
    ("Vegetables", "മധുരക്കിഴങ്ങ് (Sweet potato)", "1 medium boiled (130 g)"),
    ("Tea, coffee & drinks", "പാൽ ചായ (Milk tea; with sugar)", "1 cup (150 ml)"),
    ("Tea, coffee & drinks", "കട്ടൻ ചായ (Black tea; no sugar)", "1 cup (150 ml)"),
    ("Tea, coffee & drinks", "കാപ്പി (Coffee with milk and sugar)", "1 cup (150 ml)"),
    ("Tea, coffee & drinks", "കട്ടൻ കാപ്പി (Black coffee; no sugar)", "1 cup (150 ml)"),
    ("Tea, coffee & drinks", "സംഭാരം (Sambharam/buttermilk)", "1 glass (200 ml)"),
    ("Tea, coffee & drinks", "ഫ്രൂട്ടി (Mango drink; packaged)", "1 small pack (160 ml)"),
    ("Tea, coffee & drinks", "7UP (lemon-lime soft drink)", "1 glass (250 ml)"),
    ("Tea, coffee & drinks", "മൗണ്ടൻ ഡ്യൂ (Mountain Dew)", "1 glass (250 ml)"),
    ("Tea, coffee & drinks", "പെപ്സി (Pepsi)", "1 glass (250 ml)"),
    ("Rotti & breads", "പനീർ ദോശ (Paneer dosa)", "1 medium (180 g)"),
    ("Snacks & sweets", "ലഡ്ഡു (Laddu; generic besan laddu)", "1 small (35 g)"),
    ("Snacks & sweets", "ശർക്കര (Jaggery)", "1 small piece (20 g)"),
    ("Fruits", "ലിച്ചി (Litchi)", "10 fruits (100 g edible)")
]

page6_nutrition = [
    (160.0, 10.0, 4.0, 14.0, 25.0),
    (150.0, 7.0, 2.5, 20.0, 25.0),
    (160.0, 10.0, 2.0, 16.0, 8.0),
    (130.0, 2.0, 2.0, 27.0, 12.0),
    (180.0, 5.0, 3.0, 30.0, 15.0),
    (190.0, 5.0, 2.0, 34.0, 12.0),
    (220.0, 11.0, 3.0, 28.0, 25.0),
    (260.0, 15.0, 7.0, 25.0, 35.0),
    (270.0, 15.0, 8.0, 25.0, 25.0),
    (150.0, 8.0, 3.0, 17.0, 20.0),
    (160.0, 10.0, 0.7, 18.0, 3.0),
    (150.0, 9.5, 2.0, 15.0, 8.0),
    (122.0, 0.4, 1.3, 31.0, 3.0),
    (72.0, 0.2, 0.9, 19.0, 4.0),
    (99.0, 0.6, 1.4, 25.0, 18.0),
    (62.0, 0.4, 0.7, 16.0, 31.0),
    (143.0, 0.5, 2.3, 35.0, 24.0),
    (68.0, 1.0, 2.6, 14.0, 18.0),
    (72.0, 1.0, 1.5, 16.0, 7.0),
    (45.0, 0.2, 0.9, 11.0, 9.0),
    (104.0, 0.2, 1.1, 27.0, 15.0),
    (62.0, 0.2, 1.2, 15.0, 52.0),
    (45.0, 0.3, 0.8, 10.0, 25.0),
    (35.0, 0.2, 1.9, 7.0, 77.0),
    (37.0, 0.2, 2.1, 8.0, 30.0),
    (26.0, 0.1, 1.0, 6.0, 21.0),
    (13.0, 0.1, 0.4, 3.0, 19.0),
    (35.0, 0.2, 1.0, 8.0, 9.0),
    (33.0, 0.5, 3.0, 4.0, 215.0),
    (25.0, 0.1, 0.6, 6.0, 20.0),
    (37.0, 0.1, 1.4, 8.0, 13.0),
    (23.0, 0.1, 1.2, 5.0, 36.0),
    (130.0, 0.2, 3.0, 30.0, 12.0),
    (112.0, 0.1, 2.0, 26.0, 39.0),
    (90.0, 3.0, 2.5, 13.0, 90.0),
    (2.0, 0.0, 0.0, 0.5, 0.0),
    (85.0, 3.0, 2.5, 12.0, 85.0),
    (2.0, 0.0, 0.2, 0.3, 2.0),
    (55.0, 2.0, 3.0, 5.0, 110.0),
    (95.0, 0.0, 0.0, 23.0, 0.0),
    (105.0, 0.0, 0.0, 26.0, 0.0),
    (115.0, 0.0, 0.0, 29.0, 0.0),
    (105.0, 0.0, 0.0, 27.0, 0.0),
    (330.0, 13.0, 12.0, 40.0, 190.0),
    (165.0, 8.0, 3.0, 21.0, 25.0),
    (77.0, 0.0, 0.1, 19.0, 8.0),
    (66.0, 0.4, 0.8, 17.0, 5.0)
]

assert len(page1_items) == len(page4_nutrition) == 47
assert len(page2_items) == len(page5_nutrition) == 51
assert len(page3_items) == len(page6_nutrition) == 47

all_items = []

def map_category(raw_cat, name):
    name_low = name.lower()
    if raw_cat in ["Rotti & breads", "Rice & biriyani"]:
        return "Grains & Breads"
    elif raw_cat == "Vegetables":
        return "Vegetables"
    elif raw_cat == "Fruits":
        return "Fruits"
    elif raw_cat == "Curry & gravy":
        if any(w in name_low for w in ["chicken", "mutton", "beef", "meen", "fish", "mutta", "egg", "kadala", "chana", "green gram", "green peas", "paneer"]):
            return "Proteins"
        elif any(w in name_low for w in ["sambar", "rasam", "avial", "theeyal", "kuruma", "ash gourd", "cauliflower", "tomato"]):
            return "Vegetables"
        elif "moru" in name_low or "മോർ" in name_low:
            return "Dairy & Alternatives"
        return "Proteins"
    elif raw_cat in ["Fry & roast", "Alfaham & grilled"]:
        if any(w in name_low for w in ["bonda", "vada", "pazham pori", "പഴംപൊരി", "ബോണ്ട", "വട"]):
            return "Beverages & Snacks"
        return "Proteins"
    elif raw_cat in ["Salna, chutney & sides"]:
        if any(w in name_low for w in ["thoran", "തോരൻ", "olan", "ഓലൻ", "kichadi", "കിച്ചടി"]):
            return "Vegetables"
        return "Beverages & Snacks"
    elif raw_cat in ["Snacks & sweets", "Tea, coffee & drinks"]:
        return "Beverages & Snacks"
    return "Beverages & Snacks"

def extract_grams(serving_str):
    m = re.search(r'\((\d+)\s*g\)', serving_str)
    if m:
        return int(m.group(1))
    m_ml = re.search(r'\((\d+)\s*ml\)', serving_str)
    if m_ml:
        return int(m_ml.group(1))
    return None

def determine_calorie_quality(name, cat, cal, fat):
    name_low = name.lower()
    if any(w in name_low for w in ["porotta", "പൊറോട്ട", "പൂരി", "poori", "fried", "ഫ്രൈ", "broast", "ബ്രോസ്റ്റ്", "bonda", "ബോണ്ട", "vada", "വട", "chips", "ചിപ്സ്", "ലേയ്സ്", "lays", "പഫ്‌സ്", "puffs", "laddu", "ലഡ്ഡു", "mysore pak", "മൈസൂർ പാക്ക്", "jalebi", "ജിലേബി", "cake", "കേക്ക്", "cupcake", "sweet", "മധുര", "pepsi", "പെപ്സി", "7up", "mountain dew", "മൗണ്ടൻ ഡ്യൂ", "frooti", "ഫ്രൂട്ടി", "mayonnaise", "മയോണൈസ്", "sauce", "biscuit", "ബിസ്കറ്റ്", "mixture", "മിക്സ്ചർ"]):
        return "bad"
    return "good"

def make_slug_id(name):
    # Extract English name inside parenthesis if available
    m = re.search(r'\((.*?)\)', name)
    eng = m.group(1) if m else name
    eng_clean = re.sub(r'[^a-zA-Z0-9]+', '-', eng.strip()).lower().strip('-')
    return f"kl-{eng_clean}"

pairs = (
    list(zip(page1_items, page4_nutrition)) +
    list(zip(page2_items, page5_nutrition)) +
    list(zip(page3_items, page6_nutrition))
)

generated_foods = []
seen_ids = set()

for idx, (item, nut) in enumerate(pairs, 1):
    raw_cat, name, serving = item
    cal, fat, protein, carbs, calcium = nut
    category = map_category(raw_cat, name)
    grams = extract_grams(serving)
    cal_quality = determine_calorie_quality(name, category, cal, fat)
    
    slug_id = make_slug_id(name)
    if slug_id in seen_ids or len(slug_id) < 5:
        slug_id = f"{slug_id}-{idx}"
    seen_ids.add(slug_id)

    food_obj = {
        "id": slug_id,
        "name": name,
        "category": category,
        "servingUnit": serving,
        "servingGrams": grams,
        "calories": round(cal),
        "protein": round(protein, 1),
        "carbs": round(carbs, 1),
        "fat": round(fat, 1),
        "calorieQuality": cal_quality,
        "calciumMg": round(calcium, 1),
        "clinicVerified": True,
        "sourcePdf": "Kerala_Food_Nutrition_Expanded"
    }
    generated_foods.append(food_obj)

print(f"Total processed: {len(generated_foods)}")
with open("scripts/parsed_kerala_foods.json", "w", encoding="utf-8") as f:
    json.dump(generated_foods, f, ensure_ascii=False, indent=2)

print("Saved to scripts/parsed_kerala_foods.json")
