import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CASES, CATEGORIES, TOOLS, TRACKS, allFixes, byId, shuffleOptions, trackMeta } from './cases';
import { applyFix, emptySession, toolCost } from './engine';
import * as store from './store';
import { Machine, ToolSurface } from './Tools';
import { bayTip, identifyFor, optionLists, screenBrief, tipFor, toolTitle } from './coach';
import Friday from './Friday';
import Profile from './Profile';
import './FaultBench.css';

function ledsFor(c, resolved) {
  if (resolved) return { pwr: 'on', hdd: 'ok', nic: 'ok', warn: false };
  const leds = { pwr: 'on', hdd: 'ok', nic: 'ok', warn: false };
  if (c.id === 'nvme-dying' || c.id === 'bsod-store') leds.hdd = 'err';
  if (c.id === 'sata-crc') leds.hdd = 'warn';
  if (c.category === 'network') leds.nic = 'warn';
  if (
    ['crash', 'memory', 'thermals', 'gpu', 'power', 'security'].includes(c.category) ||
    ['slow-disk', 'profile-temp', 'print-spooler', 'fast-startup'].includes(c.id)
  ) {
    leds.warn = true;
  }
  return leds;
}

function stepOf(session) {
  if (session.resolved) return 6;
  if (session.wrong.length) return 5;
  if (session.theory) return 4;
  if (session.tests.length) return 3;
  return 1;
}

const STEPS = [
  { n: 1, label: 'Identify' },
  { n: 3, label: 'Test' },
  { n: 4, label: 'Plan' },
  { n: 5, label: 'Implement' },
  { n: 6, label: 'Verify' },
];

export default function FaultBench() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const onProfile = location.pathname.includes('/profile');
  const caseId = params.get('c');
  const toolId = params.get('t');
  const caseObj = byId[caseId];
  const figures = store.stats(CASES.length);

  const [session, setSession] = useState(() => (caseId ? emptySession(caseId) : null));
  const [drawer, setDrawer] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('fb-root');
    const prev = document.title;
    document.title = 'Fault Bench — service bay';
    return () => {
      document.documentElement.classList.remove('fb-root');
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    if (!caseId) {
      setSession(null);
      return;
    }
    setSession(emptySession(caseId));
    setDrawer(null);
    setToast(null);
    store.recordOpen(caseId);
  }, [caseId]);

  const go = (next) => setParams(next, { replace: false });

  const runTool = (id) => {
    if (!session || session.tests.includes(id)) {
      go({ c: caseId, t: id });
      return;
    }
    setSession((s) => ({
      ...s,
      tests: [...s.tests, id],
      minutes: s.minutes + toolCost(id),
    }));
    go({ c: caseId, t: id });
  };

  const pinTheory = (id) => {
    setSession((s) => ({ ...s, theory: id }));
    setDrawer('fix');
  };

  const tryFix = (fixId) => {
    if (!caseObj || !session || session.resolved) return;
    const result = applyFix(caseObj, fixId);
    if (result.ok) {
      const next = {
        ...session,
        minutes: session.minutes + result.minutes,
        resolved: true,
        lastMessage: result.message,
        rootTheory: caseObj.rootTheory,
      };
      setSession(next);
      store.recordClear(caseObj.id, { ...next, rootTheory: caseObj.rootTheory });
      setToast({ ok: true, text: result.message });
      setDrawer('debrief');
    } else {
      const next = {
        ...session,
        minutes: session.minutes + result.minutes,
        wrong: [...session.wrong, fixId],
        lastMessage: result.message,
      };
      setSession(next);
      setToast({ ok: false, text: result.message });
    }
  };

  return (
    <div className="fb">
      <div className="fb__tape" aria-hidden="true" />
      <header className="fb__top">
        <button type="button" className="fb__mark" onClick={() => navigate('/fault-bench')}>
          <span>RG SERVICE</span>
          <strong>Fault Bench</strong>
        </button>
        <p className="fb__wo">
          WO-{String(421 + (caseObj ? CASES.findIndex((c) => c.id === caseObj.id) : 0)).padStart(4, '0')}
          {session ? ` · ${session.minutes} min` : ''}
        </p>
        <nav className="fb__links">
          <Link to="/fault-bench/profile" className={onProfile ? 'is-on' : ''}>
            Profile
          </Link>
          <Link to="/projects">Portfolio</Link>
        </nav>
      </header>

      {onProfile && <Profile onBay={() => navigate('/fault-bench')} />}
      {!onProfile && !caseObj && <Bay figures={figures} onOpen={(id) => go({ c: id })} />}
      {!onProfile && caseObj && session && (
        <CaseView
          caseObj={caseObj}
          session={session}
          toolId={toolId}
          drawer={drawer}
          toast={toast}
          onTool={runTool}
          onTheory={pinTheory}
          onFix={tryFix}
          onDrawer={setDrawer}
          onBay={() => go({})}
          onDismissToast={() => setToast(null)}
        />
      )}
    </div>
  );
}

