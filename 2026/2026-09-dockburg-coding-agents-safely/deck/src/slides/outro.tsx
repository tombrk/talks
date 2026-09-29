import { R, Words, useSlide } from '../engine/anim';
import { GLogo } from '../components';
import tom from '../assets/tom.webp';

function Point({ at, n, big, sub }: { at: number; n: string; big: string; sub: string }) {
  const { step } = useSlide();
  return (
    <R at={at} v="up" className={`recap-point${step === at ? ' now' : ''}`}>
      <span className="recap-n">{n}</span>
      <div>
        <div className="recap-big">{big}</div>
        <div className="recap-sub">{sub}</div>
      </div>
    </R>
  );
}

export function Recap() {
  return (
    <>
      <div className="abs display" style={{ left: 120, top: 150, fontSize: 88 }}>
        <Words text="So you want to run coding agents *safely?*" />
      </div>
      <div className="abs recap" style={{ left: 120, top: 300, width: 1680 }}>
        <Point at={0} n="01" big="Assume it will misbehave." sub="Zero trust in your agent (you can’t shame, sue or fire it)." />
        <Point at={1} n="02" big="Make its world small." sub="Least privilege: sandboxes, zones, placeholder secrets, per-request network policy." />
        <Point at={2} n="03" big="Watch the exits." sub="The network is the danger zone. Log everything, alert on attempts, react automatically." />
      </div>
      <R at={3} v="zoom" className="abs serif-i walk-away" style={{ left: 0, right: 0, top: 910, textAlign: 'center' }}>
        Then, and only then, walk away.
      </R>
    </>
  );
}

export function Thanks() {
  return (
    <>
      <R v="fade" className="abs" style={{ left: 104, top: 80 }}>
        <GLogo h={54} />
      </R>
      <div className="abs display" style={{ left: 120, top: 210, fontSize: 240 }}>
        <Words text="Thank you!" />
      </div>
      <div className="abs serif-i" style={{ left: 128, top: 480, fontSize: 130 }}>
        <Words text="Questions?" d={0.5} />
      </div>
      <R d={0.8} className="abs speaker" style={{ left: 120, top: 800 }}>
        <img src={tom} width={132} height={132} style={{ borderRadius: '50%' }} />
        <div>
          <div style={{ fontSize: 44, fontWeight: 650, letterSpacing: '-0.015em' }}>Tom Braack</div>
          <div style={{ fontSize: 31, opacity: 0.9 }}>Senior Software Engineer · Grafana Labs</div>
        </div>
      </R>
      <R d={1.0} className="abs links" style={{ left: 1180, top: 560, width: 640 }}>
        <div>
          <span>demo</span> nono.sh
        </div>
        <div>
          <span>demo</span> github.com/smol-machines/smolvm
        </div>
      </R>
      <R d={1.2} className="abs takeaways" style={{ left: 1180, top: 700 }}>
        <span>assume it misbehaves</span>
      </R>
      <R d={1.3} className="abs takeaways" style={{ left: 1180, top: 780 }}>
        <span>make its world small</span>
      </R>
      <R d={1.4} className="abs takeaways" style={{ left: 1180, top: 860 }}>
        <span>watch the exits</span>
      </R>
    </>
  );
}
