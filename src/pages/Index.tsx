import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ── Данные ─────────────────────────────────────────────────────────────────

const SOUNDS = [
  {
    id: "rain_roof",
    label: "Дождь по крыше",
    emoji: "🌧",
    color: "#8fb8d0",
    url: "https://cdn.freesound.org/previews/612/612026_1648170-lq.mp3",
  },
  {
    id: "fire",
    label: "Костёр",
    emoji: "🔥",
    color: "#d4956a",
    url: "https://cdn.freesound.org/previews/336/336091_5865517-lq.mp3",
  },
  {
    id: "waves",
    label: "Прибой",
    emoji: "🌊",
    color: "#7ab8c4",
    url: "https://cdn.freesound.org/previews/371/371277_6687700-lq.mp3",
  },
  {
    id: "forest",
    label: "Лес",
    emoji: "🌿",
    color: "#7ab88a",
    url: "https://cdn.freesound.org/previews/496/496846_11235861-lq.mp3",
  },
  {
    id: "crickets",
    label: "Сверчки",
    emoji: "🦗",
    color: "#a8b87a",
    url: "https://cdn.freesound.org/previews/484/484039_10574267-lq.mp3",
  },
  {
    id: "birds",
    label: "Птицы",
    emoji: "🐦",
    color: "#c4a87a",
    url: "https://cdn.freesound.org/previews/476/476848_9676595-lq.mp3",
  },
  {
    id: "wind",
    label: "Ветер",
    emoji: "🍃",
    color: "#a0b8c4",
    url: "https://cdn.freesound.org/previews/476/476562_9676595-lq.mp3",
  },
  {
    id: "rain_forest",
    label: "Дождь в лесу",
    emoji: "🌲",
    color: "#6aa888",
    url: "https://cdn.freesound.org/previews/346/346170_5450487-lq.mp3",
  },
];

const QUOTES = [
  { id: 1, text: "Покой — это не отсутствие шума, а присутствие тишины внутри.", author: "" },
  { id: 2, text: "Каждый вдох — это новое начало. Каждый выдох — отпускание.", author: "" },
  { id: 3, text: "Природа не торопится, и всё же всё успевает.", author: "Лао-цзы" },
  { id: 4, text: "В тишине больше мудрости, чем во всех книгах мира.", author: "" },
  { id: 5, text: "Будь как вода: мягкой — для жизни, твёрдой — перед препятствием.", author: "Лао-цзы" },
  { id: 6, text: "Счастье — это не место, куда ты придёшь. Это способ идти.", author: "" },
  { id: 7, text: "Позволь мыслям проплыть мимо, как облака по небу.", author: "" },
  { id: 8, text: "Самый глубокий покой рождается в принятии настоящего момента.", author: "Экхарт Толле" },
  { id: 9, text: "Дерево не борется с ветром. Оно просто качается и остаётся собой.", author: "" },
  { id: 10, text: "Только в тишине слышен голос души.", author: "" },
  { id: 11, text: "Замедлись. Ты уже там, где нужно быть.", author: "" },
  { id: 12, text: "Луна не торопится освещать путь. Она просто светит.", author: "" },
];

// ── Хук избранного ─────────────────────────────────────────────────────────

