import React, { useMemo, useState } from 'react';
import { CASES, CATEGORIES, trackMeta } from './cases';
import * as store from './store';

function when(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Profile({ onBay }) {
  const [tick, setTick] = useState(0);
  const state = useMemo(() => store.load(), [tick]);
  const figures = useMemo(() => store.stats(CASES.length), [tick]);
  const rows = useMemo(() => {
    return Object.entries(state.cleared || {})
      .map(([id, rec]) => {
        const c = CASES.find((x) => x.id === id);
        return {
          id,
          rec,
          machine: c?.machine || id,
          customer: c?.customer || '',
          category: [trackMeta(c?.track)?.short, CATEGORIES.find((g) => g.id === c?.category)?.label || c?.category]
            .filter(Boolean)
            .join(' · '),
        };
      })
      .sort((a, b) => (b.rec.at || 0) - (a.rec.at || 0));
  }, [state]);

  const wipeOne = (id) => {
    store.wipeCase(id);
    setTick((n) => n + 1);
  };

  const wipeAll = () => {
    if (!window.confirm('Wipe the whole bay log? Cleared tickets and minutes go with it.')) return;
    store.wipeAll();
    setTick((n) => n + 1);
  };

  return (
    <main className="fb-profile">
      <header className="fb-profile__intro">
        <p className="fb-kicker">Technician file</p>
        <h1>Bay profile</h1>
        <p className="fb-lede">
          Local to this browser. F.R.I.D.A.Y. does not keep a copy. Wipe a row or the whole log when you want a clean bench.
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
        <div className="fb-profile__actions">
          <button type="button" className="fb-cta" onClick={onBay}>
            Back to queue
          </button>
          <button type="button" className="fb-danger" onClick={wipeAll} disabled={!rows.length}>
            Wipe all history
          </button>
        </div>
      </header>
      <section className="fb-profile__log">
        <h2>Closed tickets</h2>
        {!rows.length ? (
          <p className="fb-note">No closed jobs yet. Clear a machine on the bench and it lands here.</p>
        ) : (
          <table className="fb-table fb-profile__table">
            <thead>
              <tr>
                <th>When</th>
                <th>Machine</th>
                <th>Bay</th>
                <th>Time</th>
                <th>Probes</th>
                <th>Result</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{when(r.rec.at)}</td>
                  <td>
                    {r.machine}
                    <em>{r.customer}</em>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.rec.minutes} min</td>
                  <td>
                    {r.rec.tests} · {r.rec.wrong} miss
                  </td>
                  <td>{r.rec.firstHit ? 'First contact' : 'Closed'}</td>
                  <td>
                    <button type="button" className="fb-linkish" onClick={() => wipeOne(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
