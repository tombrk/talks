import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { R, Words, useSlide, useVisible, EASE } from '../engine/anim';
import { Emoji, Kicker, WhiteCard } from '../components';

/* ───────────────────────── zero trust: the reframe ───────────────────────── */
export function ZeroTrust() {
  const vis = useVisible(0);
  return (
    <>
      <Kicker ch="zerotrust" />
      {[0, 1, 2].map((k) => (
        <div key={k} className="abs radar" style={{ left: 630, top: 200, width: 660, height: 660, animationDelay: `${k * 1.3}s` }} />
      ))}
      <motion.div
        className="abs zt-glow"
        style={{ left: 660, top: 150, width: 600, height: 760 }}
        initial={false}
        animate={{ opacity: vis ? 1 : 0 }}
        transition={{ duration: 1.2, delay: vis ? 1.1 : 0 }}
      />
      <svg className="abs" style={{ left: 0, top: 0 }} width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="zt-ring" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#fbca0a" />
            <stop offset="0.5" stopColor="#ff671d" />
            <stop offset="1" stopColor="#f2495c" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx={960}
          cy={530}
          rx={300}
          ry={380}
          fill="none"
          stroke="url(#zt-ring)"
          strokeWidth={34}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: vis ? 1 : 0, rotate: vis ? 0 : -90 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
          style={{ transformOrigin: '960px 530px' }}
        />
      </svg>
      <div className="abs display" style={{ left: 0, right: 0, top: 386, textAlign: 'center', fontSize: 190 }}>
        <Words text="Zero trust" d={0.7} />
      </div>
      <div className="abs serif-i" style={{ left: 0, right: 0, top: 574, textAlign: 'center', fontSize: 100 }}>
        <Words text="in your agent." d={1.0} />
      </div>
      <R at={1} className="abs lede" style={{ left: 0, right: 0, top: 960, textAlign: 'center', fontSize: 34, opacity: 0.8 }}>
        It <b>will</b> make mistakes. We can’t prevent that, so we plan for it.
      </R>
    </>
  );
}

/* ───────────────────────── the principles, as tracked changes ───────────────────────── */
function Swap({ from, to, at }: { from: string; to: string; at: number }) {
  const vis = useVisible(at);
  return (
    <span className="swap">
      <span className="swap-from">
        {from}
        <motion.span
          className="swap-line"
          initial={false}
          animate={{ scaleX: vis ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: vis ? 0.9 : 0 }}
        />
      </span>{' '}
      <motion.span
        className="swap-to"
        initial={false}
        animate={vis ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: -18, filter: 'blur(6px)' }}
        transition={{ duration: 0.6, ease: EASE, delay: vis ? 1.35 : 0 }}
      >
        {to}
      </motion.span>
    </span>
  );
}

function Principle({ at, name, children }: { at: number; name: string; children: ReactNode }) {
  const { step } = useSlide();
  return (
    <R at={at} v="up" className={`principle${step === at ? ' now' : ''}`}>
      <div className="principle-name">{name}</div>
      <div className="principle-text">{children}</div>
    </R>
  );
}

export function Principles() {
  return (
    <>
      <WhiteCard />
      <div className="abs display" style={{ left: 140, top: 124, fontSize: 70, color: 'var(--ink)' }}>
        <Words text="Classic zero trust, *applied to agents*" />
      </div>
      <div className="abs principles" style={{ left: 140, top: 270, width: 1640 }}>
        <Principle at={0} name="Hostile environment">
          Assume <Swap at={0} from="all network participants" to="all agents" /> are untrusted by default.
        </Principle>
        <Principle at={1} name="Assume breach">
          Operate as if <Swap at={1} from="a breach" to="misbehavior" /> has already occurred. Contain the effects and
          recover quickly. Don’t assume it never happens.
        </Principle>
        <Principle at={2} name="Never trust, always verify">
          Agents have <b>zero data access by default</b>. Access is granted explicitly, via policy.
        </Principle>
        <Principle at={3} name="Least privilege">
          The least access that <b>still gets the job done</b>.
        </Principle>
        <Principle at={4} name="Analytics">
          Agents are observed (audit-logged) <b>at all times</b>. Act on it, automatically.
        </Principle>
      </div>
    </>
  );
}

/* ───────────────────────── three moves ───────────────────────── */
function Rings() {
  const vis = useVisible(1);
  return (
    <svg width={150} height={150} viewBox="0 0 150 150">
      {[64, 46, 28].map((r, i) => (
        <motion.circle
          key={r}
          cx={75}
          cy={75}
          fill="none"
          stroke="#fff"
          strokeWidth={4}
          initial={false}
          animate={{ r: vis ? r * (i === 2 ? 1 : 0.35 + i * 0.1) : r, opacity: vis ? (i === 2 ? 1 : 0.25) : 0.9 }}
          transition={{ duration: 1.4, ease: EASE, delay: vis ? 0.6 + i * 0.1 : 0 }}
        />
      ))}
      <circle cx={75} cy={75} r={9} fill="#fff" />
    </svg>
  );
}

