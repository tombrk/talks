import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { MotionConfig } from 'motion/react';
import { Controller } from './controller';
import { Frame } from './Frame';
import { ChromeBar } from './Chrome';
import { SlideContext } from './anim';
import { chapters, type SlideDef } from './types';

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function Screen({ def, index, step, total }: { def: SlideDef; index: number; step: number; total: number }) {
  const C = def.Component;
  const ctx = useMemo(() => ({ index, step, active: true, shown: true }), [index, step]);
  return (
    <div className="presenter-screen">
      <SlideContext.Provider value={ctx}>
        <Frame theme={def.theme} plain={def.plain} backdrop={def.backdrop}>
          <C />
          {index > 0 && <ChromeBar theme={def.theme} index={index} total={total} />}
        </Frame>
      </SlideContext.Provider>
    </div>
  );
}

export function Presenter({ slides }: { slides: SlideDef[] }) {
  const ctrl = useMemo(() => new Controller(slides, 'presenter'), [slides]);
  const state = useSyncExternalStore(ctrl.subscribe, ctrl.getState);
  const [t0, setT0] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    ctrl.connect();
    ctrl.hello();
    const id = window.setInterval(() => setNow(Date.now()), 500);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') return setT0(Date.now());
      ctrl.onKey(e);
    };
    window.addEventListener('keydown', onKey);
    document.title = 'Presenter · So you want to run (coding) agents safely';
    return () => {
      clearInterval(id);
      window.removeEventListener('keydown', onKey);
      ctrl.disconnect();
    };
  }, [ctrl]);

  // the clock starts the first time you leave the title slide
  useEffect(() => {
    if (t0 === null && state.index > 0) setT0(Date.now());
  }, [state.index, t0]);

  const cur = slides[state.index];
  const lastStep = state.step >= ctrl.steps(state.index) - 1;
  const nextIdx = lastStep ? Math.min(state.index + 1, slides.length - 1) : state.index;
  const nextStep = lastStep ? 0 : state.step + 1;
  const isEnd = lastStep && state.index === slides.length - 1;

  const plannedStart = slides.slice(0, state.index).reduce((a, s) => a + s.minutes, 0) * 60_000;
  const plannedEnd = plannedStart + cur.minutes * 60_000;
  const total = slides.reduce((a, s) => a + s.minutes, 0);
  const elapsed = t0 ? now - t0 : 0;
  let pace = { cls: 'ok', text: 'on track' };
  if (t0) {
    if (elapsed > plannedEnd) {
      const behind = elapsed - plannedEnd;
      pace = { cls: behind > 120_000 ? 'bad' : 'warn', text: `+${fmt(behind)} behind` };
    } else if (elapsed < plannedStart) pace = { cls: 'ok', text: `${fmt(plannedStart - elapsed)} ahead` };
  } else pace = { cls: 'ok', text: 'clock starts when you leave the title (T to restart)' };

  const upcoming = slides
    .map((sl, i) => ({ sl, i, at: slides.slice(0, i).reduce((acc, x) => acc + x.minutes, 0) }))
    .slice(state.index + 1, state.index + 7);
  const ch = chapters[cur.chapter];

  return (
    <MotionConfig reducedMotion="user">
      <div className="presenter">
        <div className="presenter-top">
          <div className="clock">{fmt(elapsed)}</div>
          <div className={`pace ${pace.cls}`}>{pace.text}</div>
          <div className="p-where">
            <span className="p-ch">
              {ch.n} {ch.label}
            </span>
            <span>
              slide {state.index + 1}/{slides.length} · build {state.step + 1}/{ctrl.steps(state.index)} · planned {fmt(plannedStart)}–{fmt(plannedEnd)}
            </span>
          </div>
          <button onClick={() => setT0(Date.now())}>restart clock · T</button>
          <div className="p-wall">{new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className="presenter-col">
          <div className="presenter-label">Now · {cur.title}</div>
          <Screen def={cur} index={state.index} step={state.step} total={slides.length} />
          <div className="presenter-notes">
            <ul>
              {cur.notes.map((n, i) => (
                <li key={i} className={n.startsWith('\u201c') ? 'say' : ''}>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="presenter-col">
          <div className="presenter-label">
            Next · {isEnd ? 'end of deck' : lastStep ? slides[nextIdx].title : `build ${nextStep + 1}`}
          </div>
          <Screen def={slides[nextIdx]} index={nextIdx} step={nextStep} total={slides.length} />
          <div className="p-upcoming">
            {upcoming.map(({ sl, i, at }) => (
              <div key={sl.id} className={chapters[sl.chapter] !== ch && slides[i - 1]?.chapter !== sl.chapter ? 'new-ch' : ''}>
                <span className="p-at">{fmt(at * 60_000)}</span>
                <span className="p-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="p-t">{sl.title}</span>
              </div>
            ))}
          </div>
          <div className="p-keys">↓ / Enter next · ↑ back · T restart clock · total {total} min</div>
        </div>
      </div>
    </MotionConfig>
  );
}
