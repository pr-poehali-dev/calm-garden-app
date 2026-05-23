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
      "https://freesound.org/data/previews/612/612026_1648170-lq.mp3",
      "https://freesound.org/data/previews/346/346170_5450487-lq.mp3",
      "https://freesound.org/data/previews/204/204966_1612429-lq.mp3",
    ],
  },
  {
    id: "fire",
    label: "Костёр",
    img: `${CDN}/4043917e-7ddb-4efa-8907-f10cb5b43d2a.jpg`,
    color: "#d4956a",
    urls: [
      "https://freesound.org/data/previews/404/404357_5121236-lq.mp3",
      "https://freesound.org/data/previews/543/543687_3797507-lq.mp3",
    ],
  },
  {
    id: "waves",
    label: "Прибой",
    img: `${CDN}/89f731ab-a059-4a4a-8aa2-e026c781f727.jpg`,
    color: "#7ab8c4",
    urls: [
      "https://freesound.org/data/previews/362/362528_6629901-lq.mp3",
      "https://freesound.org/data/previews/402/402543_5121236-lq.mp3",
    ],
  },
  {
    id: "forest",
    label: "Лес",
    img: `${CDN}/edb816aa-7b73-478b-9e18-2c71de591d3b.jpg`,
    color: "#7ab88a",
    urls: [
      "https://freesound.org/data/previews/496/496846_11235861-lq.mp3",
      "https://freesound.org/data/previews/476/476848_9676595-lq.mp3",
    ],
  },
  {
    id: "night",
    label: "Ночь",
    img: `${CDN}/3f99d082-fc42-4ee0-9267-275d24830503.jpg`,
    color: "#8890b8",
    urls: [
      "https://freesound.org/data/previews/484/484039_10574267-lq.mp3",
      "https://freesound.org/data/previews/521/521975_11235861-lq.mp3",
    ],
  },
  {
    id: "birds",
    label: "Птицы",
    img: `${CDN}/2be4a871-044f-473d-88b3-1cbeab247d18.jpg`,
    color: "#c4a87a",
    urls: [
      "https://freesound.org/data/previews/476/476848_9676595-lq.mp3",
      "https://freesound.org/data/previews/400/400926_5121236-lq.mp3",
    ],
  },
  {
    id: "wind",
    label: "Ветер",
    img: `${CDN}/4dafa7bf-6ccd-4127-aafd-48418133682b.jpg`,
    color: "#a0b8c4",
    urls: [
      "https://freesound.org/data/previews/476/476562_9676595-lq.mp3",
      "https://freesound.org/data/previews/348/348545_5122493-lq.mp3",
    ],
  },
  {
    id: "rain_forest",
    label: "Дождь в лесу",
    img: `${CDN}/3399eea0-b201-49e7-a54f-ce6f3f3af54c.jpg`,
    color: "#6aa888",
    urls: [
      "https://freesound.org/data/previews/346/346170_5450487-lq.mp3",
      "https://freesound.org/data/previews/612/612026_1648170-lq.mp3",
    ],
  },
];

// ── Web Audio синтез — каждый звук уникален ────────────────────────────────

function makeWhiteNoise(ctx: AudioContext, seconds = 8) {
  const n = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  return src;
}

function makePinkNoise(ctx: AudioContext, seconds = 8) {
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
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  return src;
}

// Коричневый (красный) шум — самый тёплый и низкий
function makeBrownNoise(ctx: AudioContext, seconds = 8) {
  const n = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  return src;
}

type SoundType = "rain_roof" | "fire" | "waves" | "forest" | "night" | "birds" | "wind" | "rain_forest";

