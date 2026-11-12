'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Brand intro — plays once per browser session.
 * The overlay is server-rendered and animated purely by CSS (see `.fs-intro` in globals.css),
 * so it is on screen from the very first paint, before React hydrates.
 * The boot script in layout.tsx adds `intro-play` or `intro-skip` to <html> before paint.
 * This component only handles: remembering it played, skip-on-interaction, and cleanup.
 */

// The monogram split into its six letters, each revealed in a palette color (brand book "Icon design").
const PIECES = [
  { k: 'f', c: 'var(--fayrouz)' },
  { k: 'a', c: 'var(--mustard)' },
  { k: 'i', c: 'var(--pink)' },
  { k: 'r', c: 'var(--orange)' },
  { k: 'u', c: 'var(--teal)' },
  { k: 'z', c: 'var(--cream)' },
];
const BAR = ['--mustard', '--orange', '--pink', '--purple', '--teal', '--fayrouz', '--navy'];

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || !root.classList.contains('intro-play')) {
      setGone(true);
      return;
    }
    try { sessionStorage.setItem('fs-intro', '1'); } catch {}

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setGone(true);
      // let the page's settle animation finish before dropping the class
      window.setTimeout(() => root.classList.remove('intro-play', 'intro-fast'), 450);
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName.startsWith('fsOpen')) finish();
    };
    const skip = () => {
      if (el.classList.contains('is-skip')) return;
      el.classList.add('is-skip');
      root.classList.add('intro-fast');
    };
    const onKey = (e: KeyboardEvent) => { if (!e.metaKey && !e.ctrlKey) skip(); };

    el.addEventListener('animationend', onEnd);
    el.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', skip, { passive: true });
    const safety = window.setTimeout(finish, 6000);
    return () => {
      el.removeEventListener('animationend', onEnd);
      el.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', skip);
      window.clearTimeout(safety);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={ref} className="fs-intro" aria-hidden="true">
      <div className="fs-intro__in">
        <div className="fs-intro__mono">
          {PIECES.map((p, i) => (
            <span
              key={p.k}
              className={`fs-intro__piece p-${p.k}`}
              style={{ '--c': p.c, '--d': `${0.25 + i * 0.17}s` } as React.CSSProperties}
            />
          ))}
          <span className="fs-intro__whole" />
        </div>
        <span className="fs-intro__logo" />
        <div className="fs-intro__tags">
          <span className="fs-intro__tag fs-intro__tag--en">Every shape holds a story</span>
          <span className="fs-intro__tag fs-intro__tag--ar" lang="ar">لكل شكلٍ حكاية</span>
        </div>
      </div>
      <div className="fs-intro__bar">
        {BAR.map((c, i) => (
          <span key={c} style={{ '--c': `var(${c})`, '--d': `${0.2 + i * 0.3}s` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
