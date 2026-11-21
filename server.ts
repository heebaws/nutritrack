import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import * as webpush from "web-push";
import { KERALA_SERVER_LOOKUP } from "./src/data/keralaServerLookup";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Built-in clinic food nutritional database for instant high-accuracy food inquiries and fallback
const CLINIC_FOOD_LOOKUP: Record<string, {
  name: string;
  category: string;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  glycemicIndex?: string;
  verdict: string;
  tips: string;
}> = {
  bread: {
    name: "Whole Wheat Bread",
    category: "Grains & Breads",
    servingUnit: "1 slice (35g)",
    calories: 79,
    protein: 3.9,
    carbs: 13.8,
    fat: 1.0,
    fiber: 2.3,
    glycemicIndex: "Medium (58)",
    verdict: "A solid complex carbohydrate source. Opt for 100% whole grain or sourdough over refined white bread for slower glucose absorption.",
    tips: "Pair with scrambled eggs, peanut butter, or paneer to balance the glycemic response."
  },
  "white bread": {
    name: "White Bread",
    category: "Grains & Breads",
    servingUnit: "1 slice (30g)",
    calories: 75,
    protein: 2.3,
    carbs: 14.5,
    fat: 0.9,
    fiber: 0.8,
    glycemicIndex: "High (73)",
    verdict: "Refined grain with low fiber. It digests rapidly and can spike blood sugar levels.",
    tips: "Consider swapping for brown or multigrain bread, especially if you have insulin resistance or a weight loss goal."
  },
  egg: {
    name: "Boiled Whole Egg",
    category: "Proteins",
    servingUnit: "1 large egg (50g)",
    calories: 74,
    protein: 6.3,
    carbs: 0.4,
    fat: 5.0,
    fiber: 0,
    glycemicIndex: "Low (<10)",
    verdict: "Superfood with complete amino acid profile, choline, and fat-soluble vitamins A, D, E, K.",
    tips: "Ideal for breakfast or post-workout. Satiating and promotes sustained energy."
  },
  banana: {
    name: "Fresh Banana",
    category: "Fruits",
    servingUnit: "1 medium banana (118g)",
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    fiber: 3.1,
    glycemicIndex: "Medium (51)",
    verdict: "Rich in potassium, vitamin B6, and quick digestible natural carbs.",
    tips: "Great 30-45 minutes before exercise for an energy boost, or paired with Greek yogurt."
  },
  oats: {
    name: "Rolled Oats (dry)",
    category: "Grains & Breads",
    servingUnit: "1/2 cup (40g)",
    calories: 154,
    protein: 5.3,
    carbs: 27.4,
    fat: 2.6,
    fiber: 4.1,
    glycemicIndex: "Low (55)",
    verdict: "High in beta-glucan soluble fiber which lowers LDL cholesterol and stabilizes blood glucose.",
    tips: "Cook in water or skim milk, top with chia seeds or nuts rather than refined sugar."
  },
  chicken: {
    name: "Grilled Chicken Breast (skinless)",
    category: "Proteins",
    servingUnit: "100g cooked",
    calories: 165,
    protein: 31.0,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    glycemicIndex: "Zero (0)",
    verdict: "Gold standard lean protein for muscle preservation and satiety in weight loss regimens.",
    tips: "Season with herbs, turmeric, garlic, and lemon rather than heavy cream or sodium marinades."
  },
  rice: {
    name: "Cooked Basmati Rice",
    category: "Grains & Breads",
    servingUnit: "1 cup (158g)",
    calories: 205,
    protein: 4.3,
    carbs: 45.0,
    fat: 0.4,
    fiber: 0.6,
    glycemicIndex: "Medium (58)",
    verdict: "Easily digestible carbohydrate staple. Portion control is essential for fat loss targets.",
    tips: "Fill half your plate with salad/sabzi and a quarter with protein before adding rice."
  },
  apple: {
    name: "Fresh Apple with Skin",
    category: "Fruits",
    servingUnit: "1 medium (182g)",
    calories: 95,
    protein: 0.5,
    carbs: 25.0,
    fat: 0.3,
    fiber: 4.4,
    glycemicIndex: "Low (36)",
    verdict: "Packed with pectin fiber, vitamin C, and antioxidants.",
    tips: "Eat whole with skin for maximum fiber. Avoid strained apple juice."
  },
  milk: {
    name: "Low-Fat Toned Cow Milk",
    category: "Dairy & Alternatives",
    servingUnit: "1 cup (240ml)",
    calories: 122,
    protein: 8.0,
    carbs: 12.0,
    fat: 4.8,
    fiber: 0,
    glycemicIndex: "Low (31)",
    verdict: "Provides bioavailable calcium, vitamin D, and whey & casein proteins.",
    tips: "Great for nighttime recovery or blended in smoothies."
  },
  paneer: {
    name: "Fresh Low-Fat Paneer / Cottage Cheese",
    category: "Dairy & Alternatives",
    servingUnit: "100g",
    calories: 180,
    protein: 18.0,
    carbs: 4.0,
    fat: 10.0,
    fiber: 0,
    glycemicIndex: "Low (<15)",
    verdict: "Nutrient-dense vegetarian protein source with slow-digesting casein protein.",
    tips: "Grill with bell peppers or add to vegetable stir fries."
  },
  chapati: {
    name: "Whole Wheat Chapati / Roti",
    category: "Grains & Breads",
    servingUnit: "1 medium roti (35g)",
    calories: 104,
    protein: 3.1,
    carbs: 20.2,
    fat: 1.2,
    fiber: 2.8,
    glycemicIndex: "Medium (52)",
    verdict: "Traditional whole grain flatbread offering balanced complex carbohydrates and fiber.",
    tips: "Prepare with minimal added ghee or oil if you are on a strict caloric deficit."
  },
  avocado: {
    name: "Fresh Avocado",
    category: "Nuts & Healthy Fats",
    servingUnit: "1/2 medium avocado (100g)",
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    glycemicIndex: "Low (<15)",
    verdict: "Outstanding monounsaturated heart-healthy fats, potassium, and high fiber.",
    tips: "Supports hormone balance and lipid profiles. Great spread on whole grain toast."
  },
  almonds: {
    name: "Raw California Almonds",
    category: "Nuts & Healthy Fats",
    servingUnit: "1 handful (28g / ~23 nuts)",
    calories: 164,
    protein: 6.0,
    carbs: 6.1,
    fat: 14.2,
    fiber: 3.5,
    glycemicIndex: "Low (<10)",
    verdict: "Rich in Vitamin E, magnesium, and healthy fats. Excellent for glycemic control.",
    tips: "Soak overnight or consume as a mid-morning snack to curb sugar cravings."
  },
  coffee: {
    name: "Black Coffee / Espresso",
    category: "Beverages & Snacks",
    servingUnit: "1 cup (240ml, no sugar)",
    calories: 2,
    protein: 0.3,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0,
    glycemicIndex: "Zero (0)",
    verdict: "Metabolism booster and antioxidant source without added calories.",
    tips: "Avoid artificial sweeteners or heavy dairy cream if fasting or managing insulin."
  },
  tea: {
    name: "Green Tea / Black Tea",
    category: "Beverages & Snacks",
    servingUnit: "1 cup (200ml, no sugar)",
    calories: 2,
    protein: 0.1,
    carbs: 0.4,
    fat: 0.0,
    fiber: 0,
    glycemicIndex: "Zero (0)",
    verdict: "Rich in EGCG catechins that stimulate cellular thermogenesis.",
    tips: "Enjoy 2–3 cups between meals to aid digestion and daily hydration."
  },
  dal: {
    name: "Cooked Moong / Toor Dal",
    category: "Proteins",
    servingUnit: "1 small bowl (150g)",
    calories: 155,
    protein: 9.4,
    carbs: 22.0,
    fat: 2.8,
    fiber: 4.8,
    glycemicIndex: "Low (29)",
    verdict: "Staple plant-based protein with soluble fiber and iron.",
    tips: "Tempering with cumin and garlic enhances digestive bioavailability."
  },
  // Kerala Snacks & Specialities (Saleem Valanchery Wellness Clinic Referral)
  "pazham pori": {
    name: "Pazham Pori (Ethakka Appam / Banana Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (80g)",
    calories: 185,
    protein: 2.2,
    carbs: 34.0,
    fat: 5.5,
    fiber: 2.1,
    glycemicIndex: "Medium-High (62)",
    verdict: "Classic Kerala tea-time snack made of ripe Nendran banana dipped in maida/wheat batter and fried in oil. Naturally sweet, high in potassium and fast carbohydrates.",
    tips: "If on a weight-loss plan, limit to 1 piece occasionally. Ask whether it was deep-fried in coconut oil (+120 kcal) or air-fried/steamed (+0 kcal)."
  },
  "ethakka appam": {
    name: "Pazham Pori (Ethakka Appam)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (80g)",
    calories: 185,
    protein: 2.2,
    carbs: 34.0,
    fat: 5.5,
    fiber: 2.1,
    glycemicIndex: "Medium-High (62)",
    verdict: "Kerala ripe plantain fritter rich in natural sugars, vitamin B6, and potassium.",
    tips: "Pair with black tea or green tea without sugar to avoid compounding total sugar intake."
  },
  "parippu vada": {
    name: "Parippu Vada (Kerala Dal Vada)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (50g)",
    calories: 148,
    protein: 6.2,
    carbs: 16.5,
    fat: 7.2,
    fiber: 3.8,
    glycemicIndex: "Medium (45)",
    verdict: "Crunchy tea-time fritter made with coarse chana dal, shallots, ginger, and curry leaves. Good pulse protein and dietary fiber.",
    tips: "Deep frying increases lipid absorption. Enjoy in moderation with black coffee or unsweetened sulaimani."
  },
  "dal vada": {
    name: "Parippu Vada (Kerala Dal Vada)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (50g)",
    calories: 148,
    protein: 6.2,
    carbs: 16.5,
    fat: 7.2,
    fiber: 3.8,
    glycemicIndex: "Medium (45)",
    verdict: "Protein-rich pulse snack seasoned with traditional Kerala herbs and spices.",
    tips: "Drain excess surface oil with a napkin to save 20-30 kcal per vada."
  },
  "uzhunnu vada": {
    name: "Uzhunnu Vada (Medu Vada)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (50g)",
    calories: 142,
    protein: 4.8,
    carbs: 15.0,
    fat: 7.5,
    fiber: 2.2,
    glycemicIndex: "Medium (48)",
    verdict: "Fluffy fermented urad dal doughnut-shaped fritter. Provides bioavailable plant protein and complex carbs.",
    tips: "Pair with fresh coconut chammanthi and vegetable sambar for balanced micronutrients."
  },
  "medu vada": {
    name: "Uzhunnu Vada (Medu Vada)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (50g)",
    calories: 142,
    protein: 4.8,
    carbs: 15.0,
    fat: 7.5,
    fiber: 2.2,
    glycemicIndex: "Medium (48)",
    verdict: "Fermented black gram snack crispy on the exterior and soft inside.",
    tips: "Best consumed fresh as breakfast or morning snack rather than late night."
  },
  vada: {
    name: "Kerala Vada (Parippu / Uzhunnu)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (50g)",
    calories: 145,
    protein: 5.5,
    carbs: 15.8,
    fat: 7.3,
    fiber: 3.0,
    glycemicIndex: "Medium (46)",
    verdict: "Traditional Kerala lentil fritter offering plant protein accompanied by frying oil fats.",
    tips: "Select parippu vada for higher fiber, or pair with green tea."
  },
  unniyappam: {
    name: "Unniyappam (Sweet Jaggery & Rice Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (35g)",
    calories: 115,
    protein: 1.6,
    carbs: 22.0,
    fat: 2.8,
    fiber: 1.0,
    glycemicIndex: "Medium-High (60)",
    verdict: "Sweet snack made from roasted rice flour, ripe banana, cardamom, and dark jaggery fried in an appakarappam.",
    tips: "Contains iron and minerals from unrefined jaggery, but calorie-dense due to oil and concentrated sugars. Limit to 1-2 pieces."
  },
  neyyappam: {
    name: "Neyyappam (Traditional Ghee Rice Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (45g)",
    calories: 145,
    protein: 1.8,
    carbs: 25.0,
    fat: 4.5,
    fiber: 1.2,
    glycemicIndex: "High (65)",
    verdict: "Rich heritage delicacy made from raw rice batter, jaggery syrup, fried coconut slices, and ghee.",
    tips: "Reserve for festival cheat meals or special occasions if pursuing active fat loss."
  },
  sukhiyan: {
    name: "Sukhiyan (Sugiyan / Green Gram Sweet Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (55g)",
    calories: 140,
    protein: 4.5,
    carbs: 24.0,
    fat: 3.2,
    fiber: 2.6,
    glycemicIndex: "Medium (50)",
    verdict: "Boiled green gram (cherupayar) mashed with jaggery and coconut, dipped in light batter and crisped.",
    tips: "Cherupayar provides good potassium and dietary fiber compared to pure starch sweets."
  },
  "banana chips": {
    name: "Kerala Banana Chips (Nendran Upperi)",
    category: "Beverages & Snacks",
    servingUnit: "1 handful (30g)",
    calories: 158,
    protein: 1.1,
    carbs: 18.2,
    fat: 9.6,
    fiber: 1.8,
    glycemicIndex: "Medium (54)",
    verdict: "Crisp raw plantain slices fried in pure coconut oil with turmeric and salt. Delicious but energy dense.",
    tips: "Easily overconsumed. Measure a small 30g portion in a bowl rather than eating straight from the packet."
  },
  upperi: {
    name: "Kerala Banana Chips (Nendran Upperi)",
    category: "Beverages & Snacks",
    servingUnit: "1 handful (30g)",
    calories: 158,
    protein: 1.1,
    carbs: 18.2,
    fat: 9.6,
    fiber: 1.8,
    glycemicIndex: "Medium (54)",
    verdict: "Iconic Kerala coconut oil fried raw banana chips.",
    tips: "High in fats. Keep track of serving portions when logging in your diary."
  },
  "sharkara upperi": {
    name: "Sharkara Upperi (Jaggery Coated Banana Chips)",
    category: "Beverages & Snacks",
    servingUnit: "1 handful (30g)",
    calories: 168,
    protein: 1.0,
    carbs: 24.5,
    fat: 7.5,
    fiber: 1.5,
    glycemicIndex: "High (68)",
    verdict: "Thick-cut plantain chunks fried and coated with crystallized jaggery syrup, dried ginger (chukku), and cumin.",
    tips: "High sugar and energy density. Best treated as an occasional celebration treat."
  },
  "ela ada": {
    name: "Ela Ada (Steamed Rice Parcel)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (85g)",
    calories: 162,
    protein: 2.8,
    carbs: 32.0,
    fat: 3.0,
    fiber: 2.0,
    glycemicIndex: "Medium (48)",
    verdict: "Steamed delicacy wrapped in fresh banana leaf with grated coconut and jaggery inside roasted rice dough. Completely oil-free!",
    tips: "Excellent healthy Kerala breakfast or tea snack. Steaming preserves all nutrients without added frying fats."
  },
  kozhukkatta: {
    name: "Kozhukkatta (Steamed Rice Dumpling)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (60g)",
    calories: 132,
    protein: 2.2,
    carbs: 26.5,
    fat: 2.3,
    fiber: 1.5,
    glycemicIndex: "Medium (50)",
    verdict: "Steamed rice flour dumplings stuffed with jaggery, cardamom, and fresh coconut.",
    tips: "Zero frying oil. A wholesome alternative to deep-fried tea-time snacks."
  },
  mixture: {
    name: "Kerala Mixture (Spicy Sev, Peanuts & Curry Leaves)",
    category: "Beverages & Snacks",
    servingUnit: "Small cup (30g)",
    calories: 162,
    protein: 3.5,
    carbs: 15.0,
    fat: 10.2,
    fiber: 2.0,
    glycemicIndex: "Medium (52)",
    verdict: "Deep fried gram flour crisps blended with peanuts, roasted chickpeas, chili, and fried curry leaves.",
    tips: "Substantial oil absorption. Keep portions to 1-2 tablespoons when enjoying with chai."
  },
  achappam: {
    name: "Achappam (Kerala Rose Cookie)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (25g)",
    calories: 98,
    protein: 1.2,
    carbs: 14.5,
    fat: 4.2,
    fiber: 0.5,
    glycemicIndex: "Medium-High (60)",
    verdict: "Light, flower-patterned crunchy snack made from rice flour, coconut milk, and sesame seeds.",
    tips: "Lightweight and moderately portion-safe when limited to 1 piece."
  },
  "mutta bajji": {
    name: "Mutta Bajji (Kerala Egg Bonda)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (70g)",
    calories: 158,
    protein: 6.8,
    carbs: 11.2,
    fat: 9.8,
    fiber: 1.2,
    glycemicIndex: "Low-Medium (38)",
    verdict: "Boiled egg coated with spiced besan batter and fried. High biological value egg protein with batter fats.",
    tips: "Great protein delivery for a snack. Check whether it was deep-fried or lightly prepared."
  },
  halwa: {
    name: "Kerala Calicut Halwa",
    category: "Beverages & Snacks",
    servingUnit: "1 slice (40g)",
    calories: 175,
    protein: 1.0,
    carbs: 26.0,
    fat: 7.8,
    fiber: 0.5,
    glycemicIndex: "High (70)",
    verdict: "Traditional gelatinous sweet made of flour/tapioca, sugar, coconut oil or ghee, garnished with cashews.",
    tips: "Very calorie dense. Mindful micro-portions are recommended."
  },

  // Kerala Staple Meals & Curries
  puttu: {
    name: "Kerala Puttu (Steamed Rice Flour & Coconut)",
    category: "Grains & Breads",
    servingUnit: "1 piece / cup (100g)",
    calories: 165,
    protein: 3.2,
    carbs: 32.0,
    fat: 2.8,
    fiber: 2.2,
    glycemicIndex: "Medium (54)",
    verdict: "Iconic steamed breakfast cylinder made of coarse ground rice layered with fresh grated coconut. Naturally steamed with zero added cooking oil.",
    tips: "Pair with black chickpea kadala curry or boiled green gram (cherupayar) for a complete amino acid profile."
  },
  "kadala curry": {
    name: "Kerala Kadala Curry (Roasted Coconut Black Chickpeas)",
    category: "Proteins",
    servingUnit: "1 bowl (150g)",
    calories: 195,
    protein: 8.5,
    carbs: 26.0,
    fat: 7.0,
    fiber: 6.5,
    glycemicIndex: "Low (32)",
    verdict: "Nutrient-packed black chickpeas simmered in a roasted coconut paste with coriander, shallots, and curry leaves. Outstanding fiber and plant protein.",
    tips: "Ideal companion for Puttu, Appam, or Idiyappam. Low glycemic index helps sustain satiety for 4-5 hours."
  },
  kadala: {
    name: "Kerala Kadala Curry",
    category: "Proteins",
    servingUnit: "1 bowl (150g)",
    calories: 195,
    protein: 8.5,
    carbs: 26.0,
    fat: 7.0,
    fiber: 6.5,
    glycemicIndex: "Low (32)",
    verdict: "High-fiber black chickpeas with roasted Malabar spices.",
    tips: "Keeps post-meal blood glucose smooth and prevents midday energy crashes."
  },
  appam: {
    name: "Palappam / Kerala Appam",
    category: "Grains & Breads",
    servingUnit: "1 piece (50g)",
    calories: 95,
    protein: 1.8,
    carbs: 19.5,
    fat: 1.2,
    fiber: 0.8,
    glycemicIndex: "Medium (55)",
    verdict: "Fermented rice pancake with soft spongy coconut milk center and crispy lace borders. Light on the stomach and easily digestible.",
    tips: "Pair with egg roast, vegetable stew, or kadala curry. 2 appams generally provide ~190 kcal."
  },
  palappam: {
    name: "Palappam / Kerala Appam",
    category: "Grains & Breads",
    servingUnit: "1 piece (50g)",
    calories: 95,
    protein: 1.8,
    carbs: 19.5,
    fat: 1.2,
    fiber: 0.8,
    glycemicIndex: "Medium (55)",
    verdict: "Traditional fermented rice bowl crepe cooked in an appachatti.",
    tips: "Healthy gut benefits from natural rice batter fermentation."
  },
  idiyappam: {
    name: "Idiyappam (Noolappam / String Hoppers)",
    category: "Grains & Breads",
    servingUnit: "1 piece (45g)",
    calories: 78,
    protein: 1.5,
    carbs: 17.2,
    fat: 0.4,
    fiber: 0.9,
    glycemicIndex: "Medium (52)",
    verdict: "Steamed rice noodle nests seasoned with a dash of freshly grated coconut. Very low in fat, zero cooking oil.",
    tips: "Exceptional clean carbohydrate choice for weight loss and sensitive digestive systems."
  },
  porotta: {
    name: "Malabar Porotta (Layered Flatbread)",
    category: "Grains & Breads",
    servingUnit: "1 porotta (75g)",
    calories: 295,
    protein: 5.5,
    carbs: 38.0,
    fat: 14.0,
    fiber: 1.8,
    glycemicIndex: "High (72)",
    verdict: "Flaky, layered refined flour flatbread kneaded with oil and fried on a flat griddle. High in calories and saturated fats.",
    tips: "If you eat porotta, balance your daily calories with plenty of water, salad, and high protein dishes like chicken breast or fish curry."
  },
  parotta: {
    name: "Malabar Porotta",
    category: "Grains & Breads",
    servingUnit: "1 porotta (75g)",
    calories: 295,
    protein: 5.5,
    carbs: 38.0,
    fat: 14.0,
    fiber: 1.8,
    glycemicIndex: "High (72)",
    verdict: "Popular Malabar layered flatbread. Rich in carbohydrates and cooking fats.",
    tips: "Check oiliness: restaurant porottas often absorb more ghee/oil (+60 kcal extra)."
  },
  "matta rice": {
    name: "Kerala Matta Rice (Red Rice)",
    category: "Grains & Breads",
    servingUnit: "1 cup cooked (150g)",
    calories: 198,
    protein: 4.2,
    carbs: 42.0,
    fat: 1.0,
    fiber: 2.8,
    glycemicIndex: "Medium (50)",
    verdict: "Indigenous parboiled red grain rice grown in Palakkad/Kerala. Packed with magnesium, zinc, and intact germ pericarp nutrients.",
    tips: "Superior to polished white rice for glycemic control. Digest slower and keeps you energized through the afternoon."
  },
  "fish curry": {
    name: "Kerala Fish Curry (Kudampuli Meen Curry)",
    category: "Proteins",
    servingUnit: "1 bowl (150g)",
    calories: 172,
    protein: 21.0,
    carbs: 3.5,
    fat: 8.2,
    fiber: 1.0,
    glycemicIndex: "Low (<15)",
    verdict: "Fresh sea fish cooked in an earthenware pot (manchatti) with Malabar tamarind (kudampuli), Kashmiri chili, shallots, and fenugreek. Superb lean protein and omega-3 fatty acids.",
    tips: "Kudampuli aids lipid metabolism and digestion. Highly recommended for fat loss and metabolic recovery."
  },
  "meen curry": {
    name: "Kerala Fish Curry (Kudampuli Meen Curry)",
    category: "Proteins",
    servingUnit: "1 bowl (150g)",
    calories: 172,
    protein: 21.0,
    carbs: 3.5,
    fat: 8.2,
    fiber: 1.0,
    glycemicIndex: "Low (<15)",
    verdict: "Heart-healthy fish curry loaded with bioavailable marine protein and anti-inflammatory spices.",
    tips: "A clinic staple for lowering visceral fat and improving insulin sensitivity."
  },
  "fish fry": {
    name: "Kerala Fish Fry (Tawa Ayala / Karimeen)",
    category: "Proteins",
    servingUnit: "1 piece (100g)",
    calories: 220,
    protein: 23.0,
    carbs: 2.0,
    fat: 13.8,
    fiber: 0.5,
    glycemicIndex: "Low (<15)",
    verdict: "Fish marinated in chili, turmeric, ginger, garlic, and lemon juice, then seared on a tawa.",
    tips: "Opt for tawa shallow fry rather than deep oil immersion to keep added fats low."
  },
  "meen fry": {
    name: "Kerala Fish Fry",
    category: "Proteins",
    servingUnit: "1 piece (100g)",
    calories: 220,
    protein: 23.0,
    carbs: 2.0,
    fat: 13.8,
    fiber: 0.5,
    glycemicIndex: "Low (<15)",
    verdict: "Spiced Kerala fish fry rich in complete amino acids and minerals.",
    tips: "Pair with cabbage thoran and a small portion of matta rice."
  },
  "beef fry": {
    name: "Kerala Beef Fry / Roast (Ularthiyathu)",
    category: "Proteins",
    servingUnit: "1 bowl (100g)",
    calories: 265,
    protein: 26.0,
    carbs: 4.5,
    fat: 16.0,
    fiber: 1.5,
    glycemicIndex: "Low (<15)",
    verdict: "Pressure-cooked beef slow-roasted in iron pan with coconut slices, pepper, shallots, and curry leaves.",
    tips: "Rich in heme iron, zinc, and B-vitamins. Watch portion size due to coconut slivers and cooking fats."
  },
  "beef roast": {
    name: "Kerala Beef Roast",
    category: "Proteins",
    servingUnit: "1 bowl (100g)",
    calories: 265,
    protein: 26.0,
    carbs: 4.5,
    fat: 16.0,
    fiber: 1.5,
    glycemicIndex: "Low (<15)",
    verdict: "Slow-roasted tender beef chunks packed with muscle-building protein and iron.",
    tips: "Excellent for post-workout recovery when matched with clean carbs."
  },
  "chicken roast": {
    name: "Kerala Chicken Roast / Curry",
    category: "Proteins",
    servingUnit: "1 bowl (150g)",
    calories: 215,
    protein: 24.0,
    carbs: 4.0,
    fat: 11.5,
    fiber: 1.2,
    glycemicIndex: "Low (<15)",
    verdict: "Traditional chicken curry or dry roast made with roasted spices, tomato, shallots, and ginger.",
    tips: "Skinless chicken breasts or thighs deliver high-protein with lower saturated fat."
  },
  aviyal: {
    name: "Kerala Aviyal (Mixed Vegetables & Coconut)",
    category: "Vegetables",
    servingUnit: "1 bowl (150g)",
    calories: 138,
    protein: 3.2,
    carbs: 14.5,
    fat: 7.8,
    fiber: 4.2,
    glycemicIndex: "Low (35)",
    verdict: "A medley of plantain, drumstick, yam, carrot, beans steamed with coarse coconut, cumin, curd, and fresh coconut oil.",
    tips: "Phenomenal micronutrient density and dietary fiber. Supports gut microbiome diversity."
  },
  thoran: {
    name: "Kerala Thoran (Cabbage / Beans / Beetroot with Coconut)",
    category: "Vegetables",
    servingUnit: "1 bowl (120g)",
    calories: 98,
    protein: 2.6,
    carbs: 9.5,
    fat: 5.8,
    fiber: 3.6,
    glycemicIndex: "Low (28)",
    verdict: "Finely chopped vegetables stir-fried with mustard seeds, curry leaves, shallots, and grated coconut.",
    tips: "Low calorie, high fiber side dish that helps stabilize blood glucose after lunch."
  },
  sambar: {
    name: "Kerala Sambar (Toor Dal & Vegetables)",
    category: "Vegetables",
    servingUnit: "1 bowl (150g)",
    calories: 115,
    protein: 5.2,
    carbs: 18.0,
    fat: 2.6,
    fiber: 4.5,
    glycemicIndex: "Low (34)",
    verdict: "Lentil stew with drumsticks, pumpkin, okra, shallots, and tamarind.",
    tips: "Combines plant-based protein with soluble fibers. Great over matta rice or with idli/dosa."
  },
  "moru curry": {
    name: "Kerala Moru Curry / Pulissery",
    category: "Dairy & Alternatives",
    servingUnit: "1 bowl (150g)",
    calories: 85,
    protein: 3.5,
    carbs: 6.2,
    fat: 5.2,
    fiber: 0.5,
    glycemicIndex: "Low (22)",
    verdict: "Traditional tempered buttermilk curry with turmeric, green chilies, fenugreek, and coconut paste.",
    tips: "Probiotic and soothing for gut flora and digestive acidity."
  },
  biryani: {
    name: "Thalassery Chicken Biryani (Kaima Rice)",
    category: "Grains & Breads",
    servingUnit: "1 plate (300g)",
    calories: 485,
    protein: 28.0,
    carbs: 58.0,
    fat: 16.5,
    fiber: 3.2,
    glycemicIndex: "Medium (58)",
    verdict: "Fragrant Kaima/Jeerakasala rice cooked on dum with chicken, ghee, fried shallots, and cashews.",
    tips: "Rich meal. Enjoy alongside cucumber raita (moru chammanthi) to improve digestion."
  },
  pathiri: {
    name: "Ari Pathiri (Thin Steamed Rice Roti)",
    category: "Grains & Breads",
    servingUnit: "1 piece (30g)",
    calories: 55,
    protein: 1.1,
    carbs: 12.0,
    fat: 0.2,
    fiber: 0.5,
    glycemicIndex: "Medium (58)",
    verdict: "Paper-thin Malabar flatbread made exclusively from cooked rice flour and water, cooked on a dry clay tawa. Completely fat-free!",
    tips: "Light on digestion. Excellent alternative to porotta when paired with fish curry or chicken roast."
  },
  "mutta roast": {
    name: "Kerala Mutta Roast (Egg Roast with Shallot Gravy)",
    category: "Proteins",
    servingUnit: "1 egg with gravy (120g)",
    calories: 185,
    protein: 9.5,
    carbs: 8.0,
    fat: 12.5,
    fiber: 1.5,
    glycemicIndex: "Low (30)",
    verdict: "Hard boiled eggs tossed in caramelized onions, tomatoes, and Kerala spices.",
    tips: "Classic high-protein pairing for Appam, Puttu, or Chapati."
  },
  pazhampori: {
    name: "Pazham Pori (Ethakka Appam)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (80g)",
    calories: 185,
    protein: 2.2,
    carbs: 34.0,
    fat: 5.5,
    fiber: 2.1,
    glycemicIndex: "Medium (62)",
    verdict: "Ripe Nendran plantain dipped in flour batter and fried in coconut oil. Naturally rich in potassium and fruit fructose.",
    tips: "Traditional tea-time snack. Choose medium sauté over deep oil bath to save 50-70 kcal."
  },
  parippuvada: {
    name: "Parippu Vada (Kerala Dal Vada)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (50g)",
    calories: 148,
    protein: 6.2,
    carbs: 16.5,
    fat: 7.2,
    fiber: 3.8,
    glycemicIndex: "Low-Medium (48)",
    verdict: "Coarsely crushed chana dal with shallots, ginger, green chilies, and curry leaves.",
    tips: "High in dietary fiber and plant protein. One piece makes an energizing snack."
  },
  "ulli vada": {
    name: "Kerala Ulli Vada (Crispy Onion Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (45g)",
    calories: 155,
    protein: 2.8,
    carbs: 16.0,
    fat: 9.0,
    fiber: 2.0,
    glycemicIndex: "Medium (55)",
    verdict: "Finely sliced red shallots mixed with besan, rice flour, and green chilies, deep fried crisp.",
    tips: "High calorie density due to surface oil absorption. Enjoy sparingly as a cheat treat."
  },
  ullivada: {
    name: "Kerala Ulli Vada (Crispy Onion Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (45g)",
    calories: 155,
    protein: 2.8,
    carbs: 16.0,
    fat: 9.0,
    fiber: 2.0,
    glycemicIndex: "Medium (55)",
    verdict: "Finely sliced red shallots mixed with besan, rice flour, and green chilies, deep fried crisp.",
    tips: "High calorie density due to surface oil absorption. Enjoy sparingly as a cheat treat."
  },
  bonda: {
    name: "Kerala Potato Bonda",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (65g)",
    calories: 160,
    protein: 3.2,
    carbs: 22.0,
    fat: 7.0,
    fiber: 2.2,
    glycemicIndex: "High (68)",
    verdict: "Spiced mashed potato dumpling coated in chickpea batter and deep fried golden.",
    tips: "Carbohydrate-heavy. Pair with black tea or green tea without sugar."
  },
  elayada: {
    name: "Ela Ada (Steamed Rice Parcel with Jaggery & Coconut)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (85g)",
    calories: 162,
    protein: 2.8,
    carbs: 32.0,
    fat: 3.0,
    fiber: 2.0,
    glycemicIndex: "Medium (52)",
    verdict: "Steamed in fragrant banana leaf using rice flour dough, grated coconut, cardamom, and pure jaggery. Zero oil frying!",
    tips: "Excellent healthy Kerala snack choice! Steaming keeps fats low while providing natural energy."
  },
  ilayada: {
    name: "Ela Ada (Steamed Rice Parcel with Jaggery & Coconut)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (85g)",
    calories: 162,
    protein: 2.8,
    carbs: 32.0,
    fat: 3.0,
    fiber: 2.0,
    glycemicIndex: "Medium (52)",
    verdict: "Steamed in fragrant banana leaf using rice flour dough, grated coconut, cardamom, and pure jaggery. Zero oil frying!",
    tips: "Steamed healthy choice. Ideal for morning or evening snack without extra trans fats."
  },
  unnakaya: {
    name: "Malabar Unnakaya (Stuffed Plantain Fritter)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (60g)",
    calories: 178,
    protein: 2.0,
    carbs: 28.0,
    fat: 7.2,
    fiber: 1.8,
    glycemicIndex: "Medium (60)",
    verdict: "Spindle-shaped steamed ripe plantain mashed and stuffed with coconut, sugar, egg/dry fruits, then fried.",
    tips: "A beloved Malabar wedding delicacy. Rich and sweet, best reserved for festive occasions."
  },
  kinnathappam: {
    name: "Kinnathappam (Steamed Sweet Rice Cake)",
    category: "Beverages & Snacks",
    servingUnit: "1 piece (60g)",
    calories: 135,
    protein: 2.0,
    carbs: 26.0,
    fat: 2.8,
    fiber: 0.8,
    glycemicIndex: "Medium (56)",
    verdict: "Soft steamed plate cake prepared with ground rice, coconut milk, jaggery or sugar, and cumin/cardamom.",
    tips: "Steamed and oil-free. Better choice than fried snacks for evening cravings."
  },
  "nendran chips": {
    name: "Kerala Banana Chips (Nendran Upperi)",
    category: "Beverages & Snacks",
    servingUnit: "Handful (30g)",
    calories: 158,
    protein: 1.1,
    carbs: 18.2,
    fat: 9.6,
    fiber: 1.8,
    glycemicIndex: "Medium (55)",
    verdict: "Thin raw Nendran plantain slices deep fried in pure coconut oil and salted.",
    tips: "High fat content. Limit to small portion (15-20g) to stay within daily fat limits."
  },
  "kerala upperi": {
    name: "Kerala Banana Chips (Nendran Upperi)",
    category: "Beverages & Snacks",
    servingUnit: "Handful (30g)",
    calories: 158,
    protein: 1.1,
    carbs: 18.2,
    fat: 9.6,
    fiber: 1.8,
    glycemicIndex: "Medium (55)",
    verdict: "Thin raw Nendran plantain slices deep fried in pure coconut oil and salted.",
    tips: "High fat content. Limit to small portion (15-20g) to stay within daily fat limits."
  },
  "sharkkara upperi": {
    name: "Sharkara Upperi (Jaggery Coated Plantain Chunks)",
    category: "Beverages & Snacks",
    servingUnit: "Handful (30g)",
    calories: 168,
    protein: 1.0,
    carbs: 24.5,
    fat: 7.5,
    fiber: 1.5,
    glycemicIndex: "High (65)",
    verdict: "Thick plantain chunks fried and coated with crystallized jaggery syrup, dried ginger (chukku), and cumin.",
    tips: "Traditional Onam Sadhya snack. Calorie-dense due to jaggery sugar concentration."
  },
  kappa: {
    name: "Kerala Steamed Tapioca (Kappa Puzhukku)",
    category: "Grains & Breads",
    servingUnit: "1 bowl (150g)",
    calories: 210,
    protein: 2.0,
    carbs: 48.0,
    fat: 1.5,
    fiber: 3.2,
    glycemicIndex: "High (70)",
    verdict: "Boiled cassava/tapioca seasoned with crushed coconut, green chilies, shallots, and turmeric.",
    tips: "Complex starch providing long-lasting fullness. Pair with spicy fish curry for balanced protein."
  },
  tapioca: {
    name: "Kerala Steamed Tapioca (Kappa Puzhukku)",
    category: "Grains & Breads",
    servingUnit: "1 bowl (150g)",
    calories: 210,
    protein: 2.0,
    carbs: 48.0,
    fat: 1.5,
    fiber: 3.2,
    glycemicIndex: "High (70)",
    verdict: "Boiled cassava/tapioca seasoned with crushed coconut, green chilies, shallots, and turmeric.",
    tips: "Complex starch providing long-lasting fullness. Pair with spicy fish curry for balanced protein."
  },
  "kappa and fish curry": {
    name: "Kappa & Kerala Fish Curry Combo",
    category: "Proteins",
    servingUnit: "1 plate (150g kappa + 120g fish curry)",
    calories: 382,
    protein: 23.0,
    carbs: 51.5,
    fat: 9.7,
    fiber: 4.2,
    glycemicIndex: "Medium-High",
    verdict: "Iconic Kerala combination providing both satisfying starches and lean seafood protein with omega-3s.",
    tips: "Great post-workout or midday active meal."
  },
  kanji: {
    name: "Kerala Matta Rice Kanji (Rice Gruel with Payar)",
    category: "Grains & Breads",
    servingUnit: "1 bowl (250ml)",
    calories: 145,
    protein: 3.5,
    carbs: 31.0,
    fat: 0.8,
    fiber: 2.0,
    glycemicIndex: "Medium (58)",
    verdict: "Warm comforting red rice gruel served with boiled cherupayar (green gram), chammanthi, and pickle.",
    tips: "Extremely gentle on digestion, hydrating, and naturally soothing for gut inflammation."
  },
  payasam: {
    name: "Kerala Ada Pradhaman / Palada Payasam",
    category: "Beverages & Snacks",
    servingUnit: "1 small cup (100ml)",
    calories: 220,
    protein: 3.8,
    carbs: 38.0,
    fat: 6.5,
    fiber: 0.5,
    glycemicIndex: "High (72)",
    verdict: "Festive Kerala dessert made with rice ada, thickened milk or coconut milk, jaggery/sugar, and ghee-roasted cashews.",
    tips: "High sugar content. Treat as an occasional festive indulgence."
  },
  snack: {
    name: "Kerala Snack Selection (Saleem Valanchery Centre)",
    category: "Beverages & Snacks",
    servingUnit: "1 standard portion",
    calories: 155,
    protein: 3.5,
    carbs: 22.0,
    fat: 6.5,
    fiber: 2.0,
    glycemicIndex: "Medium",
    verdict: "Traditional Kerala snacks range from healthy steamed delicacies (Ela Ada, Kozhukatta) to rich fried treats (Pazham Pori, Parippu Vada).",
    tips: "Ask NutriBot about any specific snack or select whether it was Steamed, Medium Sauté, or Deep Fried to see the exact calorie difference!"
  },
  sulaimani: {
    name: "Sulaimani (Black Tea with Lemon & Cardamom)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (150ml)",
    calories: 8,
    protein: 0.2,
    carbs: 1.8,
    fat: 0.0,
    fiber: 0,
    glycemicIndex: "Low",
    verdict: "Aromatic Malabar spiced black tea with fresh lemon and cardamom. Zero saturated fat.",
    tips: "Great digestive aid after lunch or dinner."
  },
  "chukku kaapi": {
    name: "Chukku Kaapi (Dry Ginger Herbal Coffee)",
    category: "Beverages & Snacks",
    servingUnit: "1 cup (150ml)",
    calories: 45,
    protein: 0.5,
    carbs: 10.5,
    fat: 0.1,
    fiber: 0.3,
    glycemicIndex: "Low",
    verdict: "Traditional Kerala dry ginger coffee infused with black pepper and palm jaggery.",
    tips: "Warming, anti-inflammatory, and comforting for throat and digestion."
  },
  sambharam: {
    name: "Morum Vellam / Sambharam (Kerala Spiced Buttermilk)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (240ml)",
    calories: 38,
    protein: 3.2,
    carbs: 3.8,
    fat: 1.2,
    fiber: 0.2,
    glycemicIndex: "Low",
    verdict: "Churned buttermilk spiced with crushed ginger, green chili, and curry leaves.",
    tips: "Probiotic powerhouse that hydrates and calms digestive heat."
  },
  "morum vellam": {
    name: "Morum Vellam / Sambharam (Kerala Spiced Buttermilk)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (240ml)",
    calories: 38,
    protein: 3.2,
    carbs: 3.8,
    fat: 1.2,
    fiber: 0.2,
    glycemicIndex: "Low",
    verdict: "Natural probiotic and electrolyte beverage.",
    tips: "Superb afternoon thirst quencher."
  },
  karikku: {
    name: "Karikku (Fresh Tender Coconut Water)",
    category: "Beverages & Snacks",
    servingUnit: "1 whole (250ml)",
    calories: 48,
    protein: 1.8,
    carbs: 9.0,
    fat: 0.5,
    fiber: 2.6,
    glycemicIndex: "Low",
    verdict: "Pure natural electrolyte water rich in potassium and active enzymes.",
    tips: "Superior natural alternative to artificial sports electrolyte drinks."
  },
  "kulukki sarbath": {
    name: "Kulukki Sarbath (Shaken Lemon & Sabja)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (250ml)",
    calories: 85,
    protein: 1.2,
    carbs: 20.0,
    fat: 0.2,
    fiber: 1.5,
    glycemicIndex: "Medium",
    verdict: "Shaken Kerala street cooler with lemon, green chili, and basil seeds.",
    tips: "Refreshing and cooling with beneficial dietary fiber from sabja seeds."
  },
  "nannari sarbath": {
    name: "Nannari Sarbath (Roots Sarbath with Lemon)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (250ml)",
    calories: 105,
    protein: 0.4,
    carbs: 26.0,
    fat: 0.1,
    fiber: 1.0,
    glycemicIndex: "Medium-High",
    verdict: "Herbal roots syrup drink with fresh lemon.",
    tips: "Traditional Ayurvedic body coolant."
  },
  panakam: {
    name: "Panakam (Traditional Jaggery & Pepper Drink)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (200ml)",
    calories: 88,
    protein: 0.3,
    carbs: 21.5,
    fat: 0.1,
    fiber: 0.4,
    glycemicIndex: "Medium",
    verdict: "Heritage electrolyte drink made with dark jaggery, dried ginger, and pepper.",
    tips: "Restores vital electrolytes during summer."
  },
  "jeeraka vellam": {
    name: "Jeeraka Vellam (Warm Cumin Water)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (250ml)",
    calories: 2,
    protein: 0.1,
    carbs: 0.4,
    fat: 0,
    fiber: 0.1,
    glycemicIndex: "Low",
    verdict: "Boiled cumin seed water.",
    tips: "Gentle digestive stimulant throughout the day."
  },
  "pathimugam vellam": {
    name: "Pathimugam Vellam (Pink Herbal Water)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (250ml)",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    glycemicIndex: "Zero",
    verdict: "Traditional Kerala pink drinking water boiled with Caesalpinia sappan wood.",
    tips: "100% calorie-free and antimicrobial."
  },
  "sharjah shake": {
    name: "Sharjah Shake (Calicut Bakery Shake)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (300ml)",
    calories: 280,
    protein: 6.5,
    carbs: 48.0,
    fat: 7.2,
    fiber: 2.2,
    glycemicIndex: "High",
    verdict: "Malabar bakery frozen banana, milk, and Horlicks smoothie.",
    tips: "High calorie density; reserve as an occasional treat."
  },
  chaya: {
    name: "Kerala Naadan Chaya (Milk Tea)",
    category: "Beverages & Snacks",
    servingUnit: "1 glass (150ml with milk & sugar)",
    calories: 75,
    protein: 2.8,
    carbs: 9.5,
    fat: 2.6,
    fiber: 0,
    glycemicIndex: "Medium",
    verdict: "Traditional poured milk tea.",
    tips: "Switch to black tea / Sulaimani to cut liquid dairy sugars."
  },
  kallappam: {
    name: "Kallappam / Vellayappam (Soft Rice Pancake)",
    category: "Grains & Breads",
    servingUnit: "1 piece (50g)",
    calories: 92,
    protein: 1.8,
    carbs: 18.5,
    fat: 1.2,
    fiber: 0.8,
    glycemicIndex: "Medium",
    verdict: "Fermented rice and coconut pancake with subtle cumin and shallots.",
    tips: "Gentle on digestion, pair with high-protein curries."
  },
  "thattu dosa": {
    name: "Kerala Thattu Dosa",
    category: "Grains & Breads",
    servingUnit: "1 small dosa (45g)",
    calories: 78,
    protein: 2.1,
    carbs: 14.5,
    fat: 1.2,
    fiber: 0.7,
    glycemicIndex: "Medium",
    verdict: "Soft street-style fermented rice & black gram pancake.",
    tips: "Pair with sambar or tomato chammanthi."
  },
  uppumavu: {
    name: "Uppumavu / Rava Upma",
    category: "Grains & Breads",
    servingUnit: "1 bowl (150g)",
    calories: 168,
    protein: 4.5,
    carbs: 28.0,
    fat: 4.2,
    fiber: 2.1,
    glycemicIndex: "Medium",
    verdict: "Roasted semolina cooked with mustard, curry leaves, and ginger.",
    tips: "Pair with boiled eggs for balanced protein."
  },
  olan: {
    name: "Olan (Ash Gourd & Cowpeas in Coconut Milk)",
    category: "Vegetables",
    servingUnit: "1 bowl (120g)",
    calories: 118,
    protein: 3.8,
    carbs: 12.0,
    fat: 6.2,
    fiber: 2.8,
    glycemicIndex: "Low",
    verdict: "Mild white pumpkin and cowpeas stew in fresh coconut milk.",
    tips: "Alkaline, cooling, and gentle on the gut."
  },
  kalan: {
    name: "Kalan (Sadhya Yam & Curd Curry)",
    category: "Vegetables",
    servingUnit: "1 bowl (120g)",
    calories: 148,
    protein: 3.2,
    carbs: 16.5,
    fat: 7.5,
    fiber: 2.4,
    glycemicIndex: "Low-Medium",
    verdict: "Thick spiced curd and yam curry with ground pepper and coconut.",
    tips: "Good probiotics from cooked curd."
  },
  "chemmeen roast": {
    name: "Chemmeen Roast (Kerala Prawn Roast)",
    category: "Proteins",
    servingUnit: "1 bowl (120g)",
    calories: 185,
    protein: 23.0,
    carbs: 4.5,
    fat: 8.2,
    fiber: 1.2,
    glycemicIndex: "Low",
    verdict: "Prawns roasted with shallots, kudampuli, garlic, and curry leaves.",
    tips: "Superb lean seafood protein with zinc and selenium."
  },
  "kappa biryani": {
    name: "Kappa Biryani / Erachi Kappa (Tapioca & Beef)",
    category: "Grains & Breads",
    servingUnit: "1 plate (250g)",
    calories: 395,
    protein: 24.0,
    carbs: 46.0,
    fat: 14.0,
    fiber: 3.8,
    glycemicIndex: "Medium-High",
    verdict: "Mashed boiled tapioca tossed with spiced beef roast and roasted coconut.",
    tips: "High energy active meal."
  }
};

