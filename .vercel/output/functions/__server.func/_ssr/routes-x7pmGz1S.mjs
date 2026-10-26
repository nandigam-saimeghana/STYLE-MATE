import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-x7pmGz1S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "stylemate-v1";
var SEED = {
	style: "smart casual",
	items: [
		{
			id: "1",
			name: "White tee",
			category: "top",
			color: "white",
			season: "all",
			occasion: "casual",
			brand: "Uniqlo",
			worn: 8,
			favorite: true
		},
		{
			id: "2",
			name: "Navy shirt",
			category: "top",
			color: "navy",
			season: "all",
			occasion: "work",
			brand: "Van Heusen",
			worn: 5,
			favorite: false
		},
		{
			id: "3",
			name: "Black sweater",
			category: "top",
			color: "black",
			season: "winter",
			occasion: "casual",
			brand: "H&M",
			worn: 3,
			favorite: false
		},
		{
			id: "4",
			name: "Olive hoodie",
			category: "top",
			color: "olive",
			season: "monsoon",
			occasion: "casual",
			brand: "Nike",
			worn: 4,
			favorite: true
		},
		{
			id: "5",
			name: "Blue jeans",
			category: "bottom",
			color: "blue",
			season: "all",
			occasion: "casual",
			brand: "Levi's",
			worn: 11,
			favorite: true
		},
		{
			id: "6",
			name: "Black chinos",
			category: "bottom",
			color: "black",
			season: "all",
			occasion: "work",
			brand: "Gap",
			worn: 6,
			favorite: false
		},
		{
			id: "7",
			name: "Grey joggers",
			category: "bottom",
			color: "grey",
			season: "all",
			occasion: "workout",
			brand: "Adidas",
			worn: 4,
			favorite: false
		},
		{
			id: "8",
			name: "White sneakers",
			category: "shoes",
			color: "white",
			season: "all",
			occasion: "casual",
			brand: "Adidas",
			worn: 14,
			favorite: true
		},
		{
			id: "9",
			name: "Black derbies",
			category: "shoes",
			color: "black",
			season: "all",
			occasion: "formal",
			brand: "Clarks",
			worn: 2,
			favorite: false
		},
		{
			id: "10",
			name: "Denim jacket",
			category: "outerwear",
			color: "blue",
			season: "monsoon",
			occasion: "casual",
			brand: "Levi's",
			worn: 3,
			favorite: false
		},
		{
			id: "11",
			name: "Black blazer",
			category: "outerwear",
			color: "black",
			season: "all",
			occasion: "formal",
			brand: "Zara",
			worn: 2,
			favorite: true
		},
		{
			id: "12",
			name: "Brown belt",
			category: "accessory",
			color: "brown",
			season: "all",
			occasion: "casual",
			brand: "Local",
			worn: 7,
			favorite: false
		},
		{
			id: "13",
			name: "Silver watch",
			category: "accessory",
			color: "silver",
			season: "all",
			occasion: "work",
			brand: "Casio",
			worn: 9,
			favorite: false
		}
	],
	looks: [{
		id: "l1",
		name: "Campus day",
		occasion: "casual",
		itemIds: [
			"1",
			"5",
			"8"
		],
		note: "Default lecture look"
	}, {
		id: "l2",
		name: "Interview",
		occasion: "formal",
		itemIds: [
			"2",
			"6",
			"9",
			"11"
		],
		note: "Keep it sharp"
	}]
};
function loadStore() {
	if (typeof window === "undefined") return SEED;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return structuredClone(SEED);
		const parsed = JSON.parse(raw);
		if (!parsed.items || !parsed.looks) return structuredClone(SEED);
		return parsed;
	} catch {
		return structuredClone(SEED);
	}
}
function saveStore(store) {
	localStorage.setItem(KEY, JSON.stringify(store));
}
function uid() {
	return Math.random().toString(36).slice(2, 10);
}
var CATEGORIES = [
	"top",
	"bottom",
	"shoes",
	"outerwear",
	"accessory"
];
var OCCASIONS = [
	"casual",
	"work",
	"party",
	"formal",
	"workout"
];
var SEASONS = [
	"all",
	"summer",
	"winter",
	"monsoon"
];
function recommend(store, occasion, season) {
	const fit = store.items.filter((i) => (i.season === "all" || i.season === season || season === "all") && (occasion === "casual" || i.occasion === occasion || i.occasion === "casual"));
	const pick = (cat) => fit.filter((i) => i.category === cat);
	const tops = pick("top");
	const bottoms = pick("bottom");
	const shoes = pick("shoes");
	const outers = pick("outerwear");
	const accs = pick("accessory");
	const out = [];
	const n = Math.max(tops.length, 1);
	for (let i = 0; i < Math.min(4, Math.max(tops.length, bottoms.length)); i++) {
		const items = [
			tops[i % Math.max(tops.length, 1)],
			bottoms[i % Math.max(bottoms.length, 1)],
			shoes[i % Math.max(shoes.length, 1)],
			season === "winter" || season === "monsoon" ? outers[i % Math.max(outers.length, 1)] : void 0,
			accs[i % Math.max(accs.length, 1)]
		].filter((x) => Boolean(x));
		const unique = [...new Map(items.map((it) => [it.id, it])).values()];
		if (unique.length < 2) continue;
		const score = 72 + (i * 7 + n) % 22;
		out.push({
			name: `${occasion[0].toUpperCase()}${occasion.slice(1)} look ${i + 1}`,
			score,
			items: unique,
			tip: occasion === "formal" ? "Keep colors quiet and shoes polished." : occasion === "workout" ? "Breathable fabric and a shoe you can actually move in." : season === "monsoon" ? "A light layer you can roll up if it clears." : "One favorite piece is enough. Don't over-accessorize."
		});
	}
	return out.sort((a, b) => b.score - a.score);
}
var QUIZ = [
	{
		q: "Saturday morning, you reach for…",
		a: [
			"A clean shirt and chinos",
			"A hoodie and jeans",
			"Something patterned and loose"
		]
	},
	{
		q: "Your closet should feel…",
		a: [
			"Few pieces, all worn often",
			"A mix I can remix",
			"Full of statement items"
		]
	},
	{
		q: "Shoes you actually wear",
		a: [
			"Sneakers",
			"Derbies or loafers",
			"Sandals or boots"
		]
	}
];
function quizResult(picks) {
	const score = picks.reduce((s, n) => s + n, 0);
	if (score <= 1) return {
		style: "minimal",
		line: "You like a small closet of pieces that all work together."
	};
	if (score <= 3) return {
		style: "smart casual",
		line: "Polished enough for college and interviews, easy enough for a bike ride."
	};
	return {
		style: "expressive",
		line: "You dress with personality. Mix one loud piece with quieter basics."
	};
}
var SWATCH = {
	white: "#f4f1ea",
	navy: "#1e3a5f",
	black: "#1c1915",
	olive: "#5c6b3a",
	blue: "#3d5a80",
	grey: "#8a847c",
	brown: "#7a4e2d",
	silver: "#c5c1b8",
	beige: "#d8c7a6",
	khaki: "#c2b280"
};
function StyleMateApp() {
	const [store, setStore] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("closet");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [occasion, setOccasion] = (0, import_react.useState)("casual");
	const [season, setSeason] = (0, import_react.useState)("all");
	const [quizStep, setQuizStep] = (0, import_react.useState)(0);
	const [picks, setPicks] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)({
		name: "",
		category: "top",
		color: "navy",
		season: "all",
		occasion: "casual",
		brand: ""
	});
	(0, import_react.useEffect)(() => {
		setStore(loadStore());
	}, []);
	(0, import_react.useEffect)(() => {
		if (store) saveStore(store);
	}, [store]);
	const items = store?.items ?? [];
	const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
	const suggestions = (0, import_react.useMemo)(() => store ? recommend(store, occasion, season) : [], [
		store,
		occasion,
		season
	]);
	if (!store) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "p-8 text-muted",
		children: "Opening your closet…"
	});
	function update(next) {
		setStore(next);
	}
	function addItem() {
		if (!draft.name.trim()) return;
		const item = {
			id: uid(),
			name: draft.name.trim(),
			category: draft.category,
			color: draft.color.trim() || "black",
			season: draft.season,
			occasion: draft.occasion,
			brand: draft.brand.trim(),
			worn: 0,
			favorite: false
		};
		update({
			...store,
			items: [item, ...store.items]
		});
		setDraft({
			...draft,
			name: "",
			brand: ""
		});
		setAdding(false);
	}
	function toggleFav(id) {
		update({
			...store,
			items: store.items.map((i) => i.id === id ? {
				...i,
				favorite: !i.favorite
			} : i)
		});
	}
	function wear(id) {
		update({
			...store,
			items: store.items.map((i) => i.id === id ? {
				...i,
				worn: i.worn + 1
			} : i)
		});
	}
	function removeItem(id) {
		update({
			...store,
			items: store.items.filter((i) => i.id !== id),
			looks: store.looks.map((l) => ({
				...l,
				itemIds: l.itemIds.filter((x) => x !== id)
			}))
		});
	}
	function saveLook(name, itemIds, occ) {
		const look = {
			id: uid(),
			name,
			occasion: occ,
			itemIds,
			note: ""
		};
		update({
			...store,
			looks: [look, ...store.looks]
		});
		setTab("looks");
	}
	function removeLook(id) {
		update({
			...store,
			looks: store.looks.filter((l) => l.id !== id)
		});
	}
	const favs = items.filter((i) => i.favorite).length;
	const most = [...items].sort((a, b) => b.worn - a.worn)[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-border bg-surface",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-semibold tracking-tight",
					children: "StyleMate"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Personal closet and outfit planner"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "hidden text-right text-sm text-muted sm:block",
					children: ["Style: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-fg",
						children: store.style
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3",
				children: [
					["closet", "Closet"],
					["looks", "Looks"],
					["suggest", "Suggest"],
					["quiz", "Style quiz"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(id),
					className: `rounded-full px-4 py-2 text-sm font-medium ${tab === id ? "bg-primary text-primary-fg" : "bg-surface-2 text-fg"}`,
					children: label
				}, id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-5xl px-4 py-6",
			children: [
				tab === "closet" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Pieces",
								value: String(items.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Favorites",
								value: String(favs)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Most worn",
								value: most ? most.name : "—",
								small: true
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setFilter("all"),
								className: `rounded-full px-3 py-1.5 text-sm ${filter === "all" ? "bg-accent text-primary-fg" : "bg-surface text-fg border border-border"}`,
								children: "All"
							}),
							CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setFilter(c),
								className: `rounded-full px-3 py-1.5 text-sm capitalize ${filter === c ? "bg-accent text-primary-fg" : "bg-surface text-fg border border-border"}`,
								children: c
							}, c)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setAdding((v) => !v),
								className: "ml-auto rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg",
								children: adding ? "Close" : "Add piece"
							})
						]
					}),
					adding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mb-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2",
						onSubmit: (e) => {
							e.preventDefault();
							addItem();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									value: draft.name,
									onChange: (e) => setDraft({
										...draft,
										name: e.target.value
									}),
									placeholder: "Linen shirt",
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Brand",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									value: draft.brand,
									onChange: (e) => setDraft({
										...draft,
										brand: e.target.value
									}),
									placeholder: "Optional"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "field",
									value: draft.category,
									onChange: (e) => setDraft({
										...draft,
										category: e.target.value
									}),
									children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Color",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									value: draft.color,
									onChange: (e) => setDraft({
										...draft,
										color: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Season",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "field",
									value: draft.season,
									onChange: (e) => setDraft({
										...draft,
										season: e.target.value
									}),
									children: SEASONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Occasion",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "field",
									value: draft.occasion,
									onChange: (e) => setDraft({
										...draft,
										occasion: e.target.value
									}),
									children: OCCASIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg",
									children: "Save to closet"
								})
							})
						]
					}),
					visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted",
						children: "Nothing in this category yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-3 sm:grid-cols-2",
						children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3 rounded-2xl border border-border bg-surface p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 h-12 w-12 shrink-0 rounded-xl border border-border",
								style: { background: SWATCH[item.color] ?? "#c8bfb2" },
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: item.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted capitalize",
										children: [
											item.category,
											" · ",
											item.color,
											item.brand ? ` · ${item.brand}` : ""
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => toggleFav(item.id),
										className: "text-sm text-primary",
										"aria-label": "Favorite",
										children: item.favorite ? "Saved" : "Save"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => wear(item.id),
										className: "rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium",
										children: ["Worn ", item.worn]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removeItem(item.id),
										className: "rounded-lg px-3 py-1.5 text-xs font-medium text-danger",
										children: "Remove"
									})]
								})]
							})]
						}, item.id))
					})
				] }),
				tab === "looks" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [store.looks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted",
						children: "No saved looks. Build one from Suggest."
					}), store.looks.map((look) => {
						const pieces = look.itemIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl border border-border bg-surface p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl",
									children: look.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm capitalize text-muted",
									children: look.occasion
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => removeLook(look.id),
									className: "text-sm text-danger",
									children: "Delete"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 flex flex-wrap gap-2",
								children: pieces.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-full bg-surface-2 px-3 py-1 text-sm",
									children: p.name
								}, p.id))
							})]
						}, look.id);
					})]
				}),
				tab === "suggest" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-muted",
							children: "Occasion"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							value: occasion,
							onChange: (e) => setOccasion(e.target.value),
							children: OCCASIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: o }, o))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-muted",
							children: "Season"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "field",
							value: season,
							onChange: (e) => setSeason(e.target.value),
							children: SEASONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: o }, o))
						})]
					})]
				}), suggestions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted",
					children: "Add a top and a bottom so StyleMate can pair them."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3",
					children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl border border-border bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl",
									children: s.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-medium text-accent",
									children: [s.score, " match"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 flex flex-wrap gap-2",
								children: s.items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-full bg-surface-2 px-3 py-1 text-sm",
									children: p.name
								}, p.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: s.tip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-fg",
								onClick: () => saveLook(s.name, s.items.map((i) => i.id), occasion),
								children: "Save this look"
							})
						]
					}, s.name))
				})] }),
				tab === "quiz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mx-auto max-w-xl rounded-2xl border border-border bg-surface p-5",
					children: quizStep < QUIZ.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Question ",
								quizStep + 1,
								" of ",
								QUIZ.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-2xl",
							children: QUIZ[quizStep].q
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-2",
							children: QUIZ[quizStep].a.map((answer, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "rounded-xl border border-border bg-bg px-4 py-3 text-left text-sm",
								onClick: () => {
									const next = [...picks, idx];
									setPicks(next);
									setQuizStep(quizStep + 1);
									if (quizStep + 1 === QUIZ.length) {
										const result = quizResult(next);
										update({
											...store,
											style: result.style
										});
									}
								},
								children: answer
							}, answer))
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Your read"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-3xl capitalize",
							children: store.style
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: quizResult(picks).line
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "mt-4 rounded-xl bg-surface-2 px-4 py-2 text-sm font-medium",
							onClick: () => {
								setQuizStep(0);
								setPicks([]);
							},
							children: "Retake"
						})
					] })
				})
			]
		})]
	});
}
function Stat({ label, value, small }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-surface px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 font-medium ${small ? "truncate text-sm" : "text-2xl font-display"}`,
			children: value
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-muted",
			children: label
		}), children]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleMateApp, {});
}
//#endregion
export { Home as component };
