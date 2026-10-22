import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaMicrophone, FaVolumeUp, FaVolumeMute, FaGithub, FaCloudSun,
  FaNewspaper, FaLaughBeam, FaBrain, FaMicrochip, FaBatteryHalf, FaClock,
  FaMusic, FaCamera,
} from 'react-icons/fa';
import './JarvisDemo.css';

/* -------------------------------------------------------------
   Jarvis Live Demo
   A miniature version of the desktop HUD orb + a rack of chips
   that trigger simulated (and some real) commands. Meant to
   convey the feel of the always-on assistant without needing
   to install Python.
   ------------------------------------------------------------- */

// Curated tech headlines. We can't hit Google News RSS from the
// browser (CORS), so this snapshot stands in for the real desktop
// `news tech`.
const NEWS_TECH = [
  'Anthropic ships Claude 4 with sub-second tool use.',
  'NVIDIA announces Blackwell Ultra for on-device inference.',
  "Apple's M5 chip leaks: 3nm, 12 P-cores, 40 GPU cores.",
  'Rust becomes the fastest-growing language on GitHub for the third year running.',
  'OpenAI opens up a fine-tuning API for GPT-5 mini.',
];

// Cheap deterministic pick so the same session doesn't repeat.
function pickRotating(arr, seed) {
  return arr[seed % arr.length];
}

/* --- real fetchers (CORS-friendly public endpoints) --- */

// Force UTF-8 decoding so em-dashes and ellipses from JokeAPI /
// OpenTDB render correctly, no matter what Content-Type header the
// API returned.
async function fetchJsonUtf8(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const text = new TextDecoder('utf-8').decode(buf);
  return JSON.parse(text);
}

async function fetchJoke() {
  const j = await fetchJsonUtf8('https://v2.jokeapi.dev/joke/Any?safe-mode');
  if (j.type === 'single') return j.joke;
  return `${j.setup}  \u2014  ${j.delivery}`;
}

async function fetchTrivia() {
  // Base64 encoding sidesteps every charset issue — the API
  // guarantees valid UTF-8 once decoded.
  const j = await fetchJsonUtf8(
    'https://opentdb.com/api.php?amount=1&type=multiple&encode=base64'
  );
  const q = j.results?.[0];
  if (!q) throw new Error('no trivia');
  const b64 = s => {
    try { return decodeURIComponent(escape(atob(s))); }
    catch (_) { return atob(s); }
  };
  const question = b64(q.question);
  const answer = b64(q.correct_answer);
  return `${question}  \u2014  Answer: ${answer}.`;
}

// Weather code → human-readable label (WMO table used by Open-Meteo).
const WMO = {
  0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'depositing rime fog',
  51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  56: 'freezing drizzle', 57: 'heavy freezing drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  66: 'freezing rain', 67: 'heavy freezing rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow', 77: 'snow grains',
  80: 'rain showers', 81: 'moderate rain showers', 82: 'heavy rain showers',
  85: 'snow showers', 86: 'heavy snow showers',
  95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'severe thunderstorm',
};

async function fetchWeatherVancouver() {
  // Open-Meteo: free, keyless, CORS-enabled, returns clean JSON.
  // wttr.in was returning full HTML in the browser because it
  // keys off User-Agent, which fetch() can't override.
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=49.2827&longitude=-123.1207' +
    '&current=temperature_2m,apparent_temperature,weather_code' +
    '&timezone=auto';
  const j = await fetchJsonUtf8(url);
  const c = j.current || {};
  const desc = WMO[c.weather_code] || 'unknown conditions';
  const t = Math.round(c.temperature_2m);
  const feels = Math.round(c.apparent_temperature);
  return `Vancouver right now: ${desc}, ${t}\u00B0C (feels like ${feels}\u00B0C), sir.`;
}

/* --- local synthesized responses --- */

function respondTime() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `It's ${time}, sir.`;
}

