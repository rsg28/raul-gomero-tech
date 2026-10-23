const KEY = 'rg.faultbench.v1';

function empty() {
  return { cleared: {}, last: null, log: [], chats: {} };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return { ...empty(), ...parsed, cleared: parsed.cleared || {}, log: parsed.log || [], chats: parsed.chats || {} };
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

export function recordOpen(caseId) {
  const state = load();
  state.last = caseId;
  state.log = [...(state.log || []), { at: Date.now(), caseId, kind: 'open' }].slice(-240);
  save(state);
  return state;
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
  state.log = [...(state.log || []), { at: rec.at, caseId, kind: 'clear', ...rec }].slice(-240);
  save(state);
  return state;
}

export function wipeCase(caseId) {
  const state = load();
  delete state.cleared[caseId];
  if (state.chats) delete state.chats[caseId];
  state.log = (state.log || []).filter((row) => row.caseId !== caseId);
  if (state.last === caseId) state.last = null;
  save(state);
  return state;
}

export function loadChat(caseId) {
  if (!caseId) return [];
  const rows = load().chats?.[caseId];
  return Array.isArray(rows) ? rows : [];
}

export function saveChat(caseId, messages) {
  if (!caseId) return;
  const state = load();
  state.chats = state.chats || {};
  state.chats[caseId] = (messages || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-120);
  save(state);
}

export function wipeAll() {
  const next = empty();
  save(next);
  return next;
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