function Bay({ figures, onOpen }) {
  const state = store.load();
  const [track, setTrack] = useState('all');
  const [cat, setCat] = useState('all');
  const shown = CASES.filter((c) => (track === 'all' || c.track === track) && (cat === 'all' || c.category === cat));
  const groupByTrack = track === 'all';
  const groups = (groupByTrack ? TRACKS : CATEGORIES)
    .filter((g) => g.id !== 'all')
    .map((g) => ({
      ...g,
      items: shown.filter((c) => (groupByTrack ? c.track === g.id : c.category === g.id)),
    }))
    .filter((g) => g.items.length);
  const activeTrack = trackMeta(track);

  return (
    <main className="fb-bay">
      <header className="fb-bay__intro">
        <p className="fb-kicker">LeetCode for the service desk.</p>
        <h1>{CASES.length} tickets. Exam tracks. One cause each.</h1>
        <p className="fb-lede">
          CompTIA-shaped original tickets — not dumps. The client names the pain, never the fault. You measure, pin one
          theory, spend minutes on a miss. General is the mixed IT queue. Security+ is defense only.
        </p>
        <ul className="fb-stats">
          <li>
            <strong>{figures.cleared}</strong>
            <span>cleared / {figures.total}</span>
          </li>
          <li>
            <strong>{figures.firstHit}</strong>
            <span>first contact</span>
          </li>
          <li>
            <strong>{figures.minutes}</strong>
            <span>bench minutes</span>
          </li>
        </ul>
        <p className="fb-note">
          Simulated lab. Public exam domains only — A+ Core 1/2, Network+, Security+, plus General. Identify, test,
          implement, verify. None of this is a leaked stem, and none of it touches your real PC.
        </p>
        <p className="fb-tip fb-tip--bay">
          <span>Tip</span>
          {bayTip(figures.cleared)}
        </p>
      </header>
      <div className="fb-bay__queue">
        <div className="fb-cats fb-cats--tracks" role="tablist" aria-label="Exam tracks">
          {TRACKS.map((g) => {
            const n = g.id === 'all' ? CASES.length : CASES.filter((c) => c.track === g.id).length;
            if (g.id !== 'all' && n === 0) return null;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                className={track === g.id ? 'is-on' : ''}
                onClick={() => {
                  setTrack(g.id);
                  setCat('all');
                }}
              >
                {g.label}
                <em>{n}</em>
              </button>
            );
          })}
        </div>
        {activeTrack?.blurb ? <p className="fb-track-blurb">{activeTrack.blurb}</p> : null}
        <div className="fb-cats" role="tablist" aria-label="Topics">
          {CATEGORIES.map((g) => {
            const pool = track === 'all' ? CASES : CASES.filter((c) => c.track === track);
            const n = g.id === 'all' ? pool.length : pool.filter((c) => c.category === g.id).length;
            if (g.id !== 'all' && n === 0) return null;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                className={cat === g.id ? 'is-on' : ''}
                onClick={() => setCat(g.id)}
              >
                {g.label}
                <em>{n}</em>
              </button>
            );
          })}
        </div>
        {groups.map((g) => (
          <section key={g.id} className="fb-queue-group">
            <h2>{g.label}</h2>
            <ol className="fb-queue">
              {g.items.map((c) => {
                const i = CASES.findIndex((x) => x.id === c.id);
                const rec = state.cleared[c.id];
                return (
                  <li key={c.id}>
                    <button type="button" className={rec ? 'is-cleared' : ''} onClick={() => onOpen(c.id)}>
                      <span className="fb-queue__n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="fb-queue__meta">
                        <strong>
                          {c.machine}
                          {c.badge ? <i className="fb-badge">{c.badge}</i> : null}
                        </strong>
                        <em>
                          {c.bay} · {c.customer} · {'●'.repeat(c.difficulty)}{'○'.repeat(3 - c.difficulty)}
                        </em>
                      </span>
                      <span className="fb-queue__ticket">{c.ticket}</span>
                      <span className={`fb-queue__done${rec ? '' : ' is-idle'}`}>
                        {rec ? `${rec.firstHit ? 'FCR' : 'closed'} · ${rec.minutes} min` : 'queued'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}

function CaseView({
  caseObj,
  session,
  toolId,
  drawer,
  toast,
  onTool,
  onTheory,
  onFix,
  onDrawer,
  onBay,
  onDismissToast,
}) {
  const step = stepOf(session);
  const leds = useMemo(() => ledsFor(caseObj, session.resolved), [caseObj, session.resolved]);
  const [netLog, setNetLog] = useState(null);
  const identify = useMemo(() => identifyFor(caseObj), [caseObj]);
  const tip = useMemo(() => tipFor(caseObj, toolId), [caseObj, toolId]);
  const theories = useMemo(
    () => shuffleOptions(caseObj.theories, `${caseObj.id}:theory`, caseObj.rootTheory),
    [caseObj],
  );
  const fixes = useMemo(
    () => shuffleOptions(allFixes(caseObj), `${caseObj.id}:fix`, caseObj.rootFix),
    [caseObj],
  );
  const screen = useMemo(
    () => screenBrief(caseObj, toolId, session.resolved, { netLog }),
    [caseObj, toolId, session.resolved, netLog],
  );
  const lists = useMemo(() => optionLists(theories, fixes, session), [theories, fixes, session]);
  const fridayCtx = useMemo(
    () => ({
      toolId,
      toolTitle: screen.title,
      watching: toolId ? `Watching the page · ${toolTitle(toolId)}` : 'Watching the whole page',
      placeholder: 'Ask what a line means — not which button to click',
      screen: screen.text,
      tests: session.tests,
      theory: caseObj.theories.find((t) => t.id === session.theory)?.label || '',
      resolved: session.resolved,
      drawer: session.resolved ? 'debrief' : drawer,
      toast: toast?.text || '',
      theories: lists.theories,
      fixes: lists.fixes,
    }),
    [caseObj, drawer, lists, screen, session, toast, toolId],
  );

  return (
    <main className="fb-case">
      <div className="fb-case__bench">
      <ol className="fb-steps" aria-label="Method">
        {STEPS.map((s) => (
          <li key={s.n} className={step >= s.n ? 'is-on' : ''}>
            {s.label}
          </li>
        ))}
      </ol>

      <div className="fb-stage">
      <div className="fb-grid">
        <section className="fb-col fb-col--machine">
          <Machine caseObj={caseObj} resolved={session.resolved} leds={leds} />
          <p className="fb-machine-name">{caseObj.machine}</p>
          <p className="fb-machine-sub">{caseObj.customer}</p>
          <button type="button" className="fb-back" onClick={onBay}>
            ← Queue
          </button>
        </section>

        <section className="fb-col fb-col--work">
          <p className="fb-tip">
            <span>Tip</span>
            {tip}
          </p>
          <ToolSurface
            key={`${caseObj.id}-${session.resolved}-${toolId || 'none'}`}
            caseObj={caseObj}
            toolId={toolId}
            resolved={session.resolved}
            identify={identify}
            onScreen={setNetLog}
          />
        </section>

        <aside className="fb-col fb-col--clip">
          <article className="fb-clip">
            <p className="fb-clip__label">Work order</p>
            <h2>{caseObj.customer}</h2>
            <p>{caseObj.ticket}</p>
            <p className="fb-clip__tags">
              {caseObj.track ? <span>{trackMeta(caseObj.track)?.short || caseObj.track}</span> : null}
              {caseObj.category ? <span>{CATEGORIES.find((g) => g.id === caseObj.category)?.label || caseObj.category}</span> : null}
              {caseObj.domain ? <span>{caseObj.domain}</span> : null}
              {caseObj.tags
                .filter((t) => t !== caseObj.category && t !== caseObj.track)
                .map((t) => (
                  <span key={t}>{t}</span>
                ))}
            </p>
          </article>
          <p className="fb-labor">
            Labor <strong>{session.minutes} min</strong>
            <span>
              {session.tests.length} probes · {session.wrong.length} misses
            </span>
          </p>
          {session.theory && (
            <p className="fb-theory">
              Theory: {caseObj.theories.find((t) => t.id === session.theory)?.label}
            </p>
          )}
        </aside>
      </div>
      </div>

      <nav className="fb-drawer" aria-label="Tools">
        {TOOLS.map((t) => {
          const used = session.tests.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className={`${toolId === t.id ? 'is-on' : ''} ${used ? 'is-used' : ''}`}
              onClick={() => onTool(t.id)}
              title={`${t.hint} · ${t.cost} min`}
            >
              {t.label}
              <em>{used ? 'ok' : `+${t.cost}`}</em>
            </button>
          );
        })}
        <button
          type="button"
          className={`fb-drawer__fix${drawer === 'theory' || drawer === 'fix' ? ' is-on' : ''}`}
          onClick={() => onDrawer(drawer === 'fix' || drawer === 'theory' ? null : session.theory ? 'fix' : 'theory')}
        >
          {session.resolved ? 'Debrief' : 'Theory / fix'}
        </button>
      </nav>

      {(drawer === 'theory' || drawer === 'fix' || drawer === 'debrief' || session.resolved) && (
        <section className="fb-sheet">
          {session.resolved ? (
            <Debrief caseObj={caseObj} session={session} onBay={onBay} />
          ) : drawer === 'theory' ? (
            <div>
              <h3>What is broken?</h3>
              <p className="fb-sheet__hint">One theory. Then a fix that tests it. Guessing costs minutes too.</p>
              <ul className="fb-actions">
                {theories.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => onTheory(t.id)}>
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h3>Apply a fix</h3>
              <p className="fb-sheet__hint">
                If you are wrong, the machine stays broken and the clock keeps running. Reinstalling is almost never the first move.
              </p>
              <ul className="fb-actions">
                {fixes.map((f) => (
                  <li key={f.id}>
                    <button type="button" onClick={() => onFix(f.id)} disabled={session.wrong.includes(f.id)}>
                      <span>
                        {f.label}
                        {f.blurb ? <em>{f.blurb}</em> : null}
                      </span>
                      <b>{f.cost} min</b>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {toast && (
        <div className={`fb-toast${toast.ok ? ' is-ok' : ' is-bad'}`} role="status">
          <p>{toast.text}</p>
          <button type="button" onClick={onDismissToast}>
            Dismiss
          </button>
        </div>
      )}
      </div>
      <Friday key={caseObj.id} caseId={caseObj.id} context={fridayCtx} />
    </main>
  );
}

function Debrief({ caseObj, session, onBay }) {
  const theoryOk = session.theory === caseObj.rootTheory;
  return (
    <div className="fb-debrief">
      <p className="fb-kicker">Closed</p>
      <h3>{theoryOk ? 'Cause and theory match.' : 'The fix worked. The theory was not that.'}</h3>
      <p>
        <strong>Cause. </strong>
        {caseObj.debrief.cause}
      </p>
      <p>
        <strong>Herring. </strong>
        {caseObj.debrief.herring}
      </p>
      <p>
        <strong>Method. </strong>
        {caseObj.debrief.method}
      </p>
      <p className="fb-labor">
        Final ticket: {session.minutes} min · {session.tests.length} probes · {session.wrong.length} missed attempts
        {session.wrong.length === 0 ? ' · first contact' : ''}
      </p>
      <button type="button" className="fb-cta" onClick={onBay}>
        Next machine
      </button>
    </div>
  );
}
