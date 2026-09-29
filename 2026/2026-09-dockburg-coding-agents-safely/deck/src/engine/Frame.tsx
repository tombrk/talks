import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Theme } from './types';

/** Full-bleed themed background + a 1920×1080 stage scaled to fit ("contain"). */
export function Frame({
  theme,
  plain,
  backdrop,
  children,
}: {
  theme: Theme;
  plain?: boolean;
  backdrop?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const s = Math.min(el.clientWidth / 1920, el.clientHeight / 1080);
      el.style.setProperty('--s', String(s || 1));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={`frame theme-${theme}`}>
      {backdrop}
      {!plain && (
        <>
          <div className="bg bg-grid" />
          <div className="bg bg-grid-hi" />
        </>
      )}
      <div className="bg bg-vignette" />
      <div className="stage">{children}</div>
      <div className="bg bg-grain" />
    </div>
  );
}