function Move({ at, n, title, sub, icon }: { at: number; n: string; title: ReactNode; sub: ReactNode; icon: ReactNode }) {
  return (
    <R at={at} v="up" className="move">
      <div className="move-n">{n}</div>
      <div className="move-icon">{icon}</div>
      <div className="move-title">{title}</div>
      <div className="move-sub">{sub}</div>
    </R>
  );
}

export function ThreeMoves() {
  return (
    <>
      <Kicker ch="zerotrust" />
      <div className="abs display" style={{ left: 120, top: 140, fontSize: 92 }}>
        <Words text="Don’t hope. Plan." />
      </div>
      <div className="abs moves" style={{ left: 120, top: 330, width: 1680 }}>
        <Move
          at={0}
          n="01"
          icon={<Emoji n="shrug" size={130} />}
          title={
            <>
              It <span className="serif-i">will</span> make mistakes.
            </>
          }
          sub="We cannot prevent that. Stop designing as if we could."
        />
        <Move at={1} n="02" icon={<Rings />} title="Limit the blast radius." sub="Least privilege: make its world as small as the task." />
        <Move at={2} n="03" icon={<Emoji n="siren" size={130} className="siren" />} title="Detect it. Fast." sub="…and take remediating action, automatically." />
      </div>
    </>
  );
}

/* ───────────────────────── risk split: the thesis ───────────────────────── */
type Chip = { id: string; label: string; need: boolean };
const CHIPS: Chip[] = [
  { id: 'repo', label: 'grafana/grafana checkout', need: true },
  { id: 'aws', label: '~/.aws/credentials', need: false },
  { id: 'tool', label: 'go + node toolchains', need: true },
  { id: 'dt', label: 'mycorp/gitops', need: false },
  { id: 'kube', label: '~/.kube/config', need: false },
  { id: 'pkg', label: 'proxy.golang.org · npmjs', need: true },
  { id: 'ssh', label: '~/.ssh/id_ed25519', need: false },
  { id: 'op', label: '1Password', need: false },
  { id: 'pr', label: 'open a PR on grafana/grafana', need: true },
  { id: 'slack', label: 'Slack', need: false },
  { id: 'mail', label: 'Mail', need: false },
  { id: 'gh', label: 'gh token (all scopes)', need: false },
  { id: 'repos', label: 'every other repo', need: false },
  { id: 'cookies', label: 'browser cookies', need: false },
];

// hand-placed "everything on my laptop" cloud (x, y); widths vary, so no grid
const CLOUD: Record<string, [number, number]> = {
  repo: [120, 392], aws: [590, 392], tool: [960, 392], dt: [1360, 392],
  kube: [200, 494], pkg: [520, 494], ssh: [990, 494], slack: [1350, 494],
  pr: [120, 596], gh: [650, 596], repos: [1080, 596], op: [1430, 596],
  mail: [480, 698], cookies: [660, 698],
};

export function RiskSplit() {
  const { step, shown } = useSlide();
  const split = step >= 1;
  const cut = step >= 2;
  const watch = step >= 3;
  return (
    <>
      <Kicker ch="zerotrust" />
      <div className="abs display" style={{ left: 120, top: 140, fontSize: 84 }}>
        <Words text="What does the task *actually* need?" />
      </div>
      <R d={0.3} v="fade" className="abs task-chip" style={{ left: 120, top: 262 }}>
        task: fix a bug in grafana/grafana
      </R>

      <R at={1} v="fade" className="abs split-legend" style={{ left: 120, top: 346 }}>
        <span className="group-label need">
          <i /> what the task needs
        </span>
        <span className="group-label not">
          <i /> what it doesn’t
        </span>
      </R>

      {CHIPS.map((c, i) => {
        const [x, y] = CLOUD[c.id];
        const dead = cut && !c.need;
        return (
          <motion.div
            key={c.id}
            className={`abs rchip${split ? (c.need ? ' need' : ' not') : ''}${dead ? ' dead' : ''}${watch && c.need ? ' watched' : ''}`}
            style={{ left: x, top: y, transitionDelay: split && !cut ? `${i * 45}ms` : '0ms' }}
            initial={false}
            animate={{ opacity: shown ? (dead ? 0.35 : 1) : 0, scale: shown ? 1 : 0.9 }}
            transition={{ duration: 0.6, ease: EASE, delay: shown && !split ? 0.25 + i * 0.03 : 0 }}
          >
            {c.label}
          </motion.div>
        );
      })}

      <R at={2} v="up" className="abs verdict not" style={{ left: 900, top: 900 }}>
        pure risk, zero usefulness <span className="verdict-arrow">·</span> <b>remove it</b>
      </R>
      <R at={3} v="up" className="abs verdict need" style={{ left: 120, top: 900 }}>
        <Emoji n="eyes" size={34} /> the risk you signed up for <span className="verdict-arrow">·</span> <b>watch it</b>
      </R>
      <R at={4} v="fade" className="abs scrim" style={{ left: 0, top: 0, width: 1920, height: 1080 }} />
      <R at={4} v="zoom" d={0.1} className="abs thesis" style={{ left: 0, right: 0, top: 350 }}>
        <div>
          Remove what it doesn’t need.
          <br />
          <span className="grad-text">Watch what it does.</span>
        </div>
      </R>
    </>
  );
}
