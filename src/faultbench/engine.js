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
  if (!fix) return { ok: false, minutes: 0, message: 'Ese arreglo no está en el cajón.' };
  if (fixId === caseObj.rootFix) {
    return {
      ok: true,
      minutes: fix.cost,
      message: 'La máquina respira. Verifica con las mismas herramientas: la evidencia tiene que volverse verde.',
    };
  }
  const message = caseObj.wrong?.[fixId] || 'No cambió nada que importe. El síntoma sigue.';
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
        'Ejemplos: ping 8.8.8.8 · ping google.com · nslookup gmail.com',
      ],
    };
  }

  if (lower === 'ipconfig' || lower === 'ipconfig /all' || lower === 'ipconfig /all') {
    const lines = [
      `Adaptador ${net.media}:`,
      '',
      `   Estado de medios. . . . . . : ${net.link ? 'Medios conectados' : 'Medios desconectados'}`,
      `   Sufijo DNS específico. . .  : lan`,
      `   Dirección física. . . . . . : ${net.mac || '—'}`,
      `   DHCP habilitado . . . . . . : ${net.dhcp ? 'Sí' : 'No'}`,
      `   Dirección IPv4. . . . . . . : ${net.ip}`,
      `   Máscara de subred . . . . . : ${net.mask}`,
      `   Puerta de enlace predet.. . : ${net.gw || '(no definida)'}`,
      `   Servidores DNS. . . . . . . : ${net.dns.filter(Boolean).join(' , ') || '(ninguno)'}`,
    ];
    if (net.staticLeftover) {
      lines.push('', `   [nota] Perfil estático huérfano en el registro: ${net.staticLeftover}`);
    }
    if (net.ip.startsWith('169.254')) {
      lines.push('', '   [APIPA] 169.254.x.x — Windows no obtuvo DHCP. No hay ruta al router.');
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
          `Haciendo ping a ${ping[1]} con 32 bytes de datos:`,
          `Tiempo de espera agotado para esta solicitud.`,
          `Tiempo de espera agotado para esta solicitud.`,
          `Tiempo de espera agotado para esta solicitud.`,
          `Tiempo de espera agotado para esta solicitud.`,
          '',
          `Estadísticas: Enviados = 4, Recibidos = 0, Perdidos = 4 (100% perdidos)`,
        ],
      };
    }
    const ip = rec.resolve || (host.includes('.') && /^\d/.test(host) ? host : host);
    return {
      kind: 'ping',
      lines: [
        rec.resolve ? `Haciendo ping a ${ping[1]} [${rec.resolve}] con 32 bytes de datos:` : `Haciendo ping a ${ip} con 32 bytes de datos:`,
        `Respuesta desde ${rec.resolve || ip}: bytes=32 tiempo=${rec.ms}ms TTL=54`,
        `Respuesta desde ${rec.resolve || ip}: bytes=32 tiempo=${rec.ms + 1}ms TTL=54`,
        `Respuesta desde ${rec.resolve || ip}: bytes=32 tiempo=${rec.ms}ms TTL=54`,
        `Respuesta desde ${rec.resolve || ip}: bytes=32 tiempo=${Math.max(1, rec.ms - 1)}ms TTL=54`,
        '',
        `Estadísticas: Enviados = 4, Recibidos = 4, Perdidos = 0 (0% perdidos)`,
      ],
    };
  }

  const ns = lower.match(/^nslookup\s+(\S+)/);
  if (ns) {
    const host = hostKey(ns[1]);
    const rec = net.hosts[host];
    const server = net.dns.filter(Boolean)[0] || '(ninguno)';
    if (net.nslookupNote && rec && rec.reason === 'nx') {
      return {
        kind: 'nslookup',
        lines: [
          `Servidor:  UnKnown`,
          `Address:  ${server}`,
          '',
          `DNS request timed out.`,
          `    timeout was 2 seconds.`,
          `*** UnKnown no encontró ${ns[1]}: Non-existent domain`,
        ],
      };
    }
    if (!rec || rec.reason === 'nx' || !rec.resolve) {
      if (/^\d/.test(host)) {
        return { kind: 'nslookup', lines: [`Servidor: ${server}`, `Address: ${server}`, '', `${ns[1]} es una IP. nslookup de un nombre, o usa ping.`] };
      }
      return {
        kind: 'nslookup',
        lines: [`Servidor:  ${server}`, `Address:  ${server}`, '', `*** no encontró ${ns[1]}: Non-existent domain`],
      };
    }
    return {
      kind: 'nslookup',
      lines: [`Servidor:  ${server}`, `Address:  ${server}`, '', `Nombre:  ${ns[1]}`, `Address:  ${rec.resolve}`],
    };
  }

  return { kind: 'unknown', lines: [`'${cmd}' no se reconoce. Escribe help.`] };
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
