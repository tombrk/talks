import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { R, Words, useSlide, useVisible, EASE } from '../engine/anim';
import { Arr, Emoji, Flame, Kicker, SocialIcon, WhiteCard } from '../components';
import claude from '../assets/claude.webp';
import slack from '../assets/slack.webp';
import mail from '../assets/mail.webp';
import photos from '../assets/photos.webp';
import reddit from '../assets/reddit.webp';
import frog from '../assets/frog-toad.webp';
import iceberg from '../assets/iceberg.webp';

/* ───────────────────────── Sandboxes! ───────────────────────── */
export function SandboxesBang() {
  const vis = useVisible(0);
  const letters = Array.from('Sandboxes!');
  return (
    <>
      <div className="abs display bang" style={{ left: 0, right: 0, top: 330, textAlign: 'center', fontSize: 300 }}>
        {letters.map((c, i) => (
          <motion.span
            key={i}
            style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
            initial={false}
            animate={vis ? { y: 0, opacity: 1, rotate: 0 } : { y: -420, opacity: 0, rotate: i % 2 ? 14 : -14 }}
            transition={vis ? { type: 'spring', stiffness: 520, damping: 17, mass: 1.1, delay: 0.1 + i * 0.06 } : { duration: 0.2 }}
            className={c === '!' ? 'bang-mark' : undefined}
          >
            {c}
          </motion.span>
        ))}
      </div>
      <R d={1.1} v="up" className="abs serif-i" style={{ left: 0, right: 0, top: 710, textAlign: 'center', fontSize: 64, opacity: 0.95 }}>
        “Just sandbox it.”
      </R>
    </>
  );
}

/* ───────────────────────── the laptop scene ───────────────────────── */
type Pt = { x: number; y: number; s: number };
type AppKey = 'slack' | 'mail' | 'photos';
type SceneState = {
  apps: Record<AppKey, Pt & { hot: boolean }>;
  box: { x: number; y: number; w: number; h: number } | null;
  boxHot?: boolean;
  inner: boolean;
  caption?: ReactNode;
};

const HOME: Record<AppKey, Pt> = {
  slack: { x: 520, y: 400, s: 150 },
  mail: { x: 1400, y: 400, s: 150 },
  photos: { x: 520, y: 760, s: 150 },
};
const BOX = { x: 750, y: 380, w: 420, h: 400 };
const LAPTOP = { x: 330, y: 186, w: 1260, h: 720 };

const app = (k: AppKey, hot = false, p: Partial<Pt> = {}) => ({ ...HOME[k], ...p, hot });

const SCENE_A: SceneState[] = [
  { apps: { slack: app('slack'), mail: app('mail'), photos: app('photos') }, box: null, inner: false },
  { apps: { slack: app('slack'), mail: app('mail'), photos: app('photos', true) }, box: null, inner: false },
  { apps: { slack: app('slack'), mail: app('mail', true), photos: app('photos', true) }, box: null, inner: false },
  {
    apps: { slack: app('slack', true), mail: app('mail', true), photos: app('photos', true) },
    box: null,
    inner: false,
    caption: (
      <>
        It can reach everything <span className="serif-i">you</span> can.
      </>
    ),
  },
  {
    apps: { slack: app('slack'), mail: app('mail'), photos: app('photos') },
    box: BOX,
    inner: true,
    caption: (
      <>
        Contained. <Emoji n="party" />
      </>
    ),
  },
];

