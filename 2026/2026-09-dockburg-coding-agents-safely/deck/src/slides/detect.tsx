import { useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { R, Words, useSlide, EASE } from '../engine/anim';
import { GLogo, Kicker } from '../components';

/* ───────────────────────── a Grafana dashboard for your agent ───────────────────────── */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const N = 60;
function useSeries() {
  return useMemo(() => {
    const r = rng(42);
    const allowed = Array.from({ length: N }, (_, i) => 22 + Math.sin(i / 5) * 6 + r() * 9 + (i > 40 ? 4 : 0));
    const denied = Array.from({ length: N }, (_, i) => (i === 51 ? 9 : i === 52 ? 23 : i === 53 ? 17 : i === 54 ? 6 : r() < 0.12 ? 1 : 0));
    return { allowed, denied };
  }, []);
}

function TimeSeries({ w, h }: { w: number; h: number }) {
  const { allowed, denied } = useSeries();
  const { step, shown } = useSlide();
  const upto = step >= 1 ? N : 48;
  const max = 40;
  const x = (i: number) => 52 + (i / (N - 1)) * (w - 70);
  const y = (v: number) => h - 34 - (v / max) * (h - 60);
  const line = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = (vals: number[]) => `${line(vals)} L ${x(N - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const clipW = shown ? x(upto - 1) + 2 : 52;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="ts-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#73bf69" stopOpacity="0.35" />
          <stop offset="1" stopColor="#73bf69" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ts-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2495c" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f2495c" stopOpacity="0" />
        </linearGradient>
        <clipPath id="ts-clip">
          <motion.rect x={0} y={0} height={h} initial={false} animate={{ width: clipW }} transition={{ duration: step >= 1 ? 1.4 : 1.8, ease: 'easeOut' }} />
        </clipPath>
      </defs>
      {[0, 10, 20, 30, 40].map((v) => (
        <g key={v}>
          <line x1={52} x2={w - 18} y1={y(v)} y2={y(v)} stroke="rgba(204,204,220,0.08)" />
          <text x={40} y={y(v) + 6} textAnchor="end" fontSize={16} fill="rgba(204,204,220,0.55)" fontFamily="Inter">
            {v}
          </text>
        </g>
      ))}
      {['10:00', '10:15', '10:30', '10:45', '11:00'].map((t, i) => (
        <text key={t} x={52 + (i / 4) * (w - 70)} y={h - 8} textAnchor="middle" fontSize={16} fill="rgba(204,204,220,0.55)" fontFamily="Inter">
          {t}
        </text>
      ))}
      <g clipPath="url(#ts-clip)">
        <path d={area(allowed)} fill="url(#ts-g)" />
        <path d={line(allowed)} fill="none" stroke="#73bf69" strokeWidth={2.5} />
        <path d={area(denied)} fill="url(#ts-r)" />
        <path d={line(denied)} fill="none" stroke="#f2495c" strokeWidth={2.5} />
      </g>
    </svg>
  );
}

function Panel({ title, style, children, className }: { title: string; style: React.CSSProperties; children: ReactNode; className?: string }) {
  return (
    <div className={`abs gp ${className ?? ''}`} style={style}>
      <div className="gp-title">{title}</div>
      {children}
    </div>
  );
}

type Log = { at: number; t: string; lvl: 'info' | 'warn' | 'err'; msg: ReactNode };
const LOGS: Log[] = [
  { at: 0, t: '10:47:02', lvl: 'info', msg: <>exec  <b>go test ./pkg/services/ngalert/...</b></> },
  { at: 0, t: '10:47:31', lvl: 'info', msg: <>ALLOW GET  github.com/grafana/grafana.git</> },
  { at: 0, t: '10:48:05', lvl: 'info', msg: <>ALLOW POST api.github.com/repos/grafana/grafana/pulls</> },
  { at: 1, t: '10:51:40', lvl: 'warn', msg: <>exec  <b>cat ~/.aws/credentials</b>  (no such file, not in zone)</> },
  { at: 1, t: '10:51:44', lvl: 'err', msg: <>DENY  POST gist.github.com, body matched <b>AKIA[0-9A-Z]{'{'}16{'}'}</b></> },
  { at: 2, t: '10:51:45', lvl: 'err', msg: <>agent <b>pr-bot</b> paused · GITHUB_TOKEN revoked · owner paged</> },
];

export function Dashboard() {
  const { step } = useSlide();
  const denied = step >= 1 ? 55 : 2;
  const firing = step >= 2;
  return (
    <>
      <Kicker ch="detect" />
      <div className="abs display" style={{ left: 120, top: 132, fontSize: 80 }}>
        <Words text="Don’t prevent and hope. *Detect.*" />
      </div>
      <R d={0.2} v="up" className="abs gdash" style={{ left: 100, top: 244, width: 1720, height: 764 }}>
        <div className="gnav">
          <GLogo icon gradient h={30} />
          <span className="gcrumb">
            Home <i>›</i> Dashboards <i>›</i> Agents <i>›</i> <b>pr-bot</b>
          </span>
          <span className="gtime">Last 1 hour</span>
        </div>
        <Panel title="Egress requests / min · pr-bot" style={{ left: 16, top: 70, width: 1060, height: 314 }}>
          <TimeSeries w={1040} h={240} />
          <div className="legend">
            <span>
              <i style={{ background: '#73bf69' }} /> allowed
            </span>
            <span>
              <i style={{ background: '#f2495c' }} /> denied
            </span>
          </div>
        </Panel>
        <Panel title="Denied requests (1h)" className={step >= 1 ? 'stat red' : 'stat'} style={{ left: 1092, top: 70, width: 300, height: 314 }}>
          <motion.div key={denied} className="stat-v" initial={{ scale: 1.25, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
            {denied}
          </motion.div>
        </Panel>
        <Panel title="Agent status" className={firing ? 'stat red' : 'stat green'} style={{ left: 1408, top: 70, width: 296, height: 314 }}>
          <motion.div key={String(firing)} className="stat-v small" initial={{ scale: 1.2, opacity: 0.3 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
            {firing ? 'PAUSED' : 'RUNNING'}
          </motion.div>
        </Panel>
        <Panel title="Audit log · every command, every request" style={{ left: 16, top: 400, width: 1060, height: 348 }}>
          <div className="glogs">
            {LOGS.map((l, i) => (
              <R key={i} at={l.at} d={l.at ? 0.4 + i * 0.15 : 0.5 + i * 0.1} v="left" className={`glog ${l.lvl}`}>
                <span className="glog-t">{l.t}</span>
                <span>{l.msg}</span>
              </R>
            ))}
          </div>
        </Panel>
        <Panel title="Alert rules" style={{ left: 1092, top: 400, width: 612, height: 348 }}>
          <div className={`alert-rule${firing ? ' firing' : ''}`}>
            <div className="alert-state">{firing ? 'Firing' : 'Normal'}</div>
            <div className="alert-name">Exfiltration attempt</div>
            <div className="alert-expr">denied egress with secret-like body &gt; 0</div>
            <div className="alert-actions">
              <span>pause agent</span>
              <span>revoke secrets</span>
              <span>page owner</span>
            </div>
          </div>
        </Panel>
      </R>
      <R at={2} d={0.8} v="zoom" className="abs signal-callout" style={{ right: 120, top: 104 }}>
        an attempt is a <b>signal</b>,
        <br />
        <span>even when it was blocked</span>
      </R>
    </>
  );
}
