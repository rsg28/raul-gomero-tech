import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBolt, FaCircle, FaDownload, FaExpand, FaMicrochip, FaMemory, FaHdd, FaFire } from 'react-icons/fa';
import './PCWatchdogDemo.css';

/* ─────────────────────────── data model ─────────────────────────── */

const N_SAMPLES = 96;               // last 8 hours at 5-minute cadence
const SAMPLE_STEP_MS = 5 * 60 * 1000;

/** Generate a realistic baseline dataset for the last 8 hours. */
function generateBaseline(nowMs = Date.now()) {
  const out = [];
  for (let i = 0; i < N_SAMPLES; i += 1) {
    const t = nowMs - (N_SAMPLES - 1 - i) * SAMPLE_STEP_MS;
    // Two "work sessions": one about 4-5h ago, one recent
    const hoursAgo = (nowMs - t) / (60 * 60 * 1000);
    const session1 = Math.max(0, Math.exp(-Math.pow((hoursAgo - 5), 2) / 1.2));
    const session2 = Math.max(0, Math.exp(-Math.pow((hoursAgo - 0.7), 2) / 0.9));
    const load = Math.min(95, 8 + 65 * (session1 + session2) + rand(-6, 6));

    // CPU temp: baseline 42, rises with load
    const cpuTemp = 42 + load * 0.36 + rand(-1.2, 1.2);
    // GPU temp: baseline 38, rises with load but slightly less
    const gpuTemp = 38 + load * 0.3 + rand(-1.2, 1.2);
    // RAM: baseline 45, crawls up during work sessions
    const ram = Math.min(88, 45 + (session1 + session2) * 22 + rand(-2, 2));
    // Disk: very stable
    const disk = 66.2 + rand(-0.15, 0.15);

    out.push({
      t,
      cpuTemp: round(cpuTemp),
      gpuTemp: round(gpuTemp),
      cpuLoad: round(load),
      ram: round(ram),
      disk: round(disk, 1),
    });
  }
  return out;
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function round(v, decimals = 0) {
  const m = Math.pow(10, decimals);
  return Math.round(v * m) / m;
}

/* ─────────────────────────── SVG chart ─────────────────────────── */

const CHART_W = 520;
const CHART_H = 150;
const PAD_L = 34;
const PAD_R = 8;
const PAD_T = 8;
const PAD_B = 22;

/** A small multi-series line chart drawn with pure SVG. */
const LineChart = ({ title, series, unit, yMax, yMin = 0, threshold = null, thresholdColor = 'rgba(239, 68, 68, 0.5)' }) => {
  const width = CHART_W;
  const height = CHART_H;
  const innerW = width - PAD_L - PAD_R;
  const innerH = height - PAD_T - PAD_B;

  // Auto scale if yMax not provided
  const maxVal = yMax ?? Math.max(...series.flatMap((s) => s.data), threshold ?? 0) * 1.1;
  const minVal = yMin;

  const toX = (i, len) => PAD_L + (i / (len - 1)) * innerW;
  const toY = (v) => PAD_T + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  // Y-axis ticks: 4 lines
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => minVal + (maxVal - minVal) * f);

  return (
    <div className="watchdog__chart">
      <div className="watchdog__chart-head">
        <h4 className="watchdog__chart-title">{title}</h4>
        <div className="watchdog__chart-legend">
          {series.map((s) => (
            <span key={s.name} className="watchdog__legend-item">
              <i style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="watchdog__chart-svg" role="img" aria-label={title}>
        {/* Grid + axis */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD_L} y1={toY(t)} x2={width - PAD_R} y2={toY(t)}
              stroke="rgba(244, 241, 234, 0.06)" strokeDasharray="3 4"
            />
            <text x={4} y={toY(t) + 4} fontSize="9" fill="rgba(244,241,234,0.4)">
              {Math.round(t)}{unit}
            </text>
          </g>
        ))}

        {/* Threshold line */}
        {threshold != null && threshold >= minVal && threshold <= maxVal && (
          <>
            <line
              x1={PAD_L} y1={toY(threshold)} x2={width - PAD_R} y2={toY(threshold)}
              stroke={thresholdColor} strokeDasharray="5 3" strokeWidth={1.2}
            />
            <text
              x={width - PAD_R - 4} y={toY(threshold) - 3}
              fontSize="8.5" fill={thresholdColor} textAnchor="end"
            >
              alert @ {threshold}{unit}
            </text>
          </>
        )}

        {/* Series */}
        {series.map((s) => {
          const path = s.data
            .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i, s.data.length)} ${toY(v)}`)
            .join(' ');
          // area under curve — subtle
          const area = `${path} L ${toX(s.data.length - 1, s.data.length)} ${toY(minVal)} L ${toX(0, s.data.length)} ${toY(minVal)} Z`;
          return (
            <g key={s.name}>
              <path d={area} fill={s.color} opacity={0.06} />
              <path d={path} fill="none" stroke={s.color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
              {/* Last-point dot */}
              <circle
                cx={toX(s.data.length - 1, s.data.length)}
                cy={toY(s.data[s.data.length - 1])}
                r={2.6} fill={s.color}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ─────────────────────────── sensor tile ─────────────────────────── */

const SensorTile = ({ icon: Icon, label, value, unit, threshold, color, breach, trend }) => {
  const pct = Math.min(100, (value / Math.max(threshold, 100)) * 100);
  return (
    <div className={`watchdog__tile ${breach ? 'watchdog__tile--breach' : ''}`} style={{ '--tile-c': color }}>
      <header className="watchdog__tile-head">
        <Icon aria-hidden="true" />
        <span className="watchdog__tile-label">{label}</span>
        <span className={`watchdog__tile-trend watchdog__tile-trend--${trend}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '■'}
        </span>
      </header>
      <div className="watchdog__tile-value">
        <span className="watchdog__tile-num">{value}</span>
        <span className="watchdog__tile-unit">{unit}</span>
      </div>
      <div className="watchdog__tile-bar">
        <div className="watchdog__tile-bar-fill" style={{ width: `${pct}%` }} />
        {threshold != null && (
          <div className="watchdog__tile-bar-mark" style={{ left: `${Math.min(100, (threshold / Math.max(threshold, 100)) * 100)}%` }} />
        )}
      </div>
      <div className="watchdog__tile-meta">
        {threshold != null ? `alert @ ${threshold}${unit}` : ''}
      </div>
    </div>
  );
};