function respondCPU() {
  const load = Math.round(18 + Math.random() * 22);
  const ghz = (3.8 + Math.random() * 1.1).toFixed(2);
  return `CPU is running at ${load}% load, boost clock ${ghz} GHz, sir.`;
}

function respondBattery() {
  const pct = Math.round(64 + Math.random() * 30);
  const plugged = Math.random() > 0.4;
  return plugged
    ? `Battery at ${pct}%, plugged in and charging, sir.`
    : `Battery at ${pct}%, on the internal cell.`;
}

function respondNews(seed) {
  const headline = pickRotating(NEWS_TECH, seed);
  return `Top tech headline: ${headline}`;
}

/* --- canned responses for "capability tease" chips --- */

const CAPABILITY_RESPONSES = {
  play: [
    "In the desktop version, this would open Spotify's web player and search for you, sir.",
    "This web demo can't launch Spotify \u2014 but the real Jarvis does, on voice command.",
  ],
  screenshot: [
    "On the desktop I'd save a PNG to your OneDrive Desktop right now. Here I'll just describe it, sir.",
  ],
  volume: [
    'The desktop build talks to Windows Core Audio via pycaw \u2014 volume master would be at 60% now.',
  ],
};

function pickResponse(pool, seed) {
  return pool[seed % pool.length];
}

/* --- main component --- */

