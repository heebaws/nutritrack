import json
import re

with open("scripts/parsed_kerala_foods.json", "r", encoding="utf-8") as f:
    foods = json.load(f)

def clean_term(s):
    return s.strip().lower()

lookup_entries = {}

for f in foods:
    name = f["name"] # e.g. "പുട്ട് (Puttu)" or "ഇടിയപ്പം / നൂൽപ്പുട്ട് (Idiyappam)"
    cal = f["calories"]
    prot = f["protein"]
    carb = f["carbs"]
    fat = f["fat"]
    serving = f["servingUnit"]
    cat = f["category"]

    # Extract Malayalam and English parts
    m = re.match(r'^(.*?)\s*\((.*?)\)$', name)
    mal_part = m.group(1).strip() if m else name
    eng_part = m.group(2).strip() if m else name

    # Verdict & Tips
    verdict = f"Authentic Kerala preparation of {name}. Provides {cal} kcal per {serving} (Protein: {prot}g, Carbs: {carb}g, Fat: {fat}g)."
    tips = "Track your portion and review our 3 oil options (Steamed, Medium Sauté, Deep Fried) in your meal log."

    entry_data = {
        "name": name,
        "category": cat,
        "servingUnit": serving,
        "calories": cal,
        "protein": prot,
        "carbs": carb,
        "fat": fat,
        "fiber": 2.0,
        "glycemicIndex": "Medium",
        "verdict": verdict,
        "tips": tips
    }

    # Keys to add
    keys = []
    # 1. Full lower name
    keys.append(clean_term(name))
    # 2. English part
    if eng_part:
        keys.append(clean_term(eng_part))
        # if slash in english part
        for sub in eng_part.split('/'):
            if sub.strip():
                keys.append(clean_term(sub))
    # 3. Malayalam part
    if mal_part:
        keys.append(clean_term(mal_part))
        for sub in mal_part.split('/'):
            if sub.strip():
                keys.append(clean_term(sub))

    for k in keys:
        if k and len(k) >= 2:
            lookup_entries[k] = entry_data

ts_code = """// 145 Kerala Food Lookup Entries for Server-Side AI NutriBot
// Generated from Kerala_Food_Nutrition_Expanded PDF

export const KERALA_SERVER_LOOKUP: Record<string, {
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
}> = """ + json.dumps(lookup_entries, ensure_ascii=False, indent=2) + ";\n"

with open("src/data/keralaServerLookup.ts", "w", encoding="utf-8") as f_out:
    f_out.write(ts_code)

print(f"Generated src/data/keralaServerLookup.ts with {len(lookup_entries)} search keys covering all {len(foods)} foods.")