function synthesizeSound(ctx: AudioContext, type: SoundType, gainNode: GainNode) {
  const nodes: AudioNode[] = [];

  if (type === "rain_roof") {
    // Дождь по крыше: белый шум + два фильтра
    const noise = makeWhiteNoise(ctx);
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2000;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3800; bp.Q.value = 0.6;
    noise.connect(hp); hp.connect(bp); bp.connect(gainNode);
    noise.start();
    nodes.push(noise, hp, bp);

  } else if (type === "fire") {
    // Костёр: коричневый шум (потрескивание) + розовый (шум огня) + LFO
    const brown = makeBrownNoise(ctx);
    const pink = makePinkNoise(ctx);
    const lp1 = ctx.createBiquadFilter(); lp1.type = "lowpass"; lp1.frequency.value = 800; lp1.Q.value = 0.8;
    const lp2 = ctx.createBiquadFilter(); lp2.type = "lowpass"; lp2.frequency.value = 1200;
    // Мерцание огня через LFO
    const lfo1 = ctx.createOscillator(); lfo1.frequency.value = 0.6; lfo1.type = "sine";
    const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 1.4; lfo2.type = "sine";
    const lfoG1 = ctx.createGain(); lfoG1.gain.value = 0.12;
    const lfoG2 = ctx.createGain(); lfoG2.gain.value = 0.06;
    const gBrown = ctx.createGain(); gBrown.gain.value = 0.7;
    const gPink = ctx.createGain(); gPink.gain.value = 0.3;
    lfo1.connect(lfoG1); lfoG1.connect(gBrown.gain);
    lfo2.connect(lfoG2); lfoG2.connect(gPink.gain);
    brown.connect(lp1); lp1.connect(gBrown); gBrown.connect(gainNode);
    pink.connect(lp2); lp2.connect(gPink); gPink.connect(gainNode);
    brown.start(); pink.start(); lfo1.start(); lfo2.start();
    nodes.push(brown, pink, lp1, lp2, lfo1, lfo2, lfoG1, lfoG2, gBrown, gPink);

  } else if (type === "waves") {
    // Прибой: коричневый шум + медленное LFO (волны накатывают)
    const brown = makeBrownNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
    const wg = ctx.createGain(); wg.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1; lfo.type = "sine";
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.45;
    lfo.connect(lfoG); lfoG.connect(wg.gain);
    brown.connect(lp); lp.connect(wg); wg.connect(gainNode);
    brown.start(); lfo.start();
    nodes.push(brown, lp, wg, lfo, lfoG);

  } else if (type === "forest") {
    // Лес: розовый + коричневый шум (листва + гул деревьев)
    const pink = makePinkNoise(ctx);
    const brown = makeBrownNoise(ctx);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1000; bp.Q.value = 0.35;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
    const gp = ctx.createGain(); gp.gain.value = 0.65;
    const gb = ctx.createGain(); gb.gain.value = 0.35;
    pink.connect(bp); bp.connect(gp); gp.connect(gainNode);
    brown.connect(lp); lp.connect(gb); gb.connect(gainNode);
    pink.start(); brown.start();
    nodes.push(pink, brown, bp, lp, gp, gb);

  } else if (type === "night") {
    // Ночной амбиент: коричневый (тишина) + редкие глубокие тоны
    const brown = makeBrownNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 300;
    const gb = ctx.createGain(); gb.gain.value = 0.4;
    brown.connect(lp); lp.connect(gb); gb.connect(gainNode);
    brown.start();
    // Редкие низкие тона (как вдалеке)
    const schedTone = () => {
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.value = 80 + Math.random() * 60;
      const env = ctx.createGain(); env.gain.value = 0;
      osc.connect(env); env.connect(gainNode);
      const t = ctx.currentTime;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.04, t + 1.5);
      env.gain.linearRampToValueAtTime(0, t + 4);
      osc.start(t); osc.stop(t + 5);
      setTimeout(schedTone, 4000 + Math.random() * 6000);
    };
    schedTone();
    nodes.push(brown, lp, gb);

  } else if (type === "birds") {
    // Утренние птицы: розовый (лес) + синтетическое чириканье
    const ambient = makePinkNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = "bandpass"; lp.frequency.value = 1400; lp.Q.value = 0.4;
    const ag = ctx.createGain(); ag.gain.value = 0.28;
    ambient.connect(lp); lp.connect(ag); ag.connect(gainNode);
    ambient.start();
    const schedChirp = () => {
      const baseFreq = 1800 + Math.random() * 1800;
      const numNotes = 2 + Math.floor(Math.random() * 3);
      for (let ni = 0; ni < numNotes; ni++) {
        const osc = ctx.createOscillator(); osc.type = "sine";
        osc.frequency.value = baseFreq + ni * 200 * (Math.random() > 0.5 ? 1 : -1);
        const env = ctx.createGain(); env.gain.value = 0;
        osc.connect(env); env.connect(gainNode);
        const t = ctx.currentTime + ni * 0.12;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.12, t + 0.04);
        env.gain.linearRampToValueAtTime(0, t + 0.14);
        osc.start(t); osc.stop(t + 0.2);
      }
      setTimeout(schedChirp, 600 + Math.random() * 3000);
    };
    schedChirp();
    nodes.push(ambient, lp, ag);

  } else if (type === "wind") {
    // Ветер: коричневый шум + очень медленное LFO
    const brown = makeBrownNoise(ctx);
    const lp1 = ctx.createBiquadFilter(); lp1.type = "lowpass"; lp1.frequency.value = 500;
    const lp2 = ctx.createBiquadFilter(); lp2.type = "lowpass"; lp2.frequency.value = 700;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lfoG = ctx.createGain(); lfoG.gain.value = 180;
    lfo.connect(lfoG); lfoG.connect(lp2.frequency);
    brown.connect(lp1); lp1.connect(lp2); lp2.connect(gainNode);
    brown.start(); lfo.start();
    nodes.push(brown, lp1, lp2, lfo, lfoG);

  } else if (type === "rain_forest") {
    // Дождь в лесу: белый (капли) + коричневый (гул) + розовый (листья)
    const white = makeWhiteNoise(ctx);
    const brown = makeBrownNoise(ctx);
    const pink = makePinkNoise(ctx);
    const f1 = ctx.createBiquadFilter(); f1.type = "bandpass"; f1.frequency.value = 3000; f1.Q.value = 0.7;
    const f2 = ctx.createBiquadFilter(); f2.type = "lowpass"; f2.frequency.value = 500;
    const f3 = ctx.createBiquadFilter(); f3.type = "bandpass"; f3.frequency.value = 900; f3.Q.value = 0.4;
    const g1 = ctx.createGain(); g1.gain.value = 0.5;
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    const g3 = ctx.createGain(); g3.gain.value = 0.25;
    white.connect(f1); f1.connect(g1); g1.connect(gainNode);
    brown.connect(f2); f2.connect(g2); g2.connect(gainNode);
    pink.connect(f3); f3.connect(g3); g3.connect(gainNode);
    white.start(); brown.start(); pink.start();
    nodes.push(white, brown, pink, f1, f2, f3, g1, g2, g3);
  }

  return nodes;
}

