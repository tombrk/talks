import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { R, Words, useSlide, useVisible, EASE } from '../engine/anim';
import { Clawd, Emoji, Kicker, MaskImg, WhiteCard, type EmojiName } from '../components';
import wordmark from '../assets/openclaw-wordmark.webp';
import lobster from '../assets/lobster.webp';
import openai from '../assets/openai.png';
import abc from '../assets/abc-headline.webp';
import chat from '../assets/openclaw-chat.webp';

/* ───────────────────────── section card ───────────────────────── */
export function DilemmaSection() {
  return (
    <>
      <WhiteCard />
      <div className="abs display" style={{ left: 136, top: 318, fontSize: 196, color: 'var(--orange)' }}>
        <Words text={'The access\ndilemma'} d={0.25} stagger={0.09} />
      </div>
      <R d={0.7} v="fade" className="abs serif-i" style={{ left: 1214, top: 356, fontSize: 56, color: '#444' }}>
        starring …
      </R>
      <R d={0.9} v="pop" className="abs lobster-wobble" style={{ left: 1200, top: 440 }}>
        <img src={wordmark} width={560} />
      </R>
      <div className="abs trait-chips" style={{ left: 1204, top: 600, width: 580 }}>
        {['always on', 'remembers everything', 'knows your world', 'acts on its own'].map((t, i) => (
          <R key={t} d={1.3 + i * 0.12} v="up" className="trait-chip">
            {t}
          </R>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────── why it's useful ───────────────────────── */
function Source({ at, icon, src, children }: { at: number; icon: EmojiName; src: string; children: ReactNode }) {
  return (
    <R at={at} v="left" className="source-card">
      <div className="source-icon">
        <Emoji n={icon} size={54} />
      </div>
      <div>
        <div className="source-label">{src}</div>
        <div className="source-body">{children}</div>
      </div>
    </R>
  );
}

export function Useful() {
  const linked = useVisible(4);
  const ys = [389, 529, 669, 809];
  return (
    <>
      <Kicker ch="dilemma" />
      <div className="abs display" style={{ left: 120, top: 138, fontSize: 104 }}>
        <Words text="Access *is* the feature." />
      </div>

      <div className="abs" style={{ left: 120, top: 330, width: 860, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Source at={0} icon="calendar" src="Calendar">
          Thursday: <Emoji n="airplane" /> Flight to Berlin vs. <Emoji n="tennis" /> Tennis
          <span className="tag-red">conflict</span>
        </Source>
        <Source at={1} icon="speech" src="Slack · a coworker">
          “fyi, the conference got postponed <Emoji n="confused" />”
        </Source>
        <Source at={2} icon="envelope" src="Email">
          Your flight booking has been cancelled.
        </Source>
        <Source at={3} icon="bank" src="Bank account">
          Refund from the airline: <b style={{ color: 'var(--g-yellow)' }}>still pending</b>
        </Source>
      </div>

      <svg className="abs" style={{ left: 0, top: 0 }} width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="useful-link" x1="0" x2="1">
            <stop offset="0" stopColor="#ff671d" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ff671d" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {ys.map((y, i) => (
          <motion.path
            key={y}
            d={`M 985 ${y} C 1080 ${y}, 1080 600, 1166 600`}
            fill="none"
            stroke="url(#useful-link)"
            strokeWidth={3}
            initial={false}
            animate={{ pathLength: linked ? 1 : 0, opacity: linked ? 1 : 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: linked ? i * 0.08 : 0 }}
          />
        ))}
      </svg>

      <R at={0} v="right" className="abs phone" style={{ left: 1166, top: 250 }}>
        <div className="phone-head">
          <img src={lobster} width={58} />
          <div>
            <div style={{ fontWeight: 650, fontSize: 26 }}>OpenClaw</div>
            <div style={{ fontSize: 18, opacity: 0.6 }}>bot · online</div>
          </div>
        </div>
        <div className="phone-body">
          <div className="chat-day">Today</div>
          <R at={3} until={4} d={0.5} v="fade" className="typing">
            <i />
            <i />
            <i />
          </R>
          <R at={4} v="up" className="bubble">
            Heads-up: your flight clashes with tennis on Thursday, but the conference was postponed and you already
            cancelled the flight. <b>I removed it from your calendar.</b> Enjoy tennis <Emoji n="tennis" />
            <br />
            <br />
            The refund hasn't arrived yet. I'll check again next week.
            <div className="bubble-time">09:12</div>
          </R>
          <R at={4} until={5} d={1.2} v="fade" className="unprompted">
            unprompted
          </R>
        </div>
      </R>

      <R at={5} className="abs serif-i" style={{ left: 120, top: 930, fontSize: 64 }}>
        …and nobody even asked.
      </R>
    </>
  );
}

/* ───────────────────────── the chart ───────────────────────── */
const P = { S: [292, 860], A: [423, 665], B: [942, 578], C: [1580, 208] } as const;

function Seg({ from, to, at }: { from: readonly number[]; to: readonly number[]; at: number }) {
  const vis = useVisible(at);
  const { step } = useSlide();
  return (
    <motion.line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke={step >= 3 ? 'url(#risk-line)' : '#141414'}
      strokeWidth={4}
      strokeLinecap="round"
      initial={false}
      animate={{ pathLength: vis ? 1 : 0, opacity: vis ? 1 : 0 }}
      transition={{ duration: 0.9, ease: EASE, opacity: { duration: 0.15 } }}
    />
  );
}

function Dot({ p, at }: { p: readonly number[]; at: number }) {
  const vis = useVisible(at);
  return (
    <motion.circle
      cx={p[0]}
      cy={p[1]}
      r={11}
      fill="#141414"
      initial={false}
      animate={{ scale: vis ? 1 : 0, opacity: vis ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 14, delay: vis ? 0.75 : 0 }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  );
}

export function Chart() {
  const risk = useVisible(3);
  const xs = [516, 782, 1048, 1314, 1580];
  const ys = [734, 608, 482, 356, 230];
  return (
    <>
      <WhiteCard />
      <div className="abs display-2" style={{ left: 140, top: 108, fontSize: 64, color: 'var(--orange)' }}>
        The access dilemma
      </div>
      <svg className="abs" style={{ left: 0, top: 0 }} width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="risk-heat" x1="0" x2="1">
            <stop offset="0" stopColor="#f2495c" stopOpacity="0" />
            <stop offset="0.55" stopColor="#ff671d" stopOpacity="0.14" />
            <stop offset="1" stopColor="#f2495c" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id="risk-line" gradientUnits="userSpaceOnUse" x1="250" x2="1600" y1="0" y2="0">
            <stop offset="0" stopColor="#73bf69" />
            <stop offset="0.5" stopColor="#ff9830" />
            <stop offset="1" stopColor="#f2495c" />
          </linearGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#141414" />
          </marker>
        </defs>
        <motion.rect
          x={252}
          y={190}
          width={1400}
          height={668}
          fill="url(#risk-heat)"
          initial={false}
          animate={{ opacity: risk ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
        {xs.map((x) => (
          <line key={x} x1={x} y1={200} x2={x} y2={860} stroke="#141414" strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        ))}
        {ys.map((y) => (
          <line key={y} x1={250} y1={y} x2={1600} y2={y} stroke="#141414" strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        ))}
        <line x1={250} y1={860} x2={1660} y2={860} stroke="#141414" strokeWidth={3} markerEnd="url(#arrow)" />
        <line x1={250} y1={860} x2={250} y2={176} stroke="#141414" strokeWidth={3} markerEnd="url(#arrow)" />
        <Seg from={P.S} to={P.A} at={0} />
        <Seg from={P.A} to={P.B} at={1} />
        <Seg from={P.B} to={P.C} at={2} />
        <Dot p={P.A} at={0} />
        <Dot p={P.B} at={1} />
        <Dot p={P.C} at={2} />
      </svg>

      <div className="abs axis-label" style={{ left: 150, top: 520, transform: 'translate(-50%, -50%) rotate(-90deg)' }}>
        Usefulness
      </div>
      <div className="abs axis-label" style={{ left: 740, top: 890, width: 340, textAlign: 'right' }}>
        Access to things
      </div>
      <motion.div
        className="abs risk-box"
        style={{ left: 1104, top: 880, transformOrigin: '0% 50%' }}
        initial={false}
        animate={risk ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: risk ? 0.2 : 0 }}
      >
        = Risk
      </motion.div>

      <R at={0} d={0.5} v="pop" className="abs" style={{ left: P.A[0] - 46, top: P.A[1] - 118 }}>
        <MaskImg src={openai} w={92} h={92} color="#141414" />
      </R>
      <R at={0} d={0.9} className="abs point-label" style={{ left: P.A[0] + 30, top: P.A[1] + 18 }}>
        <div>
          <b>ChatGPT</b>
        </div>
        <div>takes your prompt, gives a response</div>
        <div className="funnel">
          <Funnel /> <em>You</em> are the data funnel.
        </div>
      </R>

      <R at={1} d={0.5} v="pop" className="abs" style={{ left: P.B[0] - 60, top: P.B[1] + 26 }}>
        <Clawd size={120} walk />
      </R>
      <R at={1} d={0.9} className="abs point-label" style={{ left: P.B[0] + 90, top: P.B[1] + 30 }}>
        <div>
          <b>Claude Code</b> has a shell
        </div>
        <div className="funnel">
          <Funnel /> The <em>shell</em> is the data funnel,
        </div>
        <div className="funnel-sub">with all the data on your laptop behind it.</div>
      </R>

      <R at={2} d={0.5} v="pop" className="abs" style={{ left: P.C[0] + 26, top: P.C[1] - 70 }}>
        <img src={lobster} width={170} className="lobster-wobble" />
      </R>
      <R at={2} d={0.9} className="abs point-label" style={{ left: P.C[0] - 780, top: P.C[1] - 58, textAlign: 'right', width: 640 }}>
        <div>
          <b>OpenClaw</b> is plugged into your life
        </div>
        <div className="funnel" style={{ justifyContent: 'flex-end' }}>
          <Funnel /> Literally <em>all the data.</em>
        </div>
        <div className="funnel-sub">mail · calendar · Slack · bank · …</div>
      </R>
    </>
  );
}

function Funnel() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" className="funnel-icon">
      <path d="M2 4h20l-7.5 9v6.5L9.5 22v-9z" fill="var(--orange)" />
    </svg>
  );
}

/* ───────────────────────── the statement + coupled gauges ───────────────────────── */
function useAccessWave(vis: boolean) {
  const [v, setV] = useState(0.1);
  useEffect(() => {
    if (!vis) {
      setV(0.1);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const s = (t - t0) / 1000;
      // ramp up once, then breathe near the top
      const ramp = Math.min(1, s / 2.6);
      const e = 1 - Math.pow(1 - ramp, 3);
      setV(0.08 + e * 0.82 + (ramp >= 1 ? Math.sin((s - 2.6) * 1.1) * 0.06 : 0));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [vis]);
  return v;
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const [x0, y0] = [cx + r * Math.cos(rad(a0)), cy + r * Math.sin(rad(a0))];
  const [x1, y1] = [cx + r * Math.cos(rad(a1)), cy + r * Math.sin(rad(a1))];
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function Gauge({ title, value, colors }: { title: string; value: number; colors: [string, string] }) {
  const A0 = -130;
  const A1 = 130;
  const a = A0 + (A1 - A0) * value;
  const id = title.replace(/\W/g, '');
  const color = value > 0.66 ? colors[1] : value > 0.33 ? '#fade2a' : colors[0];
  return (
    <div className="g-panel" style={{ width: 330, height: 360 }}>
      <div className="g-panel-title">{title}</div>
      <svg width={330} height={300} viewBox="0 0 330 300">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" x2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <path d={arc(165, 165, 118, A0, A1)} stroke="rgba(204,204,220,0.1)" strokeWidth={26} fill="none" />
        <path d={arc(165, 165, 118, A0, Math.max(A0 + 0.5, a))} stroke={`url(#g-${id})`} strokeWidth={26} fill="none" />
        <path d={arc(165, 165, 142, A0, -43)} stroke="#73bf69" strokeWidth={6} fill="none" />
        <path d={arc(165, 165, 142, -40, 43)} stroke="#fade2a" strokeWidth={6} fill="none" />
        <path d={arc(165, 165, 142, 46, A1)} stroke="#f2495c" strokeWidth={6} fill="none" />
        <text x={165} y={185} textAnchor="middle" fill={color} fontSize={64} fontWeight={600} fontFamily="Inter">
          {Math.round(value * 100)}%
        </text>
      </svg>
    </div>
  );
}

export function Statement() {
  const vis = useVisible(0);
  const v = useAccessWave(vis);
  return (
    <>
      <Kicker ch="dilemma" />
      <div className="abs display" style={{ left: 120, top: 196, width: 1000, fontSize: 96, lineHeight: 1.0 }}>
        <Words text="The access that makes an agent *useful* is exactly the access that makes it *dangerous.*" stagger={0.045} />
      </div>
      <R d={0.4} v="right" className="abs" style={{ left: 1180, top: 210, display: 'flex', gap: 22 }}>
        <Gauge title="Usefulness" value={v} colors={['#73bf69', '#5794f2']} />
        <Gauge title="Risk" value={v} colors={['#fade2a', '#f2495c']} />
      </R>
      <R d={0.6} v="right" className="abs g-panel access-knob" style={{ left: 1180, top: 600, width: 682 }}>
        <div className="g-panel-title">Access to things</div>
        <div className="knob-track">
          <div className="knob-fill" style={{ width: `${v * 100}%` }} />
          <div className="knob" style={{ left: `${v * 100}%` }} />
        </div>
        <div className="knob-caption">one knob · two needles</div>
      </R>
      <R at={1} className="abs lede" style={{ left: 120, top: 760, width: 980, color: 'rgba(255,255,255,0.92)' }}>
        Contextualizing enormous amounts of information and acting on it is exactly what LLMs excel at. Restricting
        that is a losing game.
      </R>
    </>
  );
}

/* ───────────────────────── the gym ───────────────────────── */
function Marker({ at, d, style }: { at: number; d: number; style: React.CSSProperties }) {
  const vis = useVisible(at);
  return (
    <motion.div
      className="marker"
      style={{ ...style, transformOrigin: '0% 50%' }}
      initial={false}
      animate={{ scaleX: vis ? 1 : 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: vis ? d : 0 }}
    />
  );
}

export function Gym() {
  const k = 1060 / 960;
  return (
    <>
      <R v="left" className="abs news-card" style={{ left: 100, top: 96, rotate: '-1.4deg' }}>
        <img src={abc} width={1000} />
      </R>
      <R at={1} v="right" className="abs chat-shot" style={{ left: 760, top: 430, rotate: '1.2deg' }}>
        <img src={chat} width={1060} />
        <Marker at={2} d={0.1} style={{ left: 503 * k, top: 83 * k, width: 405 * k, height: 31 * k }} />
        <Marker at={2} d={0.35} style={{ left: 23 * k, top: 120 * k, width: 274 * k, height: 31 * k }} />
        <Marker at={2} d={0.7} style={{ left: 23 * k, top: 192 * k, width: 284 * k, height: 31 * k }} />
        <Marker at={2} d={0.85} style={{ left: 819 * k, top: 192 * k, width: 89 * k, height: 31 * k }} />
        <Marker at={2} d={1.0} style={{ left: 23 * k, top: 228 * k, width: 591 * k, height: 31 * k }} />
      </R>
      <R at={2} d={0.1} className="abs" style={{ left: 110, top: 520, width: 600 }}>
        <div className="display" style={{ fontSize: 76, color: 'var(--ink)' }}>
          No attacker.
          <br />
          No malware.
        </div>
        <div className="lede" style={{ marginTop: 26, fontSize: 32, color: '#3a2a20' }}>
          Just a <span className="serif-i" style={{ fontSize: 42 }}>helpful</span> agent, a perfectly reasonable
          task, and what would be a felony if a human did it.
        </div>
      </R>
      <R v="fade" d={0.5} className="abs source-line" style={{ left: 110, top: 962 }}>
        Source: abc.net.au/news/2026-08-10/ai-assistant-hacks-gym-website-aus-cyber-attack/107007986
      </R>
    </>
  );
}
