import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/slides.css';
import { Deck } from './engine/Deck';
import { Presenter } from './engine/Presenter';
import { slides } from './slides';

const presenter = new URLSearchParams(location.search).has('presenter');

// Don't reveal anything until the (inlined) fonts are decoded: no FOUT on stage.
const faces = [
  '800 100px Bricolage',
  '400 100px Bricolage',
  '400 20px Inter',
  '700 20px Inter',
  '500 20px "JetBrains Mono"',
  'italic 400 40px "Instrument Serif"',
  '400 40px "Instrument Serif"',
];
Promise.race([
  Promise.all(faces.map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 2500)),
]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>{presenter ? <Presenter slides={slides} /> : <Deck slides={slides} />}</StrictMode>,
  );
});
