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

// ── Web Audio синтез — каждый звук уникален ────────────────────────────────

function makeWhiteNoise(ctx: AudioContext, seconds = 6) {
  const n = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function makePinkNoise(ctx: AudioContext, seconds = 6) {
  const n = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

type SoundType = "rain_roof" | "fire" | "waves" | "forest" | "crickets" | "birds" | "wind" | "rain_forest";

function synthesizeSound(ctx: AudioContext, type: SoundType, gainNode: GainNode) {
  const nodes: AudioNode[] = [];

  if (type === "rain_roof") {
    // Дождь по крыше: белый шум + высокочастотный фильтр + редкие капли
    const noise = makeWhiteNoise(ctx);
    const hipass = ctx.createBiquadFilter(); hipass.type = "highpass"; hipass.frequency.value = 2800;
    const bandpass = ctx.createBiquadFilter(); bandpass.type = "bandpass"; bandpass.frequency.value = 4000; bandpass.Q.value = 0.5;
    noise.connect(hipass); hipass.connect(bandpass); bandpass.connect(gainNode);
    noise.start();
    nodes.push(noise, hipass, bandpass);
  } else if (type === "fire") {
    // Костёр: розовый шум (глубже) + низкочастотный + LFO качание
    const noise = makePinkNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 1.2;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.4;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 200;
    lfo.connect(lfoGain); lfoGain.connect(lp.frequency);
    noise.connect(lp); lp.connect(gainNode);
    noise.start(); lfo.start();
    nodes.push(noise, lp, lfo, lfoGain);
  } else if (type === "waves") {
    // Прибой: розовый шум + медленное LFO (волна приходит-уходит)
    const noise = makePinkNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const waveGain = ctx.createGain(); waveGain.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.45;
    lfo.connect(lfoGain); lfoGain.connect(waveGain.gain);
    noise.connect(lp); lp.connect(waveGain); waveGain.connect(gainNode);
    noise.start(); lfo.start();
    nodes.push(noise, lp, waveGain, lfo, lfoGain);
  } else if (type === "forest") {
    // Лес: мягкий розовый шум (листва) + резонансный фильтр
    const noise = makePinkNoise(ctx);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 0.3;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2000;
    noise.connect(bp); bp.connect(lp); lp.connect(gainNode);
    noise.start();
    nodes.push(noise, bp, lp);
  } else if (type === "crickets") {
    // Сверчки: несколько осцилляторов на разных частотах с тремоло
    [3800, 4200, 4600].forEach((freq, idx) => {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const trem = ctx.createOscillator(); trem.frequency.value = 18 + idx * 2;
      const tremGain = ctx.createGain(); tremGain.gain.value = 0.5;
      const oscGain = ctx.createGain(); oscGain.gain.value = 0.08;
      trem.connect(tremGain); tremGain.connect(oscGain.gain);
      osc.connect(oscGain); oscGain.connect(gainNode);
      osc.start(); trem.start();
      nodes.push(osc, trem, tremGain, oscGain);
    });
  } else if (type === "birds") {
    // Птицы: периодические синусоиды разной высоты (чириканье)
    const scheduleChirp = () => {
      const freq = 2000 + Math.random() * 2000;
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const env = ctx.createGain(); env.gain.value = 0;
      osc.connect(env); env.connect(gainNode);
      const t = ctx.currentTime;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.15, t + 0.05);
      env.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t); osc.stop(t + 0.25);
      setTimeout(scheduleChirp, 300 + Math.random() * 2000);
    };
    scheduleChirp();
    // Фоновый лесной шум
    const ambient = makePinkNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = "bandpass"; lp.frequency.value = 1500; lp.Q.value = 0.4;
    const ag = ctx.createGain(); ag.gain.value = 0.3;
    ambient.connect(lp); lp.connect(ag); ag.connect(gainNode);
    ambient.start();
    nodes.push(ambient, lp, ag);
  } else if (type === "wind") {
    // Ветер: белый шум очень низкий + плавное LFO
    const noise = makeWhiteNoise(ctx);
    const lp1 = ctx.createBiquadFilter(); lp1.type = "lowpass"; lp1.frequency.value = 400;
    const lp2 = ctx.createBiquadFilter(); lp2.type = "lowpass"; lp2.frequency.value = 600;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = 150;
    lfo.connect(lfoG); lfoG.connect(lp2.frequency);
    noise.connect(lp1); lp1.connect(lp2); lp2.connect(gainNode);
    noise.start(); lfo.start();
    nodes.push(noise, lp1, lp2, lfo, lfoG);
  } else if (type === "rain_forest") {
    // Дождь в лесу: белый шум (дождь) + розовый шум (листья) + низкие частоты
    const rainNoise = makeWhiteNoise(ctx);
    const leafNoise = makePinkNoise(ctx);
    const rFilter = ctx.createBiquadFilter(); rFilter.type = "bandpass"; rFilter.frequency.value = 3500; rFilter.Q.value = 0.6;
    const lFilter = ctx.createBiquadFilter(); lFilter.type = "bandpass"; lFilter.frequency.value = 1000; lFilter.Q.value = 0.4;
    const rg = ctx.createGain(); rg.gain.value = 0.6;
    const lg = ctx.createGain(); lg.gain.value = 0.4;
    rainNoise.connect(rFilter); rFilter.connect(rg); rg.connect(gainNode);
    leafNoise.connect(lFilter); lFilter.connect(lg); lg.connect(gainNode);
    rainNoise.start(); leafNoise.start();
    nodes.push(rainNoise, leafNoise, rFilter, lFilter, rg, lg);
  }

  return nodes;
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

// ── Анимация воды (волны SVG) ──────────────────────────────────────────────
function WaterRipple({ height = 72, colors = ["#a8d4e2", "#7ab8c8", "#5aa0b0"] }: { height?: number; colors?: string[] }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {/* Фон воды */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${colors[0]}55 0%, ${colors[1]}88 50%, ${colors[2]}aa 100%)` }}
      />
      {/* Волны SVG */}
      {[0, 1, 2].map(i => (
        <svg
          key={i}
          className="absolute bottom-0 w-full"
          style={{
            height: height * 0.75,
            animation: `waveMove ${4 + i * 1.5}s ease-in-out ${i * 0.8}s infinite`,
            opacity: 0.55 - i * 0.12,
          }}
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
        >
          <path
            d={i === 0
              ? "M0,30 C50,10 100,50 150,30 C200,10 250,50 300,30 C350,10 400,50 400,30 L400,60 L0,60 Z"
              : i === 1
              ? "M0,35 C60,15 120,55 180,35 C240,15 300,55 360,35 C380,25 400,40 400,35 L400,60 L0,60 Z"
              : "M0,40 C70,20 140,55 210,38 C280,20 340,55 400,38 L400,60 L0,60 Z"
            }
            fill={colors[i]}
          />
        </svg>
      ))}
      {/* Блики */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            height: 1.5,
            width: `${30 + i * 12}%`,
            background: "rgba(255,255,255,0.5)",
            top: `${18 + i * 16}%`,
            left: `${5 + i * 8}%`,
            animation: `shimmer ${3 + i * 0.9}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// WaterAnimation — компактная версия для главной
function WaterAnimation() {
  return <WaterRipple height={48} />;
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

      {/* Цитата + вода */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-3 text-center space-y-1">
          <p className="font-display text-lg italic" style={{ color: "#3a5040" }}>
            "Природа не торопится, и всё же всё успевает."
          </p>
          <p className="font-body text-xs font-medium" style={{ color: "#6a8070" }}>— Лао-цзы</p>
        </div>
        <WaterRipple height={56} colors={["#c2e0ea", "#8cc4d0", "#6aaaba"]} />
      </div>
    </div>
  );
}

// ── Звуки ──────────────────────────────────────────────────────────────────
type SynthHandle = { ctx: AudioContext; gain: GainNode; nodes: AudioNode[] };

function SoundsPage() {
  const handles = useRef<Record<string, SynthHandle>>({});
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>(
    Object.fromEntries(SOUNDS.map(s => [s.id, 0.65]))
  );

  const stopOne = useCallback((id: string, updateState = false) => {
    const h = handles.current[id];
    if (h) {
      h.nodes.forEach(n => { try { (n as AudioBufferSourceNode).stop?.(); } catch (_) { /* ignore */ } });
      try { h.ctx.close(); } catch (_) { /* ignore */ }
      delete handles.current[id];
    }
    if (updateState) setActive(prev => ({ ...prev, [id]: false }));
  }, []);

  const playSound = useCallback((sound: typeof SOUNDS[0], vol: number) => {
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.4;
      gain.connect(ctx.destination);
      const nodes = synthesizeSound(ctx, sound.id as SoundType, gain);
      handles.current[sound.id] = { ctx, gain, nodes };
      setActive(prev => ({ ...prev, [sound.id]: true }));
    } catch (_) {
      // fail silently
    }
  }, []);

  const toggleSound = useCallback((sound: typeof SOUNDS[0]) => {
    const { id } = sound;
    if (active[id]) {
      stopOne(id, true);
    } else {
      playSound(sound, volumes[id]);
    }
  }, [active, volumes, stopOne, playSound]);

  const changeVolume = useCallback((id: string, vol: number) => {
    setVolumes(prev => ({ ...prev, [id]: vol }));
    const h = handles.current[id];
    if (h) h.gain.gain.value = vol * 0.4;
  }, []);

  const stopAll = useCallback(() => {
    SOUNDS.forEach(s => stopOne(s.id, false));
    setActive({});
  }, [stopOne]);

  useEffect(() => {
    return () => { SOUNDS.forEach(s => stopOne(s.id, false)); };
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

      <WaterRipple height={64} colors={["#b8dce8", "#7ab8c4", "#5a9aae"]} />
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

      <div className="rounded-3xl p-7 space-y-5" style={{ background: "rgba(245,250,246,0.92)", border: "1px solid rgba(122,184,138,0.2)" }}>
        <div className="space-y-3">
          <span className="font-display text-5xl leading-none block" style={{ color: "#7ab88a", opacity: 0.6 }}>"</span>
          <p className="font-display text-2xl leading-relaxed" style={{ color: "#1a2a1e", fontStyle: "italic", fontWeight: 400 }}>
            {quote.text}
          </p>
          {quote.author && (
            <p className="font-body text-sm text-right font-semibold" style={{ color: "#3a5040" }}>— {quote.author}</p>
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

      <div className="space-y-2.5">
        <p className="font-body text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: "#6a8070" }}>Все фразы</p>
        {QUOTES.map((q, i) => (
          <div key={q.id} onClick={() => setCurrent(i)}
            className="rounded-2xl p-4 cursor-pointer transition-all duration-200"
            style={i === current
              ? { background: "rgba(240,248,242,0.95)", boxShadow: "0 0 0 1.5px rgba(122,184,138,0.55)", border: "1px solid transparent" }
              : { background: "rgba(255,255,255,0.55)", opacity: 0.78 }
            }
          >
            <p className="font-display text-sm italic leading-relaxed" style={{ color: "#1a2a1e" }}>"{q.text}"</p>
            {q.author && <p className="font-body text-xs mt-1 font-semibold" style={{ color: "#3a5040" }}>— {q.author}</p>}
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
        @keyframes waveMove {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(-6%); }
          100% { transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-20px); opacity: 0; }
          30%  { opacity: 0.6; }
          70%  { opacity: 0.6; }
          100% { transform: translateX(40px); opacity: 0; }
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