const SCENE_B: SceneState[] = [
  { apps: { slack: app('slack'), mail: app('mail'), photos: app('photos') }, box: BOX, inner: true, caption: <>Contained. <Emoji n="party" /></> },
  {
    apps: { slack: app('slack'), mail: app('mail', true, { x: 1096, y: 690, s: 120 }), photos: app('photos') },
    box: BOX,
    inner: true,
    caption: (
      <>
        But to be <span className="serif-i">useful</span>, it needs your email…
      </>
    ),
  },
  {
    apps: {
      slack: app('slack', true, { x: 830, y: 470, s: 120 }),
      mail: app('mail', true, { x: 1096, y: 690, s: 120 }),
      photos: app('photos', true, { x: 836, y: 694, s: 120 }),
    },
    box: BOX,
    inner: true,
    caption: <>…and your Slack. And your photos. And…</>,
  },
  {
    apps: {
      slack: app('slack', true, { x: 830, y: 470, s: 120 }),
      mail: app('mail', true, { x: 1096, y: 690, s: 120 }),
      photos: app('photos', true, { x: 836, y: 694, s: 120 }),
    },
    box: { x: LAPTOP.x + 14, y: LAPTOP.y + 70, w: LAPTOP.w - 28, h: LAPTOP.h - 84 },
    boxHot: true,
    inner: true,
    caption: (
      <>
        Congratulations: your sandbox is now <span className="serif-i">your laptop.</span>
      </>
    ),
  },
];

const APP_SRC: Record<AppKey, string> = { slack, mail, photos };

function SandboxScene({ states, title }: { states: SceneState[]; title: string }) {
  const { step, shown } = useSlide();
  const st = states[Math.min(step, states.length - 1)];
  return (
    <>
      <WhiteCard />
      <R v="fade" className="abs display-2" style={{ left: 0, right: 0, top: 96, textAlign: 'center', fontSize: 60, color: 'var(--orange)' }}>
        {title}
      </R>
      <R v="up" d={0.15} className="abs laptop" style={{ left: LAPTOP.x, top: LAPTOP.y, width: LAPTOP.w, height: LAPTOP.h }}>
        <div className="laptop-bar">
          <i />
          <i />
          <i />
          <span>your laptop</span>
        </div>
      </R>

      <motion.div
        className={`abs sandbox-box${st.boxHot ? ' hot' : ''}`}
        initial={false}
        animate={
          st.box && shown
            ? { opacity: 1, left: st.box.x, top: st.box.y, width: st.box.w, height: st.box.h, scale: 1 }
            : { opacity: 0, left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, scale: 1.25 }
        }
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="sandbox-label">sandbox</span>
      </motion.div>

      <motion.img
        src={claude}
        className="abs claude-spin"
        style={{ left: 960 - 110, top: 575 - 110, width: 220, height: 220 }}
        initial={false}
        animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.6 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
      />
      {(['slack', 'mail', 'photos'] as AppKey[]).map((k, i) => {
        const a = st.apps[k];
        return (
          <motion.div
            key={k}
            className="abs"
            initial={false}
            animate={{ left: a.x - a.s / 2, top: a.y - a.s / 2, width: a.s, height: a.s, opacity: shown ? 1 : 0 }}
            transition={{ duration: 0.9, ease: EASE, opacity: { delay: shown ? 0.35 + i * 0.08 : 0 } }}
          >
            <img src={APP_SRC[k]} style={{ width: '100%', height: '100%' }} />
            {a.hot && <Flame x={a.s * 0.82} y={a.s * 1.08} size={a.s * 0.72} seed={i + 1} />}
          </motion.div>
        );
      })}
      {st.inner && (
        <>
          <Flame x={850} y={530} size={104} seed={4} d={0.35} />
          <Flame x={1072} y={530} size={104} seed={5} d={0.45} />
          <Flame x={962} y={760} size={104} seed={6} d={0.55} />
        </>
      )}

      <div className="abs scene-caption" style={{ left: 0, right: 0, top: 930 }}>
        <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: st.caption ? 1 : 0, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          {st.caption ?? '\u00a0'}
        </motion.div>
      </div>
    </>
  );
}

export const SandboxSceneA = () => <SandboxScene states={SCENE_A} title="Sandboxes" />;
export const SandboxSceneB = () => <SandboxScene states={SCENE_B} title="Sandboxes" />;

