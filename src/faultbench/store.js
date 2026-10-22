const KEY = 'rg.faultbench.v1';

function empty() {
  return { cleared: {}, last: null };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return { ...empty(), ...parsed, cleared: parsed.cleared || {} };
  } catch {
    return empty();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function recordClear(caseId, session) {
  const state = load();
  const prev = state.cleared[caseId];
  const firstHit = session.wrong.length === 0;
  const rec = {
    at: Date.now(),
    minutes: session.minutes,
    tests: session.tests.length,
    wrong: session.wrong.length,
    firstHit,
    theoryOk: session.theory === session.rootTheory || undefined,
  };
  if (!prev || rec.minutes < prev.minutes) state.cleared[caseId] = rec;
  else if (prev && firstHit && !prev.firstHit) state.cleared[caseId] = { ...prev, firstHit: true };
  state.last = caseId;
  save(state);
  return state;
}

export function stats(total) {
  const state = load();
  const rows = Object.values(state.cleared);
  const n = rows.length;
  const first = rows.filter((r) => r.firstHit).length;
  const minutes = rows.reduce((a, r) => a + (r.minutes || 0), 0);
  return {
    cleared: n,
    total,
    firstHit: first,
    minutes,
    remaining: Math.max(0, total - n),
  };
}
