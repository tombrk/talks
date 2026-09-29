import { motion } from 'motion/react';
import { R, Type, Words, useSlide, useVisible, EASE } from '../engine/anim';
import { Emoji, GLogo, Kicker, MaskImg } from '../components';
import tom from '../assets/tom.webp';
import claude from '../assets/claude.webp';
import openai from '../assets/openai.png';
import cursor from '../assets/cursor.webp';

export function Title() {
  const vis = useVisible(0);
  return (
    <>
      <R v="fade" className="abs" style={{ left: 104, top: 80 }}>
        <GLogo h={54} />
      </R>

      <div className="abs display title-lines" style={{ left: 0, right: 0, top: 232, fontSize: 200, textAlign: 'center' }}>
        <Words text="So you want to run" stagger={0.07} />
        <br />
        <Words text="(coding) agents" d={0.35} stagger={0.07} />
      </div>

      <motion.div
        className="abs safely-box"
        style={{ left: 930, top: 628, width: 760, height: 196, transformOrigin: '0% 50%' }}
        initial={false}
        animate={vis ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: vis ? 0.85 : 0 }}
      />
      <div className="abs" style={{ left: 930, top: 606, width: 760, textAlign: 'center' }}>
        <Words text="safely" d={1.2} className="safely-word" />
      </div>

      <R d={1.5} className="abs speaker" style={{ left: 104, top: 880 }}>
        <img src={tom} width={132} height={132} style={{ borderRadius: '50%' }} />
        <div>
          <div style={{ fontSize: 44, fontWeight: 650, letterSpacing: '-0.015em' }}>Tom Braack</div>
          <div style={{ fontSize: 31, opacity: 0.9 }}>Senior Software Engineer · Grafana Labs</div>
        </div>
      </R>
    </>
  );
}

function LogoTile({ at, label, children }: { at: number; label: string; children: React.ReactNode }) {
  const { step } = useSlide();
  const here = step === at;
  return (
    <R at={at} v="pop" className="logo-tile">
      <div className={`logo-tile-card${here ? ' here' : ''}`}>{children}</div>
      <div className="logo-tile-label">{label}</div>
    </R>
  );
}

export function Hands() {
  return (
    <>
      <Kicker ch="intro">
        Quick show of hands <Emoji n="raised_hand" size={30} className="wave" style={{ marginLeft: 10 }} />
      </Kicker>
      <div className="abs display" style={{ left: 120, top: 150, fontSize: 128 }}>
        <Words text="Who’s using…" />
      </div>
      <div className="abs" style={{ left: 120, right: 120, top: 372, display: 'flex', justifyContent: 'center', gap: 72 }}>
        <LogoTile at={0} label="Claude">
          <img src={claude} width={236} height={236} />
        </LogoTile>
        <LogoTile at={1} label="ChatGPT / Codex">
          <MaskImg src={openai} w={224} h={224} />
        </LogoTile>
        <LogoTile at={2} label="Cursor">
          <img src={cursor} height={236} />
        </LogoTile>
      </div>
      <R at={3} className="abs yolo" style={{ left: 120, right: 120, top: 866 }}>
        <div className="yolo-q">…and who has ever typed this?</div>
        <div className="yolo-cmd">
          <span style={{ color: 'var(--orange)' }}>$</span> <Type at={3} d={0.4} cps={32} text="claude --dangerously-skip-permissions" cursor />
        </div>
      </R>
    </>
  );
}