function useFavorites(key: string) {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  });

  const toggle = useCallback((id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  const isFav = (id: number) => favorites.includes(id);
  return { favorites, toggle, isFav };
}

// ── Главная ────────────────────────────────────────────────────────────────

function HomePage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Тихая ночь" :
    hour < 12 ? "Доброе утро" :
    hour < 17 ? "Светлый день" :
    hour < 21 ? "Тёплый вечер" : "Тихая ночь";

  const cards = [
    { emoji: "🌅", label: "Рассвет", quote: "Каждый рассвет — шанс начать заново" },
    { emoji: "☀️", label: "День", quote: "Настоящий момент всегда достаточен" },
    { emoji: "🌇", label: "Закат", quote: "Отпусти всё лишнее вместе с уходящим днём" },
    { emoji: "🌙", label: "Ночь", quote: "В темноте рождаются самые глубокие мысли" },
  ];

  return (
    <div className="px-5 py-8 space-y-10 animate-fade-up">
      <div className="text-center pt-4 space-y-3">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground/60">
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display text-5xl font-light text-foreground/80 italic">
          {greeting}
        </h1>
        <p className="font-body text-sm text-muted-foreground/70 font-light">
          Позволь себе замедлиться
        </p>
      </div>

      {/* Дыхательный круг */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-sage/10 animate-breathe" />
          <div className="absolute w-20 h-20 rounded-full bg-sage/20 animate-breathe" style={{ animationDelay: "0.5s" }} />
          <div className="absolute w-10 h-10 rounded-full bg-sage/40 animate-breathe" style={{ animationDelay: "1s" }} />
        </div>
        <p className="font-display text-sm text-muted-foreground italic">вдох · пауза · выдох</p>
      </div>

      {/* Карточки */}
      <div>
        <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground/50 mb-4 text-center">
          Настроение момента
        </p>
        <div className="grid grid-cols-2 gap-3">
          {cards.map(c => (
            <div key={c.label} className="glass rounded-2xl p-4 space-y-2">
              <span className="text-2xl">{c.emoji}</span>
              <p className="font-display text-base font-medium text-foreground/70">{c.label}</p>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{c.quote}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 text-center space-y-2">
        <p className="font-display text-lg italic text-foreground/70">
          "Природа не торопится, и всё же всё успевает."
        </p>
        <p className="font-body text-xs text-muted-foreground">— Лао-цзы</p>
      </div>
    </div>
  );
}

// ── Звуки ──────────────────────────────────────────────────────────────────

function SoundsPage() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>(
    Object.fromEntries(SOUNDS.map(s => [s.id, 0.7]))
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleSound = useCallback(async (sound: typeof SOUNDS[0]) => {
    const { id, url } = sound;
    if (!audioRefs.current[id]) {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = volumes[id];
      audioRefs.current[id] = audio;
    }
    const audio = audioRefs.current[id];

    if (active[id]) {
      audio.pause();
      setActive(prev => ({ ...prev, [id]: false }));
    } else {
      setLoading(prev => ({ ...prev, [id]: true }));
      try {
        await audio.play();
        setActive(prev => ({ ...prev, [id]: true }));
      } catch (_) {
        // autoplay policy
      }
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [active, volumes]);

  const changeVolume = useCallback((id: string, vol: number) => {
    setVolumes(prev => ({ ...prev, [id]: vol }));
    if (audioRefs.current[id]) audioRefs.current[id].volume = vol;
  }, []);

  const stopAll = () => {
    SOUNDS.forEach(s => { audioRefs.current[s.id]?.pause(); });
    setActive({});
  };

  useEffect(() => {
    return () => { Object.values(audioRefs.current).forEach(a => { a.pause(); a.src = ""; }); };
  }, []);

  const activeCount = Object.values(active).filter(Boolean).length;

  return (
    <div className="px-5 py-8 space-y-6 animate-fade-up">
      <div className="text-center space-y-1">
        <h2 className="font-display text-4xl font-light italic text-foreground/80">Звуки природы</h2>
        {activeCount > 0 ? (
          <p className="font-body text-xs" style={{ color: "#7ab88a" }}>
            {activeCount} {activeCount === 1 ? "звук" : activeCount < 5 ? "звука" : "звуков"} играет
          </p>
        ) : (
          <p className="font-body text-xs text-muted-foreground/60">нажми, чтобы включить</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SOUNDS.map((sound, i) => {
          const isActive = active[sound.id];
          const isLoad = loading[sound.id];
          return (
            <div
              key={sound.id}
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "forwards" }}
            >
              <div
                className="glass rounded-2xl p-4 transition-all duration-300"
                style={isActive ? { boxShadow: `0 4px 24px ${sound.color}35` } : {}}
              >
                <button
                  onClick={() => toggleSound(sound)}
                  className="w-full flex flex-col items-center gap-2 mb-3"
                >
                  <div
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                    style={{ background: isActive ? `${sound.color}25` : "rgba(0,0,0,0.04)" }}
                  >
                    {isActive && <div className="sound-ripple" />}
                    {isLoad
                      ? <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                      : <span>{sound.emoji}</span>
                    }
                  </div>
                  <span className="font-body text-xs text-foreground/70 text-center leading-tight">
                    {sound.label}
                  </span>
                </button>

                <input
                  type="range" min={0} max={1} step={0.01}
                  value={volumes[sound.id]}
                  onChange={e => changeVolume(sound.id, Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: sound.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {activeCount > 0 && (
        <button
          onClick={stopAll}
          className="w-full glass rounded-2xl py-3 font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          Остановить всё
        </button>
      )}
    </div>
  );
}

// ── Фразы ──────────────────────────────────────────────────────────────────

function QuotesPage() {
  const { toggle, isFav } = useFavorites("fav_quotes");
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent(p => (p + 1) % QUOTES.length);
  const prev = () => setCurrent(p => (p - 1 + QUOTES.length) % QUOTES.length);
  const quote = QUOTES[current];

  return (
    <div className="px-5 py-8 space-y-6 animate-fade-up">
      <div className="text-center space-y-1">
        <h2 className="font-display text-4xl font-light italic text-foreground/80">Мудрые слова</h2>
        <p className="font-body text-xs text-muted-foreground/60">слова, которые успокаивают</p>
      </div>

      <div className="glass rounded-3xl p-8 min-h-[200px] flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <span className="font-display text-5xl leading-none" style={{ color: "#7ab88a", opacity: 0.4 }}>"</span>
          <p className="font-display text-xl font-light italic text-foreground/80 leading-relaxed">
            {quote.text}
          </p>
          {quote.author && (
            <p className="font-body text-xs text-muted-foreground text-right">— {quote.author}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center transition-opacity hover:opacity-70">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <div className="flex items-center gap-1">
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5" : "w-1.5 h-1.5 bg-muted-foreground/25"}`}
                style={i === current ? { width: 20, height: 6, background: "#7ab88a" } : {}}
              />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full glass flex items-center justify-center transition-opacity hover:opacity-70">
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => toggle(quote.id)}
          className="flex-1 glass rounded-2xl py-3 flex items-center justify-center gap-2 font-body text-sm transition-all duration-200"
          style={{ color: isFav(quote.id) ? "#e07090" : "#a0a0a0" }}
        >
          <Icon name="Heart" size={16} />
          {isFav(quote.id) ? "В избранном" : "В избранное"}
        </button>
        <button
          onClick={next}
          className="flex-1 glass rounded-2xl py-3 flex items-center justify-center gap-2 font-body text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          <Icon name="Shuffle" size={16} />
          Следующая
        </button>
      </div>

      <div className="space-y-3">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground/50">Все фразы</p>
        {QUOTES.map((q, i) => (
          <div
            key={q.id} onClick={() => setCurrent(i)}
            className={`glass rounded-2xl p-4 cursor-pointer transition-all duration-200 ${i === current ? "" : "opacity-60"}`}
            style={i === current ? { boxShadow: "0 0 0 1px rgba(122,184,138,0.3)" } : {}}
          >
            <p className="font-display text-sm italic text-foreground/75 leading-relaxed">"{q.text}"</p>
            {q.author && <p className="font-body text-xs text-muted-foreground/60 mt-1">— {q.author}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Избранное ──────────────────────────────────────────────────────────────

function FavoritesPage() {
  const { favorites } = useFavorites("fav_quotes");
  const favQuotes = QUOTES.filter(q => favorites.includes(q.id));

  return (
    <div className="px-5 py-8 space-y-6 animate-fade-up">
      <div className="text-center space-y-1">
        <h2 className="font-display text-4xl font-light italic text-foreground/80">Избранное</h2>
        <p className="font-body text-xs text-muted-foreground/60">то, что осталось в сердце</p>
      </div>

      {favQuotes.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center space-y-4">
          <span className="text-5xl block animate-float">🌿</span>
          <p className="font-display text-xl italic text-foreground/50">Пока здесь пусто</p>
          <p className="font-body text-sm text-muted-foreground/50">
            Добавляй понравившиеся фразы через раздел «Фразы»
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground/50">
            Фразы · {favQuotes.length}
          </p>
          {favQuotes.map(q => (
            <div key={q.id} className="glass rounded-2xl p-5 space-y-2">
              <p className="font-display text-base italic text-foreground/75 leading-relaxed">"{q.text}"</p>
              {q.author && <p className="font-body text-xs text-muted-foreground/60">— {q.author}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

type Tab = "home" | "sounds" | "quotes" | "favorites";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Сад", icon: "Leaf" },
  { id: "sounds", label: "Звуки", icon: "Music2" },
  { id: "quotes", label: "Фразы", icon: "Quote" },
  { id: "favorites", label: "Сохранено", icon: "Heart" },
];

const BG: Record<Tab, string> = {
  home: "from-[#f5f0e8] via-[#ede8e0] to-[#e8f0eb]",
  sounds: "from-[#e8f0ed] via-[#edf5e8] to-[#e8ecf5]",
  quotes: "from-[#f0ede8] via-[#ebe8f5] to-[#e8f5ee]",
  favorites: "from-[#f5e8ee] via-[#ede8e8] to-[#e8edf5]",
};

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className={`min-h-screen bg-gradient-to-br ${BG[tab]} transition-all duration-700`}>
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full animate-float" style={{ background: "rgba(122,184,138,0.06)" }} />
        <div className="absolute bottom-[15%] left-[-8%] w-56 h-56 rounded-full animate-float" style={{ background: "rgba(212,149,106,0.05)", animationDelay: "2s" }} />
        <div className="absolute top-[40%] right-[-5%] w-40 h-40 rounded-full animate-float" style={{ background: "rgba(122,184,196,0.05)", animationDelay: "4s" }} />
      </div>

      <div className="relative max-w-md mx-auto pb-28" style={{ zIndex: 1 }}>
        {tab === "home" && <HomePage />}
        {tab === "sounds" && <SoundsPage />}
        {tab === "quotes" && <QuotesPage />}
        {tab === "favorites" && <FavoritesPage />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0" style={{ zIndex: 50 }}>
        <div className="max-w-md mx-auto px-4 pb-4">
          <div
            className="glass rounded-3xl px-2 py-2 flex items-center justify-around"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
          >
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 ${
                  tab === t.id ? "bg-white/60 shadow-sm" : "opacity-45"
                }`}
              >
                <Icon
                  name={t.icon}
                  size={tab === t.id ? 20 : 18}
                  style={{ color: tab === t.id ? "#7ab88a" : "#888" }}
                />
                <span
                  className="font-body text-[10px] tracking-wide"
                  style={{ color: tab === t.id ? "#555" : "#999" }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
