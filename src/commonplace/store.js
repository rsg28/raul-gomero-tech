const KEY = 'rg.commonplace.v1';
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [2, 7, 21, 45, 90];

function empty() {
  return {
    seen: {},
    answers: {},
    streak: { days: 0, lastDay: null },
  };
}

function todayKey(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      ...empty(),
      ...parsed,
      seen: parsed.seen || {},
      answers: parsed.answers || {},
      streak: parsed.streak || { days: 0, lastDay: null },
    };
  } catch {
    return empty();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

function bumpStreak(state) {
  const day = todayKey();
  if (state.streak.lastDay === day) return;
  const yesterday = todayKey(Date.now() - DAY);
  state.streak.days = state.streak.lastDay === yesterday ? (state.streak.days || 0) + 1 : 1;
  state.streak.lastDay = day;
}

function touch(state, id) {
  const rec = state.seen[id] || { n: 0, first: Date.now(), kept: false };
  rec.last = Date.now();
  rec.n = rec.n || 0;
  state.seen[id] = rec;
  bumpStreak(state);
  return rec;
}

export function markSeen(id) {
  const state = load();
  if (!state.seen[id]) touch(state, id);
  save(state);
  return state;
}

export function keep(id) {
  const state = load();
  const rec = touch(state, id);
  rec.kept = true;
  rec.n = (rec.n || 0) + 1;
  const days = INTERVALS[Math.min(rec.n - 1, INTERVALS.length - 1)];
  rec.next = Date.now() + days * DAY;
  save(state);
  return state;
}

export function later(id) {
  const state = load();
  const rec = touch(state, id);
  rec.next = Date.now() + DAY;
  save(state);
  return state;
}

export function unkeep(id) {
  const state = load();
  if (state.seen[id]) {
    state.seen[id].kept = false;
    state.seen[id].next = null;
    save(state);
  }
  return state;
}

export function saveAnswer(id, text) {
  const state = load();
  const trimmed = text.trim();
  if (trimmed) state.answers[id] = trimmed;
  else delete state.answers[id];
  save(state);
  return state;
}

export function pickToday(ideas) {
  const state = load();
  const now = Date.now();
  const due = ideas.filter((i) => state.seen[i.id]?.kept && (state.seen[i.id].next || 0) <= now);
  if (due.length) {
    due.sort((a, b) => (state.seen[a.id].next || 0) - (state.seen[b.id].next || 0));
    return due[0];
  }
  const unseen = ideas.filter((i) => !state.seen[i.id]);
  if (unseen.length) {
    const seed = Math.floor(Date.now() / DAY);
    return unseen[seed % unseen.length];
  }
  return [...ideas].sort((a, b) => (state.seen[a.id]?.last || 0) - (state.seen[b.id]?.last || 0))[0];
}

export function nextUnread(ideas, currentId) {
  const idx = ideas.findIndex((i) => i.id === currentId);
  const rotated = [...ideas.slice(idx + 1), ...ideas.slice(0, idx)];
  const state = load();
  return rotated.find((i) => !state.seen[i.id]) || rotated[0] || null;
}

export function stats(ideas) {
  const state = load();
  const seen = Object.keys(state.seen).length;
  const kept = Object.values(state.seen).filter((x) => x.kept).length;
  const answered = Object.keys(state.answers).length;
  const fresh = state.streak.lastDay === todayKey() || state.streak.lastDay === todayKey(Date.now() - DAY);
  return {
    seen,
    kept,
    answered,
    total: ideas.length,
    streak: fresh ? state.streak.days : 0,
  };
}

export function keptIdeas(ideas) {
  const state = load();
  return ideas
    .filter((i) => state.seen[i.id]?.kept)
    .sort((a, b) => (state.seen[a.id].next || 0) - (state.seen[b.id].next || 0));
}

export function dueIn(id) {
  const rec = load().seen[id];
  if (!rec?.kept || !rec.next) return null;
  const days = Math.ceil((rec.next - Date.now()) / DAY);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'mañana';
  return `en ${days} días`;
}