const ALL_QUOTES = [
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
  { id: 13, text: "Истинная сила — в умении остановиться.", author: "" },
  { id: 14, text: "Тот, кто умеет ждать, получает лучшее.", author: "" },
  { id: 15, text: "Не гонись за счастьем — оно всегда здесь.", author: "Торо" },
  { id: 16, text: "Дыхание — мост между телом и разумом.", author: "Тхить Нят Хань" },
  { id: 17, text: "Принятие — не слабость. Это высшая мудрость.", author: "" },
  { id: 18, text: "Каждый закат учит нас отпускать день с благодарностью.", author: "" },
  { id: 19, text: "Река не спрашивает, куда течёт. Она просто течёт.", author: "" },
  { id: 20, text: "В каждом мгновении — целая вечность.", author: "" },
  { id: 21, text: "Сердце, умеющее молчать, слышит больше.", author: "" },
  { id: 22, text: "Пусть мир будет шумным. Внутри — тишина.", author: "" },
  { id: 23, text: "Цветок не торопится расцветать. И ты не торопись.", author: "" },
  { id: 24, text: "Небо не держит облака. Отпусти и ты.", author: "" },
  { id: 25, text: "Простота — это высшая утончённость.", author: "Леонардо да Винчи" },
  { id: 26, text: "Лучшее лекарство — природа, терпение и время.", author: "" },
  { id: 27, text: "Не нужно далеко ходить за покоем. Он внутри.", author: "" },
  { id: 28, text: "Камень, омываемый водой, становится гладким. Так и душа.", author: "" },
  { id: 29, text: "Жизнь — это не путь к покою. Покой — это сам путь.", author: "" },
  { id: 30, text: "Звёзды не кричат о своём свете. Они просто светят.", author: "" },
  { id: 31, text: "Умиротворение — это не конец пути, а то, с чем ты идёшь.", author: "" },
  { id: 32, text: "Тихая вода подтачивает твёрдый камень.", author: "" },
  { id: 33, text: "Настоящий покой начинается там, где заканчиваются ожидания.", author: "" },
  { id: 34, text: "Всё, что ты ищешь снаружи, уже есть внутри.", author: "Руми" },
  { id: 35, text: "Прислушайся к шуму дождя — он смывает всё лишнее.", author: "" },
  { id: 36, text: "Осень не грустит об ушедшем лете. Она просто становится золотой.", author: "" },
  { id: 37, text: "Закрой глаза. Почувствуй, как дышит земля.", author: "" },
  { id: 38, text: "Мир принадлежит тем, кто умеет ценить тишину.", author: "" },
  { id: 39, text: "В глубине тихого пруда отражается всё небо.", author: "" },
  { id: 40, text: "Мудрость — это знать, когда остановиться.", author: "" },
  { id: 41, text: "Иногда самое важное — просто быть.", author: "" },
  { id: 42, text: "Не сопротивляйся течению — стань его частью.", author: "" },
  { id: 43, text: "Тишина — это язык Бога. Всё остальное — перевод.", author: "Руми" },
  { id: 44, text: "Береза не завидует дубу. Каждое дерево растёт своим путём.", author: "" },
  { id: 45, text: "Посмотри на небо. Ты часть чего-то огромного.", author: "" },
  { id: 46, text: "Медленнее. Ещё медленнее. Вот теперь ты начинаешь видеть.", author: "" },
  { id: 47, text: "Лучший момент — тот, в котором ты сейчас.", author: "" },
  { id: 48, text: "Радость — это не то, что случается. Это то, что ты выбираешь.", author: "" },
  { id: 49, text: "Даже самая долгая ночь заканчивается рассветом.", author: "" },
  { id: 50, text: "Ветер не знает, куда дует. И всё равно всё меняет.", author: "" },
  { id: 51, text: "Живи так, чтобы оставлять тишину там, где был шум.", author: "" },
  { id: 52, text: "Вода помнит берега, через которые прошла.", author: "" },
  { id: 53, text: "Забота о себе — это не эгоизм. Это необходимость.", author: "" },
  { id: 54, text: "Каждая трещина — это место, откуда проходит свет.", author: "Леонард Коэн" },
  { id: 55, text: "Тёплый чай. Открытое окно. Этого достаточно.", author: "" },
  { id: 56, text: "Настоящее богатство — это внутренний покой.", author: "Далай-лама" },
  { id: 57, text: "Не нужно понимать всё. Нужно просто доверять.", author: "" },
  { id: 58, text: "Первый снег падает в тишине. Так же — и самое важное.", author: "" },
  { id: 59, text: "Горы не спешат стать выше. Они просто стоят.", author: "" },
  { id: 60, text: "Отдыхать — значит слышать себя.", author: "" },
  { id: 61, text: "Пусть заботы остаются снаружи. Здесь — только ты.", author: "" },
  { id: 62, text: "Туман — это небо, решившее побыть поближе к земле.", author: "" },
  { id: 63, text: "Маленькие радости складываются в большое счастье.", author: "" },
  { id: 64, text: "Корни дерева не видно, но именно они держат.", author: "" },
  { id: 65, text: "Спокойствие — не пустота. Это полнота без суеты.", author: "" },
  { id: 66, text: "Утро всегда свежее. Дай себе начать заново.", author: "" },
  { id: 67, text: "Море не злится на скалы. Оно просто продолжает двигаться.", author: "" },
  { id: 68, text: "Мягкий свет вечера напоминает: день прожит.", author: "" },
  { id: 69, text: "В природе нет ничего лишнего. И в тебе тоже.", author: "" },
  { id: 70, text: "Тишина — это не отсутствие музыки. Это пространство между нотами.", author: "" },
  { id: 71, text: "Когда ты спокоен, ты ясно видишь путь.", author: "" },
  { id: 72, text: "Не нужно искать смысл. Просто живи — и смысл найдёт тебя.", author: "" },
  { id: 73, text: "Лепесток падает — и это целое событие.", author: "" },
  { id: 74, text: "Позволь себе быть несовершенным. Именно это делает тебя живым.", author: "" },
  { id: 75, text: "Облако не держится за небо. Отпускай.", author: "" },
  { id: 76, text: "Внутренний ребёнок знает, как радоваться просто так.", author: "" },
  { id: 77, text: "Каждый шаг — уже прибытие.", author: "Тхить Нят Хань" },
  { id: 78, text: "Дождь не знает, что он красив. Он просто идёт.", author: "" },
  { id: 79, text: "Усталость — это сигнал: пора побыть с собой.", author: "" },
  { id: 80, text: "Свеча не соревнуется с солнцем. Она просто горит.", author: "" },
  { id: 81, text: "Иногда молчать вместе — это лучший разговор.", author: "" },
  { id: 82, text: "Море всегда возвращается к берегу. Ты тоже вернёшься к себе.", author: "" },
  { id: 83, text: "Трава не думает о том, как расти. Она просто тянется к свету.", author: "" },
  { id: 84, text: "Покой приходит, когда перестаёшь бежать от себя.", author: "" },
  { id: 85, text: "Пусть сегодня будет немного медленнее, чем вчера.", author: "" },
  { id: 86, text: "Под каждым камнем — своя история. Под каждым молчанием — своя глубина.", author: "" },
  { id: 87, text: "Живи тихо. Думай глубоко. Чувствуй полно.", author: "" },
  { id: 88, text: "Сумерки — это когда день и ночь обнимаются.", author: "" },
  { id: 89, text: "Природа исцеляет того, кто умеет её слушать.", author: "" },
  { id: 90, text: "Не всё нужно понимать. Некоторые вещи нужно просто чувствовать.", author: "" },
  { id: 91, text: "Пустая чашка может вместить новое. Пустое сердце — тоже.", author: "" },
  { id: 92, text: "Ночь не тёмная. Она просто тихая.", author: "" },
  { id: 93, text: "Истинный отдых — не бездействие, а прикосновение к себе.", author: "" },
  { id: 94, text: "Нежность к себе — начало нежности ко всему миру.", author: "" },
  { id: 95, text: "Сосна в шторм гнётся, но не ломается. Будь как сосна.", author: "" },
];

