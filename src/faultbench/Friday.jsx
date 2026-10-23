import React, { useEffect, useRef, useState } from 'react';
import { readVisiblePage } from './coach';
import * as store from './store';

async function askFriday(payload) {
  const res = await fetch('/api/friday', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'F.R.I.D.A.Y. is offline.');
  return data.reply;
}

function FridayFace({ listening }) {
  const eye = listening ? '#8ee39a' : '#f2c14d';
  return (
    <svg className="fb-friday-face" viewBox="0 0 80 108" aria-hidden="true">
      <ellipse cx="40" cy="102" rx="16" ry="3.5" fill="#000" opacity="0.35" />
      <path d="M18 70h44l6 32H12z" fill="#2a231b" />
      <path d="M24 70h32l4 28H20z" fill="#3a3228" />
      <rect x="34" y="78" width="12" height="8" rx="1" fill="#e3a32a" />
      <text x="40" y="84.2" textAnchor="middle" fill="#1b1712" fontSize="6" fontFamily="ui-monospace,monospace">
        F
      </text>
      <rect x="36" y="64" width="8" height="8" fill="#c4b49a" />
      <circle cx="40" cy="36" r="22" fill="#d8c4a4" />
      <path d="M20 30c2-16 12-24 20-24s18 8 20 24" fill="#1a1612" />
      <rect x="18" y="28" width="44" height="12" rx="3" fill="#0c0b09" />
      <rect x="20" y="30" width="40" height="8" rx="2" fill="#111" />
      <circle cx="30" cy="34" r="2.6" fill={eye} />
      <circle cx="50" cy="34" r="2.6" fill={eye} />
      <path d="M14 38c-5 3-7 10-6 16" fill="none" stroke="#8a8276" strokeWidth="2.2" />
      <circle cx="8" cy="56" r="3.4" fill="#2a241c" stroke="#e3a32a" strokeWidth="1.3" />
    </svg>
  );
}

export default function Friday({ caseId, context }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => store.loadChat(caseId));
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [unread, setUnread] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages(store.loadChat(caseId));
    setDraft('');
    setErr(null);
    setUnread(false);
  }, [caseId]);

  useEffect(() => {
    store.saveChat(caseId, messages);
  }, [caseId, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const send = async (text) => {
    const content = (text || draft).trim();
    if (!content || busy) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setDraft('');
    setBusy(true);
    setErr(null);
    try {
      const page = readVisiblePage(document.querySelector('.fb'), { hideDebrief: !context.resolved });
      const reply = await askFriday({ messages: next, context: { ...context, page: page || context.screen } });
      setMessages([...next, { role: 'assistant', content: reply }]);
      if (!open) setUnread(true);
    } catch (e) {
      setErr(e.message || 'F.R.I.D.A.Y. is offline.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className={`fb-friday${open ? ' is-open' : ''}`} aria-label="F.R.I.D.A.Y.">
      <button
        type="button"
        className={`fb-friday__persona${unread ? ' has-mail' : ''}${busy ? ' is-live' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="fb-friday-panel"
        title={open ? 'Hide F.R.I.D.A.Y.' : 'Ask F.R.I.D.A.Y.'}
      >
        <FridayFace listening={busy || open} />
        <span className="fb-friday__tag">F.R.I.D.A.Y.</span>
        <em className="fb-friday__pip" aria-hidden="true" />
      </button>

      {open && (
        <section id="fb-friday-panel" className="fb-friday__panel">
          <header className="fb-friday__top">
            <p className="fb-kicker">F.R.I.D.A.Y.</p>
            <p className="fb-friday__eye">{context.watching}</p>
            <button type="button" className="fb-friday__x" onClick={() => setOpen(false)}>
              Close
            </button>
          </header>
          <div className="fb-friday__log" role="log">
            {messages.length === 0 && (
              <p className="fb-friday__hello">
                I can read this screen. I will not name the cause or the fix. Ask what a line means. Enter sends. Shift+Enter is a new line.
              </p>
            )}
            {messages.map((m, i) => (
              <p key={`${m.role}-${i}`} className={`fb-friday__msg is-${m.role}`}>
                <span>{m.role === 'assistant' ? 'F' : 'You'}</span>
                {m.content}
              </p>
            ))}
            {busy && <p className="fb-friday__msg is-assistant is-wait">Reading the screen…</p>}
            {err && <p className="fb-friday__err">{err}</p>}
            <div ref={endRef} />
          </div>
          <form
            className="fb-friday__form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="fb-sr" htmlFor="fb-friday-q">
              Ask F.R.I.D.A.Y.
            </label>
            <textarea
              id="fb-friday-q"
              ref={inputRef}
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={context.placeholder || 'Ask a question'}
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !draft.trim()}>
              Ask
            </button>
          </form>
        </section>
      )}
    </aside>
  );
}
