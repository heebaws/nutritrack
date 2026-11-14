import imgPuttuAppam from '../assets/images/food_kerala_puttu_appam_1794658306817.jpg';
import imgSnacks from '../assets/images/food_kerala_snacks_1794658308623.jpg';
import imgProtein from '../assets/images/food_protein_eggs_chicken_1794658308151.jpg';
import imgRiceMeals from '../assets/images/food_kerala_rice_meals_1794658308501.jpg';
import imgFruitsSalad from '../assets/images/food_fruits_salad_nuts_1794658309123.jpg';
import imgTeaDairy from '../assets/images/food_tea_coffee_dairy_1794658309460.jpg';

export const FOOD_FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="20" fill="#ECFDF5"/>
      <circle cx="60" cy="62" r="34" fill="#FFFFFF" stroke="#10B981" stroke-width="3"/>
      <circle cx="60" cy="62" r="22" fill="#D1FAE5"/>
      <path d="M44 58c4-8 14-12 24-9 6 2 10 7 11 13-11 4-24 4-35-4z" fill="#059669"/>
    </svg>`
  );

export const FOOD_IMAGES = {
  puttuAppam: imgPuttuAppam,
  snacks: imgSnacks,
  protein: imgProtein,
  riceMeals: imgRiceMeals,
  fruitsSalad: imgFruitsSalad,
  teaDairy: imgTeaDairy,
};

/**
 * Resolves a clean local food photograph based on food name and category.
 * Uses only statically bundled local assets (no fragile external URLs).
 */
export function getFoodImageUrl(foodName: string, category?: string): string {
  const n = (foodName || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // 1. Kerala Breakfast & Steamed Rice Cakes
  if (
    /puttu|പുട്ട്|appam|അപ്പം|palappam|പാലപ്പം|idiyappam|ഇടിയപ്പം|noolappam|dosa|ദോശ|idli|ഇഡലി|pathiri|പത്തിരി|upma|ഉപ്പുമാവ്|chapati|ചപ്പാത്തി|roti|parotta|പൊറോട്ട|bread|oats|ഓട്സ്/.test(
      n
    )
  ) {
    return imgPuttuAppam;
  }

  // 2. Snacks, Fritters, Fried, Sweets
  if (
    /pazham|പഴംപൊരി|vada|വട|parippu|samosa|bajji|pakora|chips|upperi|unniyappam|ഉണ്ണിയപ്പം|neyyappam|sukhiyan|ada|അട|kozhukkatta|biscuit|cake|jalebi|gulab|halwa|noodle|shawarma|burger|pizza/.test(
      n
    )
  ) {
    return imgSnacks;
  }

  // 3. Proteins: Eggs, Chicken, Fish, Meat, Paneer, Dal/Kadala
  if (
    /egg|മുട്ട|chicken|ചിക്കൻ|alfaham|fish|മീൻ|ayala|mathi|karimeen|salmon|tuna|beef|mutton|meat|prawn|shrimp|paneer|kadala|കടല|dal|sprout|whey|protein/.test(
      n
    ) ||
    c.includes('protein')
  ) {
    return imgProtein;
  }

  // 4. Rice, Biryani, Curries & Meals
  if (
    /rice|ചോറ്|matta|മട്ട|biryani|ബിരിയാണി|curry|കറി|sambar|സാമ്പാർ|thoran|തോരൻ|avial|അവിയൽ|kanji|കഞ്ഞി|pulao|khichdi/.test(
      n
    ) ||
    c.includes('grain')
  ) {
    return imgRiceMeals;
  }

  // 5. Beverages & Dairy
  if (
    /tea|ചായ|coffee|കാപ്പി|milk|പാൽ|curd|തൈര്|yogurt|buttermilk|സംഭാരം|lassi|shake|smoothie|juice/.test(
      n
    ) ||
    c.includes('dairy') ||
    c.includes('beverage')
  ) {
    return imgTeaDairy;
  }

  // 6. Fruits, Vegetables, Salads, Nuts
  if (
    /fruit|apple|banana|പഴം|mango|മാങ്ങ|papaya|പപ്പായ|orange|watermelon|berry|guava|salad|സാലഡ്|cucumber|വെള്ളരി|carrot|spinach|cheera|almond|walnut|cashew|peanut|nut|seed|avocado|vegetable/.test(
      n
    ) ||
    c.includes('fruit') ||
    c.includes('veg') ||
    c.includes('nut')
  ) {
    return imgFruitsSalad;
  }

  return imgRiceMeals;
}
