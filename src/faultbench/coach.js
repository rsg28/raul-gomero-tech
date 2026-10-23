import { CATEGORIES, TOOLS, trackMeta } from './cases';
import { payload, runNet } from './engine';

function pick(seed, list) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return list[Math.abs(h) % list.length];
}

const IDENTIFY = {
  interview: {
    kickers: ['Interview', 'Identify', 'The whole ticket'],
    leads: [
      'They said “it’s slow.” That is a feeling, not a cause. Open Task Manager and read CPU, RAM, Disk, GPU before you invent a story.',
      'The manager wants it “looked at before lunch.” Lunch is not a diagnostic. The column sitting at 100% is.',
      'Slow after login, slow in Excel, slow “forever” — three different machines. Measure first. Guessing is how you buy RAM for a full disk.',
      'If Task Manager scares the user, it should not scare you. One glance tells you whether this is CPU, memory, disk, or a ghost.',
    ],
    steps: [
      ['Read the one-line complaint', 'Open Task Manager first', 'Name the hot column', 'Pin a theory that matches the number', 'One fix. Then verify'],
      ['Ask what “slow” means — boot, app, or always', 'Task Manager: CPU / RAM / Disk / GPU', 'One more tool only if the column is ambiguous', 'Theory', 'Fix'],
    ],
    subs: [
      'Interview classic: do not reimage a healthy disk because someone sighed.',
      'Probes cost minutes. Task Manager is cheap. A reimage is not.',
    ],
  },
  performance: {
    kickers: ['Identify', 'Perf desk', 'Resource map'],
    leads: [
      'Something is eating a resource. Find which gauge is pinned before you touch startup, RAM, or Windows Update.',
      'Performance tickets lie by being vague. The numbers do not. Start with Task Manager, not with a shopping list.',
      'A fan that is loud is a clue, not a verdict. See whether CPU is actually working or just waiting on disk.',
    ],
    steps: [
      ['Read the ticket', 'Task Manager columns', 'If Disk is hot, check free space', 'Theory', 'One fix'],
    ],
    subs: [
      'If every gauge is calm, the slowness is probably not local — or you opened the wrong tool.',
    ],
  },
  crash: {
    kickers: ['Crash desk', 'Identify', 'Stop code'],
    leads: [
      'They photographed a blue screen. Read the stop code and the module in Event Viewer before you touch a driver or a stick of RAM.',
      'A BSOD is a name and usually a file. Reinstalling GeForce because your cousin said so is how you waste an afternoon.',
      'CRITICAL_PROCESS_DIED is not IRQL_NOT_LESS_OR_EQUAL. Open Events. The dump already tried to tell you who died.',
      'The screen went blue and then Windows “fixed itself.” It did not. The log still has the bugcheck.',
    ],
    steps: [
      ['Read the photo / stop code', 'Event Viewer — Error, not the info pile', 'Note the module if one is named', 'Theory that fits that file', 'One targeted fix'],
      ['Write down the bugcheck', 'Events first, not SMART', 'Who loaded last — update, VPN, GPU', 'Theory', 'Verify the dump is gone'],
    ],
    subs: [
      'Do not start with chkdsk because the screen was blue. Blue is a software name until SMART says otherwise.',
      'A full dump is a gift. Ignore it and you are guessing.',
    ],
  },
  os: {
    kickers: ['Identify', 'Windows desk', 'Profile / Update'],
    leads: [
      'Windows is the patient and the liar. Temporary profile, stuck update, mute audio — the ticket already narrowed the room. Confirm with the matching tool.',
      '“Don’t format, I have files on the desktop.” Believe them. The fix is almost never a wipe.',
      'Outlook, spooler, Fast Startup — these look like hardware from far away. They are not. Open the tool that names the subsystem.',
    ],
    steps: [
      ['Read what actually failed', 'Pick the tool for that subsystem', 'One confirming probe', 'Theory', 'Fix that you can undo'],
    ],
    subs: [
      'If Word works and Outlook does not, you are not looking at a dying disk yet.',
    ],
  },
  security: {
    kickers: ['Identity first', 'Contain', 'Security desk'],
    leads: [
      'This is a defense ticket. You reset, revoke, and report. You do not probe a neighbor’s lock.',
      'A working Outlook is not proof that the tenant is clean. Sessions and mail rules outlive a local scan.',
      'Least privilege and a closed port beat a longer password on a bad design.',
    ],
    steps: [
      ['Name the asset — identity, box, or edge', 'Read the one log that proves exposure', 'Contain that surface', 'Do not add a wider hole', 'Verify the exception is gone'],
    ],
    subs: [
      'Security+ here is operations, not a capture-the-flag.',
    ],
  },
  mobile: {
    kickers: ['Consumable', 'Identify', 'Print / pocket'],
    leads: [
      'Printers and phones lie with Ready. Read the panel IP, the drum count, the radio — then the queue.',
      'A faded page after a new toner is often a drum. An offline queue after a router swap is often a new lease.',
    ],
    steps: [
      ['Read the panel, not just the PC', 'Ping the address the queue still loves', 'One theory that matches the panel', 'Fix the mapping or the part', 'Print / join once to verify'],
    ],
    subs: [
      'Ready on the glass and Offline on the PC is two different computers arguing.',
    ],
  },
  cloud: {
    kickers: ['Not local', 'Cloud / virt', 'Identify'],
    leads: [
      'Desktop icons that vanished after “free up space” are often still in the tenant. VMs that will not start are often a firmware flag.',
      'Windows Features cannot enable a hypervisor the BIOS forbids.',
    ],
    steps: [
      ['Is the file or the VM actually gone?', 'OneDrive / firmware / hypervisor bit', 'Do not wipe a healthy cache', 'One reversible fix', 'Confirm the icon or the VM returns'],
    ],
    subs: [
      'Cloud tickets fail when you treat the laptop as the only copy.',
    ],
  },
  ops: {
    kickers: ['Procedure', 'Intake', 'Ops desk'],
    leads: [
      'Sometimes the fault is that nobody ran the joiner, the backup, or the intake. Tools will not invent a process.',
      'A green backup job is not a restore. A walk-up with no error is not a bay yet.',
    ],
    steps: [
      ['Write what is actually missing — identity, backup, intake', 'Do not fake a local workaround that becomes policy', 'Run the real path', 'Tell the truth if the vault is empty', 'Leave a job that exists tomorrow'],
    ],
    subs: [
      'Least privilege and 3-2-1 are operational procedures, not slogans.',
    ],
  },
  network: {
    kickers: ['Wire check', 'Identify', 'Layer walk'],
    leads: [
      'The icon says connected. That icon lies for a living. Separate link, address, DNS, and the name before you blame the ISP.',
      'Ping 8.8.8.8 and ping google.com are two different questions. If one works and the other does not, you already know the layer.',
      'No shared drive, no Outlook, but Gmail on a hotspot — that is not “the internet is down.” See which SSID and which DNS you actually have.',
      'A static leftover from a fair, a guest Wi-Fi, a hosts file from last month. The Network tool will show it. A NIC reinstall will not.',
    ],
    steps: [
      ['Read what “no internet” means', 'Open Network — ipconfig first', 'Ping an IP, then a name', 'Theory (link / DHCP / DNS / hosts)', 'One change'],
    ],
    subs: [
      'If 8.8.8.8 replies and gmail.com does not, stop buying cables.',
    ],
  },
  storage: {
    kickers: ['Identify', 'Drive desk', 'Media'],
    leads: [
      'Freezes on save, copies that die at 40%, a smell that is not there — open SMART before you run chkdsk for the third time.',
      'The OS can limp on a dying NVMe until the wedding photos are gone. Read reallocated and pending sectors first.',
    ],
    steps: [
      ['Read the symptom (save, copy, boot)', 'SMART attributes, not just the GOOD badge', 'Event log if the dump named a store', 'Theory', 'Replace or reseat — do not “repair” dying flash'],
    ],
    subs: [
      'chkdsk does not resurrect a NAND that is already counting down.',
    ],
  },
  memory: {
    kickers: ['Identify', 'RAM desk'],
    leads: [
      'Chrome closes, Excel “stops working,” MEMORY_MANAGEMENT — that pattern is a stick, not Windows being moody. Memtest names the slot.',
      'Two DIMMs and nobody labeled them. You are allowed to run one pass before you buy 32 GB more.',
    ],
    steps: [
      ['Read the crash pattern', 'Event Viewer for MEMORY_MANAGEMENT', 'Memtest — one pass', 'Theory', 'Swap the accused stick'],
    ],
    subs: [
      'More capacity does not cure a DIMM that already writes garbage.',
    ],
  },
  thermals: {
    kickers: ['Identify', 'Heat desk'],
    leads: [
      'Ten minutes in, frames drop, audio cuts — that is a heat curve. Sensors under load, not a Windows reinstall.',
      'The cooler can be spinning and still not touching the IHS. Read the clock: if it falls off a cliff, the paste or the mount lost the fight.',
    ],
    steps: [
      ['Read when it falls apart (idle vs load)', 'Sensors — temp and clock together', 'Feel is not data; the clock is', 'Theory', 'Clean / remount, then verify the clock holds'],
    ],
    subs: [
      'A spinning fan is not proof of contact.',
    ],
  },
  gpu: {
    kickers: ['Identify', 'Display desk'],
    leads: [
      'A one-second black flash is a TDR. A full dump with nvlddmkm.sys is a driver or power story. Event Viewer first, DDU second, shopping last.',
      'Temps “normal” and a black screen in Premiere still have a log. Read it before you reseat the card for luck.',
    ],
    steps: [
      ['Read whether it is a flicker or a dump', 'Events — Display / TDR / nvlddmkm', 'Sensors only if temps are the claim', 'Theory', 'Clean driver or power — not both at once'],
    ],
    subs: [
      '“I already reinstalled GeForce” is not the same as a clean DDU.',
    ],
  },
  power: {
    kickers: ['Identify', 'Power desk'],
    leads: [
      'It dies in-game. No dump. Idle is perfect. That is a rail or a connector until SMART or Memtest proves otherwise.',
      'Kernel-Power 41 with no bugcheck is the OS saying the floor vanished. Measure 12 V under load before you blame Windows.',
    ],
    steps: [
      ['Read when it dies (load vs lid vs idle)', 'Events for Kernel-Power 41', 'Power rails under load', 'Theory', 'Reseat or replace the part that sagged'],
    ],
    subs: [
      'A click that “sounds seated” is not a millivolt.',
    ],
  },
};

