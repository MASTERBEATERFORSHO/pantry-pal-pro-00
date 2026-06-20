export type Ingredient = {
  id: string; name: string; variant_name: string; category: string; emoji: string;
  base_shelf_life_days: number; optimal_window_start_day: number; optimal_window_end_day: number;
  storage_tips: string; basic_nutrition_info: { calories?: number; vitamins?: string[] };
  ripeness_applicable: boolean;
};

// Golden windows = peak eating-quality period (best flavor + nutrition) within
// the ingredient's shelf life. Values are in days since purchase, drawn from
// postharvest research and food-science references:
//  - UC Davis Postharvest Center produce facts
//  - Serious Eats / Cook's Illustrated storage testing
//  - USDA Fridge & Freezer Storage guidance
//  - PubMed-indexed postharvest nutrition studies (ascorbate retention, etc.)
export const INGREDIENTS: Ingredient[] = [
  {
    "name": "Apple",
    "variant_name": "Apple",
    "category": "Produce",
    "emoji": "🍎",
    "base_shelf_life_days": 21,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 14,
    "storage_tips": "Refrigerate in the crisper drawer, away from leafy greens. Apples keep best at 0–4°C and hold crispness and flavor for ~2 weeks before starches fade and texture softens.",
    "basic_nutrition_info": {
      "calories": 95,
      "vitamins": [
        "Vitamin C",
        "Fiber"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-1"
  },
  {
    "name": "Avocado",
    "variant_name": "Avocado",
    "category": "Produce",
    "emoji": "🥑",
    "base_shelf_life_days": 6,
    "optimal_window_start_day": 2,
    "optimal_window_end_day": 4,
    "storage_tips": "Ripen on counter; once ripe, refrigerate up to 3 more days. Peak eating quality is the 1–2 day window when flesh gives to gentle pressure but is not stringy or brown.",
    "basic_nutrition_info": {
      "calories": 234,
      "vitamins": [
        "Vitamin K",
        "Folate",
        "Potassium"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-2"
  },
  {
    "name": "Banana",
    "variant_name": "Banana (Green)",
    "category": "Produce",
    "emoji": "🍌",
    "base_shelf_life_days": 9,
    "optimal_window_start_day": 4,
    "optimal_window_end_day": 7,
    "storage_tips": "Ripen at room temperature, then refrigerate to slow further ripening. Peak sweetness and balanced flavor occur at the yellow-with-brown-freckles stage; the skin blackens in the fridge but flesh stays good.",
    "basic_nutrition_info": {
      "calories": 105,
      "vitamins": [
        "Potassium",
        "Vitamin B6",
        "Vitamin C"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-3"
  },
  {
    "name": "Banana",
    "variant_name": "Banana (Ripe)",
    "category": "Produce",
    "emoji": "🍌",
    "base_shelf_life_days": 4,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 2,
    "storage_tips": "Keep at room temperature away from direct sun; refrigerate to extend. Fully ripe (freckled) bananas are at peak sweetness — eat within 1–2 days before flavor flattens and texture turns mushy.",
    "basic_nutrition_info": {
      "calories": 105,
      "vitamins": [
        "Potassium",
        "Vitamin B6"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-4"
  },
  {
    "name": "Bell Pepper",
    "variant_name": "Bell Pepper",
    "category": "Produce",
    "emoji": "🫑",
    "base_shelf_life_days": 12,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 7,
    "storage_tips": "Store unwashed in the crisper; wash just before use. Vitamin C and crunch hold well for about a week before peppers soften and lose sweetness.",
    "basic_nutrition_info": {
      "calories": 31,
      "vitamins": [
        "Vitamin C",
        "Vitamin A"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-5"
  },
  {
    "name": "Berries",
    "variant_name": "Strawberries",
    "category": "Produce",
    "emoji": "🍓",
    "base_shelf_life_days": 5,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 2,
    "storage_tips": "Keep dry and refrigerated; wash only just before eating. Strawberries lose vitamin C and develop mold quickly — eat within 1–2 days of purchase for peak flavor and nutrition.",
    "basic_nutrition_info": {
      "calories": 32,
      "vitamins": [
        "Vitamin C",
        "Manganese"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-6"
  },
  {
    "name": "Berries",
    "variant_name": "Blueberries",
    "category": "Produce",
    "emoji": "🫐",
    "base_shelf_life_days": 10,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 5,
    "storage_tips": "Store unwashed in original container in the fridge. Blueberries hold quality for about a week refrigerated; bloom (the dusty coating) signals freshness and preserves antioxidants.",
    "basic_nutrition_info": {
      "calories": 57,
      "vitamins": [
        "Vitamin C",
        "Vitamin K",
        "Antioxidants"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-7"
  },
  {
    "name": "Bread",
    "variant_name": "Sliced Bread",
    "category": "Bakery",
    "emoji": "🍞",
    "base_shelf_life_days": 6,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 3,
    "storage_tips": "Keep in a bread box at room temp; freeze slices to extend life. Bread stales (retrogrades) fastest at fridge temps — best eaten within 2–3 days, then freeze.",
    "basic_nutrition_info": {
      "calories": 80,
      "vitamins": [
        "Carbs",
        "Iron"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-8"
  },
  {
    "name": "Butter",
    "variant_name": "Salted Butter",
    "category": "Dairy",
    "emoji": "🧈",
    "base_shelf_life_days": 60,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 30,
    "storage_tips": "Refrigerate in original wrapper; can be frozen up to 6 months. Salted butter resists rancidity well but peak flavor is within the first month after opening.",
    "basic_nutrition_info": {
      "calories": 102,
      "vitamins": [
        "Vitamin A",
        "Vitamin D"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-9"
  },
  {
    "name": "Carrot",
    "variant_name": "Carrot",
    "category": "Produce",
    "emoji": "🥕",
    "base_shelf_life_days": 28,
    "optimal_window_start_day": 2,
    "optimal_window_end_day": 21,
    "storage_tips": "Remove green tops; store in a sealed bag in the crisper. Carrots keep their crunch and beta-carotene for weeks if kept cold and humid; peak flavor in the first ~3 weeks.",
    "basic_nutrition_info": {
      "calories": 41,
      "vitamins": [
        "Vitamin A",
        "Vitamin K",
        "Potassium"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-10"
  },
  {
    "name": "Cheese",
    "variant_name": "Cheddar Cheese",
    "category": "Dairy",
    "emoji": "🧀",
    "base_shelf_life_days": 21,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 14,
    "storage_tips": "Wrap in parchment then loosely in plastic; store in cheese drawer. Cheddar holds flavor and texture for ~2 weeks after opening; flavor peaks in the first week before it dries out.",
    "basic_nutrition_info": {
      "calories": 113,
      "vitamins": [
        "Calcium",
        "Protein",
        "Vitamin A"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-11"
  },
  {
    "name": "Chicken",
    "variant_name": "Chicken Breast (raw)",
    "category": "Protein",
    "emoji": "🍗",
    "base_shelf_life_days": 2,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 1,
    "storage_tips": "Keep on the lowest fridge shelf in a sealed container. USDA guidance: cook or freeze raw chicken within 1–2 days. Peak quality and safety is day-of-purchase — cook as soon as possible.",
    "basic_nutrition_info": {
      "calories": 165,
      "vitamins": [
        "Protein",
        "B6",
        "Niacin"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-12"
  },
  {
    "name": "Cucumber",
    "variant_name": "Cucumber",
    "category": "Produce",
    "emoji": "🥒",
    "base_shelf_life_days": 7,
    "optimal_window_start_day": 1,
    "optimal_window_end_day": 5,
    "storage_tips": "Wrap in a paper towel and store in the crisper drawer. Cucumbers stay crisp and hydrating for ~4–5 days; below 10°C they suffer chilling injury (water-soaked patches).",
    "basic_nutrition_info": {
      "calories": 16,
      "vitamins": [
        "Vitamin K",
        "Potassium"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-13"
  },
  {
    "name": "Eggs",
    "variant_name": "Large Eggs",
    "category": "Dairy",
    "emoji": "🥚",
    "base_shelf_life_days": 28,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 21,
    "storage_tips": "Keep refrigerated in the original carton on a middle shelf. Eggs hold grade-A quality for ~3–5 weeks; flavor and yolk integrity are best in the first 3 weeks.",
    "basic_nutrition_info": {
      "calories": 72,
      "vitamins": [
        "Protein",
        "Vitamin B12",
        "Choline"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-14"
  },
  {
    "name": "Garlic",
    "variant_name": "Garlic Bulb",
    "category": "Produce",
    "emoji": "🧄",
    "base_shelf_life_days": 60,
    "optimal_window_start_day": 3,
    "optimal_window_end_day": 45,
    "storage_tips": "Store in a cool, dark, ventilated spot — not the fridge. Garlic's pungent allicin potential stays strong for ~6 weeks before cloves soften and sprout; refrigeration triggers premature sprouting.",
    "basic_nutrition_info": {
      "calories": 4,
      "vitamins": [
        "Manganese",
        "Vitamin B6"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-15"
  },
  {
    "name": "Ginger",
    "variant_name": "Fresh Ginger",
    "category": "Produce",
    "emoji": "🫚",
    "base_shelf_life_days": 21,
    "optimal_window_start_day": 1,
    "optimal_window_end_day": 14,
    "storage_tips": "Wrap in a paper towel and refrigerate, or freeze whole. Ginger root holds its pungent gingerol and juiciness for ~2 weeks refrigerated before fibering and drying out.",
    "basic_nutrition_info": {
      "calories": 4,
      "vitamins": [
        "Manganese",
        "Vitamin B6"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-16"
  },
  {
    "name": "Lemon",
    "variant_name": "Lemon",
    "category": "Produce",
    "emoji": "🍋",
    "base_shelf_life_days": 21,
    "optimal_window_start_day": 1,
    "optimal_window_end_day": 14,
    "storage_tips": "Refrigerate in the crisper for longest life. Lemons retain peak juice yield and vitamin C for ~2 weeks refrigerated; at room temp they dry out within a week.",
    "basic_nutrition_info": {
      "calories": 17,
      "vitamins": [
        "Vitamin C"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-17"
  },
  {
    "name": "Lettuce",
    "variant_name": "Romaine Lettuce",
    "category": "Produce",
    "emoji": "🥬",
    "base_shelf_life_days": 10,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 4,
    "storage_tips": "Wrap loosely in a damp paper towel inside a perforated bag. Romaine loses crispness and up to 50% of its vitamin C within 3–4 days — eat within 4 days for best quality.",
    "basic_nutrition_info": {
      "calories": 17,
      "vitamins": [
        "Vitamin A",
        "Vitamin K",
        "Folate"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-18"
  },
  {
    "name": "Mango",
    "variant_name": "Mango",
    "category": "Produce",
    "emoji": "🥭",
    "base_shelf_life_days": 7,
    "optimal_window_start_day": 2,
    "optimal_window_end_day": 5,
    "storage_tips": "Ripen at room temperature; refrigerate once fragrant and soft. Research shows optimum sweetness and texture land ~2–3 days after the climacteric peak — best eaten over a 3-day window once yieldingly soft.",
    "basic_nutrition_info": {
      "calories": 99,
      "vitamins": [
        "Vitamin C",
        "Vitamin A",
        "Folate"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-19"
  },
  {
    "name": "Milk",
    "variant_name": "Whole Milk",
    "category": "Dairy",
    "emoji": "🥛",
    "base_shelf_life_days": 7,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 4,
    "storage_tips": "Store on a middle shelf (not the door) at 4°C or below. Milk's door-storage causes temperature swings; kept properly cold, peak freshness is the first 4 days before flavor sours.",
    "basic_nutrition_info": {
      "calories": 150,
      "vitamins": [
        "Calcium",
        "Vitamin D",
        "B12"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-20"
  },
  {
    "name": "Onion",
    "variant_name": "Yellow Onion",
    "category": "Produce",
    "emoji": "🧅",
    "base_shelf_life_days": 45,
    "optimal_window_start_day": 3,
    "optimal_window_end_day": 30,
    "storage_tips": "Store in a cool, dark, well-ventilated place — never with potatoes. Onions hold pungency and firmness for ~4 weeks; after that they soften and lose the sulfur compounds that give them bite.",
    "basic_nutrition_info": {
      "calories": 40,
      "vitamins": [
        "Vitamin C",
        "Folate"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-21"
  },
  {
    "name": "Paneer",
    "variant_name": "Fresh Paneer",
    "category": "Dairy",
    "emoji": "🧀",
    "base_shelf_life_days": 5,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 2,
    "storage_tips": "Submerge in water in an airtight container, change water daily. Studies show paneer loses freshness after 2–3 days refrigerated — peak soft, milky texture and flavor is in the first 2 days.",
    "basic_nutrition_info": {
      "calories": 265,
      "vitamins": [
        "Calcium",
        "Protein",
        "Phosphorus"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-22"
  },
  {
    "name": "Potato",
    "variant_name": "Potato",
    "category": "Produce",
    "emoji": "🥔",
    "base_shelf_life_days": 60,
    "optimal_window_start_day": 5,
    "optimal_window_end_day": 45,
    "storage_tips": "Store in a paper bag in a cool, dark place — not the fridge. Potatoes hold starch quality and resist sprouting for ~6 weeks; refrigeration converts starches to sugars, ruining fry texture.",
    "basic_nutrition_info": {
      "calories": 110,
      "vitamins": [
        "Vitamin C",
        "Potassium",
        "Vitamin B6"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-23"
  },
  {
    "name": "Rice",
    "variant_name": "White Rice (uncooked)",
    "category": "Pantry",
    "emoji": "🍚",
    "base_shelf_life_days": 365,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 180,
    "storage_tips": "Store in an airtight container in a cool, dark, dry pantry. White rice holds quality for a year; moisture and pantry pests are the real enemy, so keep it sealed.",
    "basic_nutrition_info": {
      "calories": 205,
      "vitamins": [
        "Manganese",
        "Selenium"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-24"
  },
  {
    "name": "Spinach",
    "variant_name": "Spinach Leaves",
    "category": "Produce",
    "emoji": "🥬",
    "base_shelf_life_days": 7,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 2,
    "storage_tips": "Store in a damp paper towel inside a perforated bag in the crisper drawer. Mature spinach loses ~80% of its vitamin C within 3 days — eat within 2 days of purchase for peak nutrition.",
    "basic_nutrition_info": {
      "calories": 23,
      "vitamins": [
        "Vitamin K",
        "Iron",
        "Folate"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-25"
  },
  {
    "name": "Spinach",
    "variant_name": "Spinach with Roots",
    "category": "Produce",
    "emoji": "🥬",
    "base_shelf_life_days": 9,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 3,
    "storage_tips": "Stand stems in a glass of water and loosely cover leaves with a bag. Root-on spinach keeps longer with better ascorbate retention — best within 3 days before leaves wilt.",
    "basic_nutrition_info": {
      "calories": 23,
      "vitamins": [
        "Vitamin K",
        "Iron",
        "Magnesium"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-26"
  },
  {
    "name": "Spinach",
    "variant_name": "Baby Spinach",
    "category": "Produce",
    "emoji": "🥬",
    "base_shelf_life_days": 6,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 3,
    "storage_tips": "Keep in original clamshell with a paper towel to absorb moisture. Baby spinach loses ascorbate more slowly than mature leaves — still best within 2–3 days for peak nutrition and texture.",
    "basic_nutrition_info": {
      "calories": 20,
      "vitamins": [
        "Vitamin A",
        "Vitamin C",
        "Folate"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-27"
  },
  {
    "name": "Tomato",
    "variant_name": "Cherry Tomatoes",
    "category": "Produce",
    "emoji": "🍅",
    "base_shelf_life_days": 7,
    "optimal_window_start_day": 1,
    "optimal_window_end_day": 4,
    "storage_tips": "Store at room temperature on the counter, away from sun. Cherry tomatoes hit peak flavor volatiles at full color — eat within 2–3 days of fully red; refrigeration kills aroma compounds.",
    "basic_nutrition_info": {
      "calories": 18,
      "vitamins": [
        "Vitamin C",
        "Vitamin A"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-28"
  },
  {
    "name": "Tomato",
    "variant_name": "Tomato",
    "category": "Produce",
    "emoji": "🍅",
    "base_shelf_life_days": 7,
    "optimal_window_start_day": 2,
    "optimal_window_end_day": 5,
    "storage_tips": "Keep at room temperature stem-side down until fully ripe. Tomatoes reach peak flavor at full ripe color; refrigeration below 13°C permanently halts flavor-volatile production — eat within 2–3 days of peak ripeness.",
    "basic_nutrition_info": {
      "calories": 18,
      "vitamins": [
        "Vitamin C",
        "Potassium",
        "Lycopene"
      ]
    },
    "ripeness_applicable": true,
    "id": "ing-29"
  },
  {
    "name": "Yogurt",
    "variant_name": "Plain Yogurt",
    "category": "Dairy",
    "emoji": "🥣",
    "base_shelf_life_days": 14,
    "optimal_window_start_day": 0,
    "optimal_window_end_day": 10,
    "storage_tips": "Keep refrigerated and tightly sealed after opening. Live probiotic cultures and fresh tang hold best in the first 7–10 days after opening; whey separation is normal and stirrable.",
    "basic_nutrition_info": {
      "calories": 100,
      "vitamins": [
        "Calcium",
        "Probiotics",
        "Protein"
      ]
    },
    "ripeness_applicable": false,
    "id": "ing-30"
  }
];
