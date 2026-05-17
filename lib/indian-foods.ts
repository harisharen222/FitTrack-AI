// Curated nutrition data for common Indian dishes & ingredients.
// Values are per 100 g (or 100 ml for liquids) — same convention as Open Food Facts.
// Sources: USDA FDC, NIN-ICMR food composition tables, IFCT 2017.

export type IndianFood = {
  id: string
  name: string
  brand?: string // category
  servingG: number // typical single serving (used as default portion)
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  tags: string[] // search aliases
}

export const INDIAN_FOODS: IndianFood[] = [
  // Breads
  { id: "in-roti", name: "Roti / Chapati (whole wheat)", brand: "Indian · Bread", servingG: 40, calories: 297, proteinG: 11, carbsG: 56, fatG: 4, tags: ["roti", "chapati", "phulka", "wheat", "bread"] },
  { id: "in-naan", name: "Naan", brand: "Indian · Bread", servingG: 90, calories: 310, proteinG: 9, carbsG: 53, fatG: 7, tags: ["naan", "bread"] },
  { id: "in-paratha-plain", name: "Plain Paratha", brand: "Indian · Bread", servingG: 80, calories: 320, proteinG: 8, carbsG: 45, fatG: 12, tags: ["paratha", "parantha"] },
  { id: "in-paratha-aloo", name: "Aloo Paratha", brand: "Indian · Bread", servingG: 120, calories: 290, proteinG: 6, carbsG: 38, fatG: 13, tags: ["aloo paratha", "potato paratha"] },
  { id: "in-puri", name: "Puri", brand: "Indian · Bread", servingG: 30, calories: 380, proteinG: 7, carbsG: 47, fatG: 18, tags: ["puri", "poori"] },
  { id: "in-bhatura", name: "Bhatura", brand: "Indian · Bread", servingG: 100, calories: 360, proteinG: 8, carbsG: 50, fatG: 15, tags: ["bhatura", "bhature"] },
  { id: "in-thepla", name: "Thepla", brand: "Indian · Bread", servingG: 50, calories: 290, proteinG: 9, carbsG: 42, fatG: 10, tags: ["thepla", "gujarati"] },
  { id: "in-dosa-plain", name: "Plain Dosa", brand: "Indian · South", servingG: 80, calories: 168, proteinG: 4, carbsG: 28, fatG: 4, tags: ["dosa", "south indian"] },
  { id: "in-dosa-masala", name: "Masala Dosa", brand: "Indian · South", servingG: 200, calories: 168, proteinG: 4, carbsG: 26, fatG: 5, tags: ["masala dosa"] },
  { id: "in-idli", name: "Idli", brand: "Indian · South", servingG: 50, calories: 156, proteinG: 5, carbsG: 32, fatG: 1, tags: ["idli"] },
  { id: "in-uttapam", name: "Uttapam", brand: "Indian · South", servingG: 120, calories: 180, proteinG: 5, carbsG: 30, fatG: 4, tags: ["uttapam", "uthappam"] },
  { id: "in-medu-vada", name: "Medu Vada", brand: "Indian · South", servingG: 50, calories: 320, proteinG: 8, carbsG: 30, fatG: 18, tags: ["vada", "medu vada"] },

  // Rice dishes
  { id: "in-rice-plain", name: "Plain Rice (cooked)", brand: "Indian · Rice", servingG: 150, calories: 130, proteinG: 3, carbsG: 28, fatG: 0.3, tags: ["rice", "white rice", "chawal", "bhat"] },
  { id: "in-rice-brown", name: "Brown Rice (cooked)", brand: "Indian · Rice", servingG: 150, calories: 123, proteinG: 3, carbsG: 26, fatG: 1, tags: ["brown rice"] },
  { id: "in-jeera-rice", name: "Jeera Rice", brand: "Indian · Rice", servingG: 180, calories: 170, proteinG: 3, carbsG: 30, fatG: 4, tags: ["jeera rice", "cumin rice"] },
  { id: "in-pulao-veg", name: "Veg Pulao", brand: "Indian · Rice", servingG: 200, calories: 190, proteinG: 4, carbsG: 30, fatG: 6, tags: ["pulao", "pulav", "vegetable pulao"] },
  { id: "in-biryani-veg", name: "Veg Biryani", brand: "Indian · Rice", servingG: 250, calories: 210, proteinG: 5, carbsG: 32, fatG: 7, tags: ["biryani", "veg biryani"] },
  { id: "in-biryani-chicken", name: "Chicken Biryani", brand: "Indian · Rice", servingG: 300, calories: 235, proteinG: 11, carbsG: 28, fatG: 9, tags: ["chicken biryani", "biryani"] },
  { id: "in-biryani-mutton", name: "Mutton Biryani", brand: "Indian · Rice", servingG: 300, calories: 260, proteinG: 12, carbsG: 26, fatG: 12, tags: ["mutton biryani", "lamb biryani"] },
  { id: "in-curd-rice", name: "Curd Rice", brand: "Indian · Rice", servingG: 200, calories: 130, proteinG: 4, carbsG: 22, fatG: 3, tags: ["curd rice", "thayir sadam"] },
  { id: "in-khichdi", name: "Khichdi", brand: "Indian · Rice", servingG: 200, calories: 150, proteinG: 6, carbsG: 25, fatG: 3, tags: ["khichdi", "khichri"] },
  { id: "in-poha", name: "Poha", brand: "Indian · Snack", servingG: 150, calories: 180, proteinG: 4, carbsG: 32, fatG: 4, tags: ["poha", "flattened rice"] },
  { id: "in-upma", name: "Upma", brand: "Indian · South", servingG: 150, calories: 180, proteinG: 4, carbsG: 26, fatG: 6, tags: ["upma"] },

  // Dals
  { id: "in-dal-tadka", name: "Dal Tadka", brand: "Indian · Dal", servingG: 200, calories: 120, proteinG: 6, carbsG: 16, fatG: 4, tags: ["dal", "dal tadka", "yellow dal"] },
  { id: "in-dal-makhani", name: "Dal Makhani", brand: "Indian · Dal", servingG: 200, calories: 170, proteinG: 7, carbsG: 18, fatG: 8, tags: ["dal makhani"] },
  { id: "in-chana-dal", name: "Chana Dal", brand: "Indian · Dal", servingG: 200, calories: 145, proteinG: 8, carbsG: 22, fatG: 3, tags: ["chana dal"] },
  { id: "in-rajma", name: "Rajma (kidney bean curry)", brand: "Indian · Curry", servingG: 200, calories: 140, proteinG: 8, carbsG: 22, fatG: 3, tags: ["rajma", "kidney bean"] },
  { id: "in-chole", name: "Chole / Chana Masala", brand: "Indian · Curry", servingG: 200, calories: 160, proteinG: 7, carbsG: 22, fatG: 5, tags: ["chole", "chana masala", "chickpea curry"] },
  { id: "in-sambar", name: "Sambar", brand: "Indian · South", servingG: 200, calories: 90, proteinG: 4, carbsG: 13, fatG: 2, tags: ["sambar", "sambhar"] },
  { id: "in-rasam", name: "Rasam", brand: "Indian · South", servingG: 200, calories: 55, proteinG: 2, carbsG: 9, fatG: 1, tags: ["rasam"] },

  // Curries / Sabzi
  { id: "in-paneer-butter", name: "Paneer Butter Masala", brand: "Indian · Curry", servingG: 200, calories: 270, proteinG: 11, carbsG: 12, fatG: 20, tags: ["paneer butter masala", "paneer makhani"] },
  { id: "in-palak-paneer", name: "Palak Paneer", brand: "Indian · Curry", servingG: 200, calories: 180, proteinG: 11, carbsG: 8, fatG: 12, tags: ["palak paneer"] },
  { id: "in-paneer-tikka", name: "Paneer Tikka", brand: "Indian · Starter", servingG: 150, calories: 240, proteinG: 17, carbsG: 6, fatG: 17, tags: ["paneer tikka"] },
  { id: "in-shahi-paneer", name: "Shahi Paneer", brand: "Indian · Curry", servingG: 200, calories: 290, proteinG: 11, carbsG: 12, fatG: 22, tags: ["shahi paneer"] },
  { id: "in-aloo-gobi", name: "Aloo Gobi", brand: "Indian · Curry", servingG: 200, calories: 110, proteinG: 3, carbsG: 14, fatG: 5, tags: ["aloo gobi"] },
  { id: "in-bhindi-masala", name: "Bhindi Masala", brand: "Indian · Curry", servingG: 200, calories: 115, proteinG: 3, carbsG: 11, fatG: 7, tags: ["bhindi", "okra"] },
  { id: "in-baingan-bharta", name: "Baingan Bharta", brand: "Indian · Curry", servingG: 200, calories: 95, proteinG: 2, carbsG: 9, fatG: 6, tags: ["baingan bharta", "eggplant"] },
  { id: "in-mix-veg", name: "Mixed Veg Curry", brand: "Indian · Curry", servingG: 200, calories: 110, proteinG: 3, carbsG: 12, fatG: 6, tags: ["mix veg", "mixed vegetable"] },
  { id: "in-malai-kofta", name: "Malai Kofta", brand: "Indian · Curry", servingG: 200, calories: 310, proteinG: 8, carbsG: 16, fatG: 24, tags: ["malai kofta"] },
  { id: "in-kadai-paneer", name: "Kadai Paneer", brand: "Indian · Curry", servingG: 200, calories: 245, proteinG: 11, carbsG: 10, fatG: 18, tags: ["kadai paneer"] },
  { id: "in-aloo-matar", name: "Aloo Matar", brand: "Indian · Curry", servingG: 200, calories: 110, proteinG: 3, carbsG: 16, fatG: 4, tags: ["aloo matar", "aloo mutter"] },

  // Non-veg curries
  { id: "in-butter-chicken", name: "Butter Chicken", brand: "Indian · Curry", servingG: 200, calories: 220, proteinG: 14, carbsG: 7, fatG: 15, tags: ["butter chicken", "murgh makhani"] },
  { id: "in-chicken-tikka", name: "Chicken Tikka", brand: "Indian · Starter", servingG: 150, calories: 180, proteinG: 24, carbsG: 4, fatG: 8, tags: ["chicken tikka"] },
  { id: "in-tandoori-chicken", name: "Tandoori Chicken", brand: "Indian · Starter", servingG: 200, calories: 165, proteinG: 25, carbsG: 2, fatG: 6, tags: ["tandoori chicken"] },
  { id: "in-chicken-curry", name: "Chicken Curry", brand: "Indian · Curry", servingG: 200, calories: 195, proteinG: 15, carbsG: 5, fatG: 13, tags: ["chicken curry", "chicken masala"] },
  { id: "in-chicken-korma", name: "Chicken Korma", brand: "Indian · Curry", servingG: 200, calories: 240, proteinG: 14, carbsG: 6, fatG: 18, tags: ["chicken korma"] },
  { id: "in-mutton-curry", name: "Mutton Curry", brand: "Indian · Curry", servingG: 200, calories: 250, proteinG: 16, carbsG: 4, fatG: 19, tags: ["mutton curry", "lamb curry"] },
  { id: "in-fish-curry", name: "Fish Curry", brand: "Indian · Curry", servingG: 200, calories: 145, proteinG: 16, carbsG: 4, fatG: 7, tags: ["fish curry"] },
  { id: "in-egg-curry", name: "Egg Curry", brand: "Indian · Curry", servingG: 200, calories: 160, proteinG: 9, carbsG: 6, fatG: 11, tags: ["egg curry", "anda curry"] },

  // Snacks / Street food
  { id: "in-samosa", name: "Samosa", brand: "Indian · Snack", servingG: 60, calories: 308, proteinG: 5, carbsG: 32, fatG: 17, tags: ["samosa"] },
  { id: "in-pakora", name: "Pakora / Bhajia", brand: "Indian · Snack", servingG: 50, calories: 330, proteinG: 7, carbsG: 30, fatG: 21, tags: ["pakora", "bhajia", "bhaji"] },
  { id: "in-vada-pav", name: "Vada Pav", brand: "Indian · Street", servingG: 130, calories: 240, proteinG: 6, carbsG: 32, fatG: 10, tags: ["vada pav"] },
  { id: "in-pav-bhaji", name: "Pav Bhaji", brand: "Indian · Street", servingG: 300, calories: 165, proteinG: 4, carbsG: 22, fatG: 7, tags: ["pav bhaji"] },
  { id: "in-bhel-puri", name: "Bhel Puri", brand: "Indian · Street", servingG: 150, calories: 200, proteinG: 4, carbsG: 32, fatG: 6, tags: ["bhel puri", "bhel"] },
  { id: "in-pani-puri", name: "Pani Puri / Gol Gappa", brand: "Indian · Street", servingG: 120, calories: 175, proteinG: 3, carbsG: 28, fatG: 6, tags: ["pani puri", "golgappa", "puchka"] },
  { id: "in-sev-puri", name: "Sev Puri", brand: "Indian · Street", servingG: 120, calories: 220, proteinG: 4, carbsG: 28, fatG: 10, tags: ["sev puri"] },
  { id: "in-dahi-puri", name: "Dahi Puri", brand: "Indian · Street", servingG: 120, calories: 180, proteinG: 5, carbsG: 25, fatG: 7, tags: ["dahi puri"] },
  { id: "in-dhokla", name: "Dhokla", brand: "Indian · Snack", servingG: 100, calories: 160, proteinG: 6, carbsG: 26, fatG: 4, tags: ["dhokla", "gujarati"] },
  { id: "in-kachori", name: "Kachori", brand: "Indian · Snack", servingG: 60, calories: 360, proteinG: 7, carbsG: 38, fatG: 20, tags: ["kachori"] },
  { id: "in-aloo-tikki", name: "Aloo Tikki", brand: "Indian · Snack", servingG: 80, calories: 200, proteinG: 3, carbsG: 24, fatG: 10, tags: ["aloo tikki", "potato tikki"] },
  { id: "in-chaat", name: "Papdi Chaat", brand: "Indian · Street", servingG: 150, calories: 220, proteinG: 5, carbsG: 30, fatG: 9, tags: ["chaat", "papdi"] },

  // Sweets
  { id: "in-gulab-jamun", name: "Gulab Jamun", brand: "Indian · Sweet", servingG: 50, calories: 350, proteinG: 5, carbsG: 50, fatG: 15, tags: ["gulab jamun"] },
  { id: "in-jalebi", name: "Jalebi", brand: "Indian · Sweet", servingG: 50, calories: 410, proteinG: 3, carbsG: 60, fatG: 18, tags: ["jalebi"] },
  { id: "in-rasgulla", name: "Rasgulla", brand: "Indian · Sweet", servingG: 50, calories: 186, proteinG: 4, carbsG: 35, fatG: 4, tags: ["rasgulla", "rosogolla"] },
  { id: "in-rasmalai", name: "Rasmalai", brand: "Indian · Sweet", servingG: 80, calories: 280, proteinG: 7, carbsG: 36, fatG: 12, tags: ["rasmalai"] },
  { id: "in-kheer", name: "Kheer", brand: "Indian · Sweet", servingG: 150, calories: 180, proteinG: 5, carbsG: 28, fatG: 5, tags: ["kheer", "payasam"] },
  { id: "in-halwa-gajar", name: "Gajar Ka Halwa", brand: "Indian · Sweet", servingG: 100, calories: 320, proteinG: 5, carbsG: 38, fatG: 17, tags: ["gajar halwa", "carrot halwa"] },
  { id: "in-halwa-suji", name: "Suji Halwa", brand: "Indian · Sweet", servingG: 100, calories: 380, proteinG: 6, carbsG: 50, fatG: 16, tags: ["suji halwa", "sheera"] },
  { id: "in-laddoo-besan", name: "Besan Laddoo", brand: "Indian · Sweet", servingG: 30, calories: 480, proteinG: 9, carbsG: 50, fatG: 25, tags: ["laddoo", "besan ladoo"] },
  { id: "in-barfi", name: "Barfi", brand: "Indian · Sweet", servingG: 30, calories: 420, proteinG: 8, carbsG: 50, fatG: 20, tags: ["barfi", "burfi"] },

  // Drinks
  { id: "in-chai", name: "Masala Chai (with milk & sugar)", brand: "Indian · Drink", servingG: 200, calories: 60, proteinG: 2, carbsG: 9, fatG: 2, tags: ["chai", "tea", "masala chai"] },
  { id: "in-lassi-sweet", name: "Sweet Lassi", brand: "Indian · Drink", servingG: 250, calories: 110, proteinG: 4, carbsG: 18, fatG: 3, tags: ["lassi", "sweet lassi"] },
  { id: "in-lassi-salt", name: "Salted Lassi / Chaas", brand: "Indian · Drink", servingG: 250, calories: 50, proteinG: 3, carbsG: 5, fatG: 2, tags: ["chaas", "salted lassi", "buttermilk"] },
  { id: "in-mango-lassi", name: "Mango Lassi", brand: "Indian · Drink", servingG: 250, calories: 130, proteinG: 4, carbsG: 22, fatG: 3, tags: ["mango lassi"] },
  { id: "in-nimbu-pani", name: "Nimbu Pani", brand: "Indian · Drink", servingG: 250, calories: 35, proteinG: 0, carbsG: 9, fatG: 0, tags: ["nimbu pani", "lemonade", "shikanji"] },
  { id: "in-filter-coffee", name: "South Indian Filter Coffee", brand: "Indian · Drink", servingG: 150, calories: 70, proteinG: 3, carbsG: 9, fatG: 3, tags: ["filter coffee", "kaapi"] },

  // Staples / ingredients
  { id: "in-paneer", name: "Paneer (raw)", brand: "Indian · Dairy", servingG: 100, calories: 296, proteinG: 18, carbsG: 4, fatG: 25, tags: ["paneer", "cottage cheese"] },
  { id: "in-curd", name: "Dahi / Curd", brand: "Indian · Dairy", servingG: 100, calories: 61, proteinG: 3, carbsG: 5, fatG: 3, tags: ["dahi", "curd", "yogurt"] },
  { id: "in-ghee", name: "Ghee", brand: "Indian · Fat", servingG: 10, calories: 900, proteinG: 0, carbsG: 0, fatG: 100, tags: ["ghee", "clarified butter"] },
  { id: "in-coconut-chutney", name: "Coconut Chutney", brand: "Indian · Side", servingG: 30, calories: 165, proteinG: 2, carbsG: 6, fatG: 14, tags: ["coconut chutney"] },
  { id: "in-mint-chutney", name: "Mint Chutney", brand: "Indian · Side", servingG: 30, calories: 50, proteinG: 1, carbsG: 8, fatG: 1, tags: ["mint chutney", "pudina"] },
  { id: "in-pickle", name: "Mango Pickle (achar)", brand: "Indian · Side", servingG: 15, calories: 250, proteinG: 1, carbsG: 12, fatG: 22, tags: ["achar", "pickle", "mango pickle"] },
  { id: "in-papad", name: "Papad / Papadum", brand: "Indian · Side", servingG: 10, calories: 370, proteinG: 22, carbsG: 56, fatG: 4, tags: ["papad", "papadum"] },
]

export function searchIndianFoods(query: string): IndianFood[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return INDIAN_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.tags.some((t) => t.includes(q) || q.includes(t)),
  ).slice(0, 12)
}