// Ежедневная ротация: 3 фразы на каждый день года
function getDailyQuotes() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const startIdx = (dayOfYear * 3) % ALL_QUOTES.length;
  const result = [];
  for (let i = 0; i < 3; i++) {
    result.push(ALL_QUOTES[(startIdx + i) % ALL_QUOTES.length]);
  }
  return result;
}

const QUOTES = ALL_QUOTES;

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


// ── Главная ────────────────────────────────────────────────────────────────
function HomePage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 5 ? "Тихая ночь" :
    hour < 12 ? "Доброе утро" :
    hour < 17 ? "Светлый день" :
    hour < 21 ? "Тёплый вечер" : "Тихая ночь";

  const greetingEmoji = hour < 5 ? "🌙" : hour < 12 ? "🌅" : hour < 17 ? "☀️" : hour < 21 ? "🌇" : "🌙";

  // Дыхание: 4 сек вдох, 4 сек выдох
  const [breathPhase, setBreathPhase] = useState<"вдох" | "пауза" | "выдох">("вдох");
  useEffect(() => {
    const cycle = ["вдох" as const, "пауза" as const, "выдох" as const];
    const durations = [4000, 1500, 4000];
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setBreathPhase(cycle[idx]);
      timer = setTimeout(() => { idx = (idx + 1) % 3; tick(); }, durations[idx]);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  // Сезон
  const month = now.getMonth();
  const season = month < 3 || month === 11 ? "Зима" : month < 6 ? "Весна" : month < 9 ? "Лето" : "Осень";
  const seasonEmoji = month < 3 || month === 11 ? "❄️" : month < 6 ? "🌸" : month < 9 ? "🌿" : "🍂";

  // Ежедневные фразы
  const dailyQuotes = getDailyQuotes();

  const moments = [
    { img: `${CDN}/e0a56e22-4638-483d-8d24-dd1a0f7503c9.jpg`, label: "Рассвет", quote: "Каждый рассвет — шанс начать заново" },
    { img: `${CDN}/89f731ab-a059-4a4a-8aa2-e026c781f727.jpg`, label: "Прибой", quote: "Волны смывают всё лишнее" },
    { img: `${CDN}/edb816aa-7b73-478b-9e18-2c71de591d3b.jpg`, label: "Лес", quote: "В лесу время течёт иначе" },
    { img: `${CDN}/2be4a871-044f-473d-88b3-1cbeab247d18.jpg`, label: "Весна", quote: "Всё расцветает в своё время" },
  ];

  return (
    <div className="px-5 py-8 space-y-7 animate-fade-up">
      {/* Шапка */}
      <div className="text-center pt-2 space-y-1">
        <p className="font-body text-xs tracking-[0.25em] uppercase" style={{ color: "#b0baa8" }}>
          {now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display text-5xl font-light italic" style={{ color: "#3a5040" }}>
          {greetingEmoji} {greeting}
        </h1>
        <p className="font-body text-sm font-light" style={{ color: "#7a9a88" }}>
          {seasonEmoji} {season} · сад покоя
        </p>
      </div>

      {/* Дыхательный круг — интерактивный */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          <div
            className="absolute rounded-full transition-all duration-[4000ms] ease-in-out"
            style={{
              width: breathPhase === "вдох" ? 136 : breathPhase === "пауза" ? 120 : 100,
              height: breathPhase === "вдох" ? 136 : breathPhase === "пауза" ? 120 : 100,
              background: "rgba(122,184,138,0.10)",
            }}
          />
          <div
            className="absolute rounded-full transition-all duration-[4000ms] ease-in-out"
            style={{
              width: breathPhase === "вдох" ? 96 : breathPhase === "пауза" ? 84 : 68,
              height: breathPhase === "вдох" ? 96 : breathPhase === "пауза" ? 84 : 68,
              background: "rgba(122,184,138,0.20)",
            }}
          />
          <div
            className="absolute rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center"
            style={{
              width: breathPhase === "вдох" ? 56 : breathPhase === "пауза" ? 50 : 40,
              height: breathPhase === "вдох" ? 56 : breathPhase === "пауза" ? 50 : 40,
              background: "rgba(122,184,138,0.38)",
            }}
          >
            <span style={{ fontSize: 18 }}>🌿</span>
          </div>
        </div>
        <p className="font-display text-base italic transition-all duration-700" style={{ color: "#5a7862" }}>
          {breathPhase}
        </p>
        <p className="font-body text-xs" style={{ color: "#b0baa8" }}>дыхательная практика</p>
      </div>

      {/* Вода */}
      <WaterRipple height={44} colors={["#c2e0ea", "#8cc4d0", "#6aaaba"]} />

      {/* Фразы дня */}
      <div>
        <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "#8a9888", fontWeight: 600 }}>
          Фразы дня
        </p>
        <div className="space-y-2">
          {dailyQuotes.map((q, i) => (
            <div
              key={q.id}
              className="rounded-2xl px-4 py-3 opacity-0 animate-fade-up"
              style={{
                background: i === 0 ? "rgba(240,248,242,0.92)" : "rgba(255,255,255,0.6)",
                border: i === 0 ? "1px solid rgba(122,184,138,0.25)" : "1px solid rgba(0,0,0,0.05)",
                animationDelay: `${i * 0.15}s`,
                animationFillMode: "forwards",
              }}
            >
              <p className="font-display text-sm italic leading-relaxed" style={{ color: "#1a2a1e" }}>
                {i === 0 ? "✦ " : "· "}{q.text}
              </p>
              {q.author && <p className="font-body text-xs mt-1" style={{ color: "#5a7862", fontWeight: 600 }}>— {q.author}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Карточки природы */}
      <div>
        <p className="font-body text-xs tracking-[0.2em] uppercase mb-3 text-center" style={{ color: "#b0baa8" }}>
          Места силы
        </p>
        <div className="grid grid-cols-2 gap-3">
          {moments.map((m, i) => (
            <div
              key={m.label}
              className="rounded-2xl overflow-hidden relative opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards", height: 148 }}
            >
              <img src={m.img} alt={m.label} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0 flex flex-col justify-end p-3"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 65%)" }}
              >
                <p className="font-display text-white text-base font-medium italic">{m.label}</p>
                <p className="font-body text-white/75 text-[10px] leading-tight mt-0.5">{m.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Намерение дня */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(240,248,242,0.88)", border: "1px solid rgba(122,184,138,0.2)" }}>
        <div className="px-5 pt-4 pb-3 space-y-1">
          <p className="font-body text-xs tracking-[0.15em] uppercase" style={{ color: "#8a9888", fontWeight: 600 }}>Намерение дня</p>
          <p className="font-display text-base italic" style={{ color: "#2a3d2e" }}>
            Сегодня я позволяю себе замедлиться и заметить красоту в малом.
          </p>
        </div>
        <WaterRipple height={40} colors={["#c8e8c8", "#98c898", "#78b088"]} />
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
    const h = handles.current[id] as (SynthHandle & { el?: HTMLAudioElement }) | undefined;
    if (h) {
      if (h.el) { try { h.el.pause(); h.el.src = ""; } catch (_) { /* ignore */ } }
      h.nodes.forEach(n => { try { (n as AudioBufferSourceNode).stop?.(); } catch (_) { /* ignore */ } });
      try { h.ctx.close(); } catch (_) { /* ignore */ }
      delete handles.current[id];
    }
    if (updateState) setActive(prev => ({ ...prev, [id]: false }));
  }, []);

  const playSynth = useCallback((sound: typeof SOUNDS[0], vol: number) => {
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.4;
      gain.connect(ctx.destination);
      const nodes = synthesizeSound(ctx, sound.id as SoundType, gain);
      handles.current[sound.id] = { ctx, gain, nodes };
      setActive(prev => ({ ...prev, [sound.id]: true }));
    } catch (_) { /* ignore */ }
  }, []);

  const playSound = useCallback(async (sound: typeof SOUNDS[0], vol: number) => {
    // Пробуем реальные MP3 с freesound
    for (const url of sound.urls) {
      try {
        const el = new Audio(url);
        el.loop = true;
        el.volume = vol;
        await new Promise<void>((res, rej) => {
          const t = setTimeout(() => rej(), 5000);
          el.oncanplaythrough = () => { clearTimeout(t); res(); };
          el.onerror = () => { clearTimeout(t); rej(); };
          el.load();
        });
        await el.play();
        // Упаковываем HTML audio как синтез-хэндл через AudioContext
        const ctx = new AudioContext();
        const src = ctx.createMediaElementSource(el);
        const gain = ctx.createGain();
        gain.gain.value = 1;
        src.connect(gain); gain.connect(ctx.destination);
        handles.current[sound.id] = { ctx, gain, nodes: [src], el } as SynthHandle & { el: HTMLAudioElement };
        setActive(prev => ({ ...prev, [sound.id]: true }));
        return;
      } catch (_) { continue; }
    }
    // Fallback: синтез
    playSynth(sound, vol);
  }, [playSynth]);

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
    const h = handles.current[id] as (SynthHandle & { el?: HTMLAudioElement }) | undefined;
    if (!h) return;
    if (h.el) { h.el.volume = vol; } else { h.gain.gain.value = vol * 0.4; }
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

  // Свайп
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) { next(); } else { prev(); } }
  };

  return (
    <div className="px-5 py-8 space-y-6 animate-fade-up">
      <div className="text-center space-y-1">
        <h2 className="font-display text-4xl font-light italic" style={{ color: "#5a6e5c" }}>Мудрые слова</h2>
        <p className="font-body text-xs" style={{ color: "#b0baa8" }}>слова, которые успокаивают</p>
      </div>

      <div
        className="rounded-3xl p-7 space-y-5"
        style={{ background: "rgba(245,250,246,0.92)", border: "1px solid rgba(122,184,138,0.2)" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
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
          <button onClick={prev} className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-70" style={{ background: "rgba(122,184,138,0.15)" }}>
            <Icon name="ChevronLeft" size={16} />
          </button>
          {/* Счётчик вместо 95 точек */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full" style={{ background: "#7ab88a" }} />
              <p className="font-body text-xs font-semibold" style={{ color: "#5a7862" }}>
                {current + 1} / {QUOTES.length}
              </p>
              <div className="w-8 h-1 rounded-full" style={{ background: "#7ab88a" }} />
            </div>
            {/* Мини-прогресс-бар */}
            <div className="w-32 h-1 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${((current + 1) / QUOTES.length) * 100}%`, background: "#7ab88a" }}
              />
            </div>
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-70" style={{ background: "rgba(122,184,138,0.15)" }}>
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