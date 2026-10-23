/** Shared factory for original exam-desk tickets. */

export const STOCK_WRONG = {
  reinstall_windows: 'Three hours later the same complaint is still on the desk. A wipe does not name the fault.',
  chkdsk: 'The file system is not the patient. You spent the sweep for nothing.',
  buy_ram: 'Capacity was never the complaint. The numbers did not ask for more DIMMs.',
};

export function ev(t, src, id, level, msg) {
  return { t, src, id, level, msg };
}

export function desk(c) {
  return {
    bay: 'Exam bay',
    difficulty: 2,
    ...c,
    tags: c.tags || [c.track, c.category].filter(Boolean),
    badge: c.badge,
    wrong: { ...STOCK_WRONG, ...c.wrong },
  };
}
