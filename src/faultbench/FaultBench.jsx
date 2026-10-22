import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CASES, TOOLS, allFixes, byId } from './cases';
import { applyFix, emptySession, toolCost } from './engine';
import * as store from './store';
import { Machine, ToolSurface } from './Tools';
import './FaultBench.css';

function ledsFor(c, resolved) {
  if (resolved) return { pwr: 'on', hdd: 'ok', nic: 'ok', warn: false };
  const leds = { pwr: 'on', hdd: 'ok', nic: 'ok', warn: false };
  if (c.id === 'nvme-dying') leds.hdd = 'err';
  if (c.id === 'dns-dead' || c.id === 'apipa-dhcp') leds.nic = 'warn';
  if (['thermal-paste', 'kernel-power', 'gpu-driver', 'bad-dimm'].includes(c.id)) leds.warn = true;
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
  { n: 1, label: 'Identificar' },
  { n: 3, label: 'Probar' },
  { n: 4, label: 'Plan' },
  { n: 5, label: 'Implementar' },
  { n: 6, label: 'Verificar' },
];

export default function FaultBench() {
  const [params, setParams] = useSearchParams();
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
    document.title = 'Fault Bench — bahía de servicio';
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
        <button type="button" className="fb__mark" onClick={() => go({})}>
          <span>RG SERVICE</span>
          <strong>Fault Bench</strong>
        </button>
        <p className="fb__wo">
          WO-{String(421 + (caseObj ? CASES.findIndex((c) => c.id === caseObj.id) : 0)).padStart(4, '0')}
          {session ? ` · ${session.minutes} min` : ''}
        </p>
        <Link className="fb__exit" to="/projects">
          Portfolio
        </Link>
      </header>

      {!caseObj && <Bay figures={figures} onOpen={(id) => go({ c: id })} />}
      {caseObj && session && (
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
  return (
    <main className="fb-bay">
      <header className="fb-bay__intro">
        <p className="fb-kicker">No es un quiz. Es una mesa.</p>
        <h1>Ocho máquinas. Un síntoma cada una. Una causa.</h1>
        <p className="fb-lede">
          El cliente nunca te nombra el fallo. Te nombra el dolor. Abres visor de eventos, SMART, sondas, ping — y te
          prohíbes formatear por aburrimiento. Un arreglo equivocado suma horas y no apaga el LED.
        </p>
        <ul className="fb-stats">
          <li>
            <strong>{figures.cleared}</strong>
            <span>cerradas / {figures.total}</span>
          </li>
          <li>
            <strong>{figures.firstHit}</strong>
            <span>a la primera</span>
          </li>
          <li>
            <strong>{figures.minutes}</strong>
            <span>minutos de banco</span>
          </li>
        </ul>
        <p className="fb-note">
          Laboratorio simulado. CompTIA A+ en el hábito, no en la pregunta de test: identificar, probar, implementar,
          verificar. Nada de esto toca tu PC real.
        </p>
      </header>
      <ol className="fb-queue">
        {CASES.map((c, i) => {
          const rec = state.cleared[c.id];
          return (
            <li key={c.id}>
              <button type="button" className={rec ? 'is-cleared' : ''} onClick={() => onOpen(c.id)}>
                <span className="fb-queue__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="fb-queue__meta">
                  <strong>{c.machine}</strong>
                  <em>
                    {c.bay} · {c.customer} · {'●'.repeat(c.difficulty)}{'○'.repeat(3 - c.difficulty)}
                  </em>
                </span>
                <span className="fb-queue__ticket">{c.ticket}</span>
                <span className={`fb-queue__done${rec ? '' : ' is-idle'}`}>
                  {rec ? `${rec.firstHit ? 'FCR' : 'cerrada'} · ${rec.minutes} min` : 'en cola'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
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
  const fixes = allFixes(caseObj);

  return (
    <main className="fb-case">
      <ol className="fb-steps" aria-label="Método">
        {STEPS.map((s) => (
          <li key={s.n} className={step >= s.n ? 'is-on' : ''}>
            {s.label}
          </li>
        ))}
      </ol>

      <div className="fb-grid">
        <section className="fb-col fb-col--machine">
          <Machine caseObj={caseObj} resolved={session.resolved} leds={leds} />
          <p className="fb-machine-name">{caseObj.machine}</p>
          <p className="fb-machine-sub">{caseObj.customer}</p>
          <button type="button" className="fb-back" onClick={onBay}>
            ← Cola
          </button>
        </section>

        <section className="fb-col fb-col--work">
          <ToolSurface
            key={`${caseObj.id}-${session.resolved}-${toolId || 'none'}`}
            caseObj={caseObj}
            toolId={toolId}
            resolved={session.resolved}
          />
        </section>

        <aside className="fb-col fb-col--clip">
          <article className="fb-clip">
            <p className="fb-clip__label">Parte de trabajo</p>
            <h2>{caseObj.customer}</h2>
            <p>{caseObj.ticket}</p>
            <p className="fb-clip__tags">
              {caseObj.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </p>
          </article>
          <p className="fb-labor">
            Labor <strong>{session.minutes} min</strong>
            <span>
              {session.tests.length} sondas · {session.wrong.length} mal
            </span>
          </p>
          {session.theory && (
            <p className="fb-theory">
              Teoría: {caseObj.theories.find((t) => t.id === session.theory)?.label}
            </p>
          )}
        </aside>
      </div>

      <nav className="fb-drawer" aria-label="Herramientas">
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
          {session.resolved ? 'Debrief' : 'Teoría / arreglo'}
        </button>
      </nav>

      {(drawer === 'theory' || drawer === 'fix' || drawer === 'debrief' || session.resolved) && (
        <section className="fb-sheet">
          {session.resolved ? (
            <Debrief caseObj={caseObj} session={session} onBay={onBay} />
          ) : drawer === 'theory' ? (
            <div>
              <h3>¿Qué está roto?</h3>
              <p className="fb-sheet__hint">Una teoría. Luego un arreglo que la ponga a prueba. Adivinar también cuesta.</p>
              <ul className="fb-actions">
                {caseObj.theories.map((t) => (
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
              <h3>Aplicar arreglo</h3>
              <p className="fb-sheet__hint">
                Si te equivocas, la máquina no se arregla y el reloj sigue. Formatear casi nunca es el primer movimiento.
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
            Cerrar
          </button>
        </div>
      )}
    </main>
  );
}

function Debrief({ caseObj, session, onBay }) {
  const theoryOk = session.theory === caseObj.rootTheory;
  return (
    <div className="fb-debrief">
      <p className="fb-kicker">Cerrada</p>
      <h3>{theoryOk ? 'Causa y teoría coinciden.' : 'El arreglo funcionó. La teoría no era esa.'}</h3>
      <p>
        <strong>Causa. </strong>
        {caseObj.debrief.cause}
      </p>
      <p>
        <strong>Anzuelo. </strong>
        {caseObj.debrief.herring}
      </p>
      <p>
        <strong>Método. </strong>
        {caseObj.debrief.method}
      </p>
      <p className="fb-labor">
        Parte final: {session.minutes} min · {session.tests.length} sondas · {session.wrong.length} intentos fallidos
        {session.wrong.length === 0 ? ' · first contact' : ''}
      </p>
      <button type="button" className="fb-cta" onClick={onBay}>
        Siguiente máquina
      </button>
    </div>
  );
}
