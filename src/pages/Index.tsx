import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const CDN = "https://cdn.poehali.dev/projects/e76afcce-b052-4e09-b5ef-d15146bac7de/files";

const SOUNDS = [
  {
    id: "rain_roof",
    label: "Дождь по крыше",
    img: `${CDN}/ea9d4382-977c-4550-b8ff-7f9e60c54d25.jpg`,
    color: "#8fb8d0",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3",
      "https://www.soundjay.com/nature/rain-01.mp3",
    ],
  },
  {
    id: "fire",
    label: "Костёр",
    img: `${CDN}/4043917e-7ddb-4efa-8907-f10cb5b43d2a.jpg`,
    color: "#d4956a",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/1399/1399-preview.mp3",
    ],
  },
  {
    id: "waves",
    label: "Прибой",
    img: `${CDN}/89f731ab-a059-4a4a-8aa2-e026c781f727.jpg`,
    color: "#7ab8c4",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2516/2516-preview.mp3",
    ],
  },
  {
    id: "forest",
    label: "Лес",
    img: `${CDN}/edb816aa-7b73-478b-9e18-2c71de591d3b.jpg`,
    color: "#7ab88a",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2517/2517-preview.mp3",
    ],
  },
  {
    id: "crickets",
    label: "Сверчки",
    img: `${CDN}/3f99d082-fc42-4ee0-9267-275d24830503.jpg`,
    color: "#a8b87a",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2520/2520-preview.mp3",
    ],
  },
  {
    id: "birds",
    label: "Птицы",
    img: `${CDN}/2be4a871-044f-473d-88b3-1cbeab247d18.jpg`,
    color: "#c4a87a",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2518/2518-preview.mp3",
    ],
  },
  {
    id: "wind",
    label: "Ветер",
    img: `${CDN}/4dafa7bf-6ccd-4127-aafd-48418133682b.jpg`,
    color: "#a0b8c4",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2519/2519-preview.mp3",
    ],
  },
  {
    id: "rain_forest",
    label: "Дождь в лесу",
    img: `${CDN}/3399eea0-b201-49e7-a54f-ce6f3f3af54c.jpg`,
    color: "#6aa888",
    urls: [
      "https://assets.mixkit.co/active_storage/sfx/2524/2524-preview.mp3",
    ],
  },
];

// Web Audio шум как fallback когда URL недоступны
function makeNoiseNode(ctx: AudioContext, type: "rain" | "fire" | "wind") {
  const bufferSize = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const filt = ctx.createBiquadFilter();
  if (type === "rain") { filt.type = "bandpass"; filt.frequency.value = 3000; filt.Q.value = 0.4; }
  else if (type === "fire") { filt.type = "lowpass"; filt.frequency.value = 500; }
  else { filt.type = "lowpass"; filt.frequency.value = 250; }

  src.connect(filt);
  return { src, filt };
}

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