const DEFAULT_IDENTIFY = {
  kickers: ['Identify', 'Workbench'],
  leads: [
    'The ticket names a symptom, not a cause. Open one tool that can prove or kill a theory.',
    'Read the complaint twice. Then probe the subsystem it actually named.',
  ],
  steps: [['Read the ticket', 'Probe one tool', 'Pin a theory', 'Apply one fix', 'Verify the LED']],
  subs: ['Every probe adds minutes. Do not fire them all “just in case.”'],
};

const TIPS = {
  none: {
    interview: [
      'Task Manager first. Always. The rest of the drawer can wait.',
      'If they say “make it like new,” they are asking for a wipe. You are not required to obey.',
    ],
    performance: [
      'A loud fan plus a calm Disk gauge is CPU or thermal, not a full C:.',
      'Startup items matter after login. They do not explain a disk at 100%.',
    ],
    crash: [
      'Write the stop code on the clip before you open anything else. You will forget it.',
      'Filter Events to Error. The Information pile is a novel nobody asked for.',
    ],
    os: [
      'If only one app is broken, the OS is probably fine. Stay inside that app’s files.',
      'Stuck at 32% is a CBS / WU problem until the disk is actually full.',
    ],
    network: [
      'Connected ≠ working. Address, gateway, DNS, name — in that order if you can.',
      'Guest Wi-Fi will happily give you Instagram and nothing on the file server.',
    ],
    storage: [
      'Pending sectors are a countdown, not a suggestion.',
      'CRC errors that climb are often the cable, not the platters.',
    ],
    memory: [
      'One bad stick can look like a dozen broken apps.',
      'Memtest costs 28 minutes. A wrong RAM purchase costs a week.',
    ],
    thermals: [
      'Watch the clock, not just the temperature. Throttle hides in frequency.',
      'Side panel off is not a repair. It is a clue.',
    ],
    gpu: [
      'nvlddmkm.sys in a dump is a starting point, not a shopping list.',
      'A TDR can be driver, power, or a dying card. Events tell you which story started.',
    ],
    power: [
      'No minidump is data. The OS never got a chance to write one.',
      '12 V under load is the question. Idle rails flatter everyone.',
    ],
    security: [
      'Contain the identity before you admire the disk. Tokens outlive a scan.',
      'If the “fix” opens 3389 or adds Domain Admin, it is not a fix.',
    ],
    mobile: [
      'Read the panel IP and the drum count. The PC queue is often a tombstone.',
      'Ready on the glass plus Offline in Windows is two addresses, not one dead engine.',
    ],
    cloud: [
      'Ask whether the file still exists in the tenant before you talk about ransomware.',
      'Virtualization in Task Manager is a firmware bit, not a Windows Feature checkbox.',
    ],
    ops: [
      'If the vault was never configured, say so. Then stand up a job.',
      'A walk-up without a device name is intake, not a bay.',
    ],
    default: [
      'One tool. One question. Then you can open a second.',
      'The LED does not lie after a fix. Your hope does.',
    ],
  },
  taskmgr: [
    'The column at 100% is the map. The process list tells you who is holding the pen.',
    'CPU high with a boring process list? Check for a Windows Update or a stuck installer.',
    'Disk at 100% and 0 GB free is a different ticket than Disk at 100% with 400 GB free.',
    'RAM used vs RAM committed — full is not the same as leaking.',
  ],
  eventlog: [
    'Read the first Error after the user said it broke. Then the one before that.',
    'Filter to Error. Warnings from last month are not this ticket.',
    'A source plus an ID is a sentence. Read both before you open the next tool.',
  ],
  'eventlog:crash': [
    'A bugcheck line names a module. That module is a suspect, not a conviction.',
    'CRITICAL_PROCESS_DIED after an update is a different walk than IRQL after a VPN push.',
    'Write the stop code, then find it in the log. Do not skip to Device Manager.',
  ],
  'eventlog:network': [
    'DNS Client 1014 is a timeout, not a dead NIC. See whether an IP still pings.',
    'Dhcp-Client errors plus an APIPA address are the same story in two windows.',
  ],
  'eventlog:power': [
    'Kernel-Power 41 means the floor vanished. It does not say why.',
    'No bugcheck under a 41 is the OS never getting a last word.',
  ],
  'eventlog:performance': [
    'Disk or filter-driver warnings here should send you back to Task Manager, not to a reimage.',
  ],
  devmgmt: [
    'A yellow bang is a gift. A clean tree with a dying disk is a trap.',
    'Code 43 on a GPU after a driver dance is usually still the driver — or power.',
    'Unknown device after a dock change is a cable until proven otherwise.',
  ],
  smart: [
    'Reallocated and pending are the ones that end careers. Temperature is gossip unless it is 70+.',
    'UDMA_CRC climbing with a “healthy” value is almost always the SATA cable.',
    'GOOD in the corner can still hide a raw count you should not ignore.',
  ],
  sensors: [
    'Temp without clock is half a sentence. If the clock collapsed, the silicon is protecting itself.',
    'Idle 45 °C and load 98 °C in three minutes is contact or paste, not “Windows.”',
    'A fan at 3000 rpm and a hotspot at 100 °C means the air is moving past the wrong metal.',
  ],
  net: [
    'ipconfig first. Then ping the gateway, then 8.8.8.8, then a name. Skip a step and you invent a story.',
    '169.254 is Windows saying DHCP never answered. There is no route yet.',
    'nslookup failing while ping 8.8.8.8 works is DNS. Stop replacing NICs.',
    'A hosts file leftover will refuse one name and smile at everything else.',
  ],
  memtest: [
    'Let the pass finish. A 12% “looks fine” is how you miss a bad DIMM.',
    'Errors in one slot: pull that stick. Errors in every slot: board or CPU, but try one stick anyway.',
  ],
  power: [
    '12 V under 11.4 V at load is a PSU or a connector, not a driver.',
    'Event 41 plus a sagging rail is the same story told twice.',
    '“I reseated everything” is not the same as a click you heard on the 8-pin.',
  ],
  time: [
    'A clock in 2019 will fail every TLS handshake from 2024. Chrome is not the bug.',
    'w32time stopped is a cause. “Antivirus is up to date” is noise.',
  ],
  audio: [
    'HDMI default after docking is the oldest mute in the book.',
    'If colleagues hear her and she hears nothing, the mic path is fine. Playback is not.',
  ],
  bios: [
    'POST code and beep first. A machine that does not POST is not a Windows ticket.',
    'Boot order that prefers USB will look like “it will not turn on” to a night-shift user.',
  ],
};

