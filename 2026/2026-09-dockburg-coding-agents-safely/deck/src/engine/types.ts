import type { ComponentType, ReactNode } from 'react';

export type Theme = 'orange' | 'peach' | 'dark' | 'paper' | 'ice';

export type ChapterKey =
  | 'intro'
  | 'dilemma'
  | 'sandboxes'
  | 'trust'
  | 'zerotrust'
  | 'laptop'
  | 'demo'
  | 'network'
  | 'detect'
  | 'outro';

export type SlideDef = {
  id: string;
  title: string;
  chapter: ChapterKey;
  theme: Theme;
  /** number of build steps (>= 1). Down advances a step before advancing the slide */
  steps?: number;
  /** planned speaking time in minutes (drives the pacing clock in presenter view) */
  minutes: number;
  /** speaker notes: one bullet per entry; wrap spoken lines in “quotes” */
  notes: string[];
  /** optional full-bleed layer behind the 1920×1080 stage (e.g. water) */
  backdrop?: ReactNode;
  /** disable the grid background */
  plain?: boolean;
  Component: ComponentType;
};

export const chapters: Record<ChapterKey, { n: string; label: string }> = {
  intro: { n: '00', label: 'Hello' },
  dilemma: { n: '01', label: 'The access dilemma' },
  sandboxes: { n: '02', label: 'Sandboxes!' },
  trust: { n: '03', label: 'Autonomy is a trust problem' },
  zerotrust: { n: '04', label: 'Zero trust in your agent' },
  laptop: { n: '05', label: 'Your laptop is overprivileged' },
  demo: { n: '06', label: 'Demo' },
  network: { n: '07', label: 'Network is the danger zone' },
  detect: { n: '08', label: 'Detect, don’t hope' },
  outro: { n: '09', label: 'Fin' },
};
