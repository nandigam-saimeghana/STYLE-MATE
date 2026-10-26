export type Category = "top" | "bottom" | "shoes" | "outerwear" | "accessory";
export type Occasion = "casual" | "work" | "party" | "formal" | "workout";
export type Season = "all" | "summer" | "winter" | "monsoon";

export type Item = {
  id: string;
  name: string;
  category: Category;
  color: string;
  season: Season;
  occasion: Occasion;
  brand: string;
  worn: number;
  favorite: boolean;
};

export type Look = {
  id: string;
  name: string;
  occasion: Occasion;
  itemIds: string[];
  note: string;
};

export type Store = {
  style: string;
  items: Item[];
  looks: Look[];
};

const KEY = "stylemate-v1";

const SEED: Store = {
  style: "smart casual",
  items: [
    { id: "1", name: "White tee", category: "top", color: "white", season: "all", occasion: "casual", brand: "Uniqlo", worn: 8, favorite: true },
    { id: "2", name: "Navy shirt", category: "top", color: "navy", season: "all", occasion: "work", brand: "Van Heusen", worn: 5, favorite: false },
    { id: "3", name: "Black sweater", category: "top", color: "black", season: "winter", occasion: "casual", brand: "H&M", worn: 3, favorite: false },
    { id: "4", name: "Olive hoodie", category: "top", color: "olive", season: "monsoon", occasion: "casual", brand: "Nike", worn: 4, favorite: true },
    { id: "5", name: "Blue jeans", category: "bottom", color: "blue", season: "all", occasion: "casual", brand: "Levi's", worn: 11, favorite: true },
    { id: "6", name: "Black chinos", category: "bottom", color: "black", season: "all", occasion: "work", brand: "Gap", worn: 6, favorite: false },
    { id: "7", name: "Grey joggers", category: "bottom", color: "grey", season: "all", occasion: "workout", brand: "Adidas", worn: 4, favorite: false },
    { id: "8", name: "White sneakers", category: "shoes", color: "white", season: "all", occasion: "casual", brand: "Adidas", worn: 14, favorite: true },
    { id: "9", name: "Black derbies", category: "shoes", color: "black", season: "all", occasion: "formal", brand: "Clarks", worn: 2, favorite: false },
    { id: "10", name: "Denim jacket", category: "outerwear", color: "blue", season: "monsoon", occasion: "casual", brand: "Levi's", worn: 3, favorite: false },
    { id: "11", name: "Black blazer", category: "outerwear", color: "black", season: "all", occasion: "formal", brand: "Zara", worn: 2, favorite: true },
    { id: "12", name: "Brown belt", category: "accessory", color: "brown", season: "all", occasion: "casual", brand: "Local", worn: 7, favorite: false },
    { id: "13", name: "Silver watch", category: "accessory", color: "silver", season: "all", occasion: "work", brand: "Casio", worn: 9, favorite: false },
  ],
  looks: [
    { id: "l1", name: "Campus day", occasion: "casual", itemIds: ["1", "5", "8"], note: "Default lecture look" },
    { id: "l2", name: "Interview", occasion: "formal", itemIds: ["2", "6", "9", "11"], note: "Keep it sharp" },
  ],
};

export function loadStore(): Store {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(SEED);
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.items || !parsed.looks) return structuredClone(SEED);
    return parsed;
  } catch {
    return structuredClone(SEED);
  }
}

export function saveStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const CATEGORIES: Category[] = ["top", "bottom", "shoes", "outerwear", "accessory"];
export const OCCASIONS: Occasion[] = ["casual", "work", "party", "formal", "workout"];
export const SEASONS: Season[] = ["all", "summer", "winter", "monsoon"];

export type Suggestion = {
  name: string;
  score: number;
  items: Item[];
  tip: string;
};

export function recommend(store: Store, occasion: Occasion, season: Season): Suggestion[] {
  const fit = store.items.filter(
    (i) => (i.season === "all" || i.season === season || season === "all") &&
      (occasion === "casual" || i.occasion === occasion || i.occasion === "casual"),
  );
  const pick = (cat: Category) => fit.filter((i) => i.category === cat);
  const tops = pick("top");
  const bottoms = pick("bottom");
  const shoes = pick("shoes");
  const outers = pick("outerwear");
  const accs = pick("accessory");
  const out: Suggestion[] = [];
  const n = Math.max(tops.length, 1);
  for (let i = 0; i < Math.min(4, Math.max(tops.length, bottoms.length)); i++) {
    const items = [
      tops[i % Math.max(tops.length, 1)],
      bottoms[i % Math.max(bottoms.length, 1)],
      shoes[i % Math.max(shoes.length, 1)],
      season === "winter" || season === "monsoon" ? outers[i % Math.max(outers.length, 1)] : undefined,
      accs[i % Math.max(accs.length, 1)],
    ].filter((x): x is Item => Boolean(x));
    const unique = [...new Map(items.map((it) => [it.id, it])).values()];
    if (unique.length < 2) continue;
    const score = 72 + ((i * 7 + n) % 22);
    out.push({
      name: `${occasion[0].toUpperCase()}${occasion.slice(1)} look ${i + 1}`,
      score,
      items: unique,
      tip:
        occasion === "formal"
          ? "Keep colors quiet and shoes polished."
          : occasion === "workout"
            ? "Breathable fabric and a shoe you can actually move in."
            : season === "monsoon"
              ? "A light layer you can roll up if it clears."
              : "One favorite piece is enough. Don't over-accessorize.",
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

export const QUIZ = [
  { q: "Saturday morning, you reach for…", a: ["A clean shirt and chinos", "A hoodie and jeans", "Something patterned and loose"] },
  { q: "Your closet should feel…", a: ["Few pieces, all worn often", "A mix I can remix", "Full of statement items"] },
  { q: "Shoes you actually wear", a: ["Sneakers", "Derbies or loafers", "Sandals or boots"] },
];

export function quizResult(picks: number[]) {
  const score = picks.reduce((s, n) => s + n, 0);
  if (score <= 1) return { style: "minimal", line: "You like a small closet of pieces that all work together." };
  if (score <= 3) return { style: "smart casual", line: "Polished enough for college and interviews, easy enough for a bike ride." };
  return { style: "expressive", line: "You dress with personality. Mix one loud piece with quieter basics." };
}