// Merge 145 verified Kerala & Indian dishes from official nutrition guide
Object.assign(CLINIC_FOOD_LOOKUP, KERALA_SERVER_LOOKUP);


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Multi-device central storage setup
  const DB_FILE = path.join(process.cwd(), "clinic_database.json");
  let clinicData: any = null;
  let dbUpdatedAt = Date.now();

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      clinicData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not load clinic_database.json, starting fresh", err);
  }

  const saveDbToDisk = () => {
    try {
      if (clinicData) {
        fs.writeFileSync(DB_FILE, JSON.stringify(clinicData, null, 2), "utf-8");
      }
    } catch (err) {
      console.error("Failed to write to clinic_database.json", err);
    }
  };

  app.use(express.json({ limit: "15mb" }));

  // Web Push (VAPID) Store & Persistent Phone Notification Scheduler
  const PUSH_FILE = path.join(process.cwd(), "push_store.json");
  interface StoredPushEntry {
    endpoint: string;
    clientId: string;
    subscription: any;
    timezoneOffsetMinutes: number;
    reminders: Array<{ id: string; title: string; message: string; hour: number; minute: number; enabled: boolean }>;
    firedMap: Record<string, number>;
    updatedAt: number;
  }
  interface PushStoreData {
    vapidKeys: { publicKey: string; privateKey: string };
    subscriptions: StoredPushEntry[];
  }

  let pushStore: PushStoreData = {
    vapidKeys: webpush.generateVAPIDKeys(),
    subscriptions: [],
  };
  try {
    if (fs.existsSync(PUSH_FILE)) {
      const loaded = JSON.parse(fs.readFileSync(PUSH_FILE, "utf-8"));
      if (loaded?.vapidKeys?.publicKey && loaded?.vapidKeys?.privateKey) {
        pushStore = {
          vapidKeys: loaded.vapidKeys,
          subscriptions: Array.isArray(loaded.subscriptions) ? loaded.subscriptions : [],
        };
      }
    } else {
      fs.writeFileSync(PUSH_FILE, JSON.stringify(pushStore, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not initialize push_store.json:", err);
  }

  const savePushStoreToDisk = () => {
    try {
      fs.writeFileSync(PUSH_FILE, JSON.stringify(pushStore, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not save push_store.json:", err);
    }
  };

  webpush.setVapidDetails(
    "mailto:care@saleemvalanchery.com",
    pushStore.vapidKeys.publicKey,
    pushStore.vapidKeys.privateKey
  );

  const sendWebPushToEntry = async (
    entry: StoredPushEntry,
    payload: { title: string; body: string; tag?: string; url?: string }
  ): Promise<boolean> => {
    try {
      await webpush.sendNotification(entry.subscription, JSON.stringify(payload));
      return true;
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        pushStore.subscriptions = pushStore.subscriptions.filter((s) => s.endpoint !== entry.endpoint);
        savePushStoreToDisk();
      }
      return false;
    }
  };

  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: pushStore.vapidKeys.publicKey });
  });

  app.post("/api/push/subscribe", (req, res) => {
    try {
      const { clientId, subscription, timezoneOffsetMinutes, reminders } = req.body || {};
      if (!subscription?.endpoint) {
        return res.status(400).json({ error: "Valid push subscription is required" });
      }
      const existing = pushStore.subscriptions.find((s) => s.endpoint === subscription.endpoint);
      if (existing) {
        existing.clientId = clientId || existing.clientId || "cl-1";
        existing.subscription = subscription;
        if (typeof timezoneOffsetMinutes === "number") {
          existing.timezoneOffsetMinutes = timezoneOffsetMinutes;
        }
        if (Array.isArray(reminders)) {
          existing.reminders = reminders;
        }
        existing.updatedAt = Date.now();
      } else {
        pushStore.subscriptions.push({
          endpoint: subscription.endpoint,
          clientId: clientId || "cl-1",
          subscription,
          timezoneOffsetMinutes: typeof timezoneOffsetMinutes === "number" ? timezoneOffsetMinutes : -330,
          reminders: Array.isArray(reminders) ? reminders : [],
          firedMap: {},
          updatedAt: Date.now(),
        });
      }
      savePushStoreToDisk();
      res.json({ success: true, subscribedCount: pushStore.subscriptions.length });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Subscription error" });
    }
  });

  app.post("/api/push/sync-reminders", (req, res) => {
    try {
      const { clientId, endpoint, timezoneOffsetMinutes, reminders } = req.body || {};
      let updated = 0;
      for (const entry of pushStore.subscriptions) {
        if ((endpoint && entry.endpoint === endpoint) || (clientId && entry.clientId === clientId)) {
          if (Array.isArray(reminders)) entry.reminders = reminders;
          if (typeof timezoneOffsetMinutes === "number") entry.timezoneOffsetMinutes = timezoneOffsetMinutes;
          entry.updatedAt = Date.now();
          updated++;
        }
      }
      if (updated > 0) savePushStoreToDisk();
      res.json({ success: true, updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Sync error" });
    }
  });

  app.post("/api/push/test", async (req, res) => {
    try {
      const { clientId, endpoint, title, body } = req.body || {};
      const targets = pushStore.subscriptions.filter(
        (s) => (endpoint && s.endpoint === endpoint) || (clientId && s.clientId === clientId)
      );
      if (targets.length === 0) {
        return res.json({ success: false, sent: 0, message: "No subscribed device yet" });
      }
      const results = await Promise.all(
        targets.map((entry) =>
          sendWebPushToEntry(entry, {
            title: title || "NutriTrack Pro · Phone Alert Active",
            body: body || "You will receive meal reminders at 8:00 AM, 1:00 PM, 7:30 PM & coach notes directly on your phone.",
            tag: `nutritrack-push-test-${Date.now()}`,
            url: "/",
          })
        )
      );
      const sent = results.filter(Boolean).length;
      res.json({ success: sent > 0, sent });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Test push error" });
    }
  });

  app.post("/api/push/send-coach-alert", async (req, res) => {
    try {
      const { clientId, title, body, tag } = req.body || {};
      const targets = pushStore.subscriptions.filter(
        (s) => clientId === "all" || s.clientId === clientId
      );
      if (targets.length === 0) {
        return res.json({ success: true, sent: 0 });
      }
      const results = await Promise.all(
        targets.map((entry) =>
          sendWebPushToEntry(entry, {
            title: title || "Coach Reminder · NutriTrack Pro",
            body: body || "You have a new nutrition reminder from your coach.",
            tag: tag || `coach-alert-${Date.now()}`,
            url: "/",
          })
        )
      );
      res.json({ success: true, sent: results.filter(Boolean).length });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Coach push error" });
    }
  });

  // Background Phone Notification Scheduler (fires scheduled meal alerts via Web Push even when browser tab is closed)
  const checkScheduledWebPushes = async () => {
    if (!pushStore.subscriptions.length) return;
    const nowUtcMs = Date.now();
    let changed = false;

    for (const entry of pushStore.subscriptions) {
      if (!Array.isArray(entry.reminders) || entry.reminders.length === 0) continue;
      const offsetMins = typeof entry.timezoneOffsetMinutes === "number" ? entry.timezoneOffsetMinutes : -330;
      const localDate = new Date(nowUtcMs - offsetMins * 60000);
      const y = localDate.getUTCFullYear();
      const m = String(localDate.getUTCMonth() + 1).padStart(2, "0");
      const d = String(localDate.getUTCDate()).padStart(2, "0");
      const todayKey = `${y}-${m}-${d}`;
      const localMinutes = localDate.getUTCHours() * 60 + localDate.getUTCMinutes();

      for (const rem of entry.reminders) {
        if (!rem?.enabled || typeof rem.hour !== "number" || typeof rem.minute !== "number") continue;
        const fireKey = `${rem.id}:${todayKey}`;
        if (entry.firedMap[fireKey]) continue;

        const targetMinutes = rem.hour * 60 + rem.minute;
        if (localMinutes >= targetMinutes && localMinutes <= targetMinutes + 15) {
          entry.firedMap[fireKey] = nowUtcMs;
          changed = true;
          await sendWebPushToEntry(entry, {
            title: rem.title || "NutriTrack Pro Meal Reminder",
            body: rem.message || "Time for your scheduled nutrition check-in.",
            tag: `nutritrack-sched-${rem.id}-${todayKey}`,
            url: "/",
          });
        }
      }
    }

    if (changed) savePushStoreToDisk();
  };

  setInterval(() => {
    checkScheduledWebPushes().catch(() => {});
  }, 30000);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "NutriTrack AI Clinic Assistant", aiEnabled: Boolean(getAI()) });
  });

  // Global Clinic Sync Endpoints for Multi-Device Access (Clients & Dietitians across any mobile or desktop)
  app.get("/api/sync", (req, res) => {
    res.json({
      data: clinicData,
      updatedAt: dbUpdatedAt
    });
  });

  app.post("/api/sync", (req, res) => {
    try {
      const { data, timestamp } = req.body;
      if (data) {
        clinicData = {
          ...(clinicData || {}),
          ...data
        };
        dbUpdatedAt = timestamp || Date.now();
        saveDbToDisk();
      }
      res.json({ success: true, updatedAt: dbUpdatedAt });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update database" });
    }
  });

  app.post("/api/sync/reset", (req, res) => {
    try {
      clinicData = null;
      dbUpdatedAt = Date.now();
      if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
      }
      res.json({ success: true, message: "Database reset to clinic default" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Chat & Universal Bilingual Assistant Endpoint (Powered by Gemini 4 Hydrogen)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, imageBase64, mimeType, clientContext, conversationHistory, preferredLanguage } = req.body;

      if ((!message || typeof message !== "string") && !imageBase64) {
        return res.status(400).json({ error: "Message or image is required" });
      }

      const trimmedMsg = (message || "").trim();
      const lowerMsg = trimmedMsg.toLowerCase();
      const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(trimmedMsg);
      const hasManglish = /\b(engane|enthu|ethra|kazhikkam|und|parayumo|kurakkan|kootan|njan|nammude|choodu|vellam|entha|enthokke|evide|eppo|mathi|ariyaamo|tharu)\b/i.test(trimmedMsg);
      const isMalayalamInput = hasMalayalamScript || hasManglish;

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Live Gemini AI is not configured on the server. Please add a valid GEMINI_API_KEY in Settings > Secrets.",
          code: "AI_NOT_CONFIGURED"
        });
      }

      // Check if message mentions a food in our verified clinic catalog so AI can reference exact clinic numbers
      let matchedCatalogHint = "";
      for (const key of Object.keys(CLINIC_FOOD_LOOKUP)) {
        if (key.length >= 3 && lowerMsg.includes(key)) {
          const item = CLINIC_FOOD_LOOKUP[key];
          matchedCatalogHint = `\nVerified Clinic Reference for "${item.name}": serving=${item.servingUnit}, calories=${item.calories} kcal, protein=${item.protein}g, carbs=${item.carbs}g, fat=${item.fat}g, fiber=${item.fiber || 0}g, GI=${item.glycemicIndex || "Medium"}.`;
          break;
        }
      }

      const langMode: 'en' | 'ml' | 'both' | 'auto' =
        preferredLanguage === 'both' || preferredLanguage === 'ml' || preferredLanguage === 'en'
          ? preferredLanguage
          : 'auto';

      const effectiveLanguageRule =
        langMode === 'both'
          ? `BILINGUAL MODE (MANDATORY): Write EVERY response in BOTH natural **English** AND fluent **Malayalam (മലയാളം script)** with clear labelled sections (**English:** and **മലയാളം:**), regardless of what language the user wrote in.`
          : langMode === 'ml'
            ? `MALAYALAM MODE (MANDATORY): Respond completely in fluent, natural **Malayalam (മലയാളം script)** (keeping JSON property keys in English). Only include brief English food/scientific terms in parentheses where genuinely helpful.`
            : langMode === 'en'
              ? `ENGLISH MODE: Respond clearly in natural English (unless the user explicitly asks you to translate or reply in Malayalam).`
              : `AUTO LANGUAGE DETECTION:
  - If the user writes in Malayalam script OR Manglish OR clientContext.language is "ml", reply in natural, fluent **Malayalam (മലയാളം script)**.
  - If the user asks for both languages, reply in BOTH **English** and **Malayalam (മലയാളം)**.
  - Otherwise reply in clear **English**.`;

      const systemInstruction = `You are "NutriAI", a full-capability, highly intelligent, warm AI Assistant built into the NutriTrack Wellness platform (Saleem Valanchery Wellness Centre).

WHO YOU ARE & WHAT YOU CAN ANSWER:
- You are a **true general-purpose AI assistant** as well as a clinical nutrition & fitness specialist.
- Answer **ANY** question the user asks on **ANY topic**—general knowledge, science, math, technology, coding, writing, translation, daily life questions, cooking & recipes, fitness, workouts, sleep, medical/metabolic concepts, Kerala nutrition, and personalized diet progress! Never refuse or deflect non-food questions, and never paste generic canned scripts.
- Read the user's ACTUAL question and full conversation history carefully and answer directly, thoughtfully, and accurately.

${effectiveLanguageRule}

FOOD, RECIPE, PHOTO & MEAL LOGGING STRUCTURED EXTRACTION:
Distinguish accurately between:
(A) **Food / Meal / Photo / Recipe / Eaten-Food Report**:
   - Trigger ONLY when the user asks about a specific food's calories/nutrition, uploads a meal photo, lists recipe ingredients, or reports eating/drinking a meal (e.g. "I ate 2 eggs at 8:30 am", "രാവിലെ 2 പുട്ടും കടലയും കഴിച്ചു").
   - Set "isFoodInquiry": true (and set "isMealLogReport": true when reporting an eaten meal or multi-item recipe/photo).
   - Populate "food" (for single item inquiries) and/or "mealLogData" / "foodsList" (for eaten meals, recipes, or multi-item photos) with accurate numbers: calories, protein (g), carbs (g), fat (g), fiber (g), calcium (mg), iron (mg), magnesium (mg), vitaminD (IU).
   - In "answer", state the food's **Calories FIRST** in bold ("🔥 **Calories:** **X kcal**..." or Malayalam equivalent), summarize macros/micronutrients, and mention the 3 cooking oil options (+0 steamed, +45 medium sauté, +120 deep fried) when relevant.
(B) **General Question (Nutrition advice, personal progress check, general knowledge, science, math, coding, translation, coaching, chat)**:
   - Set "isFoodInquiry": false, "isMealLogReport": false, "food": null, "foodsList": null, "mealLogData": null.
   - Give a complete, clear, genuinely helpful answer to whatever they asked in "answer", personalized using Active Client Profile if the question relates to their health/diet/steps/sleep/nutrients.

Active Client Profile & Today's Live Progress:
${clientContext ? JSON.stringify(clientContext) : 'Anonymous / General Visitor'}${matchedCatalogHint}

Return a valid JSON object matching this exact schema:
{
  "isFoodInquiry": boolean,
  "isMealLogReport": boolean,
  "mealLogData": {
    "timeGiven": string,
    "detectedMealType": "Breakfast" | "Morning Snack" | "Lunch" | "Evening Snack" | "Dinner",
    "foods": [
      {
        "name": string,
        "servingUnit": string,
        "quantity": number,
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "calcium": number,
        "iron": number,
        "magnesium": number,
        "vitaminD": number,
        "category": string
      }
    ],
    "totalCalories": number,
    "totalProtein": number,
    "totalCarbs": number,
    "totalFat": number
  } | null,
  "food": {
    "name": string,
    "category": string,
    "servingUnit": string,
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "calcium": number,
    "iron": number,
    "magnesium": number,
    "vitaminD": number,
    "glycemicIndex": string,
    "verdict": string,
    "recommendation": string
  } | null,
  "foodsList": [
    {
      "name": string,
      "servingUnit": string,
      "quantity": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "calcium": number,
      "iron": number,
      "magnesium": number,
      "vitaminD": number,
      "category": string
    }
  ] | null,
  "answer": string
}`;

      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-4-hydrogen'];

      const historyTurns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(conversationHistory)) {
        for (const item of conversationHistory.slice(-12)) {
          if (!item || typeof item.text !== 'string' || !item.text.trim()) continue;
          const role: 'user' | 'model' =
            item.role === 'model' || item.role === 'assistant' || item.role === 'bot' ? 'model' : 'user';
          historyTurns.push({
            role,
            parts: [{ text: item.text.slice(0, 2000) }]
          });
        }
      }

      const currentUserParts: any[] = [
        {
          text:
            trimmedMsg ||
            "Analyze this meal photo: state each food item's calories first in bold, macronutrients, fiber, micronutrients (Calcium, Iron, Magnesium, Vitamin D), and oil options."
        }
      ];

      if (imageBase64) {
        currentUserParts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        });
      }

      const contentsPayload = [
        ...historyTurns,
        { role: 'user', parts: currentUserParts }
      ];

      let lastErr: any = null;
      for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const geminiResponse = await ai.models.generateContent({
              model: modelName,
              contents: contentsPayload,
              config: {
                systemInstruction,
                responseMimeType: 'application/json',
                abortSignal: AbortSignal.timeout(20000),
              }
            });

            const rawText = (geminiResponse.text || "").trim();
            const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            try {
              const parsed = JSON.parse(cleanedJson || "{}");
              if (parsed && typeof parsed.answer === 'string' && parsed.answer.trim().length > 0) {
                parsed.source = 'gemini';
                parsed.model = modelName;
                parsed.detectedLanguage = isMalayalamInput ? 'ml' : (langMode === 'both' ? 'both' : 'en');
                if ((parsed.isFoodInquiry || parsed.food) && !parsed.oilImpact) {
                  parsed.oilImpact = {
                    question: "Was it oily?",
                    options: [
                      { id: "none", label: "No Oil / Steamed", calorieAdjustment: 0, fatAdjustment: 0, description: "Base calories" },
                      { id: "medium", label: "Medium / Home Sauté", calorieAdjustment: 45, fatAdjustment: 5, description: "+45 kcal (+5g fat)" },
                      { id: "fried", label: "Deep Fried / Very Oily", calorieAdjustment: 120, fatAdjustment: 13, description: "+120 kcal (+13g fat)" }
                    ]
                  };
                }
                return res.json(parsed);
              }
            } catch {
              if (rawText) {
                return res.json({
                  source: 'gemini',
                  model: modelName,
                  isFoodInquiry: false,
                  isMealLogReport: false,
                  food: null,
                  answer: rawText
                });
              }
            }
          } catch (geminiError: any) {
            lastErr = geminiError;
            const statusCode = Number(geminiError?.status || geminiError?.code) || 0;
            const isTimeout = geminiError?.name === 'AbortError' || geminiError?.name === 'TimeoutError';
            console.warn(`Gemini model ${modelName} attempt ${attempt + 1} error:`, geminiError?.message || geminiError);
            // Retry briefly only on non-timeout transient 429/500/503 errors
            if (attempt === 0 && !isTimeout && (statusCode === 429 || statusCode >= 500 || statusCode === 0)) {
              await new Promise(r => setTimeout(r, 450));
              continue;
            }
            break;
          }
        }
      }

      const upstreamStatus = Number(lastErr?.status) || 502;
      const errMessage = lastErr?.message || "Upstream AI service failed to respond";
      return res.status(upstreamStatus >= 400 && upstreamStatus < 600 ? upstreamStatus : 502).json({
        error: errMessage,
        code: upstreamStatus === 403 ? "PERMISSION_DENIED" : upstreamStatus === 429 ? "RESOURCE_EXHAUSTED" : "AI_UPSTREAM_ERROR"
      });
    } catch (err: any) {
      console.error("Chatbot endpoint error:", err);
      return res.status(500).json({
        error: err?.message || "Unexpected error in NutriAI chat service"
      });
    }
  });

  // AI Voice Transcription Endpoint (Multimodal Audio)
  app.post("/api/ai/transcribe", async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: "audioBase64 is required" });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "AI voice transcription requires an active internet connection and Gemini API."
        });
      }

      const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      const cleanMime = mimeType || 'audio/webm';

      for (const modelName of ['gemini-3.1-flash-lite', 'gemini-4-hydrogen']) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMime,
                      data: cleanBase64
                    }
                  },
                  {
                    text: "Transcribe this audio note accurately. The speaker may speak in Malayalam (in Malayalam script) or English about ANY question, science, daily life, nutrition, or meal logging. Return ONLY the transcribed text."
                  }
                ]
              }
            ],
            config: {
              abortSignal: AbortSignal.timeout(20000),
            }
          });
          const transcript = response.text?.trim() || "";
          if (transcript) {
            return res.json({ transcript });
          }
        } catch (err) {
          console.warn(`Audio transcription model ${modelName} error:`, err);
        }
      }

      return res.json({ transcript: "" });
    } catch (err: any) {
      console.error("Voice transcription failed:", err?.message || err);
      return res.status(500).json({ error: err?.message || "Failed to transcribe audio" });
    }
  });

  // Dedicated NutriBot Food Resolution & Extension Endpoint
  app.all(["/api/ai/estimate-food"], async (req, res) => {
    try {
      const foodName = (req.body?.name || req.query?.name || "").toString().trim();
      if (!foodName) {
        return res.status(400).json({ error: "Food name is required" });
      }

      const lowerName = foodName.toLowerCase();
      let matched = CLINIC_FOOD_LOOKUP[lowerName];
      if (!matched) {
        for (const [k, v] of Object.entries(CLINIC_FOOD_LOOKUP)) {
          if (lowerName.includes(k) || k.includes(lowerName)) {
            matched = v;
            break;
          }
        }
      }

      if (matched) {
        return res.json({
          food: {
            name: matched.name,
            category: matched.category,
            servingUnit: matched.servingUnit,
            calories: matched.calories,
            protein: matched.protein,
            carbs: matched.carbs,
            fat: matched.fat,
            fiber: matched.fiber || 1.5,
            glycemicIndex: matched.glycemicIndex || "Medium",
            verdict: matched.verdict,
            recommendation: matched.tips
          }
        });
      }

      const ai = getAI();
      if (ai) {
        for (const modelName of ['gemini-3.1-flash-lite', 'gemini-4-hydrogen']) {
          try {
            const estRes = await ai.models.generateContent({
              model: modelName,
              contents: [{
                role: 'user',
                parts: [{
                  text: `Estimate accurate nutrition per standard single serving for food "${foodName}". Return ONLY JSON matching: { "name": string, "category": "Proteins"|"Grains & Breads"|"Vegetables"|"Fruits"|"Dairy & Alternatives"|"Nuts & Healthy Fats"|"Beverages & Snacks", "servingUnit": string, "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "calcium": number, "iron": number, "magnesium": number, "vitaminD": number, "glycemicIndex": string, "verdict": string, "recommendation": string }`
                }]
              }],
              config: {
                responseMimeType: 'application/json',
                abortSignal: AbortSignal.timeout(15000),
              }
            });
            const cleaned = (estRes.text || "").replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            const parsed = JSON.parse(cleaned || "{}");
            if (parsed && parsed.name && parsed.calories !== undefined) {
              return res.json({ food: parsed });
            }
          } catch {
            continue;
          }
        }
      }

      // Dynamic fallback estimation
      let cat = "Beverages & Snacks";
      let serving = "1 serving (100g)";
      let baseCal = 175;
      let p = 5.0;
      let c = 22.0;
      let f = 6.0;
      let fib = 2.0;

      if (lowerName.includes('chicken') || lowerName.includes('fish') || lowerName.includes('egg') || lowerName.includes('meat') || lowerName.includes('beef')) {
        cat = "Proteins";
        serving = "100g cooked";
        baseCal = 195;
        p = 26.0;
        c = 1.0;
        f = 9.0;
        fib = 0;
      } else if (lowerName.includes('rice') || lowerName.includes('bread') || lowerName.includes('roti') || lowerName.includes('oats') || lowerName.includes('pasta')) {
        cat = "Grains & Breads";
        serving = "1 serving (120g)";
        baseCal = 210;
        p = 5.0;
        c = 42.0;
        f = 2.5;
        fib = 2.5;
      } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('fruit') || lowerName.includes('mango') || lowerName.includes('orange')) {
        cat = "Fruits";
        serving = "1 medium fruit (140g)";
        baseCal = 80;
        p = 0.8;
        c = 20.0;
        f = 0.3;
        fib = 3.0;
      } else if (lowerName.includes('salad') || lowerName.includes('vegetable')) {
        cat = "Vegetables";
        serving = "1 bowl (150g)";
        baseCal = 65;
        p = 2.5;
        c = 9.0;
        f = 1.0;
        fib = 4.0;
      } else if (lowerName.includes('shake') || lowerName.includes('whey')) {
        cat = "Proteins";
        serving = "1 scoop (300ml)";
        baseCal = 135;
        p = 24.0;
        c = 3.5;
        f = 1.5;
        fib = 0.5;
      }

      return res.json({
        food: {
          name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
          category: cat,
          servingUnit: serving,
          calories: baseCal,
          protein: p,
          carbs: c,
          fat: f,
          fiber: fib,
          glycemicIndex: "Medium",
          verdict: `NutriBot calibrated nutrition for ${foodName}`,
          recommendation: "Check oil preparation to adjust calories live."
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Meal Plate & Photo Analyzer
  app.post("/api/ai/analyze-meal", async (req, res) => {
    try {
      const { imageBase64, mimeType, description } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const prompt = `You are NutriBot, expert clinical dietitian at Saleem Valanchery Wellness Clinic.
Analyze this meal plate (from photo or description: "${description || 'Food image'}").
Identify all individual food items present, estimate realistic portions in grams or standard clinic units, calculate accurate macronutrients, micronutrients (calcium mg, iron mg, magnesium mg, vitaminD IU), and calories, and determine if it appears steamed/boiled, lightly sauteed, or deep-fried.

Return a JSON object with this exact schema:
{
  "plateSummary": "Short 1-line title of the plate",
  "detectedMealType": "Breakfast" | "Morning Snack" | "Lunch" | "Evening Snack" | "Dinner",
  "cookingMethod": "Steamed / No Oil" | "Medium Sauté" | "Deep Fried",
  "oilCalories": 0 | 45 | 120,
  "foods": [
    {
      "name": string,
      "servingUnit": string,
      "quantity": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "calcium": number,
      "iron": number,
      "magnesium": number,
      "vitaminD": number,
      "category": string
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "dietitianVerdict": string,
  "glycemicImpact": "Low" | "Medium" | "High"
}`;

      const promptParts: any[] = [{ text: prompt }];
      if (imageBase64) {
        promptParts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        });
      }

      for (const modelName of ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']) {
        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: promptParts }],
            config: {
              responseMimeType: 'application/json'
            }
          });
          const cleaned = (result.text || "{}").replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleaned || "{}");
          if (parsed && (parsed.plateSummary || parsed.foods)) {
            return res.json(parsed);
          }
        } catch (modelErr) {
          console.warn(`Meal analyzer model ${modelName} error:`, modelErr);
        }
      }

      return res.status(500).json({ error: "Meal analysis failed" });
    } catch (err: any) {
      console.error("Meal analyzer error:", err);
      return res.status(500).json({ error: err.message || "Meal analysis failed" });
    }
  });

  // AI Diet Plan Generator for Dietitians
  app.post("/api/ai/generate-diet-plan", async (req, res) => {
    try {
      const { targetCalories, targetProtein, targetCarbs, targetFat, clientGoal, dietaryPreference, medicalConditions } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const prompt = `You are Senior Clinical Dietitians Coach Saleem Valanchery and Faseela Saleem at the Saleem Valanchery Wellness Centre.
Generate a comprehensive, scientifically calibrated 1-day clinical meal plan.
Client Profile:
- Target Calories: ${targetCalories || 1600} kcal
- Target Protein: ${targetProtein || 90}g
- Target Carbs: ${targetCarbs || 150}g
- Target Fat: ${targetFat || 45}g
- Client Goal: ${clientGoal || 'Visceral Fat Reduction & Metabolic Reversal'}
- Preference: ${dietaryPreference || 'Kerala Traditional Wholesome (Matta rice, fish curry, thoran, puttu, kadala, eggs, etc.)'}
- Medical Considerations: ${medicalConditions ? (Array.isArray(medicalConditions) ? medicalConditions.join(', ') : medicalConditions) : 'None / General Wellness'}

Return a JSON object with this EXACT schema:
{
  "title": string,
  "description": string,
  "targetCalories": number,
  "targetProtein": number,
  "targetCarbs": number,
  "targetFat": number,
  "waterTargetLitres": number,
  "generalGuidelines": string[],
  "meals": [
    {
      "mealType": "Breakfast" | "Morning Snack" | "Lunch" | "Evening Snack" | "Dinner",
      "timeGuideline": string,
      "instructions": string,
      "recommendedFoods": [
        {
          "foodName": string,
          "portion": number,
          "unit": string,
          "notes": string
        }
      ]
    }
  ]
}`;

      for (const modelName of ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']) {
        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json'
            }
          });
          const cleaned = (result.text || "{}").replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleaned || "{}");
          if (parsed && parsed.title) {
            return res.json(parsed);
          }
        } catch (modelErr) {
          console.warn(`Diet plan model ${modelName} error:`, modelErr);
        }
      }

      return res.status(500).json({ error: "Failed to generate diet plan" });
    } catch (err: any) {
      console.error("Generate diet plan error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate diet plan" });
    }
  });

  // AI Coach Tip & Reminder Generator
  app.post("/api/ai/generate-tip", async (req, res) => {
    try {
      const { type, clientName, goal, topic } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const prompt = `You are Coach Saleem Valanchery and Faseela Saleem at the Saleem Valanchery Wellness Centre.
Generate a personalized, warm, highly practical ${type || 'tip'} to deliver to a client's mobile app.
- Client Name: ${clientName || 'Valued Member'}
- Goal: ${goal || 'Fat Loss & Vitality'}
- Topic Focus: ${topic || 'Metabolic health, hydration, mindful eating, or evening routine'}
- Type: ${type || 'tip'} (either "tip", "note", or "reminder")

Return a JSON object with:
{
  "title": string (engaging, short, max 60 chars),
  "message": string (2-3 sentences, direct, motivating, clinically actionable)
}`;

      for (const modelName of ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']) {
        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json'
            }
          });
          const cleaned = (result.text || "{}").replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleaned || "{}");
          if (parsed && parsed.message) {
            return res.json(parsed);
          }
        } catch (modelErr) {
          console.warn(`Generate tip model ${modelName} error:`, modelErr);
        }
      }

      return res.status(500).json({ error: "Failed to generate tip" });
    } catch (err: any) {
      console.error("Generate tip error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate tip" });
    }
  });

  // AI Face Portrait Analyzer for Human-Like Full Body Avatar (Powered by Gemini 4 Hydrogen)
  app.post("/api/ai/analyze-face-avatar", async (req, res) => {
    try {
      const { imageUrl, clientName, gender } = req.body || {};
      if (!imageUrl || typeof imageUrl !== "string") {
        return res.status(400).json({ error: "imageUrl is required to analyze face" });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Live Gemini AI is not configured on the server.",
          code: "AI_NOT_CONFIGURED",
        });
      }

      let mimeType = "image/jpeg";
      let base64Data = "";

      const dataUrlMatch = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        base64Data = dataUrlMatch[2];
      } else if (/^https?:\/\//i.test(imageUrl)) {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
        if (!imgRes.ok) {
          return res.status(400).json({ error: `Could not fetch client photo (${imgRes.status})` });
        }
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        mimeType = contentType.split(";")[0].trim();
        const arrayBuf = await imgRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuf).toString("base64");
      } else {
        return res.status(400).json({ error: "Unsupported imageUrl format" });
      }

      if (!base64Data) {
        return res.status(400).json({ error: "Empty image payload" });
      }

      const prompt = `Analyze the person's face and appearance in this portrait photo (${clientName || "client"}, profile gender: ${gender || "unknown"}) so our vector artist can draw a warm, human-like illustrated portrait avatar (NOT pasting the photo).
Return exact hex colors matched to their real complexion, hair color, eye color, and lip color, plus structured facial characteristics.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          skinToneHex: { type: Type.STRING, description: "Primary natural skin tone hex color e.g. #c68b59" },
          skinShadowHex: { type: Type.STRING, description: "Slightly darker warm skin shadow hex color" },
          skinHighlightHex: { type: Type.STRING, description: "Slightly lighter warm skin highlight hex color" },
          hairColorHex: { type: Type.STRING, description: "Natural hair color hex e.g. #1f1b18" },
          hairStyle: {
            type: Type.STRING,
            description: "One of: short_curly, short_straight, side_part, spiky, long_wavy, ponytail, bob, headwrap, bald",
          },
          faceShape: {
            type: Type.STRING,
            description: "One of: oval, round, square, heart",
          },
          eyeColorHex: { type: Type.STRING, description: "Iris hex color e.g. #3b271c" },
          eyebrowThickness: { type: Type.STRING, description: "One of: thin, medium, thick" },
          eyebrowStyle: { type: Type.STRING, description: "One of: arched, straight" },
          facialHair: {
            type: Type.STRING,
            description: "One of: none, light_stubble, mustache, trimmed_beard, full_beard",
          },
          glasses: { type: Type.STRING, description: "One of: none, round, rectangular" },
          lipToneHex: { type: Type.STRING, description: "Natural lip hex color e.g. #b56560" },
          expression: { type: Type.STRING, description: "One of: warm_smile, calm, confident" },
          genderPresentation: { type: Type.STRING, description: "One of: male, female, neutral" },
          portraitSummary: {
            type: Type.STRING,
            description: "Short 8-12 word description of the person's face & hair traits",
          },
        },
        required: [
          "skinToneHex",
          "skinShadowHex",
          "skinHighlightHex",
          "hairColorHex",
          "hairStyle",
          "faceShape",
          "eyeColorHex",
          "eyebrowThickness",
          "eyebrowStyle",
          "facialHair",
          "glasses",
          "lipToneHex",
          "expression",
          "genderPresentation",
          "portraitSummary",
        ],
      };

      const result = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema,
          abortSignal: AbortSignal.timeout(15000),
        },
      });

      const cleaned = (result.text || "{}").replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const traits = JSON.parse(cleaned);
      return res.json({ traits, source: "gemini", model: "gemini-4-hydrogen" });
    } catch (err: any) {
      console.error("Face avatar analysis error:", err);
      const status = Number(err?.status || err?.code) || 500;
      return res.status(status >= 400 && status < 600 ? status : 500).json({
        error: err?.message || "Failed to analyze client face photo",
      });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NutriTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