export default function JarvisDemo() {
  const { t } = useTranslation();

  const [state, setState] = useState('idle');       // idle | listening | thinking | speaking
  const [log, setLog] = useState([]);               // { kind: 'you'|'jarvis', text }
  const [busy, setBusy] = useState(false);
  const [speak, setSpeak] = useState(false);        // browser TTS toggle
  const seedRef = useRef(0);
  const transcriptRef = useRef(null);

  // Auto-scroll transcript.
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [log]);

  function speakOut(text) {
    if (!speak || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.15;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        /jenny|aria|zira|hazel|female|samantha/i.test(v.name)
      ) || voices.find(v => v.lang?.startsWith('en'));
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      /* speech synthesis is best-effort */
    }
  }

  async function run(command) {
    if (busy) return;
    setBusy(true);
    seedRef.current += 1;

    setState('listening');
    setLog(prev => [...prev, { kind: 'you', text: command.prompt }]);
    await new Promise(r => setTimeout(r, 380));

    setState('thinking');
    let responseText = '';
    try {
      responseText = await command.run(seedRef.current);
    } catch (e) {
      responseText = "The network isn't cooperating, sir. Try another command.";
    }
    await new Promise(r => setTimeout(r, 320));

    setState('speaking');
    setLog(prev => [...prev, { kind: 'jarvis', text: responseText }]);
    speakOut(responseText);
    const speakDuration = Math.min(3200, Math.max(1200, responseText.length * 42));
    await new Promise(r => setTimeout(r, speakDuration));

    setState('idle');
    setBusy(false);
  }

  const commands = useMemo(() => [
    {
      id: 'time',
      label: t('projects.jarvis.demo.chips.time'),
      icon: <FaClock aria-hidden />,
      prompt: 'what time is it',
      run: async () => respondTime(),
    },
    {
      id: 'weather',
      label: t('projects.jarvis.demo.chips.weather'),
      icon: <FaCloudSun aria-hidden />,
      prompt: 'weather in Vancouver',
      run: fetchWeatherVancouver,
    },
    {
      id: 'joke',
      label: t('projects.jarvis.demo.chips.joke'),
      icon: <FaLaughBeam aria-hidden />,
      prompt: 'tell me a joke',
      run: fetchJoke,
    },
    {
      id: 'trivia',
      label: t('projects.jarvis.demo.chips.trivia'),
      icon: <FaBrain aria-hidden />,
      prompt: 'give me trivia',
      run: fetchTrivia,
    },
    {
      id: 'news',
      label: t('projects.jarvis.demo.chips.news'),
      icon: <FaNewspaper aria-hidden />,
      prompt: 'news tech',
      run: async seed => respondNews(seed),
    },
    {
      id: 'cpu',
      label: t('projects.jarvis.demo.chips.cpu'),
      icon: <FaMicrochip aria-hidden />,
      prompt: 'cpu',
      run: async () => respondCPU(),
    },
    {
      id: 'battery',
      label: t('projects.jarvis.demo.chips.battery'),
      icon: <FaBatteryHalf aria-hidden />,
      prompt: 'battery',
      run: async () => respondBattery(),
    },
    {
      id: 'play',
      label: t('projects.jarvis.demo.chips.play'),
      icon: <FaMusic aria-hidden />,
      prompt: 'play blinding lights',
      run: async seed => pickResponse(CAPABILITY_RESPONSES.play, seed),
    },
    {
      id: 'screenshot',
      label: t('projects.jarvis.demo.chips.screenshot'),
      icon: <FaCamera aria-hidden />,
      prompt: 'take a screenshot',
      run: async seed => pickResponse(CAPABILITY_RESPONSES.screenshot, seed),
    },
    {
      id: 'volume',
      label: t('projects.jarvis.demo.chips.volume'),
      icon: <FaVolumeUp aria-hidden />,
      prompt: 'volume up',
      run: async seed => pickResponse(CAPABILITY_RESPONSES.volume, seed),
    },
  ], [t]);

  const stateLabel = t(`projects.jarvis.demo.states.${state}`);

  return (
    <div className="jarvis-demo">
      {/* --- left: orb + state chip --- */}
      <div className="jarvis-demo__stage">
        <div className={`jarvis-demo__orb jarvis-demo__orb--${state}`}>
          <span className="jarvis-demo__ring jarvis-demo__ring--outer" aria-hidden />
          <span className="jarvis-demo__ring jarvis-demo__ring--inner" aria-hidden />
          <span className="jarvis-demo__ripple" aria-hidden />
          <span className="jarvis-demo__ripple jarvis-demo__ripple--delayed" aria-hidden />
          <span className="jarvis-demo__core" aria-hidden />
        </div>
        <div className="jarvis-demo__state-chip">
          <FaMicrophone aria-hidden />
          <span>{stateLabel}</span>
        </div>
        <label className="jarvis-demo__speak-toggle">
          <input
            type="checkbox"
            checked={speak}
            onChange={e => setSpeak(e.target.checked)}
          />
          {speak ? <FaVolumeUp aria-hidden /> : <FaVolumeMute aria-hidden />}
          <span>{t('projects.jarvis.demo.speak')}</span>
        </label>
      </div>

      {/* --- right: transcript + chips --- */}
      <div className="jarvis-demo__panel">
        <div className="jarvis-demo__transcript" ref={transcriptRef}>
          {log.length === 0 && (
            <div className="jarvis-demo__empty">
              {t('projects.jarvis.demo.empty')}
            </div>
          )}
          {log.map((entry, idx) => (
            <div
              key={idx}
              className={`jarvis-demo__line jarvis-demo__line--${entry.kind}`}
            >
              <span className="jarvis-demo__who">
                {entry.kind === 'you' ? t('projects.jarvis.demo.you') : 'Jarvis'}
              </span>
              <span className="jarvis-demo__text">{entry.text}</span>
            </div>
          ))}
        </div>

        <div className="jarvis-demo__chips">
          {commands.map(c => (
            <button
              key={c.id}
              className="jarvis-demo__chip"
              onClick={() => run(c)}
              disabled={busy}
              title={c.prompt}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="jarvis-demo__foot">
          <p className="jarvis-demo__note">{t('projects.jarvis.demo.note')}</p>
          <a
            className="jarvis-demo__source"
            href="https://github.com/rsg28/jarvis"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub aria-hidden /> {t('projects.jarvis.demo.viewCode')}
          </a>
        </div>
      </div>
    </div>
  );
}
