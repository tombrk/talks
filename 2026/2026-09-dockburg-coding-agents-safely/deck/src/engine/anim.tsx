import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, type TargetAndTransition, type Transition } from 'motion/react';

export type SlideCtx = { index: number; step: number; active: boolean; shown: boolean };
export const SlideContext = createContext<SlideCtx>({ index: 0, step: 0, active: true, shown: true });
export const useSlide = () => useContext(SlideContext);

/** true once the slide is on screen and the build has reached `at` (and not yet `until`) */
export function useVisible(at = 0, until?: number) {
  const { step, shown } = useSlide();
  return shown && step >= at && (until === undefined || step < until);
}

export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IO = [0.7, 0, 0.2, 1] as const;

type Variant = 'up' | 'down' | 'fade' | 'pop' | 'left' | 'right' | 'zoom' | 'blur';

const hiddenFor: Record<Variant, TargetAndTransition> = {
  up: { opacity: 0, y: 36, filter: 'blur(10px)' },
  down: { opacity: 0, y: -36, filter: 'blur(10px)' },
  fade: { opacity: 0 },
  pop: { opacity: 0, scale: 0.2 },
  left: { opacity: 0, x: -60, filter: 'blur(8px)' },
  right: { opacity: 0, x: 60, filter: 'blur(8px)' },
  zoom: { opacity: 0, scale: 1.25, filter: 'blur(14px)' },
  blur: { opacity: 0, filter: 'blur(24px)' },
};
const shownFor: Record<Variant, TargetAndTransition> = {
  up: { opacity: 1, y: 0, filter: 'blur(0px)' },
  down: { opacity: 1, y: 0, filter: 'blur(0px)' },
  fade: { opacity: 1 },
  pop: { opacity: 1, scale: 1 },
  left: { opacity: 1, x: 0, filter: 'blur(0px)' },
  right: { opacity: 1, x: 0, filter: 'blur(0px)' },
  zoom: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  blur: { opacity: 1, filter: 'blur(0px)' },
};

/** Reveal: appears when the build reaches step `at` (and optionally disappears at `until`). */
export function R({
  at = 0,
  until,
  v = 'up',
  d = 0,
  dur = 0.8,
  className,
  style,
  children,
}: {
  at?: number;
  until?: number;
  v?: Variant;
  d?: number;
  dur?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const vis = useVisible(at, until);
  const transition: Transition = vis
    ? v === 'pop'
      ? { type: 'spring', stiffness: 380, damping: 18, mass: 0.9, delay: d }
      : { duration: dur, ease: EASE, delay: d }
    : { duration: 0.3, ease: 'easeIn' };
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={vis ? shownFor[v] : hiddenFor[v]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/**
 * Words: kinetic, word-by-word masked reveal.
 * Markup: *serif italic*   ^accent colour^   (newline = line break)
 */
export function Words({
  text,
  at = 0,
  d = 0,
  stagger = 0.055,
  className,
  wordClass,
}: {
  text: string;
  at?: number;
  d?: number;
  stagger?: number;
  className?: string;
  wordClass?: string;
}) {
  const vis = useVisible(at);
  const tokens = parse(text);
  let wi = 0;
  return (
    <span className={`words ${className ?? ''}`}>
      {tokens.map((t, ti) => {
        if (t.br) return <br key={ti} />;
        const i = wi++;
        return (
          <span key={ti}>
            <span className="word-mask">
              <motion.span
                className={`word ${wordClass ?? ''}`}
                initial={false}
                animate={vis ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
                transition={vis ? { duration: 0.9, ease: EASE, delay: d + i * stagger } : { duration: 0.2 }}
              >
                {t.cls ? <span className={t.cls}>{t.w}</span> : t.w}
                {t.suffix}
              </motion.span>
            </span>
            {t.space ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
}

type Tok = { w: string; cls?: string; suffix?: string; space: boolean; br?: boolean };
const MARKS: Record<string, string> = { '*': 'serif-i', '^': 'accent' };

function parse(text: string): Tok[] {
  const out: Tok[] = [];
  const lines = text.split('\n');
  lines.forEach((line, li) => {
    const re = /([*^])(.+?)\1(\S*)|(\S+)/g;
    const raw: Omit<Tok, 'space'>[] = [];
    for (let m = re.exec(line); m; m = re.exec(line)) {
      if (m[1]) {
        const cls = MARKS[m[1]];
        const ws = m[2].split(' ');
        const suffix = m[3];
        ws.forEach((w, k) => raw.push({ w, cls, suffix: k === ws.length - 1 ? suffix : undefined }));
      } else raw.push({ w: m[4] });
    }
    raw.forEach((r, i) => out.push({ ...r, space: i < raw.length - 1 }));
    if (li < lines.length - 1) out.push({ w: '', space: false, br: true });
  });
  return out;
}

/** Typewriter: layout-stable (untyped rest is reserved invisibly) */
export function Type({
  text,
  at = 0,
  d = 0,
  cps = 40,
  cursor = false,
  className,
  style,
}: {
  text: string;
  at?: number;
  d?: number;
  cps?: number;
  cursor?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const vis = useVisible(at);
  const n = useTyped(vis, text.length, d, cps);
  const done = n >= text.length;
  return (
    <span className={className} style={style}>
      {text.slice(0, n)}
      {cursor && vis && !done && <span className="caret" />}
      <span style={{ visibility: 'hidden' }}>{text.slice(n)}</span>
      {cursor && vis && done && <span className="caret blink" />}
    </span>
  );
}

export function useTyped(vis: boolean, len: number, d = 0, cps = 40) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!vis) {
      setN(0);
      return;
    }
    let raf = 0;
    const start = performance.now() + d * 1000;
    const tick = (t: number) => {
      const k = Math.max(0, Math.min(len, Math.floor(((t - start) / 1000) * cps)));
      setN(k);
      if (k < len) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [vis, len, d, cps]);
  return n;
}

/** Counts up to `to` while visible */
export function useCount(vis: boolean, to: number, dur = 1.6, d = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!vis) {
      setV(0);
      return;
    }
    let raf = 0;
    const start = performance.now() + d * 1000;
    const tick = (t: number) => {
      const p = Math.max(0, Math.min(1, (t - start) / (dur * 1000)));
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [vis, to, dur, d]);
  return v;
}