/* ───────────────────────── sAnDbOxEs ───────────────────────── */
function Mock({ start }: { start: 0 | 1 }) {
  const vis = useVisible(0);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!vis) return;
    const id = window.setInterval(() => setPhase((p) => p + 1), 1500);
    return () => clearInterval(id);
  }, [vis]);
  return (
    <span className="mock">
      {Array.from('sandboxes').map((c, i) => {
        const up = (i + start + phase) % 2 === 1;
        const ch = up ? c.toUpperCase() : c;
        return (
          <motion.span
            key={`${i}-${ch}`}
            style={{ display: 'inline-block' }}
            initial={{ rotateX: 90, opacity: 0.2 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE, delay: i * 0.035 }}
          >
            {ch}
          </motion.span>
        );
      })}
    </span>
  );
}

export function Docker() {
  const k = 1500 / 1618;
  return (
    <>
      <WhiteCard />
      <R v="fade" className="abs display-2" style={{ left: 0, right: 0, top: 92, textAlign: 'center', fontSize: 66, color: 'var(--orange)' }}>
        <Mock start={0} />
      </R>
      <R d={0.2} v="up" className="abs shot-frame" style={{ left: 210, top: 214 }}>
        <img src={reddit} width={1500} />
        <div className="red-pulse" style={{ left: 131 * k, top: 272 * k, width: 1460 * k, height: 64 * k }} />
      </R>
      <R at={1} className="abs" style={{ left: 210, width: 1500, top: 758, textAlign: 'center' }}>
        <div className="serif-i" style={{ fontSize: 58, lineHeight: 1.15, color: '#1b1b1b' }}>
          “…through a throwaway container rather than sudo, since sudo needs your password.”
        </div>
        <div className="docker-note">
          <Emoji n="whale" size={34} /> docker group membership is basically root on the host
        </div>
      </R>
    </>
  );
}

export function Frog() {
  return (
    <>
      <WhiteCard />
      <R v="fade" className="abs display-2" style={{ left: 0, right: 0, top: 92, textAlign: 'center', fontSize: 66, color: 'var(--orange)' }}>
        <Mock start={1} />
      </R>
      <R d={0.2} v="zoom" className="abs frog" style={{ left: 960 - 370, top: 222, rotate: '-1deg' }}>
        <img src={frog} width={740} />
      </R>
    </>
  );
}

/* ───────────────────────── bad vs. very bad ───────────────────────── */
function Meh({ cmd, verdict, d }: { cmd: ReactNode; verdict: string; d: number }) {
  return (
    <R at={1} d={d} v="left" className="meh-row">
      <code>{cmd}</code>
      <Arr className="meh-arrow" size={30} />
      <span className="meh-verdict">{verdict}</span>
    </R>
  );
}

