export type CookingGoal = "snack" | "healthy" | "filling" | "quick";
export type Equipment =
  | "stovetop" | "oven" | "blender" | "microwave" | "no-cook"
  | "air-fryer" | "food-processor" | "pressure-cooker" | "toaster" | "grill";

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  cooking_goal: CookingGoal[];
  required_ingredients: string[];
  optional_ingredients: string[];
  equipment_needed: Equipment[];
  instructions: string[];
  prep_time_minutes: number;
  minimizes_waste_tags: string[];
  dietary_tags: string[]; // tags this recipe satisfies (e.g. "Vegetarian", "Gluten-Free")
}

// Common pantry staples assumed available in Flexible mode
export const COMMON_STAPLES = [
  "Salt", "Pepper", "Oil", "Olive Oil", "Sugar", "Water", "Flour", "Spices",
];

export const RECIPES: Recipe[] = [
  {
    id: "r1", name: "Banana Smoothie", emoji: "🥤",
    cooking_goal: ["snack", "quick", "healthy"],
    required_ingredients: ["Banana", "Milk"],
    optional_ingredients: ["Berries", "Yogurt"],
    equipment_needed: ["blender"],
    prep_time_minutes: 5,
    minimizes_waste_tags: ["Banana", "Milk", "Berries"],
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Peel the banana and slice into chunks.",
      "Add banana, milk, and any optional fruit to a blender.",
      "Blend until smooth, about 30 seconds. Serve cold.",
    ],
  },
  {
    id: "r2", name: "Scrambled Eggs on Toast", emoji: "🍳",
    cooking_goal: ["quick", "filling"],
    required_ingredients: ["Eggs", "Bread", "Butter"],
    optional_ingredients: ["Cheese"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 10,
    minimizes_waste_tags: ["Eggs", "Bread"],
    dietary_tags: ["Vegetarian"],
    instructions: [
      "Whisk eggs with a pinch of salt.",
      "Melt butter in a pan on low heat.",
      "Pour in eggs and stir gently until just set.",
      "Toast the bread and top with the eggs.",
    ],
  },
  {
    id: "r3", name: "Paneer Bhurji", emoji: "🧀",
    cooking_goal: ["healthy", "filling"],
    required_ingredients: ["Paneer", "Onion", "Tomato"],
    optional_ingredients: ["Bell Pepper", "Ginger", "Garlic"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 20,
    minimizes_waste_tags: ["Paneer", "Tomato"],
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Carb", "High-Protein"],
    instructions: [
      "Crumble paneer into rough bits.",
      "Sauté chopped onion in oil until soft, add ginger/garlic if using.",
      "Add chopped tomato and cook until mushy.",
      "Stir in paneer, season with salt and spices, cook 3–4 minutes.",
    ],
  },
  {
    id: "r4", name: "Vegetable Fried Rice", emoji: "🍚",
    cooking_goal: ["quick", "filling"],
    required_ingredients: ["Rice", "Eggs", "Onion", "Carrot"],
    optional_ingredients: ["Bell Pepper", "Garlic", "Spinach"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 15,
    minimizes_waste_tags: ["Rice", "Carrot"],
    dietary_tags: ["Vegetarian", "Dairy-Free"],
    instructions: [
      "Heat oil in a wok, scramble eggs and set aside.",
      "Stir-fry onion and carrot until just tender.",
      "Add cooked rice and any extras; toss on high heat.",
      "Return eggs, season with salt and a splash of soy sauce.",
    ],
  },
  {
    id: "r5", name: "Spinach & Paneer Saag", emoji: "🥬",
    cooking_goal: ["healthy", "filling"],
    required_ingredients: ["Spinach", "Paneer", "Onion", "Garlic"],
    optional_ingredients: ["Ginger", "Tomato"],
    equipment_needed: ["stovetop", "blender"],
    prep_time_minutes: 30,
    minimizes_waste_tags: ["Spinach", "Paneer"],
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Carb", "High-Protein"],
    instructions: [
      "Blanch spinach in hot water 2 minutes, then blend to a paste.",
      "Sauté onion, garlic, and ginger in oil until golden.",
      "Add spinach purée, simmer 5 minutes with salt and spices.",
      "Fold in cubed paneer and warm through.",
    ],
  },
  {
    id: "r6", name: "Tomato & Onion Omelette", emoji: "🍳",
    cooking_goal: ["quick", "healthy"],
    required_ingredients: ["Eggs", "Tomato", "Onion"],
    optional_ingredients: ["Cheese", "Spinach"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 8,
    minimizes_waste_tags: ["Tomato", "Eggs"],
    dietary_tags: ["Vegetarian", "Gluten-Free", "Dairy-Free", "Low-Carb", "High-Protein"],
    instructions: [
      "Beat eggs with salt and pepper.",
      "Sauté chopped onion and tomato briefly in oil.",
      "Pour eggs over, cook until set, fold and serve.",
    ],
  },
  {
    id: "r7", name: "Banana Pancakes", emoji: "🥞",
    cooking_goal: ["snack", "filling"],
    required_ingredients: ["Banana", "Eggs", "Milk"],
    optional_ingredients: ["Butter", "Berries"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 15,
    minimizes_waste_tags: ["Banana"],
    dietary_tags: ["Vegetarian"],
    instructions: [
      "Mash ripe bananas in a bowl.",
      "Whisk in eggs, milk, and a little flour to make a batter.",
      "Cook small pancakes in a buttered pan, 2 minutes per side.",
    ],
  },
  {
    id: "r8", name: "Cucumber Yogurt Raita", emoji: "🥒",
    cooking_goal: ["snack", "healthy", "quick"],
    required_ingredients: ["Cucumber", "Yogurt"],
    optional_ingredients: ["Lemon", "Spinach"],
    equipment_needed: ["no-cook"],
    prep_time_minutes: 5,
    minimizes_waste_tags: ["Cucumber", "Yogurt"],
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Carb"],
    instructions: [
      "Grate cucumber and squeeze out excess water.",
      "Whisk yogurt with a pinch of salt and pepper.",
      "Stir in cucumber, optional lemon. Chill before serving.",
    ],
  },
  {
    id: "r9", name: "Grilled Cheese Sandwich", emoji: "🥪",
    cooking_goal: ["snack", "filling", "quick"],
    required_ingredients: ["Bread", "Cheese", "Butter"],
    optional_ingredients: ["Tomato"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 7,
    minimizes_waste_tags: ["Bread", "Cheese"],
    dietary_tags: ["Vegetarian"],
    instructions: [
      "Butter one side of each bread slice.",
      "Layer cheese (and tomato if using) between slices, buttered side out.",
      "Toast in a pan over medium heat until golden, flip once.",
    ],
  },
  {
    id: "r10", name: "Garlic Lemon Chicken", emoji: "🍗",
    cooking_goal: ["healthy", "filling"],
    required_ingredients: ["Chicken", "Garlic", "Lemon", "Butter"],
    optional_ingredients: ["Onion"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 25,
    minimizes_waste_tags: ["Chicken"],
    dietary_tags: ["Gluten-Free", "Low-Carb", "High-Protein", "Dairy-Free"],
    instructions: [
      "Pat chicken dry and season with salt and pepper.",
      "Sear in a hot pan with butter, 4 minutes per side.",
      "Add minced garlic and a squeeze of lemon, baste 1 minute.",
      "Rest 3 minutes before slicing.",
    ],
  },
  {
    id: "r11", name: "Creamy Mashed Potatoes", emoji: "🥔",
    cooking_goal: ["filling"],
    required_ingredients: ["Potato", "Butter", "Milk"],
    optional_ingredients: ["Garlic", "Cheese"],
    equipment_needed: ["stovetop"],
    prep_time_minutes: 25,
    minimizes_waste_tags: ["Potato"],
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Peel and chop potatoes, boil in salted water until tender.",
      "Drain, then mash with warm milk and butter.",
      "Season with salt and pepper to taste.",
    ],
  },
  {
    id: "r12", name: "Green Spinach Smoothie", emoji: "🥬",
    cooking_goal: ["healthy", "quick", "snack"],
    required_ingredients: ["Spinach", "Banana", "Milk"],
    optional_ingredients: ["Berries", "Yogurt"],
    equipment_needed: ["blender"],
    prep_time_minutes: 5,
    minimizes_waste_tags: ["Spinach", "Banana"],
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Wash spinach, peel banana.",
      "Blend with milk and any extras until smooth.",
      "Pour over ice and enjoy.",
    ],
  },
  {
    id: "r13", name: "Berry Yogurt Parfait", emoji: "🍓",
    cooking_goal: ["snack", "healthy", "quick"],
    required_ingredients: ["Berries", "Yogurt"],
    optional_ingredients: ["Banana"],
    equipment_needed: ["no-cook"],
    prep_time_minutes: 5,
    minimizes_waste_tags: ["Berries", "Yogurt"],
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Spoon yogurt into a glass.",
      "Layer with berries (and sliced banana if using).",
      "Repeat layers, drizzle with honey if you have it.",
    ],
  },
  {
    id: "r14", name: "Roasted Veggie Bowl", emoji: "🥗",
    cooking_goal: ["healthy", "filling"],
    required_ingredients: ["Potato", "Carrot", "Bell Pepper", "Onion"],
    optional_ingredients: ["Garlic", "Spinach", "Lemon"],
    equipment_needed: ["oven"],
    prep_time_minutes: 35,
    minimizes_waste_tags: ["Carrot", "Bell Pepper", "Potato"],
    dietary_tags: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free"],
    instructions: [
      "Heat oven to 220°C. Chop veggies into bite-size pieces.",
      "Toss with oil, salt, and pepper on a baking tray.",
      "Roast 25–30 minutes until edges are crisp.",
      "Finish with a squeeze of lemon or fresh spinach on top.",
    ],
  },
  {
    id: "r15", name: "Mango Lassi", emoji: "🥭",
    cooking_goal: ["snack", "quick"],
    required_ingredients: ["Mango", "Yogurt", "Milk"],
    optional_ingredients: [],
    equipment_needed: ["blender"],
    prep_time_minutes: 5,
    minimizes_waste_tags: ["Mango"],
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Peel and chop the mango.",
      "Blend mango, yogurt, milk, and a little sugar with ice.",
      "Serve chilled.",
    ],
  },
];