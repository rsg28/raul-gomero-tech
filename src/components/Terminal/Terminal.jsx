import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import './Terminal.css';

const COMMANDS = {
  help: (t) => t('terminal.help', { returnObjects: true }),
  whoami: (t) => t('terminal.whoami', { returnObjects: true }),
  skills: (t) => t('terminal.skills', { returnObjects: true }),
  stack: (t) => t('terminal.skills', { returnObjects: true }),
  experience: (t) => t('terminal.experience', { returnObjects: true }),
  pc: (t) => t('terminal.pc', { returnObjects: true }),
  contact: (t) => t('terminal.contact', { returnObjects: true }),
  clear: null,
};

const Terminal = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inView && !booted) {
      setBooted(true);
      setLines([
        { type: 'sys', text: t('terminal.boot1') },
        { type: 'sys', text: t('terminal.boot2') },
        { type: 'out', text: t('terminal.hint') },
      ]);
    }
  }, [inView, booted, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [lines]);

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    setLines((prev) => [...prev, { type: 'in', text: `C:\\Users\\raul> ${raw}` }]);

    if (cmd === 'clear' || cmd === 'cls') {
      setLines([]);
      return;
    }

    if (cmd === 'open pc' || cmd === 'goto pc') {
      setLines((prev) => [...prev, { type: 'out', text: t('terminal.openingPc') }]);
      setTimeout(() => {
        document.querySelector('#pc')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return;
    }

    const key = cmd.split(/\s+/)[0];
    const handler = COMMANDS[key];
    if (handler) {
      const out = handler(t);
      const texts = Array.isArray(out) ? out : [String(out)];
      setLines((prev) => [...prev, ...texts.map((text) => ({ type: 'out', text }))]);
    } else {
      setLines((prev) => [
        ...prev,
        { type: 'err', text: t('terminal.unknown', { cmd: raw }) },
      ]);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  return (
    <section id="terminal" className="terminal section" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="terminal__header">
            <span className="stencil-tag">{t('terminal.tag')}</span>
            <h2 className="section__title">{t('terminal.title')}</h2>
            <p className="section__subtitle">{t('terminal.subtitle')}</p>
          </div>

          <div
            className="terminal__window"
            onClick={() => inputRef.current?.focus()}
            role="application"
            aria-label="Interactive terminal"
          >
            <div className="terminal__chrome">
              <span className="terminal__dot terminal__dot--r" />
              <span className="terminal__dot terminal__dot--y" />
              <span className="terminal__dot terminal__dot--g" />
              <span className="terminal__path">C:\Users\raul\portfolio</span>
            </div>
            <div className="terminal__body">
              {lines.map((line, i) => (
                <p key={i} className={`terminal__line terminal__line--${line.type}`}>
                  {line.text}
                </p>
              ))}
              <form className="terminal__form" onSubmit={onSubmit}>
                <span className="terminal__prompt">C:\Users\raul&gt;</span>
                <input
                  ref={inputRef}
                  className="terminal__input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal command"
                />
              </form>
              <div ref={endRef} />
            </div>
            <div className="terminal__chips">
              {['help', 'whoami', 'skills', 'pc', 'contact', 'clear'].map((c) => (
                <button key={c} type="button" className="terminal__chip" onClick={() => run(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Terminal;