export function identifyFor(caseObj) {
  const pool =
    (caseObj.badge === 'Interview' && IDENTIFY.interview) ||
    IDENTIFY[caseObj.category] ||
    DEFAULT_IDENTIFY;
  return {
    kicker: pick(`${caseObj.id}:k`, pool.kickers),
    lead: pick(`${caseObj.id}:l`, pool.leads),
    steps: pick(`${caseObj.id}:s`, pool.steps),
    sub: pick(`${caseObj.id}:u`, pool.subs),
  };
}

export function tipFor(caseObj, toolId) {
  const keyed = toolId && TIPS[`${toolId}:${caseObj.category}`];
  if (keyed) return pick(`${caseObj.id}:${toolId}:${caseObj.category}:tip`, keyed);
  if (toolId && TIPS[toolId]) {
    return pick(`${caseObj.id}:${toolId}:tip`, TIPS[toolId]);
  }
  const pool =
    (caseObj.badge === 'Interview' && TIPS.none.interview) ||
    TIPS.none[caseObj.category] ||
    TIPS.none.default;
  return pick(`${caseObj.id}:idle-tip`, pool);
}

export function bayTip(cleared) {
  const pool = [
    'Interview: an employee says the PC is slow — Task Manager before theories.',
    'BSOD: write the stop code, then Event Viewer. The cousin who says Reinstall can wait.',
    'Network: ping an IP and a name. They are not the same test.',
    'Power: no dump is a clue. The OS never got to speak.',
    'Do not format out of boredom. The LED stays red if you guessed.',
    'One wrong fix still costs the minutes on the button. Read before you click.',
    'F.R.I.D.A.Y. can see the tool you have open. Ask what a line means — not for the answer.',
    'First contact means you never applied a miss. Speed is not the metric. Waste is.',
    'Exam tracks are original tickets on public CompTIA domains. Not dumps. General is the mixed desk.',
    'Security+ here is contain and report. If a fix opens a wider hole, it is the wrong fix.',
  ];
  return pick(`bay:${cleared}:${new Date().getDate()}`, pool);
}

