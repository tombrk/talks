import { useId, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { R, useVisible } from '../engine/anim';
import { chapters, type ChapterKey } from '../engine/types';
import grafanaLogo from '../assets/grafana-logo.png';
import grafanaIcon from '../assets/grafana-icon.png';

export type EmojiName =
  | 'fire' | 'raised_hand' | 'person_raising_hand' | 'tennis' | 'airplane' | 'bank' | 'calendar'
  | 'speech' | 'envelope' | 'lobster' | 'eyes' | 'siren' | 'skull' | 'party' | 'shrug' | 'key'
  | 'whale' | 'package' | 'money' | 'pickaxe' | 'bomb' | 'see_no_evil' | 'pleading' | 'robot'
  | 'confused' | 'grimace' | 'check' | 'cross' | 'warning' | 'lock' | 'unlock' | 'eye' | 'detective'
  | 'sparkles' | 'cloud' | 'wrench' | 'gear' | 'link' | 'satellite' | 'bell';

const EMOJI: Record<EmojiName, string> = {
  fire: '🔥',
  raised_hand: '✋',
  person_raising_hand: '🙋',
  tennis: '🎾',
  airplane: '✈️',
  bank: '🏦',
  calendar: '📅',
  speech: '💬',
  envelope: '✉️',
  lobster: '🦞',
  eyes: '👀',
  siren: '🚨',
  skull: '💀',
  party: '🎉',
  shrug: '🤷',
  key: '🔑',
  whale: '🐳',
  package: '📦',
  money: '💸',
  pickaxe: '⛏️',
  bomb: '💣',
  see_no_evil: '🙈',
  pleading: '🥺',
  robot: '🤖',
  confused: '😕',
  grimace: '😬',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  lock: '🔒',
  unlock: '🔓',
  eye: '👁️',
  detective: '🕵️',
  sparkles: '✨',
  cloud: '☁️',
  wrench: '🔧',
  gear: '⚙️',
  link: '🔗',
  satellite: '📡',
  bell: '🔔',
};

/** Native Unicode emoji (Apple Color Emoji on the Mac), in a 1em box so layouts don't shift */
export function Emoji({ n, size, style, className }: { n: EmojiName; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <span className={`emoji ${className ?? ''}`} style={{ ...(size ? { fontSize: size } : null), ...style }} aria-hidden>
      {EMOJI[n]}
    </span>
  );
}

/** Grafana logo, tinted via CSS mask (any colour, or the brand gradient) */
export function GLogo({
  h = 44,
  color = '#fff',
  icon = false,
  gradient = false,
  style,
}: {
  h?: number;
  color?: string;
  icon?: boolean;
  gradient?: boolean;
  style?: CSSProperties;
}) {
  const src = icon ? grafanaIcon : grafanaLogo;
  const ratio = icon ? 137 / 149 : 1100 / 180;
  return (
    <div
      className="logo-mask"
      style={{
        height: h,
        width: h * ratio,
        background: gradient ? 'var(--grad-v)' : color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        ...style,
      }}
    />
  );
}

/** Tinted monochrome raster logo (e.g. OpenAI) */
export function MaskImg({ src, w, h, color = '#fff', style }: { src: string; w: number; h: number; color?: string; style?: CSSProperties }) {
  return (
    <div
      className="logo-mask"
      style={{ width: w, height: h, background: color, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, ...style }}
    />
  );
}

/** Clawd: the Claude Code pixel critter, rebuilt as crisp SVG (16×10 grid) */
export function Clawd({ size = 160, walk = false, color = 'var(--claude)', eye = '#141414', style }: { size?: number; walk?: boolean; color?: string; eye?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={(size * 10) / 16}
      viewBox="0 0 16 10"
      shapeRendering="crispEdges"
      className={`clawd${walk ? ' walk' : ''}`}
      style={style}
    >
      <path fill={color} d="M2 0H14V4H16V6H14V8H2V6H0V4H2Z" />
      <rect fill={eye} x="4" y="2" width="1" height="2" className="eye" />
      <rect fill={eye} x="11" y="2" width="1" height="2" className="eye" />
      <g fill={color}>
        <rect className="leg a" x="3" y="8" width="1" height="2" />
        <rect className="leg b" x="5" y="8" width="1" height="2" />
        <rect className="leg a" x="10" y="8" width="1" height="2" />
        <rect className="leg b" x="12" y="8" width="1" height="2" />
      </g>
    </svg>
  );
}

const FIRE_OUTER =
  'M35 19c0-2.062-.367-4.039-1.04-5.868-.46 5.389-3.333 8.157-6.335 6.868-2.812-1.208-.917-5.917-.777-8.164.236-3.809-.012-8.169-6.931-11.794 2.875 5.5.333 8.917-2.333 9.125-2.958.231-5.667-2.542-4.667-7.042-3.238 2.386-3.332 6.402-2.333 9 1.042 2.708-.042 4.958-2.583 5.208-2.84.28-4.418-3.041-2.963-8.333C2.52 10.965 1 14.805 1 19c0 9.389 7.611 17 17 17s17-7.611 17-17z';
const FIRE_INNER =
  'M28.394 23.999c.148 3.084-2.561 4.293-4.019 3.709-2.106-.843-1.541-2.291-2.083-5.291s-2.625-5.083-5.708-6c2.25 6.333-1.247 8.667-3.08 9.084-1.872.426-3.753-.001-3.968-4.007C7.352 23.668 6 26.676 6 30c0 .368.023.73.055 1.09C9.125 34.124 13.342 36 18 36s8.875-1.876 11.945-4.91c.032-.36.055-.722.055-1.09 0-2.187-.584-4.236-1.606-6.001z';

/** Animated flame in the Grafana palette: pops in at step `at`, flickers, throws embers */
export function Flame({
  x,
  y,
  size = 110,
  at = 0,
  until,
  d = 0,
  seed = 0,
  style,
}: {
  x: number;
  y: number;
  size?: number;
  at?: number;
  until?: number;
  d?: number;
  seed?: number;
  style?: CSSProperties;
}) {
  const vis = useVisible(at, until);
  const id = useId().replace(/:/g, '');
  const delay = `${-((seed * 0.37) % 1.2)}s`;
  return (
    <motion.div
      className="flame"
      style={{ left: x - size / 2, top: y - size, width: size, height: size, transformOrigin: '50% 100%', ...style }}
      initial={false}
      animate={vis ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2 }}
      transition={vis ? { type: 'spring', stiffness: 320, damping: 13, delay: d } : { duration: 0.35 }}
    >
      <svg viewBox="0 0 36 36">
        <defs>
          <linearGradient id={`${id}o`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2495c" />
            <stop offset="0.55" stopColor="#ff671d" />
            <stop offset="1" stopColor="#ff9830" />
          </linearGradient>
          <linearGradient id={`${id}i`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbca0a" />
            <stop offset="1" stopColor="#fff1a8" />
          </linearGradient>
        </defs>
        <path className="fo" fill={`url(#${id}o)`} d={FIRE_OUTER} style={{ animationDelay: delay }} />
        <path className="fi" fill={`url(#${id}i)`} d={FIRE_INNER} style={{ animationDelay: delay }} />
      </svg>
      {[0, 1, 2].map((k) => (
        <span
          key={k}
          className="ember"
          style={{
            left: `${30 + k * 20}%`,
            top: '20%',
            animationDelay: `${-(seed * 0.5 + k * 0.6)}s`,
            ['--dx' as string]: `${(k - 1) * 18}px`,
          }}
        />
      ))}
    </motion.div>
  );
}

/** Chapter kicker, top-left */
export function Kicker({ ch, children, style, color }: { ch: ChapterKey; children?: ReactNode; style?: CSSProperties; color?: string }) {
  const c = chapters[ch];
  return (
    <R v="fade" className="kicker abs" style={{ left: 120, top: 84, color, ...style }}>
      <span className="num">{c.n}</span>
      {children ?? c.label}
    </R>
  );
}

/** The white rounded card from the original deck */
export function WhiteCard({ children, inset = 60, style }: { children?: ReactNode; inset?: number; style?: CSSProperties }) {
  return (
    <R v="up" dur={0.9} className="card abs" style={{ left: inset, top: inset, right: inset, bottom: inset, ...style }}>
      {children}
    </R>
  );
}

/** “So you want to run coding agents safely …”: the deck's running header */
export function RunningHeader({ style }: { style?: CSSProperties }) {
  return (
    <div
      className="abs"
      style={{
        left: 140,
        top: 120,
        color: 'var(--orange)',
        fontStyle: 'italic',
        fontWeight: 650,
        fontSize: 27,
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      So you want to run coding agents safely …
    </div>
  );
}

export function Check({ ok = true, size = 34 }: { ok?: boolean; size?: number }) {
  return ok ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="rgba(115,191,105,0.16)" stroke="#73bf69" strokeWidth="1.5" />
      <path d="M7 12.5l3.2 3.2L17.5 8.5" stroke="#73bf69" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="rgba(242,73,92,0.16)" stroke="#f2495c" strokeWidth="1.5" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="#f2495c" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────── tiny inline icons (glyphs outside the Latin font subsets) ───────────── */
type IconProps = { size?: number; color?: string; style?: CSSProperties; className?: string };

export function Arr({ size = 28, color = 'currentColor', dir = 'r', style, className }: IconProps & { dir?: 'r' | 'l' | 'u' | 'd' }) {
  const rot = { r: 0, d: 90, l: 180, u: 270 }[dir];
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: '-0.12em', transform: `rotate(${rot}deg)`, ...style }}>
      <path d="M3 12h16M13 5.5 19.5 12 13 18.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Tick({ size = 26, color = '#73bf69', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: '-0.14em', ...style }}>
      <path d="M4.5 12.5l4.8 4.8L19.5 7" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Cross({ size = 26, color = '#f2495c', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: '-0.14em', ...style }}>
      <path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth={2.8} strokeLinecap="round" />
    </svg>
  );
}

export function SocialIcon({ kind, size = 26, color = 'currentColor' }: IconProps & { kind: 'reply' | 'repost' | 'like' }) {
  const d = {
    reply: 'M4 5.5h16v10.5H9.5L5 20v-4H4z',
    repost: 'M7 7h10l-2.5-2.5M17 17H7l2.5 2.5M17 7v6M7 17v-6',
    like: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z',
  }[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: '-0.2em' }}>
      <path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** GitHub mark (simple-icons, CC0) */
export function GitHubMark({ size = 48, color = 'currentColor', style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={style} aria-label="GitHub">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