// ── Анимация травы ─────────────────────────────────────────────────────────
function GrassAnimation() {
  const blades = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      left: (i / 19) * 100,
      height: 24 + Math.random() * 30,
      delay: (i * 0.15) % 2.5,
      dur: 2.0 + Math.random() * 1.2,
      width: Math.random() > 0.5 ? 2 : 1.5,
      green: 140 + Math.floor(Math.random() * 20),
      light: 42 + Math.floor(Math.random() * 16),
    }))
  );
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 52, marginBottom: -2 }}>
      {blades.current.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${b.left}%`,
            width: b.width,
            height: b.height,
            background: `hsl(${b.green} 28% ${b.light}% / 0.65)`,
            transformOrigin: "bottom center",
            animation: `grassWave ${b.dur}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Анимация воды ──────────────────────────────────────────────────────────
function WaterAnimation() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: 40, background: "linear-gradient(180deg, #b8dce8 0%, #7ab8c4 100%)" }}
    >
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            height: 2,
            width: `${55 + i * 15}%`,
            background: "rgba(255,255,255,0.3)",
            top: `${15 + i * 20}%`,
            left: 0,
            animation: `waterFlow ${2.8 + i * 0.8}s linear ${i * 0.6}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Главная ────────────────────────────────────────────────────────────────
function HomePage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Тихая ночь" :
    hour < 12 ? "Доброе утро" :
    hour < 17 ? "Светлый день" :
    hour < 21 ? "Тёплый вечер" : "Тихая ночь";

  const moments = [
    { img: `${CDN}/e0a56e22-4638-483d-8d24-dd1a0f7503c9.jpg`, label: "Рассвет", quote: "Каждый рассвет — шанс начать заново" },
    { img: `${CDN}/89f731ab-a059-4a4a-8aa2-e026c781f727.jpg`, label: "Прибой", quote: "Волны смывают всё лишнее" },
    { img: `${CDN}/edb816aa-7b73-478b-9e18-2c71de591d3b.jpg`, label: "Лес", quote: "В лесу время течёт иначе" },
    { img: `${CDN}/2be4a871-044f-473d-88b3-1cbeab247d18.jpg`, label: "Весна", quote: "Всё расцветает в своё время" },
  ];

  return (
    <div className="px-5 py-8 space-y-8 animate-fade-up">
      <div className="text-center pt-4 space-y-2">
        <p className="font-body text-xs tracking-[0.25em] uppercase" style={{ color: "#b0baa8" }}>
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display text-5xl font-light italic" style={{ color: "#5a6e5c" }}>
          {greeting}
        </h1>
        <p className="font-body text-sm font-light" style={{ color: "#9aaa8e" }}>
          Позволь себе замедлиться
        </p>
      </div>

      {/* Дыхательный круг */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          <div className="absolute rounded-full animate-breathe" style={{ width: 120, height: 120, background: "rgba(122,184,138,0.09)" }} />
          <div className="absolute rounded-full animate-breathe" style={{ width: 80, height: 80, background: "rgba(122,184,138,0.17)", animationDelay: "0.5s" }} />
          <div className="absolute rounded-full animate-breathe" style={{ width: 40, height: 40, background: "rgba(122,184,138,0.34)", animationDelay: "1s" }} />
        </div>
        <p className="font-display text-sm italic" style={{ color: "#9aaa8e" }}>вдох · пауза · выдох</p>
      </div>

      {/* Вода */}
      <WaterAnimation />

      {/* Карточки */}
      <div>
        <p className="font-body text-xs tracking-[0.2em] uppercase mb-4 text-center" style={{ color: "#b0baa8" }}>
          Настроение момента
        </p>
        <div className="grid grid-cols-2 gap-3">
          {moments.map((m, i) => (
            <div
              key={m.label}
              className="rounded-2xl overflow-hidden relative opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards", height: 150 }}
            >
              <img src={m.img} alt={m.label} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0 flex flex-col justify-end p-3"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 65%)" }}
              >
                <p className="font-display text-white text-base font-medium italic">{m.label}</p>
                <p className="font-body text-white/80 text-[10px] leading-tight mt-0.5">{m.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Цитата + трава */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-2 text-center space-y-1">
          <p className="font-display text-lg italic" style={{ color: "#6a7e6c" }}>
            "Природа не торопится, и всё же всё успевает."
          </p>
          <p className="font-body text-xs" style={{ color: "#b0baa8" }}>— Лао-цзы</p>
        </div>
        <GrassAnimation />
      </div>
    </div>
  );
}

// ── Звуки ──────────────────────────────────────────────────────────────────
type AudioHandle = { type: "html"; el: HTMLAudioElement } | { type: "noise"; ctx: AudioContext; gain: GainNode; src: AudioBufferSourceNode };

function SoundsPage() {
  const handles = useRef<Record<string, AudioHandle>>({});
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>(
    Object.fromEntries(SOUNDS.map(s => [s.id, 0.7]))
  );

  const stopOne = useCallback((id: string) => {
    const h = handles.current[id];
    if (!h) return;
    if (h.type === "html") { h.el.pause(); h.el.src = ""; }
    else { try { h.src.stop(); h.ctx.close(); } catch (_) { /* ignore */ } }
    delete handles.current[id];
  }, []);

  const playFallbackNoise = useCallback((id: string, vol: number) => {
    try {
      const ctx = new AudioContext();
      const noiseType = ["rain_roof", "rain_forest"].includes(id) ? "rain" : id === "fire" ? "fire" : "wind";
      const { src, filt } = makeNoiseNode(ctx, noiseType);
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.25;
      filt.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      handles.current[id] = { type: "noise", ctx, gain, src };
      setActive(prev => ({ ...prev, [id]: true }));
    } catch (_) {
      // тихий fail
    }
  }, []);

  const tryPlayUrls = useCallback(async (id: string, urls: string[], vol: number): Promise<boolean> => {
    for (const url of urls) {
      try {
        const el = new Audio();
        el.crossOrigin = "anonymous";
        el.loop = true;
        el.volume = vol;
        el.src = url;

        await new Promise<void>((res, rej) => {
          const t = setTimeout(() => rej(new Error("timeout")), 4000);
          el.oncanplaythrough = () => { clearTimeout(t); res(); };
          el.onerror = () => { clearTimeout(t); rej(new Error("error")); };
          el.load();
        });

        await el.play();
        handles.current[id] = { type: "html", el };
        setActive(prev => ({ ...prev, [id]: true }));
        return true;
      } catch (_) {
        continue;
      }
    }
    return false;
  }, []);

  const toggleSound = useCallback(async (sound: typeof SOUNDS[0]) => {
    const { id, urls } = sound;
    if (active[id]) {
      stopOne(id);
      setActive(prev => ({ ...prev, [id]: false }));
    } else {
      const vol = volumes[id];
      const ok = await tryPlayUrls(id, urls, vol);
      if (!ok) playFallbackNoise(id, vol);
    }
  }, [active, volumes, stopOne, tryPlayUrls, playFallbackNoise]);

  const changeVolume = useCallback((id: string, vol: number) => {
    setVolumes(prev => ({ ...prev, [id]: vol }));
    const h = handles.current[id];
    if (!h) return;
    if (h.type === "html") h.el.volume = vol;
    else h.gain.gain.value = vol * 0.25;
  }, []);

  const stopAll = () => {
    SOUNDS.forEach(s => stopOne(s.id));
    setActive({});
  };

  useEffect(() => {
    return () => { SOUNDS.forEach(s => stopOne(s.id)); };
  }, [stopOne]);

  const activeCount = Object.values(active).filter(Boolean).length;

  return (
    <div className="px-5 py-8 space-y-5 animate-fade-up">
      <div className="text-center space-y-1">
        <h2 className="font-display text-4xl font-light italic" style={{ color: "#5a6e5c" }}>Звуки природы</h2>
        {activeCount > 0 ? (
          <p className="font-body text-xs" style={{ color: "#7ab88a" }}>
            {activeCount} {activeCount === 1 ? "звук" : activeCount < 5 ? "звука" : "звуков"} играет
          </p>
        ) : (
          <p className="font-body text-xs" style={{ color: "#b0baa8" }}>нажми на карточку, чтобы включить</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SOUNDS.map((sound, i) => {
          const isActive = active[sound.id];
          return (
            <div
              key={sound.id}
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "forwards" }}
            >
              <div
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={isActive ? { boxShadow: `0 6px 28px ${sound.color}55`, transform: "scale(1.025)" } : {}}
              >
                {/* Фото */}
                <div
                  className="relative cursor-pointer"
                  style={{ height: 120 }}
                  onClick={() => toggleSound(sound)}
                >
                  <img src={sound.img} alt={sound.label} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      background: isActive
                        ? `linear-gradient(to top, ${sound.color}cc 0%, transparent 55%)`
                        : "linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 60%)",
                    }}
                  />
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: sound.color }}
                    >
                      <Icon name="Volume2" size={11} className="text-white" />
                    </div>
                  )}
                  <p className="absolute bottom-2 left-3 font-body text-xs text-white font-medium drop-shadow">
                    {sound.label}
                  </p>
                </div>

                {/* Слайдер */}
                <div
                  className="px-3 py-2"
                  style={{ background: "rgba(255,252,248,0.88)" }}
                >
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={volumes[sound.id]}
                    onChange={e => changeVolume(sound.id, Number(e.target.value))}
                    className="w-full cursor-pointer"
                    style={{ accentColor: sound.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeCount > 0 && (
        <button
          onClick={stopAll}
          className="w-full glass rounded-2xl py-3 font-body text-sm transition-opacity hover:opacity-70"
          style={{ color: "#a0a8a0" }}
        >
          Остановить всё
        </button>
      )}

      <GrassAnimation />
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
        <h2 className="font-display text-4xl font-light italic" style={{ color: "#5a6e5c" }}>Мудрые слова</h2>
        <p className="font-body text-xs" style={{ color: "#b0baa8" }}>слова, которые успокаивают</p>
      </div>

      <div className="glass rounded-3xl p-7 space-y-5">
        <div className="space-y-3">
          <span className="font-display text-5xl leading-none block" style={{ color: "#7ab88a", opacity: 0.4 }}>"</span>
          <p className="font-display text-xl font-light italic leading-relaxed" style={{ color: "#5a6e5c" }}>
            {quote.text}
          </p>
          {quote.author && (
            <p className="font-body text-xs text-right" style={{ color: "#b0baa8" }}>— {quote.author}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center transition-opacity hover:opacity-70">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <div className="flex items-center gap-1">
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={i === current
                  ? { width: 20, height: 6, background: "#7ab88a" }
                  : { width: 6, height: 6, background: "rgba(0,0,0,0.15)" }}
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
          style={{ color: isFav(quote.id) ? "#e07090" : "#a0a8a0" }}
        >
          <Icon name="Heart" size={16} />
          {isFav(quote.id) ? "В избранном" : "В избранное"}
        </button>
        <button
          onClick={next}
          className="flex-1 glass rounded-2xl py-3 flex items-center justify-center gap-2 font-body text-sm transition-opacity hover:opacity-70"
          style={{ color: "#a0a8a0" }}
        >
          <Icon name="Shuffle" size={16} />
          Следующая
        </button>
      </div>

      <div className="space-y-3">
        <p className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: "#b0baa8" }}>Все фразы</p>
        {QUOTES.map((q, i) => (
          <div key={q.id} onClick={() => setCurrent(i)}
            className="glass rounded-2xl p-4 cursor-pointer transition-all duration-200"
            style={i === current ? { boxShadow: "0 0 0 1.5px rgba(122,184,138,0.4)" } : { opacity: 0.65 }}
          >
            <p className="font-display text-sm italic leading-relaxed" style={{ color: "#5a6e5c" }}>"{q.text}"</p>
            {q.author && <p className="font-body text-xs mt-1" style={{ color: "#b0baa8" }}>— {q.author}</p>}
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
        <h2 className="font-display text-4xl font-light italic" style={{ color: "#5a6e5c" }}>Избранное</h2>
        <p className="font-body text-xs" style={{ color: "#b0baa8" }}>то, что осталось в сердце</p>
      </div>

      {favQuotes.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center space-y-4">
          <span className="text-5xl block animate-float">🌿</span>
          <p className="font-display text-xl italic" style={{ color: "#9aaa8e" }}>Пока здесь пусто</p>
          <p className="font-body text-sm" style={{ color: "#b0baa8" }}>
            Добавляй понравившиеся фразы через раздел «Фразы»
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: "#b0baa8" }}>Фразы · {favQuotes.length}</p>
          {favQuotes.map(q => (
            <div key={q.id} className="glass rounded-2xl p-5 space-y-2">
              <p className="font-display text-base italic leading-relaxed" style={{ color: "#5a6e5c" }}>"{q.text}"</p>
              {q.author && <p className="font-body text-xs" style={{ color: "#b0baa8" }}>— {q.author}</p>}
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
      <style>{`
        @keyframes grassWave {
          0%, 100% { transform: rotate(-5deg) scaleY(1); }
          50% { transform: rotate(5deg) scaleY(0.95); }
        }
        @keyframes waterFlow {
          0% { transform: translateX(-110%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full animate-float"
          style={{ top: "-8%", right: "-8%", width: 280, height: 280, background: "rgba(122,184,138,0.06)" }} />
        <div className="absolute rounded-full animate-float"
          style={{ bottom: "18%", left: "-6%", width: 200, height: 200, background: "rgba(212,149,106,0.05)", animationDelay: "2s" }} />
      </div>

      <div className="relative max-w-md mx-auto pb-28" style={{ zIndex: 1 }}>
        {tab === "home" && <HomePage />}
        {tab === "sounds" && <SoundsPage />}
        {tab === "quotes" && <QuotesPage />}
        {tab === "favorites" && <FavoritesPage />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0" style={{ zIndex: 50 }}>
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="glass rounded-3xl px-2 py-2 flex items-center justify-around"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200"
                style={tab === t.id
                  ? { background: "rgba(255,255,255,0.65)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }
                  : { opacity: 0.45 }}
              >
                <Icon name={t.icon} size={tab === t.id ? 20 : 18} style={{ color: tab === t.id ? "#7ab88a" : "#888" }} />
                <span className="font-body text-[10px] tracking-wide" style={{ color: tab === t.id ? "#555" : "#999" }}>
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