/* ─────────────────────────── main component ─────────────────────────── */

const PCWatchdogDemo = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(() => generateBaseline());
  const [alerts, setAlerts] = useState([]);
  const [triggerActive, setTriggerActive] = useState(false);
  const [tickTs, setTickTs] = useState(Date.now());
  const streakRef = useRef({ cpu_temp_c: 0, gpu_temp_c: 0, ram_used_pct: 0, disk_used_pct: 0 });
  const armedRef = useRef({ cpu_temp_c: true, gpu_temp_c: true, ram_used_pct: true, disk_used_pct: true });
  const eventTicksRef = useRef(0);

  // Advance one sample every 3s so the dashboard feels "live"
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const nowMs = last.t + SAMPLE_STEP_MS;

        // If a thermal event is active, push CPU + GPU temp up hard
        let cpuTemp, gpuTemp, cpuLoad, ram, disk;
        if (triggerActive && eventTicksRef.current < 6) {
          const ramp = Math.min(1, (eventTicksRef.current + 1) / 3);
          cpuTemp = round(88 + 6 * ramp + rand(-0.4, 0.8));
          gpuTemp = round(80 + 5 * ramp + rand(-0.4, 0.6));
          cpuLoad = round(96 + rand(-2, 2));
          ram = round(Math.min(94, last.ram + rand(0.8, 2.2)));
          disk = round(last.disk + rand(-0.05, 0.05), 1);
          eventTicksRef.current += 1;
        } else if (triggerActive && eventTicksRef.current < 10) {
          // Cool-down
          cpuTemp = round(last.cpuTemp - rand(4, 7));
          gpuTemp = round(last.gpuTemp - rand(3, 6));
          cpuLoad = round(Math.max(15, last.cpuLoad - rand(15, 25)));
          ram = round(Math.max(45, last.ram - rand(1, 3)));
          disk = round(last.disk + rand(-0.05, 0.05), 1);
          eventTicksRef.current += 1;
          if (eventTicksRef.current >= 10) {
            setTriggerActive(false);
            eventTicksRef.current = 0;
          }
        } else {
          // Normal drift
          cpuTemp = round(clamp(last.cpuTemp + rand(-1.4, 1.4), 40, 78));
          gpuTemp = round(clamp(last.gpuTemp + rand(-1.2, 1.2), 36, 72));
          cpuLoad = round(clamp(last.cpuLoad + rand(-8, 8), 6, 88));
          ram = round(clamp(last.ram + rand(-1.5, 1.5), 40, 82));
          disk = round(clamp(last.disk + rand(-0.1, 0.1), 65, 68), 1);
        }

        const nextSample = { t: nowMs, cpuTemp, gpuTemp, cpuLoad, ram, disk };

        // Threshold + sustain gate — same logic as the Python daemon
        const checks = [
          ['cpu_temp_c', cpuTemp, 90, 'CPU', '°C'],
          ['gpu_temp_c', gpuTemp, 82, 'GPU', '°C'],
          ['ram_used_pct', ram, 95, 'RAM', '%'],
          ['disk_used_pct', disk, 90, 'Disk', '%'],
        ];
        checks.forEach(([key, value, threshold, name, unit]) => {
          if (value > threshold) {
            streakRef.current[key] += 1;
          } else {
            streakRef.current[key] = 0;
            armedRef.current[key] = true;
          }
          if (streakRef.current[key] >= 3 && armedRef.current[key]) {
            armedRef.current[key] = false;
            setAlerts((a) => [
              {
                ts: nowMs,
                sensor: key,
                sensorLabel: name,
                value,
                threshold,
                unit,
              },
              ...a,
            ].slice(0, 8));
          }
        });

        setTickTs(nowMs);
        return [...prev.slice(1), nextSample];
      });
    }, 2200);
    return () => clearInterval(id);
  }, [triggerActive]);

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const trend = (curr, prev) =>
    Math.abs(curr - prev) < 0.4 ? 'flat' : curr > prev ? 'up' : 'down';

  const cpuTempSeries = data.map((d) => d.cpuTemp);
  const gpuTempSeries = data.map((d) => d.gpuTemp);
  const cpuLoadSeries = data.map((d) => d.cpuLoad);
  const ramSeries = data.map((d) => d.ram);
  const diskSeries = data.map((d) => d.disk);

  const triggerEvent = () => {
    if (triggerActive) return;
    eventTicksRef.current = 0;
    setTriggerActive(true);
  };

  const timeLabel = useMemo(() => new Date(tickTs).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }), [tickTs]);

  const cpuBreach = latest.cpuTemp > 90;
  const gpuBreach = latest.gpuTemp > 82;
  const ramBreach = latest.ram > 95;
  const diskBreach = latest.disk > 90;

  return (
    <div className="watchdog">
      <header className="watchdog__head">
        <div>
          <span className="watchdog__eyebrow">
            <FaCircle className="watchdog__live-dot" aria-hidden="true" />
            {t('pcWatchdog.demo.live')}
          </span>
          <h3 className="watchdog__title">{t('pcWatchdog.demo.title')}</h3>
          <p className="watchdog__subtitle">
            {t('pcWatchdog.demo.subtitle', { time: timeLabel })}
          </p>
        </div>
        <button
          type="button"
          className={`watchdog__trigger ${triggerActive ? 'watchdog__trigger--active' : ''}`}
          onClick={triggerEvent}
          disabled={triggerActive}
        >
          <FaFire aria-hidden="true" />
          {triggerActive ? t('pcWatchdog.demo.triggerActive') : t('pcWatchdog.demo.trigger')}
        </button>
      </header>

      {/* ─── Sensor tiles ─── */}
      <div className="watchdog__tiles">
        <SensorTile
          icon={FaMicrochip}
          label={t('pcWatchdog.demo.tiles.cpu')}
          value={latest.cpuTemp}
          unit="°C"
          threshold={90}
          color="#fb923c"
          breach={cpuBreach}
          trend={trend(latest.cpuTemp, previous.cpuTemp)}
        />
        <SensorTile
          icon={FaBolt}
          label={t('pcWatchdog.demo.tiles.gpu')}
          value={latest.gpuTemp}
          unit="°C"
          threshold={82}
          color="#22d3ee"
          breach={gpuBreach}
          trend={trend(latest.gpuTemp, previous.gpuTemp)}
        />
        <SensorTile
          icon={FaMemory}
          label={t('pcWatchdog.demo.tiles.ram')}
          value={latest.ram}
          unit="%"
          threshold={95}
          color="#34d399"
          breach={ramBreach}
          trend={trend(latest.ram, previous.ram)}
        />
        <SensorTile
          icon={FaHdd}
          label={t('pcWatchdog.demo.tiles.disk')}
          value={latest.disk}
          unit="%"
          threshold={90}
          color="#f472b6"
          breach={diskBreach}
          trend={trend(latest.disk, previous.disk)}
        />
      </div>

      {/* ─── Charts ─── */}
      <div className="watchdog__charts">
        <LineChart
          title={t('pcWatchdog.demo.charts.temperature')}
          unit="°C"
          yMax={100}
          threshold={90}
          series={[
            { name: 'CPU', data: cpuTempSeries, color: '#fb923c' },
            { name: 'GPU', data: gpuTempSeries, color: '#22d3ee' },
          ]}
        />
        <LineChart
          title={t('pcWatchdog.demo.charts.utilization')}
          unit="%"
          yMax={100}
          series={[
            { name: 'CPU load', data: cpuLoadSeries, color: '#a78bfa' },
            { name: 'RAM', data: ramSeries, color: '#34d399' },
            { name: 'Disk', data: diskSeries, color: '#f472b6' },
          ]}
        />
      </div>

      {/* ─── Alert feed ─── */}
      <div className="watchdog__alerts">
        <h4 className="watchdog__alerts-title">
          {t('pcWatchdog.demo.alerts.title')}
          <span className="watchdog__alerts-count">{alerts.length}</span>
        </h4>
        {alerts.length === 0 ? (
          <p className="watchdog__alerts-empty">
            {t('pcWatchdog.demo.alerts.empty')}
          </p>
        ) : (
          <ul className="watchdog__alerts-list">
            {alerts.map((a, i) => (
              <li key={`${a.ts}-${a.sensor}-${i}`} className="watchdog__alert">
                <span className="watchdog__alert-time">
                  {new Date(a.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="watchdog__alert-sensor">{a.sensorLabel}</span>
                <span className="watchdog__alert-body">
                  {t('pcWatchdog.demo.alerts.entry', {
                    value: `${a.value}${a.unit}`,
                    threshold: `${a.threshold}${a.unit}`,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="watchdog__foot">
        <p className="watchdog__foot-note">
          {t('pcWatchdog.demo.footNote')}
        </p>
        <div className="watchdog__foot-actions">
          <a
            className="watchdog__foot-link"
            href="https://github.com/rsg28"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload aria-hidden="true" /> {t('pcWatchdog.demo.getCode')}
          </a>
        </div>
      </footer>
    </div>
  );
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default PCWatchdogDemo;
