import React, { useEffect, useMemo, useRef, useState } from 'react';
import { payload, runNet } from './engine';

function jitter(v, amt) {
  return Math.round((v + (Math.random() * 2 - 1) * amt) * 10) / 10;
}

export function EventLog({ lines }) {
  const [filter, setFilter] = useState('all');
  const shown = lines.filter((l) => filter === 'all' || l.level === filter);
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>Visor de eventos · Windows Logs</span>
        <div className="fb-seg">
          {['all', 'error', 'warn', 'info'].map((f) => (
            <button key={f} type="button" className={filter === f ? 'is-on' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <table className="fb-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Nivel</th>
            <th>Origen</th>
            <th>ID</th>
            <th>Mensaje</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((l, i) => (
            <tr key={`${l.t}-${l.id}-${i}`} className={`is-${l.level}`}>
              <td>{l.t}</td>
              <td>{l.level}</td>
              <td>{l.src}</td>
              <td>{l.id}</td>
              <td>{l.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DeviceManager({ devices }) {
  const buses = [...new Set(devices.map((d) => d.bus))];
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>Administrador de dispositivos</span>
        <span className="fb-tool__ghost">{devices.filter((d) => d.status !== 'ok').length} con aviso</span>
      </div>
      <ul className="fb-tree">
        {buses.map((bus) => (
          <li key={bus}>
            <strong>{bus}</strong>
            <ul>
              {devices
                .filter((d) => d.bus === bus)
                .map((d) => (
                  <li key={d.name} className={`is-${d.status}`}>
                    <i className={`fb-bang is-${d.status}`} aria-hidden="true" />
                    {d.name}
                    {d.code ? <em> Code {d.code}</em> : null}
                    {d.status === 'ok' ? <span className="fb-ok">This device is working properly.</span> : null}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SmartTable({ rows }) {
  const fail = rows.some((r) => r.fail);
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>crystaldisk · SMART</span>
        <span className={fail ? 'fb-pill fb-pill--bad' : 'fb-pill fb-pill--ok'}>{fail ? 'FAILED' : 'GOOD'}</span>
      </div>
      <table className="fb-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Atributo</th>
            <th>Value</th>
            <th>Worst</th>
            <th>Thresh</th>
            <th>Raw</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.fail ? 'is-error' : ''}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.value}</td>
              <td>{r.worst}</td>
              <td>{r.thresh}</td>
              <td>{r.raw}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Sensors({ data }) {
  const [live, setLive] = useState(data);
  useEffect(() => {
    setLive(data);
    const id = setInterval(() => {
      setLive({
        ...data,
        cpu: jitter(data.cpu, data.load ? 1.8 : 0.6),
        gpu: jitter(data.gpu, data.load ? 1.2 : 0.5),
        cpuClock: Math.max(400, Math.round(jitter(data.cpuClock, data.load ? 40 : 80))),
        gpuClock: Math.max(0, Math.round(jitter(data.gpuClock, 30))),
        cpuFan: Math.round(jitter(data.cpuFan, 40)),
        gpuFan: Math.round(jitter(data.gpuFan, 30)),
        hotspot: jitter(data.hotspot, 0.8),
      });
    }, 700);
    return () => clearInterval(id);
  }, [data]);

  const cpuHot = live.cpu >= 90;
  const items = [
    { k: 'CPU', v: `${live.cpu.toFixed(1)} °C`, hot: cpuHot },
    { k: 'CPU clock', v: `${live.cpuClock} MHz`, hot: live.cpuClock < 1200 && data.load },
    { k: 'CPU fan', v: `${live.cpuFan} rpm`, hot: false },
    { k: 'GPU', v: `${live.gpu.toFixed(1)} °C`, hot: live.gpu >= 88 },
    { k: 'GPU clock', v: `${live.gpuClock} MHz`, hot: live.gpuClock === 0 },
    { k: 'Hotspot', v: `${live.hotspot.toFixed(1)} °C`, hot: live.hotspot >= 95 },
  ];
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>Sondas · HWiNFO (sim)</span>
        <span className="fb-tool__ghost">{data.load ? 'carga sintética ON' : 'idle'}</span>
      </div>
      <div className="fb-gauges">
        {items.map((it) => (
          <div key={it.k} className={`fb-gauge${it.hot ? ' is-hot' : ''}`}>
            <span>{it.k}</span>
            <strong>{it.v}</strong>
          </div>
        ))}
      </div>
      {cpuHot && (
        <p className="fb-callout">Throttle térmico: el clock cae para no freír el CCD. El cooler puede estar girando y aun así no tocar el IHS.</p>
      )}
    </div>
  );
}

export function NetTerm({ net }) {
  const [line, setLine] = useState('');
  const [hist, setHist] = useState(() => [runNet(net, 'ipconfig')]);
  const endRef = useRef(null);
  const netKey = useMemo(() => JSON.stringify(net), [net]);

  useEffect(() => {
    setHist([runNet(net, 'ipconfig')]);
  }, [netKey, net]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [hist]);

  const run = (cmd) => {
    const c = (cmd || line).trim();
    if (!c) return;
    setHist((h) => [...h, { cmd: c, ...runNet(net, c) }]);
    setLine('');
  };

  const chips = ['ipconfig /all', 'ping 127.0.0.1', 'ping 192.168.1.1', 'ping 8.8.8.8', 'ping google.com', 'nslookup google.com'];

  return (
    <div className="fb-tool fb-term-wrap">
      <div className="fb-tool__bar">
        <span>cmd · red</span>
        {net.sslNote && <span className="fb-pill fb-pill--bad">TLS</span>}
      </div>
      <div className="fb-term" role="log">
        {hist.map((h, i) => (
          <div key={i} className="fb-term__block">
            {h.cmd && (
              <p className="fb-term__cmd">
                C:\Users\bench&gt; {h.cmd}
              </p>
            )}
            {h.lines.map((ln, j) => (
              <p key={j}>{ln || ' '}</p>
            ))}
          </div>
        ))}
        {net.sslNote && <p className="fb-term__note">{net.sslNote}</p>}
        <div ref={endRef} />
      </div>
      <form
        className="fb-term__form"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label className="fb-sr" htmlFor="fb-cmd">
          Comando
        </label>
        <span className="fb-term__ps">C:\&gt;</span>
        <input
          id="fb-cmd"
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="ipconfig, ping, nslookup — o un chip"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit">Enter</button>
      </form>
      <div className="fb-chips">
        {chips.map((c) => (
          <button type="button" key={c} onClick={() => run(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Memtest({ data }) {
  const target = data.errors ? 64 : 100;
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPct(0);
    setDone(false);
    const id = setInterval(() => {
      setPct((p) => {
        const n = p + (data.errors ? 4.2 : 5.5);
        if (n >= target) {
          clearInterval(id);
          setDone(true);
          return target;
        }
        return n;
      });
    }, 90);
    return () => clearInterval(id);
  }, [data, target]);

  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>Memtest86+ · pass 1</span>
        <span className={done && data.errors ? 'fb-pill fb-pill--bad' : done ? 'fb-pill fb-pill--ok' : 'fb-tool__ghost'}>
          {done ? (data.errors ? 'HALT' : 'PASS') : 'RUN'}
        </span>
      </div>
      <div className="fb-progress" aria-valuenow={Math.round(pct)}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="fb-mono">{Math.round(pct)}% · testing 32 GB</p>
      {done && (
        <p className={`fb-callout${data.errors ? ' is-bad' : ''}`}>
          {data.note}
          {data.slot ? ` Slot acusado: ${data.slot}.` : ''}
        </p>
      )}
    </div>
  );
}

export function PowerPanel({ data }) {
  const sag = data.loadRails['12V'] < 11.4;
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>Multímetro · rails ATX</span>
        {data.event41 && <span className="fb-pill fb-pill--bad">Event 41</span>}
      </div>
      <div className="fb-gauges">
        {['12V', '5V', '3.3V'].map((k) => (
          <div key={k} className={`fb-gauge${k === '12V' && sag ? ' is-hot' : ''}`}>
            <span>{k} idle</span>
            <strong>{data.rails[k].toFixed(2)} V</strong>
          </div>
        ))}
        {['12V', '5V', '3.3V'].map((k) => (
          <div key={`${k}-l`} className={`fb-gauge${k === '12V' && sag ? ' is-hot' : ''}`}>
            <span>{k} carga</span>
            <strong>{data.loadRails[k].toFixed(2)} V</strong>
          </div>
        ))}
      </div>
      <p className="fb-kv">
        EPS 8-pin CPU: <b className={data.eps === 'seated' ? 'ok' : 'bad'}>{data.eps}</b>
        {' · '}
        PCIe 8-pin GPU: <b className={data.pcie8 === 'seated' ? 'ok' : 'bad'}>{data.pcie8}</b>
      </p>
      <p className="fb-callout">{data.note}</p>
    </div>
  );
}

export function TimePanel({ data }) {
  const now = data.ok ? new Date().toISOString().replace('T', ' ').slice(0, 19) : data.shown;
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>timedate.cpl · w32time</span>
        <span className={data.ok ? 'fb-pill fb-pill--ok' : 'fb-pill fb-pill--bad'}>{data.ok ? 'SYNC' : 'DRIFT'}</span>
      </div>
      <p className="fb-clock">{now}</p>
      <p className="fb-kv">
        Windows Time: <b className={data.service === 'running' ? 'ok' : 'bad'}>{data.service}</b>
        {data.drift ? ` · drift ${data.drift} días` : ' · drift < 1 s'}
      </p>
      {!data.ok && (
        <p className="fb-callout is-bad">
          Un certificado con notBefore 2024 no existe todavía para un sistema que vive en 2019. Chrome no está loco.
        </p>
      )}
    </div>
  );
}

export function AudioPanel({ data }) {
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>mmsys.cpl · reproducción</span>
      </div>
      <ul className="fb-tree">
        {data.devices.map((d) => (
          <li key={d.name} className={d.enabled ? 'is-ok' : 'is-warn'}>
            <i className={`fb-bang is-${d.enabled ? 'ok' : 'warn'}`} />
            {d.name}
            {d.def ? <em> predeterminado</em> : null}
            {!d.enabled ? <em> deshabilitado</em> : null}
          </li>
        ))}
      </ul>
      <p className="fb-kv">Exclusive mode: {data.exclusive ? 'on' : 'off'}</p>
    </div>
  );
}

export function BiosPanel({ data }) {
  return (
    <div className="fb-tool">
      <div className="fb-tool__bar">
        <span>POST · boot order</span>
        <span className="fb-mono">código {data.post}</span>
      </div>
      <p className="fb-kv">Beep: {data.beep}</p>
      <ol className="fb-boot">
        {data.boot.map((b, i) => (
          <li key={b}>
            {String(i + 1).padStart(2, '0')} {b}
          </li>
        ))}
      </ol>
      <p className="fb-callout">{data.message}</p>
    </div>
  );
}

export function ToolSurface({ caseObj, toolId, resolved }) {
  if (!toolId) {
    return (
      <div className="fb-empty">
        <p className="fb-kicker">Banco de trabajo</p>
        <p>Abre una herramienta. El ticket describe un síntoma, no una causa. La causa está en los logs, las sondas, el SMART, el ping.</p>
        <ol className="fb-empty__steps">
          <li>Leer el parte</li>
          <li>Probar una sonda</li>
          <li>Fijar una teoría</li>
          <li>Aplicar un arreglo</li>
          <li>Verificar el LED</li>
        </ol>
        <p className="fb-empty__sub">Cada sonda suma minutos al parte. No las dispares todas “por si acaso”.</p>
      </div>
    );
  }
  const data = payload(caseObj, toolId, resolved);
  switch (toolId) {
    case 'eventlog':
      return <EventLog lines={data} />;
    case 'devmgmt':
      return <DeviceManager devices={data} />;
    case 'smart':
      return <SmartTable rows={data} />;
    case 'sensors':
      return <Sensors data={data} />;
    case 'net':
      return <NetTerm net={data} />;
    case 'memtest':
      return <Memtest data={data} />;
    case 'power':
      return <PowerPanel data={data} />;
    case 'time':
      return <TimePanel data={data} />;
    case 'audio':
      return <AudioPanel data={data} />;
    case 'bios':
      return <BiosPanel data={data} />;
    default:
      return null;
  }
}

export function Machine({ caseObj, resolved, leds }) {
  return (
    <svg className="fb-machine" viewBox="0 0 220 200" role="img" aria-label={caseObj.machine}>
      <rect x="18" y="14" width="130" height="84" rx="4" fill="#0d0c0a" stroke="#3a342c" />
      <rect x="26" y="22" width="114" height="62" fill={resolved ? '#1a2a1c' : '#15120e'} />
      <text x="84" y="58" textAnchor="middle" fill={resolved ? '#8ecf8e' : '#c4a45a'} fontSize="9" fontFamily="ui-monospace, monospace">
        {resolved ? 'PASS' : 'FAULT'}
      </text>
      <rect x="158" y="28" width="46" height="110" rx="3" fill="#1a1713" stroke="#4a4338" />
      <rect x="166" y="38" width="30" height="18" fill="#111" />
      <circle cx="181" cy="72" r="4" fill={leds.pwr === 'on' ? '#5dcc6a' : '#2a2a2a'} />
      <circle cx="181" cy="88" r="4" fill={leds.hdd === 'err' ? '#e04b32' : leds.hdd === 'ok' ? '#c9a227' : '#2a2a2a'} />
      <circle cx="181" cy="104" r="4" fill={leds.nic === 'ok' ? '#4aa3e8' : leds.nic === 'warn' ? '#e08a22' : '#2a2a2a'} />
      <text x="181" y="124" textAnchor="middle" fill="#6a6258" fontSize="6" fontFamily="ui-monospace, monospace">
        PWR HDD NIC
      </text>
      {leds.warn && !resolved && <rect x="166" y="132" width="30" height="4" fill="#e08a22" />}
      <rect x="48" y="108" width="88" height="8" fill="#2a261f" />
      <rect x="70" y="118" width="44" height="36" fill="#12100c" stroke="#3a342c" />
      <text x="92" y="178" textAnchor="middle" fill="#8a8276" fontSize="7" fontFamily="ui-monospace, monospace">
        {caseObj.bay}
      </text>
    </svg>
  );
}
