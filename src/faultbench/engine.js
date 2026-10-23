import { CASES, HEALTHY, TOOLS, allFixes } from './cases';

export function toolCost(id) {
  return TOOLS.find((t) => t.id === id)?.cost ?? 5;
}

export function payload(caseObj, toolId, resolved) {
  if (resolved) return HEALTHY[toolId];
  if (caseObj.tools && caseObj.tools[toolId] !== undefined) return caseObj.tools[toolId];
  return HEALTHY[toolId];
}

export function fixById(caseObj, fixId) {
  return allFixes(caseObj).find((f) => f.id === fixId);
}

export function applyFix(caseObj, fixId) {
  const fix = fixById(caseObj, fixId);
  if (!fix) return { ok: false, minutes: 0, message: 'That fix is not in the drawer.' };
  if (fixId === caseObj.rootFix) {
    return {
      ok: true,
      minutes: fix.cost,
      message: 'The machine is breathing. Verify with the same tools: the evidence has to turn green.',
    };
  }
  const message = caseObj.wrong?.[fixId] || 'Nothing that matters changed. The symptom is still there.';
  return { ok: false, minutes: fix.cost, message };
}

function hostKey(raw) {
  return String(raw || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export function runNet(net, rawCmd) {
  const cmd = rawCmd.trim();
  if (!cmd) return { kind: 'empty', lines: [] };
  const lower = cmd.toLowerCase();

  if (lower === 'help' || lower === '?') {
    return {
      kind: 'help',
      lines: [
        'ipconfig        ipconfig /all',
        'ping HOST       nslookup HOST',
        'Examples: ping 8.8.8.8 · ping google.com · nslookup gmail.com',
      ],
    };
  }

  if (lower === 'ipconfig' || lower === 'ipconfig /all' || lower === 'ipconfig /all') {
    const lines = [
      `${net.media} adapter:`,
      '',
      `   Media State . . . . . . . . : ${net.link ? 'Media connected' : 'Media disconnected'}`,
      `   Connection-specific DNS Suffix  : lan`,
      `   Physical Address. . . . . . : ${net.mac || '—'}`,
      `   DHCP Enabled. . . . . . . . : ${net.dhcp ? 'Yes' : 'No'}`,
      `   IPv4 Address. . . . . . . . : ${net.ip}`,
      `   Subnet Mask . . . . . . . . : ${net.mask}`,
      `   Default Gateway . . . . . . : ${net.gw || '(none)'}`,
      `   DNS Servers . . . . . . . . : ${net.dns.filter(Boolean).join(' , ') || '(none)'}`,
    ];
    if (net.staticLeftover) {
      lines.push('', `   [note] Orphan static profile in the registry: ${net.staticLeftover}`);
    }
    if (net.ip.startsWith('169.254')) {
      lines.push('', '   [APIPA] 169.254.x.x — Windows got no DHCP. There is no route to the router.');
    }
    if (net.hostsNote) {
      lines.push('', `   [hosts] ${net.hostsNote}`);
    }
    return { kind: 'ipconfig', lines };
  }

  const ping = lower.match(/^ping\s+(\S+)/);
  if (ping) {
    const host = hostKey(ping[1]);
    const rec = net.hosts[host];
    if (!rec) {
      return { kind: 'ping', lines: [`Ping request could not find host ${ping[1]}. Please check the name and try again.`] };
    }
    if (rec.reason === 'nx') {
      return { kind: 'ping', lines: [`Ping request could not find host ${ping[1]}. Please check the name and try again.`] };
    }
    if (!rec.ok) {
      return {
        kind: 'ping',
        lines: [
          `Pinging ${ping[1]} with 32 bytes of data:`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          '',
          `Ping statistics: Sent = 4, Received = 0, Lost = 4 (100% loss)`,
        ],
      };
    }
    const ip = rec.resolve || (host.includes('.') && /^\d/.test(host) ? host : host);
    return {
      kind: 'ping',
      lines: [
        rec.resolve ? `Pinging ${ping[1]} [${rec.resolve}] with 32 bytes of data:` : `Pinging ${ip} with 32 bytes of data:`,
        `Reply from ${rec.resolve || ip}: bytes=32 time=${rec.ms}ms TTL=54`,
        `Reply from ${rec.resolve || ip}: bytes=32 time=${rec.ms + 1}ms TTL=54`,
        `Reply from ${rec.resolve || ip}: bytes=32 time=${rec.ms}ms TTL=54`,
        `Reply from ${rec.resolve || ip}: bytes=32 time=${Math.max(1, rec.ms - 1)}ms TTL=54`,
        '',
        `Ping statistics: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
      ],
    };
  }

  const ns = lower.match(/^nslookup\s+(\S+)/);
  if (ns) {
    const host = hostKey(ns[1]);
    const rec = net.hosts[host];
    const server = net.dns.filter(Boolean)[0] || '(none)';
    if (net.nslookupNote && rec && rec.reason === 'nx') {
      return {
        kind: 'nslookup',
        lines: [
          `Server:  UnKnown`,
          `Address:  ${server}`,
          '',
          `DNS request timed out.`,
          `    timeout was 2 seconds.`,
          `*** UnKnown can't find ${ns[1]}: Non-existent domain`,
        ],
      };
    }
    if (!rec || rec.reason === 'nx' || !rec.resolve) {
      if (/^\d/.test(host)) {
        return { kind: 'nslookup', lines: [`Server: ${server}`, `Address: ${server}`, '', `${ns[1]} is an IP. nslookup a name, or use ping.`] };
      }
      return {
        kind: 'nslookup',
        lines: [`Server:  ${server}`, `Address:  ${server}`, '', `*** can't find ${ns[1]}: Non-existent domain`],
      };
    }
    return {
      kind: 'nslookup',
      lines: [`Server:  ${server}`, `Address:  ${server}`, '', `Name:    ${ns[1]}`, `Address: ${rec.resolve}`],
    };
  }

  return { kind: 'unknown', lines: [`'${cmd}' is not recognized. Type help.`] };
}

export function emptySession(caseId) {
  return {
    caseId,
    minutes: 0,
    tests: [],
    wrong: [],
    theory: null,
    resolved: false,
    lastMessage: null,
    started: Date.now(),
  };
}

export { CASES };
