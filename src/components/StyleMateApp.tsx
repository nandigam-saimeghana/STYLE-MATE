import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CATEGORIES,
  OCCASIONS,
  SEASONS,
  QUIZ,
  loadStore,
  saveStore,
  recommend,
  quizResult,
  uid,
  type Category,
  type Item,
  type Look,
  type Occasion,
  type Season,
  type Store,
} from "@/lib/stylemate";

type Tab = "closet" | "looks" | "suggest" | "quiz";

const SWATCH: Record<string, string> = {
  white: "#f4f1ea",
  navy: "#1e3a5f",
  black: "#1c1915",
  olive: "#5c6b3a",
  blue: "#3d5a80",
  grey: "#8a847c",
  brown: "#7a4e2d",
  silver: "#c5c1b8",
  beige: "#d8c7a6",
  khaki: "#c2b280",
};

export function StyleMateApp() {
  const [store, setStore] = useState<Store | null>(null);
  const [tab, setTab] = useState<Tab>("closet");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [adding, setAdding] = useState(false);
  const [occasion, setOccasion] = useState<Occasion>("casual");
  const [season, setSeason] = useState<Season>("all");
  const [quizStep, setQuizStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [draft, setDraft] = useState({
    name: "",
    category: "top" as Category,
    color: "navy",
    season: "all" as Season,
    occasion: "casual" as Occasion,
    brand: "",
  });

  useEffect(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    if (store) saveStore(store);
  }, [store]);

  const items = store?.items ?? [];
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const suggestions = useMemo(
    () => (store ? recommend(store, occasion, season) : []),
    [store, occasion, season],
  );

  if (!store) {
    return <main className="p-8 text-muted">Opening your closet…</main>;
  }

  function update(next: Store) {
    setStore(next);
  }

  function addItem() {
    if (!draft.name.trim()) return;
    const item: Item = {
      id: uid(),
      name: draft.name.trim(),
      category: draft.category,
      color: draft.color.trim() || "black",
      season: draft.season,
      occasion: draft.occasion,
      brand: draft.brand.trim(),
      worn: 0,
      favorite: false,
    };
    update({ ...store!, items: [item, ...store!.items] });
    setDraft({ ...draft, name: "", brand: "" });
    setAdding(false);
  }

  function toggleFav(id: string) {
    update({
      ...store!,
      items: store!.items.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i)),
    });
  }

  function wear(id: string) {
    update({
      ...store!,
      items: store!.items.map((i) => (i.id === id ? { ...i, worn: i.worn + 1 } : i)),
    });
  }

  function removeItem(id: string) {
    update({
      ...store!,
      items: store!.items.filter((i) => i.id !== id),
      looks: store!.looks.map((l) => ({ ...l, itemIds: l.itemIds.filter((x) => x !== id) })),
    });
  }

  function saveLook(name: string, itemIds: string[], occ: Occasion) {
    const look: Look = { id: uid(), name, occasion: occ, itemIds, note: "" };
    update({ ...store!, looks: [look, ...store!.looks] });
    setTab("looks");
  }

  function removeLook(id: string) {
    update({ ...store!, looks: store!.looks.filter((l) => l.id !== id) });
  }

  const favs = items.filter((i) => i.favorite).length;
  const most = [...items].sort((a, b) => b.worn - a.worn)[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">StyleMate</p>
            <p className="text-sm text-muted">Personal closet and outfit planner</p>
          </div>
          <p className="hidden text-right text-sm text-muted sm:block">
            Style: <span className="font-medium text-fg">{store.style}</span>
          </p>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {(
            [
              ["closet", "Closet"],
              ["looks", "Looks"],
              ["suggest", "Suggest"],
              ["quiz", "Style quiz"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === id ? "bg-primary text-primary-fg" : "bg-surface-2 text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "closet" && (
          <section>
            <div className="mb-5 grid grid-cols-3 gap-3">
              <Stat label="Pieces" value={String(items.length)} />
              <Stat label="Favorites" value={String(favs)} />
              <Stat label="Most worn" value={most ? most.name : "—"} small />
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-full px-3 py-1.5 text-sm ${filter === "all" ? "bg-accent text-primary-fg" : "bg-surface text-fg border border-border"}`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`rounded-full px-3 py-1.5 text-sm capitalize ${filter === c ? "bg-accent text-primary-fg" : "bg-surface text-fg border border-border"}`}
                >
                  {c}
                </button>
              ))}
              <button onClick={() => setAdding((v) => !v)} className="ml-auto rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">
                {adding ? "Close" : "Add piece"}
              </button>
            </div>

            {adding && (
              <form
                className="mb-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem();
                }}
              >
                <Field label="Name">
                  <input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Linen shirt" required />
                </Field>
                <Field label="Brand">
                  <input className="field" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} placeholder="Optional" />
                </Field>
                <Field label="Category">
                  <select className="field" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Color">
                  <input className="field" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
                </Field>
                <Field label="Season">
                  <select className="field" value={draft.season} onChange={(e) => setDraft({ ...draft, season: e.target.value as Season })}>
                    {SEASONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Occasion">
                  <select className="field" value={draft.occasion} onChange={(e) => setDraft({ ...draft, occasion: e.target.value as Occasion })}>
                    {OCCASIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg">
                    Save to closet
                  </button>
                </div>
              </form>
            )}

            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
                Nothing in this category yet.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {visible.map((item) => (
                  <li key={item.id} className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
                    <span
                      className="mt-1 h-12 w-12 shrink-0 rounded-xl border border-border"
                      style={{ background: SWATCH[item.color] ?? "#c8bfb2" }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted capitalize">
                            {item.category} · {item.color}
                            {item.brand ? ` · ${item.brand}` : ""}
                          </p>
                        </div>
                        <button onClick={() => toggleFav(item.id)} className="text-sm text-primary" aria-label="Favorite">
                          {item.favorite ? "Saved" : "Save"}
                        </button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => wear(item.id)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium">
                          Worn {item.worn}
                        </button>
                        <button onClick={() => removeItem(item.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-danger">
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "looks" && (
          <section className="space-y-3">
            {store.looks.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
                No saved looks. Build one from Suggest.
              </p>
            )}
            {store.looks.map((look) => {
              const pieces = look.itemIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[];
              return (
                <article key={look.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl">{look.name}</h2>
                      <p className="text-sm capitalize text-muted">{look.occasion}</p>
                    </div>
                    <button onClick={() => removeLook(look.id)} className="text-sm text-danger">
                      Delete
                    </button>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {pieces.map((p) => (
                      <li key={p.id} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </section>
        )}

        {tab === "suggest" && (
          <section>
            <div className="mb-4 flex flex-wrap gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-muted">Occasion</span>
                <select className="field" value={occasion} onChange={(e) => setOccasion(e.target.value as Occasion)}>
                  {OCCASIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-muted">Season</span>
                <select className="field" value={season} onChange={(e) => setSeason(e.target.value as Season)}>
                  {SEASONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            </div>
            {suggestions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
                Add a top and a bottom so StyleMate can pair them.
              </p>
            ) : (
              <ul className="grid gap-3">
                {suggestions.map((s) => (
                  <li key={s.name} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-xl">{s.name}</h2>
                      <span className="text-sm font-medium text-accent">{s.score} match</span>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {s.items.map((p) => (
                        <li key={p.id} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                          {p.name}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm text-muted">{s.tip}</p>
                    <button
                      className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-fg"
                      onClick={() => saveLook(s.name, s.items.map((i) => i.id), occasion)}
                    >
                      Save this look
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "quiz" && (
          <section className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-5">
            {quizStep < QUIZ.length ? (
              <>
                <p className="text-sm text-muted">
                  Question {quizStep + 1} of {QUIZ.length}
                </p>
                <h2 className="mt-1 font-display text-2xl">{QUIZ[quizStep].q}</h2>
                <div className="mt-4 grid gap-2">
                  {QUIZ[quizStep].a.map((answer, idx) => (
                    <button
                      key={answer}
                      className="rounded-xl border border-border bg-bg px-4 py-3 text-left text-sm"
                      onClick={() => {
                        const next = [...picks, idx];
                        setPicks(next);
                        setQuizStep(quizStep + 1);
                        if (quizStep + 1 === QUIZ.length) {
                          const result = quizResult(next);
                          update({ ...store, style: result.style });
                        }
                      }}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">Your read</p>
                <h2 className="mt-1 font-display text-3xl capitalize">{store.style}</h2>
                <p className="mt-2 text-muted">{quizResult(picks).line}</p>
                <button
                  className="mt-4 rounded-xl bg-surface-2 px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    setQuizStep(0);
                    setPicks([]);
                  }}
                >
                  Retake
                </button>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-medium ${small ? "truncate text-sm" : "text-2xl font-display"}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}
