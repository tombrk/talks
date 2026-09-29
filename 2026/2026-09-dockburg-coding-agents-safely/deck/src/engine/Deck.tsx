import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { MotionConfig } from 'motion/react';
import { Controller } from './controller';
import { Frame } from './Frame';
import { Chrome } from './Chrome';
import { SlideContext } from './anim';
import { chapters, type SlideDef } from './types';

const SHOTS = new URLSearchParams(location.search).has('shots');

const SlideView = memo(function SlideView({
  def,
  index,
  step,
  active,
  shown,
}: {
  def: SlideDef;
  index: number;
  step: number;
  active: boolean;
  shown: boolean;
}) {
  const ctx = useMemo(() => ({ index, step, active, shown }), [index, step, active, shown]);
  const C = def.Component;
  return (
    <SlideContext.Provider value={ctx}>
      <Frame theme={def.theme} plain={def.plain} backdrop={def.backdrop}>
        <C />
      </Frame>
    </SlideContext.Provider>
  );
});

export function Deck({ slides }: { slides: SlideDef[] }) {
  const ctrl = useMemo(() => new Controller(slides, 'deck'), [slides]);
  const state = useSyncExternalStore(ctrl.subscribe, ctrl.getState);
  const ref = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState(false);
  const [black, setBlack] = useState(false);
  const [help, setHelp] = useState(!SHOTS);

  useLayoutEffect(() => {
    if (!ref.current) return;
    ctrl.attach(ref.current);
    (window as unknown as { __deck: unknown }).__deck = {
      slides: slides.map((s) => ({ id: s.id, title: s.title, steps: s.steps ?? 1 })),
      goto: (i: number, s: number) => ctrl.goto(i, s, true),
      state: () => ctrl.getState(),
    };
    return () => ctrl.detach();
  }, [ctrl, slides]);

  useEffect(() => {
    const t = window.setTimeout(() => setHelp(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') return setToc(false);
      if (k === 'o' || k === 'g') return setToc((v) => !v);
      if (k === 'b' || k === '.') return setBlack((v) => !v);
      if (k === '?') return setHelp((v) => !v);
      if (k === 'f') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        return;
      }
      if (k === 'p') {
        const url = `${location.pathname}?presenter${location.hash}`;
        window.open(url, 'presenter', 'width=1440,height=900');
        return;
      }
      if (toc) return;
      if (ctrl.onKey(e)) setBlack(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ctrl, toc]);

  const cur = slides[state.index];
  const total = slides.length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="deck" ref={ref}>
        {slides.map((s, i) => {
          const active = i === state.index;
          const isFrom = i === state.from;
          const near = Math.abs(i - state.index) <= 1 || isFrom;
          const step = active ? state.step : isFrom ? state.fromStep : i < state.index ? ctrl.steps(i) - 1 : 0;
          const leaving = isFrom && !active;
          const back = state.from > state.index;
          return (
            <section
              key={s.id}
              className={`slide${near ? '' : ' is-far'}${leaving ? ' is-leaving' : ''}${leaving && back ? ' is-back' : ''}`}
              style={leaving && back ? ({ '--back': state.from - state.index } as React.CSSProperties) : undefined}
              data-slide={s.id}
              onAnimationEnd={leaving ? (e) => e.target === e.currentTarget && ctrl.leaveDone() : undefined}
            >
              <div className="slide-inner">
                <SlideView def={s} index={i} step={step} active={active} shown={active || isFrom} />
              </div>
            </section>
          );
        })}
        {slides.map((s, i) => (
          <div key={`snap-${s.id}`} className="snap" style={{ top: `calc(${i} * 100dvh)` }} />
        ))}
      </div>

      <Chrome theme={cur.theme} index={state.index} total={total} hidden={state.index === 0} />

      {!SHOTS && (
        <div className={`hud hud-${cur.theme}`} style={{ color: cur.theme === 'peach' || cur.theme === 'paper' || cur.theme === 'ice' ? '#7a3a14' : '#fff' }}>
          <nav className="hud-rail" style={{ ['--rail-on' as string]: cur.theme === 'orange' ? '#fff' : 'var(--orange)' }}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                title={`${i + 1}. ${s.title}`}
                className={`${i === state.index ? 'on' : ''} ${i === 0 || slides[i - 1].chapter !== s.chapter ? 'chapter-start' : ''}`}
                onClick={() => ctrl.goto(i, 0)}
              />
            ))}
          </nav>
          <div className="hud-toast" style={{ opacity: help ? 1 : 0 }}>
            <kbd>↓</kbd> <kbd>Enter</kbd> or scroll: next · <kbd>↑</kbd> back · <kbd>P</kbd> presenter · <kbd>F</kbd> fullscreen · <kbd>O</kbd> overview · <kbd>B</kbd> blackout
          </div>
        </div>
      )}

      {toc && (
        <div className="toc" onClick={() => setToc(false)}>
          <h2>So you want to run (coding) agents safely</h2>
          <div className="toc-grid">
            {Object.entries(chapters).map(([key, ch]) => {
              const items = slides.map((s, i) => ({ s, i })).filter(({ s }) => s.chapter === key);
              if (!items.length) return null;
              return (
                <div className="toc-chapter" key={key}>
                  <h3>
                    {ch.n} · {ch.label}
                  </h3>
                  {items.map(({ s, i }) => (
                    <button
                      key={s.id}
                      className={i === state.index ? 'on' : ''}
                      onClick={(e) => {
                        e.stopPropagation();
                        setToc(false);
                        ctrl.goto(i, 0);
                      }}
                    >
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="blackout" style={{ opacity: black ? 1 : 0, pointerEvents: black ? 'auto' : 'none' }} onClick={() => setBlack(false)} />
    </MotionConfig>
  );
}
