export type EquipmentKey =
  | "stovetop" | "oven" | "microwave" | "air-fryer" | "blender"
  | "food-processor" | "pressure-cooker" | "toaster" | "grill" | "no-cook";

export interface EquipmentOption {
  key: EquipmentKey;
  label: string;
  emoji: string;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { key: "no-cook", label: "No special equipment", emoji: "✋" },
  { key: "stovetop", label: "Stovetop", emoji: "🍳" },
  { key: "oven", label: "Oven", emoji: "🔥" },
  { key: "microwave", label: "Microwave", emoji: "📻" },
  { key: "air-fryer", label: "Air Fryer", emoji: "🌀" },
  { key: "blender", label: "Blender", emoji: "🥤" },
  { key: "food-processor", label: "Food Processor", emoji: "⚙️" },
  { key: "pressure-cooker", label: "Pressure Cooker", emoji: "♨️" },
  { key: "toaster", label: "Toaster", emoji: "🍞" },
  { key: "grill", label: "Grill / Tandoor", emoji: "🔥" },
];

export const DEFAULT_EQUIPMENT: EquipmentKey[] = ["no-cook"];

export type DietaryTag =
  | "Vegetarian" | "Vegan" | "Gluten-Free" | "Dairy-Free"
  | "Low-Carb" | "High-Protein" | "No Preference";

export const DIETARY_OPTIONS: DietaryTag[] = [
  "No Preference", "Vegetarian", "Vegan", "Gluten-Free",
  "Dairy-Free", "Low-Carb", "High-Protein",
];

// Restrictive tags hide non-matching recipes. Others are rank boosts only.
export const RESTRICTIVE_DIETARY: DietaryTag[] = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free",
];