export function BadVsVeryBad() {
  return (
    <>
      <Kicker ch="sandboxes" />
      <div className="abs display" style={{ left: 120, top: 140, width: 1640, fontSize: 92 }}>
        <Words text="Running untrusted code is a *solved* problem." />
      </div>
      <R d={0.5} className="abs lede" style={{ left: 120, top: 262, width: 1500, fontSize: 31, opacity: 0.62 }}>
        Take some money, run an isolated VM per conversation, throw it away afterwards. Everything else (gVisor,
        Firecracker, V8 isolates, WASM) is optimization.
      </R>

      <R at={1} v="fade" className="abs col-label ok" style={{ left: 120, top: 400 }}>
        bad, but fine
      </R>
      <div className="abs" style={{ left: 120, top: 458, width: 820, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Meh d={0.05} cmd="rm -rf / (in the sandbox)" verdict="a failed tool call" />
        <Meh d={0.15} cmd="wipes its ephemeral compute" verdict="inconvenient" />
        <Meh d={0.25} cmd="writes itself a crypto miner" verdict="expensive" />
      </div>

      <R at={2} v="fade" className="abs col-label bad" style={{ left: 1000, top: 400 }}>
        actually bad
      </R>
      <R at={2} d={0.05} v="right" className="abs tweet" style={{ left: 1000, top: 458, width: 800 }}>
        <div className="tweet-head">
          <div className="tweet-avatar">
            <Emoji n="robot" size={40} />
          </div>
          <div>
            <b>You</b> <span className="tweet-meta">@you · 2:14 AM</span>
          </div>
        </div>
        <div className="tweet-body">
          really bad RCE incident at Grafana Labs, working hard to resolve <Emoji n="pleading" />
        </div>
        <div className="tweet-foot">
          <span>
            <SocialIcon kind="reply" /> 312
          </span>
          <span>
            <SocialIcon kind="repost" /> 1.9K
          </span>
          <span>
            <SocialIcon kind="like" /> 4.8K
          </span>
          <span className="tweet-agent">posted by your agent</span>
        </div>
      </R>
      <R at={2} d={0.3} v="right" className="abs leak-card" style={{ left: 1000, top: 790, width: 800 }}>
        <span className="leak-dot" />
        <code>mycorp/gitops</code>, now on the public internet
      </R>
      <R at={2} d={0.9} className="abs bridge" style={{ left: 120, top: 944, width: 1680 }}>
        The problem isn’t what it <span className="serif-i">runs</span>. It’s what it can <span className="serif-i accent">reach</span>.
      </R>
    </>
  );
}

/* ───────────────────────── the iceberg ───────────────────────── */
export const IcebergBackdrop = (
  <>
    <div className="bg water" style={{ top: 'calc(50% + (470px - 540px) * var(--s))' }} />
    <div className="bg bubbles" style={{ top: 'calc(50% + (470px - 540px) * var(--s))' }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-i * 0.9}s`, animationDuration: `${7 + (i % 5)}s` }} />
      ))}
    </div>
  </>
);

export function Iceberg() {
  const deep = useVisible(1);
  return (
    <>
      <svg className="abs waves" style={{ left: -200, top: 452 }} width={2320} height={40} viewBox="0 0 2320 40">
        <path d={wavePath(2320, 18, 120, 20)} fill="#d4e2ff" />
      </svg>
      <R v="fade" className="abs" style={{ left: 120, top: 76, color: 'var(--orange)', fontWeight: 650, fontSize: 30 }}>
        Autonomy is a trust problem
      </R>
      <div className="abs display" style={{ left: 120, top: 122, fontSize: 92, color: '#101010' }}>
        <Words text="Sandboxing is *not* all you need" />
      </div>
      <R v="up" d={0.2} className="abs berg" style={{ left: 170, top: 262 }}>
        <img src={iceberg} width={520} />
      </R>

      <R d={0.5} className="abs berg-block" style={{ left: 820, top: 270 }}>
        <h3>What a VM protects</h3>
        <ul>
          <li>The kernel</li>
          <li>Other processes</li>
        </ul>
      </R>

      <motion.div className="abs deep-veil" initial={false} animate={{ opacity: deep ? 0 : 1 }} transition={{ duration: 1 }} />

      <R at={1} className="abs berg-block" style={{ left: 820, top: 560 }}>
        <h3>
          What is <span className="serif-i">actually your</span> problem
        </h3>
        <ul>
          <li>What (sensitive) data it has</li>
          <li>What it can read</li>
          <li>Where it can write</li>
          <li className="hl">Who it can talk to</li>
        </ul>
      </R>
    </>
  );
}

function wavePath(w: number, amp: number, len: number, base: number) {
  let d = `M 0 ${base}`;
  for (let x = 0; x <= w; x += len) {
    d += ` Q ${x + len / 4} ${base - amp} ${x + len / 2} ${base} T ${x + len} ${base}`;
  }
  return d + ` V 40 H 0 Z`;
}
