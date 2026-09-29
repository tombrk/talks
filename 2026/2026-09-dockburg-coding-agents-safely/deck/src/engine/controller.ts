import type { SlideDef } from './types';

export type NavState = {
  index: number;
  step: number;
  /** slide we're transitioning away from (kept rendered until the transition settles) */
  from: number;
  fromStep: number;
};

type Msg =
  | { type: 'state'; index: number; step: number }
  | { type: 'cmd'; cmd: 'next' | 'prev' }
  | { type: 'goto'; index: number; step: number }
  | { type: 'hello' };

/** crossfade between slides (0 = hard cut). Keep in sync with --fade-ms in global.css */
export const FADE_MS = 300;

/**
 * Owns navigation. The deck window drives a native (snapping) scroller;
 * the presenter window mirrors state over a BroadcastChannel and forwards keys.
 */
export class Controller {
  state: NavState = { index: 0, step: 0, from: -1, fromStep: 0 };
  private listeners = new Set<() => void>();
  private scroller: HTMLElement | null = null;
  private raf = 0;
  private animating = false;
  private settleTimer = 0;
  private covers: number[] = [];
  private digits = '';
  private digitTimer = 0;
  private channel: BroadcastChannel | null = null;
  private wheelAcc = 0;
  private lastWheel = 0;
  private wheelLocked = false;
  private lockAt = 0;
  private holdUntil = 0;

  constructor(
    public slides: SlideDef[],
    public role: 'deck' | 'presenter',
  ) {}

  /** open the presenter-sync channel (in an effect: StrictMode may construct us twice) */
  connect() {
    if (this.channel || typeof BroadcastChannel === 'undefined') return;
    this.channel = new BroadcastChannel('so-you-want-to-run-agents-safely');
    this.channel.onmessage = (e: MessageEvent<Msg>) => this.onMessage(e.data);
  }

  disconnect() {
    this.channel?.close();
    this.channel = null;
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getState = () => this.state;
  steps = (i: number) => Math.max(1, this.slides[i]?.steps ?? 1);
  get count() {
    return this.slides.length;
  }

  private commit(next: Partial<NavState>, broadcast = true) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((f) => f());
    if (this.role === 'deck') {
      const { index, step } = this.state;
      const hash = `#/${index + 1}${step ? `/${step}` : ''}`;
      if (location.hash !== hash) history.replaceState(null, '', hash);
      if (broadcast) this.post({ type: 'state', index, step });
    }
  }

  private post(m: Msg) {
    this.channel?.postMessage(m);
  }

  private onMessage(m: Msg) {
    if (this.role === 'deck') {
      if (m.type === 'hello') this.post({ type: 'state', index: this.state.index, step: this.state.step });
      if (m.type === 'cmd') m.cmd === 'next' ? this.next() : this.prev();
      if (m.type === 'goto') this.goto(m.index, m.step);
    } else if (m.type === 'state') {
      this.commit({ index: m.index, step: m.step, from: -1 }, false);
    }
  }

  hello() {
    this.post({ type: 'hello' });
  }

  // ───────────── navigation ─────────────
  next = () => {
    if (this.role === 'presenter') return this.post({ type: 'cmd', cmd: 'next' });
    const { index, step } = this.state;
    if (step < this.steps(index) - 1) this.commit({ step: step + 1 });
    else if (index < this.count - 1) this.goto(index + 1, 0);
  };

  prev = () => {
    if (this.role === 'presenter') return this.post({ type: 'cmd', cmd: 'prev' });
    const { index, step } = this.state;
    if (step > 0) this.commit({ step: step - 1 });
    else if (index > 0) this.goto(index - 1, this.steps(index - 1) - 1);
  };

  goto = (index: number, step = 0, instant?: boolean) => {
    if (this.role === 'presenter') return this.post({ type: 'goto', index, step });
    index = Math.max(0, Math.min(this.count - 1, index));
    step = Math.max(0, Math.min(this.steps(index) - 1, step));
    const from = this.state.index;
    if (index === from) return this.commit({ step });
    // cut to the new slide; the old one stays on top for FADE_MS and fades out (see .is-leaving)
    this.holdUntil = instant ? 0 : performance.now() + FADE_MS + 900; // fallback; normally leaveDone() ends it
    this.commit({ index, step, from: instant ? -1 : from, fromStep: this.state.step });
    this.scrollToIndex(index);
  };

  onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return false;
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      this.digits += k;
      clearTimeout(this.digitTimer);
      this.digitTimer = window.setTimeout(() => (this.digits = ''), 1600);
      return true;
    }
    if (k === 'Enter' && this.digits) {
      const n = parseInt(this.digits, 10);
      this.digits = '';
      this.goto(n - 1, 0);
      e.preventDefault();
      return true;
    }
    switch (k) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
      case 'Enter':
      case 'j':
      case 'l':
        this.next();
        break;
      case ' ':
        e.shiftKey ? this.prev() : this.next();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
      case 'k':
      case 'h':
        this.prev();
        break;
      case 'Home':
        this.goto(0, 0);
        break;
      case 'End':
        this.goto(this.count - 1, 0);
        break;
      default:
        return false;
    }
    e.preventDefault();
    return true;
  };

  // ───────────── scroller (deck window only) ─────────────
  attach(el: HTMLElement) {
    this.connect();
    this.scroller = el;
    el.addEventListener('scroll', this.onScroll, { passive: true });
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('touchstart', this.cancelAnim, { passive: true });
    el.addEventListener('scrollend', this.onScrollEnd);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('hashchange', this.onHash);
    this.onHash();
    this.applyCover();
  }

  detach() {
    const el = this.scroller;
    if (!el) return;
    this.disconnect();
    el.removeEventListener('scroll', this.onScroll);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('touchstart', this.cancelAnim);
    el.removeEventListener('scrollend', this.onScrollEnd);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('hashchange', this.onHash);
    this.scroller = null;
  }

  private onHash = () => {
    const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
    if (!m) return;
    const index = Math.max(0, Math.min(this.count - 1, parseInt(m[1], 10) - 1));
    const step = Math.max(0, Math.min(this.steps(index) - 1, parseInt(m[2] ?? '0', 10)));
    if (index === this.state.index && step === this.state.step) {
      this.scrollToIndex(index);
      return;
    }
    this.commit({ index, step, from: -1 });
    this.scrollToIndex(index);
  };

  private onResize = () => {
    if (!this.scroller) return;
    cancelAnimationFrame(this.raf);
    this.animating = false;
    this.scrollToIndex(this.state.index);
  };

  /**
   * Scrollytelling: every wheel / trackpad gesture acts like ↓ / ↑ (reveal the next build, then
   * move on). Inertia is swallowed until the gesture goes quiet, so one swipe = one step.
   */
  private onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) return; // pinch-zoom
    e.preventDefault();
    const now = performance.now();
    const gap = now - this.lastWheel;
    this.lastWheel = now;
    if (this.wheelLocked) {
      if (gap > 180 && now - this.lockAt > 420) this.wheelLocked = false;
      else return;
    }
    if (gap > 250) this.wheelAcc = 0;
    this.wheelAcc += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    if (Math.abs(this.wheelAcc) >= 24) {
      this.wheelAcc > 0 ? this.next() : this.prev();
      this.wheelAcc = 0;
      this.wheelLocked = true;
      this.lockAt = now;
    }
  };

  private cancelAnim = () => {
    if (!this.animating || !this.scroller) return;
    cancelAnimationFrame(this.raf);
    this.animating = false;
    this.scroller.style.scrollSnapType = '';
  };

  private onScroll = () => {
    const el = this.scroller;
    if (!el) return;
    const pos = el.scrollTop / el.clientHeight;
    this.applyCover(pos);
    if (this.animating) return;
    const nearest = Math.max(0, Math.min(this.count - 1, Math.round(pos)));
    if (nearest !== this.state.index) {
      // native scrolling (touch) skips builds: land on the fully built slide
      this.commit({
        index: nearest,
        step: this.steps(nearest) - 1,
        from: this.state.index,
        fromStep: this.state.step,
      });
    }
  };

  private onScrollEnd = () => {
    if (!this.animating) this.settle();
  };

  /** the leaving slide finished fading out */
  leaveDone = () => {
    this.holdUntil = 0;
    clearTimeout(this.settleTimer);
    if (this.state.from !== -1) this.commit({ from: -1 }, false);
  };

  private settle() {
    clearTimeout(this.settleTimer);
    const wait = Math.max(60, this.holdUntil - performance.now());
    this.settleTimer = window.setTimeout(() => {
      if (this.state.from !== -1) this.commit({ from: -1 }, false);
    }, wait);
  }

  /** --c = how much of slide i is covered by slide i+1 (drives the depth effect) */
  private applyCover(pos?: number) {
    const el = this.scroller;
    if (!el) return;
    const p = pos ?? el.scrollTop / el.clientHeight;
    const sections = el.querySelectorAll<HTMLElement>(':scope > .slide');
    sections.forEach((s, i) => {
      const c = Math.round(Math.max(0, Math.min(1, p - i)) * 1000) / 1000;
      if (this.covers[i] !== c) {
        this.covers[i] = c;
        s.style.setProperty('--c', String(c));
      }
    });
  }

  private scrollToIndex(i: number) {
    const el = this.scroller;
    if (!el) return;
    cancelAnimationFrame(this.raf);
    el.style.scrollSnapType = 'none';
    this.animating = true;
    el.scrollTop = i * el.clientHeight;
    this.applyCover();
    requestAnimationFrame(() => {
      el.style.scrollSnapType = '';
      this.animating = false;
      this.settle();
    });
  }
}
