import { useLayoutEffect, useState } from 'react';
import { GLogo } from '../components';
import type { Theme } from './types';

const TONE: Record<Theme, { text: string; logo: string }> = {
  orange: { text: 'rgba(255, 255, 255, 0.9)', logo: '#ffffff' },
  peach: { text: 'rgba(90, 40, 10, 0.72)', logo: '#ff671d' },
  dark: { text: 'rgba(255, 255, 255, 0.6)', logo: '#ff671d' },
  paper: { text: 'rgba(20, 20, 20, 0.6)', logo: '#ff671d' },
  ice: { text: 'rgba(20, 20, 20, 0.6)', logo: '#ff671d' },
};

const pad = (n: number) => String(n).padStart(2, '0');

/** The lower third (logo · talk · speaker · counter), laid out in 1920×1080 stage coordinates. */
export function ChromeBar({ theme, index, total }: { theme: Theme; index: number; total: number }) {
  const t = TONE[theme];
  return (
    <div className="chrome-bar" style={{ color: t.text }}>
      <GLogo h={25} color={t.logo} style={{ transition: 'background-color 0.5s' }} />
      <span className="chrome-sep" />
      <span className="chrome-title">
        So you want to run (coding) agents <em>safely</em>
      </span>
      <span className="chrome-dot">·</span>
      <span className="chrome-name">Tom Braack</span>
      <span className="chrome-count">
        {pad(index + 1)} / {pad(total)}
      </span>
    </div>
  );
}

/**
 * Fixed overlay: the slides scroll underneath, the lower third stays put.
 * Uses its own scaled stage so it lines up with the letterboxed slide stage.
 */
export function Chrome({ theme, index, total, hidden }: { theme: Theme; index: number; total: number; hidden: boolean }) {
  const [s, setS] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setS(Math.min(window.innerWidth / 1920, window.innerHeight / 1080) || 1);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className={`chrome${hidden ? ' is-hidden' : ''}`} aria-hidden>
      <div className="chrome-stage" style={{ transform: `translate(-50%, -50%) scale(${s})` }}>
        <ChromeBar theme={theme} index={index} total={total} />
      </div>
    </div>
  );
}