export function toolTitle(toolId) {
  if (!toolId) return 'Workbench — no tool open';
  return TOOLS.find((t) => t.id === toolId)?.hint || toolId;
}

function linesOf(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export function screenBrief(caseObj, toolId, resolved, extra = {}) {
  const cat = CATEGORIES.find((g) => g.id === caseObj.category)?.label || caseObj.category;
  const track = trackMeta(caseObj.track)?.label || caseObj.track || '';
  const header = [
    `Machine: ${caseObj.machine}`,
    `Customer: ${caseObj.customer}`,
    `Bay: ${caseObj.bay}`,
    `Track: ${track}${caseObj.domain ? ` · ${caseObj.domain}` : ''}`,
    `Category: ${cat}${caseObj.badge ? ` · ${caseObj.badge}` : ''}`,
    `Ticket: ${caseObj.ticket}`,
  ].join('\n');

  if (!toolId) {
    return {
      toolId: null,
      title: 'Workbench — no tool open yet',
      text: `${header}\n\nThe tech has not opened a tool. They are still on Identify.`,
    };
  }

  const data = payload(caseObj, toolId, resolved);
  const title = TOOLS.find((t) => t.id === toolId)?.label || toolId;
  let body = '';

  switch (toolId) {
    case 'taskmgr':
      body = [
        `Task Manager · Performance  ${data.uptime || ''}`,
        `CPU ${data.cpu}%   RAM ${data.ramUsed}/${data.ramTotal} GB   Disk ${data.disk}%   GPU ${data.gpu}%`,
        data.diskFreeGb != null ? `C: ${data.diskFreeGb} GB free of ${data.diskTotalGb} GB` : '',
        data.note || '',
        'Processes:',
        ...(data.processes || []).map((p) => `  ${p.name}  CPU ${p.cpu}%  RAM ${p.ram}  Disk ${p.disk}${p.hot ? '  [hot]' : ''}`),
        data.startup?.length ? 'Startup:' : '',
        ...(data.startup || []).map((s) => `  ${s.name}  impact ${s.impact}`),
      ]
        .filter(Boolean)
        .join('\n');
      break;
    case 'eventlog':
      body = [
        'Event Viewer · Windows Logs',
        'Time | Level | Source | ID | Message',
        ...linesOf(data).map((l) => `${l.t} | ${l.level} | ${l.src} | ${l.id} | ${l.msg}`),
      ].join('\n');
      break;
    case 'devmgmt':
      body = [
        'Device Manager',
        ...linesOf(data).map((d) => `${d.bus} / ${d.name}  status=${d.status}${d.code ? ` code ${d.code}` : ''}`),
      ].join('\n');
      break;
    case 'smart':
      body = [
        'crystaldisk · SMART',
        'ID Attribute Value Worst Thresh Raw Fail',
        ...linesOf(data).map((r) => `${r.id} ${r.name} ${r.value} ${r.worst} ${r.thresh} ${r.raw} ${r.fail ? 'FAIL' : 'ok'}`),
      ].join('\n');
      break;
    case 'sensors':
      body = [
        `Sensors · ${data.load ? 'synthetic load ON' : 'idle'}`,
        `CPU ${data.cpu} °C  clock ${data.cpuClock} MHz  fan ${data.cpuFan} rpm`,
        `GPU ${data.gpu} °C  clock ${data.gpuClock} MHz  hotspot ${data.hotspot} °C`,
      ].join('\n');
      break;
    case 'net':
      body =
        extra.netLog ||
        [
          'cmd · network — current window (ipconfig already run)',
          ...runNet(data, 'ipconfig').lines,
          data.sslNote ? `TLS note: ${data.sslNote}` : '',
          data.hostsNote ? `hosts note: ${data.hostsNote}` : '',
        ]
          .filter(Boolean)
          .join('\n');
      break;
    case 'memtest':
      body = `Memtest86+ pass 1\n${data.note}${data.slot ? ` Accused slot: ${data.slot}` : ''}\nerrors=${data.errors}`;
      break;
    case 'power':
      body = [
        'Multimeter · ATX rails',
        `idle  12V ${data.rails['12V']}  5V ${data.rails['5V']}  3.3V ${data.rails['3.3V']}`,
        `load  12V ${data.loadRails['12V']}  5V ${data.loadRails['5V']}  3.3V ${data.loadRails['3.3V']}`,
        `EPS 8-pin: ${data.eps} · PCIe 8-pin: ${data.pcie8}`,
        data.event41 ? 'Kernel-Power Event 41 is present.' : 'No Event 41 on this capture.',
        data.note,
      ].join('\n');
      break;
    case 'time':
      body = [
        'timedate.cpl · w32time',
        data.ok ? 'SYNC' : `DRIFT  shown=${data.shown || '?'}  driftDays=${data.drift}`,
        `Windows Time service: ${data.service}`,
      ].join('\n');
      break;
    case 'audio':
      body = [
        'mmsys.cpl · playback',
        ...((data.devices || []).map((d) => `${d.name}${d.def ? ' [default]' : ''}${d.enabled ? '' : ' [disabled]'}`)),
        `Exclusive mode: ${data.exclusive ? 'on' : 'off'}`,
      ].join('\n');
      break;
    case 'bios':
      body = [
        `POST code ${data.post} · beep ${data.beep}`,
        'Boot order:',
        ...(data.boot || []).map((b, i) => `  ${i + 1}. ${b}`),
        data.message,
      ].join('\n');
      break;
    default:
      body = JSON.stringify(data, null, 2);
  }

  return {
    toolId,
    title: `${title} — live screen`,
    text: `${header}\n\n--- LIVE SCREEN (${title}) ---\n${body}`,
  };
}

export function readVisiblePage(root, opts = {}) {
  if (!root) return '';
  const clone = root.cloneNode(true);
  clone.querySelectorAll('.fb-friday, [aria-label="F.R.I.D.A.Y."]').forEach((n) => n.remove());
  if (opts.hideDebrief) {
    clone.querySelectorAll('.fb-debrief').forEach((n) => n.remove());
  }
  return (clone.innerText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 14000);
}

export function optionLists(theories, fixes, session) {
  return {
    theories: (theories || []).map((t, i) => ({
      n: i + 1,
      label: t.label,
      pinned: session.theory === t.id,
    })),
    fixes: (fixes || []).map((f, i) => ({
      n: i + 1,
      label: f.label,
      blurb: f.blurb || '',
      cost: f.cost,
      missed: session.wrong.includes(f.id),
    })),
  };
}
