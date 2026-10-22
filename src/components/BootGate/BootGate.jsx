import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './BootGate.css';

const BIOS_LINES = [
  'ARMOURY BIOS v1.0 — Copyright (C) 2026 Raul Gomero',
  'CPU: Intel Core Ultra 7 265KF @ 5.50GHz',
  'Memory Test: 32768MB OK',
  'Storage: 2TB NVMe SSD detected',
  'GPU: NVIDIA GeForce RTX 5060 Ti',
  'Loading RG Systems CLI...',
];

/** Original geometric spider mark — not a trademark logo */
const SpiderMark = ({ className }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="52" r="18" fill="currentColor" />
    <ellipse cx="60" cy="68" rx="14" ry="16" fill="currentColor" />
    <circle cx="53" cy="48" r="3.5" fill="#0a0a0c" />
    <circle cx="67" cy="48" r="3.5" fill="#0a0a0c" />
    <path d="M42 50 C20 40 12 28 8 18" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M42 58 C18 58 10 52 4 44" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M44 66 C22 74 12 86 8 98" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M48 72 C30 88 28 100 26 110" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M78 50 C100 40 108 28 112 18" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M78 58 C102 58 110 52 116 44" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M76 66 C98 74 108 86 112 98" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M72 72 C90 88 92 100 94 110" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * Boot: BIOS → shell → 5s load → ~3s spider blink/roam → yank curtain up
 */
const BootGate = ({ onRevealSite, onDone }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('bios'); // bios | shell | load | yank
  const [biosCount, setBiosCount] = useState(0);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState(0);
  const [spiderMove, setSpiderMove] = useState('idle'); // idle | blink | circle | fly
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const onRevealRef = useRef(onRevealSite);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onRevealRef.current = onRevealSite;
    onDoneRef.current = onDone;
  }, [onRevealSite, onDone]);

  useEffect(() => {
    if (phase !== 'bios') return;
    const timers = BIOS_LINES.map((_, i) =>
      setTimeout(() => setBiosCount(i + 1), 220 + i * 280)
    );
    const next = setTimeout(() => {
      setPhase('shell');
      setLines([
        { type: 'sys', text: t('boot.shellBoot1') },
        { type: 'sys', text: t('boot.shellBoot2') },
        { type: 'out', text: t('boot.shellHint') },
      ]);
    }, 220 + BIOS_LINES.length * 280 + 400);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(next);
    };
  }, [phase, t]);

  useEffect(() => {
    if (phase === 'shell') setTimeout(() => inputRef.current?.focus(), 100);
  }, [phase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [lines]);

  // Progress only — never calls parent setters that would remount this effect
  useEffect(() => {
    if (phase !== 'load') return;
    setProgress(0);
    setLoadStatus(0);
    setSpiderMove('idle');

    const start = Date.now();
    const duration = 5000;
    const statuses = t('boot.loadStatuses', { returnObjects: true });
    const statusList = Array.isArray(statuses) ? statuses : [];
    let rafId = 0;
    let finished = false;

    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setProgress(Math.round(p * 100));
      if (statusList.length) {
        setLoadStatus(Math.min(statusList.length - 1, Math.floor(p * statusList.length)));
      }
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        // Keep loader on screen — spider does its flourish BEFORE revealing the site
        setSpiderMove('blink');
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, t]);

  // Spider choreography (~3s): blink → roam → yank (site mounts under curtain)
  useEffect(() => {
    if (spiderMove === 'blink') {
      const t1 = setTimeout(() => setSpiderMove('circle'), 1300);
      return () => clearTimeout(t1);
    }
    if (spiderMove === 'circle') {
      const t1 = setTimeout(() => {
        // Curtain still fully covers — safe to mount site underneath
        onRevealRef.current?.();
        window.scrollTo(0, 0);
        setPhase('yank');
        setSpiderMove('fly');
      }, 1700);
      return () => clearTimeout(t1);
    }
    if (spiderMove === 'fly') {
      const t1 = setTimeout(() => {
        onDoneRef.current?.();
        window.scrollTo(0, 0);
      }, 1300);
      return () => clearTimeout(t1);
    }
    return undefined;
  }, [spiderMove]);

  const push = (items) => setLines((prev) => [...prev, ...items]);

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    push([{ type: 'in', text: `C:\\Users\\raul> ${raw}` }]);

    if (cmd === 'clear' || cmd === 'cls') {
      setLines([]);
      return;
    }
    if (cmd === 'help') {
      push((t('boot.help', { returnObjects: true }) || []).map((text) => ({ type: 'out', text })));
      return;
    }
    if (cmd === 'whoami') {
      push((t('boot.whoami', { returnObjects: true }) || []).map((text) => ({ type: 'out', text })));
      return;
    }
    if (cmd === 'interests' || cmd === 'life') {
      push((t('boot.interests', { returnObjects: true }) || []).map((text) => ({ type: 'out', text })));
      return;
    }
    if (cmd === 'skills') {
      push((t('boot.skills', { returnObjects: true }) || []).map((text) => ({ type: 'out', text })));
      return;
    }
    if (cmd === 'open' || cmd === 'enter' || cmd === 'start' || cmd === 'go') {
      push([{ type: 'sys', text: t('boot.opening') }]);
      setTimeout(() => startReveal(), 400);
      return;
    }
    push([{ type: 'err', text: t('boot.unknown', { cmd: raw }) }]);
  };

  const startReveal = () => {
    setPhase('load');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  const statusLines = t('boot.loadStatuses', { returnObjects: true });
  const currentStatus = Array.isArray(statusLines) ? statusLines[loadStatus] : t('boot.loadTitle');

  const spiderAnimate =
    spiderMove === 'blink'
      ? { opacity: [1, 0.12, 1, 0.12, 1, 0.2, 1], scale: [1, 1.1, 1, 1.12, 1, 1.06, 1] }
      : spiderMove === 'circle'
        ? {
            x: [0, 48, 28, -36, -48, 0],
            y: [0, -18, -56, -40, -12, 0],
            rotate: [0, 18, -8, -22, 14, 0],
          }
        : spiderMove === 'idle'
          ? { y: [0, -6, 0] }
          : {};

  const spiderTransition =
    spiderMove === 'blink'
      ? { duration: 1.25, times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1], ease: 'easeInOut' }
      : spiderMove === 'circle'
        ? { duration: 1.65, ease: 'easeInOut' }
        : spiderMove === 'idle'
          ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 };

  return (
    <div className={`boot ${phase === 'yank' ? 'boot--yanking' : ''}`}>
      {phase !== 'yank' && (
        <div className="boot__lang" aria-label="Language">
          <LanguageSwitcher />
        </div>
      )}
      <AnimatePresence mode="wait">
        {phase === 'bios' && (
          <motion.div
            key="bios"
            className="boot__bios"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="boot__scan" aria-hidden="true" />
            <div className="boot__bios-panel">
              <p className="boot__brand">RG SYSTEMS</p>
              {BIOS_LINES.slice(0, biosCount).map((line, i) => (
                <p key={i} className="boot__bios-line">
                  <span className="boot__ok">[OK]</span> {line}
                </p>
              ))}
              {biosCount < BIOS_LINES.length && <span className="boot__cursor">█</span>}
            </div>
          </motion.div>
        )}

        {phase === 'shell' && (
          <motion.div
            key="shell"
            className="boot__shell-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="boot__shell" onClick={() => inputRef.current?.focus()}>
              <div className="boot__chrome">
                <span className="boot__dot boot__dot--r" />
                <span className="boot__dot boot__dot--y" />
                <span className="boot__dot boot__dot--g" />
                <span className="boot__path">C:\Users\raul\boot</span>
              </div>
              <div className="boot__body">
                {lines.map((line, i) => (
                  <p key={i} className={`boot__line boot__line--${line.type}`}>{line.text}</p>
                ))}
                <form className="boot__form" onSubmit={onSubmit}>
                  <span className="boot__prompt">C:\Users\raul&gt;</span>
                  <input
                    ref={inputRef}
                    className="boot__input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Boot shell"
                  />
                </form>
                <div ref={endRef} />
              </div>
              <div className="boot__chips" role="toolbar" aria-label="Quick commands">
                {['help', 'whoami', 'interests', 'skills'].map((c) => (
                  <button key={c} type="button" className="boot__chip" onClick={() => run(c)}>{c}</button>
                ))}
                <motion.button
                  key="open"
                  type="button"
                  className="boot__chip boot__chip--open"
                  onClick={() => run('open')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 rgba(251, 146, 60, 0)',
                      '0 0 22px rgba(251, 146, 60, 0.55)',
                      '0 0 0 rgba(251, 146, 60, 0)',
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  aria-label={t('boot.enterAria')}
                >
                  <span className="boot__chip-caret">▸</span>
                  <span className="boot__chip-label">open</span>
                  <span className="boot__chip-hint">{t('boot.enterHint')}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'load' && (
          <motion.div
            key="load"
            className="boot__loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <motion.div
              className="boot__spider-wrap"
              animate={spiderAnimate}
              transition={spiderTransition}
            >
              <SpiderMark className="boot__spider" />
            </motion.div>
            <h2 className="boot__load-title">{t('boot.loadTitle')}</h2>
            <p className="boot__load-status">
              {spiderMove === 'blink' || spiderMove === 'circle'
                ? t('boot.loadReady')
                : currentStatus}
            </p>
            <div className="boot__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="boot__bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="boot__load-pct">{progress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yank lives outside mode=wait so curtain never flashes the site */}
      {phase === 'yank' && (
        <div className="boot__yank" aria-hidden="true">
          <motion.div
            className="boot__curtain"
            initial={{ y: '0%' }}
            animate={{ y: '-115%' }}
            transition={{ duration: 1.15, ease: [0.7, 0, 0.3, 1] }}
          >
            {/* Spider rides the curtain — web shoots up, then both fly away */}
            <div className="boot__yank-spider-slot">
              <motion.div
                className="boot__web-strand-v"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 1, 1, 0.4] }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <motion.div
                initial={{ y: 0, rotate: 0 }}
                animate={{ y: -40, rotate: [0, -12, 10, -6, 0] }}
                transition={{ duration: 1.15, ease: [0.7, 0, 0.3, 1] }}
              >
                <SpiderMark className="boot__spider boot__spider--pull" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BootGate;
