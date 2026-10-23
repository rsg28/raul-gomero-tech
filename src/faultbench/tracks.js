/** Public exam-domain labels. Original tickets only — not CompTIA stems. */

export const TRACKS = [
  { id: 'all', label: 'All tracks', short: 'All', domain: '', blurb: 'The whole queue.' },
  {
    id: 'general',
    label: 'General',
    short: 'General',
    domain: 'IT desk · mixed tickets',
    blurb: 'LeetCode for IT. Everyday tickets with no exam stamp — measure, then fix.',
  },
  {
    id: 'aplus1',
    label: 'A+ Core 1',
    short: 'A+ 1101',
    domain: 'A+ Core 1 · hardware / network / mobile / virt',
    blurb: 'Hardware, networking, mobile, virtualization/cloud, hardware troubleshooting.',
  },
  {
    id: 'aplus2',
    label: 'A+ Core 2',
    short: 'A+ 1102',
    domain: 'A+ Core 2 · OS / security / software / ops',
    blurb: 'Operating systems, security hygiene, software troubleshooting, operational procedures.',
  },
  {
    id: 'nplus',
    label: 'Network+',
    short: 'Net+',
    domain: 'Network+ · routing / switching / Wi-Fi / DNS',
    blurb: 'Implementation and troubleshooting: VLANs, DHCP, DNS, wireless, ACLs. No attack labs.',
  },
  {
    id: 'secplus',
    label: 'Security+',
    short: 'Sec+',
    domain: 'Security+ · identity / hardening / incidents',
    blurb: 'Defense, identity, and incident response. You contain and report — you do not attack.',
  },
];

export const CORE_TRACK = {
  'dns-dead': 'nplus',
  'nvme-dying': 'aplus1',
  'thermal-paste': 'aplus1',
  'bad-dimm': 'aplus1',
  'gpu-driver': 'aplus1',
  'kernel-power': 'aplus1',
  'apipa-dhcp': 'nplus',
  'clock-ssl': 'aplus2',
  'slow-disk': 'general',
  'slow-startup': 'aplus2',
  'bsod-critical': 'aplus2',
  'bsod-irql': 'aplus1',
  'profile-temp': 'aplus2',
  'update-stuck': 'aplus2',
  'slow-cpu-update': 'aplus2',
  'slow-network-file': 'nplus',
  'bsod-store': 'aplus1',
  'bsod-tdr': 'aplus1',
  'wifi-guest': 'nplus',
  'hosts-leftover': 'nplus',
  'print-spooler': 'aplus2',
  'no-audio': 'aplus2',
  'sata-crc': 'aplus1',
  'outlook-ost': 'aplus2',
  'fast-startup': 'aplus2',
  'psu-real': 'aplus1',
};

export function trackMeta(id) {
  return TRACKS.find((t) => t.id === id);
}

export function stampCase(c, track) {
  const t = track || c.track || 'general';
  const meta = trackMeta(t);
  return {
    ...c,
    track: t,
    badge: c.badge || meta?.short || t,
    domain: c.domain || meta?.domain || '',
  };
}
