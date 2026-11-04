'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { COLS, COL_KEYS, PRODUCTS, byId, type PieceType } from '@/lib/data';
import { dir, project, reduceMotion, rubber, Spring } from '@/lib/motion';
import { useStore } from '@/context/StoreProvider';
import { Arrow, GemSvg, Icon, Mono, PieceSvg } from '@/components/Art';
import { ProductCard } from '@/components/ProductCard';

const fresh = PRODUCTS.filter((p) => p.isNew);
const sig = [...fresh, ...PRODUCTS.filter((p) => !p.isNew)];
const SLIDE_ACTS = ['sec:collections', 'col:fayrouz', 'new'];
const UI_TONE = ['#ffffff', 'var(--pink)', 'var(--purple)'];
const CATS: [PieceType, string, string][] = [['ring', 'dome-ring', 'k-fayrouz'], ['necklace', 'jali-pendant', 'k-mughal'], ['earrings', 'ember-drops', 'k-nile']];

const VISUALS: ReactNode[] = [
  <div className="vis" key="v0">
    <GemSvg cut="round" color="#12BDC1" className="f" style={{ width: '46%', left: '27%', top: '24%' }} />
    <GemSvg cut="oval" color="#a3153a" className="f" style={{ width: '24%', left: '6%', top: '8%', rotate: '-18deg' }} />
    <GemSvg cut="emerald" color="#0f8a5f" className="f" style={{ width: '22%', left: '72%', top: '52%', rotate: '16deg' }} />
    <GemSvg cut="emerald" color="#6cc4ee" className="f" style={{ width: '15%', left: '14%', top: '70%', rotate: '-28deg' }} />
  </div>,
  <div className="vis" key="v1">
    <Mono className="bigmono" />
    <div className="piece"><PieceSvg p={byId['sinai-necklace']} /></div>
    <span className="badge2"><Mono /></span>
  </div>,
  <div className="vis" key="v2">
    <div className="quad">{fresh.slice(0, 4).map((p) => <span key={p.id} className={COLS[p.col].skin}><PieceSvg p={p} /></span>)}</div>
  </div>,
];

/** Hero slideshow: spring-driven, swipeable with momentum, interruptible, autoplays. */
function HeroSlider() {
  const { t, num, act, lang } = useStore();
  const slides = t('slides');
  const n = slides.length;
  const hsRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const W = useRef(0);
  const sp = useRef<Spring | null>(null);
  const auto = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragged = useRef(false);
  const st = useRef<{ x0: number; y0: number; base: number; start: number; drag: boolean; id: number; h: [number, number][] } | null>(null);

  const stopAuto = () => { if (auto.current) { clearInterval(auto.current); auto.current = null; } };
  const goTo = (i: number, opts?: { damping?: number; response?: number; velocity?: number }) => {
    const s = sp.current; const hs = hsRef.current;
    if (!s || !hs) return;
    const next = Math.max(0, Math.min(n - 1, i));
    idxRef.current = next; setIdx(next);
    W.current = hs.offsetWidth;
    if (reduceMotion()) s.set(next * W.current);
    else s.to(next * W.current, opts || { damping: 1, response: 0.55 });
  };

  useEffect(() => {
    const hs = hsRef.current!;
    W.current = hs.offsetWidth;
    sp.current = new Spring(0, (x) => { if (trackRef.current) trackRef.current.style.transform = `translate3d(${-dir() * x}px,0,0)`; });
    sp.current.set(0);
    const onResize = () => { W.current = hs.offsetWidth; sp.current?.set(idxRef.current * W.current); };
    window.addEventListener('resize', onResize);
    if (!reduceMotion()) auto.current = setInterval(() => { if (!document.hidden) goTo((idxRef.current + 1) % n); }, 7000);
    return () => { window.removeEventListener('resize', onResize); stopAuto(); sp.current?.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // direction flips with language: re-apply the transform
  useEffect(() => { sp.current?.set(idxRef.current * W.current); }, [lang]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.hs-ui')) return;
    st.current = { x0: e.clientX, y0: e.clientY, base: sp.current!.x, start: idxRef.current, drag: false, id: e.pointerId, h: [[e.clientX, performance.now()]] };
    dragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current, spr = sp.current!;
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
    if (!s.drag) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        s.drag = true; dragged.current = true; stopAuto(); spr.stop(); s.base = spr.x; s.x0 = e.clientX;
        hsRef.current!.setPointerCapture(e.pointerId);
      } else if (Math.abs(dy) > 10) st.current = null;
      return;
    }
    const max = (n - 1) * W.current;
    let x = s.base - (e.clientX - s.x0) * dir();
    if (x < 0) x = rubber(x, W.current); else if (x > max) x = max + rubber(x - max, W.current);
    spr.x = x; spr.on(x);
    s.h.push([e.clientX, performance.now()]); if (s.h.length > 6) s.h.shift();
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s || e.pointerId !== s.id) return;
    st.current = null;
    if (!s.drag) return;
    const a = s.h[0], b = s.h[s.h.length - 1];
    const v = -((b[0] - a[0]) / Math.max(1, b[1] - a[1])) * 1000 * dir();
    let target = Math.round((sp.current!.x + project(v)) / W.current);
    target = Math.max(s.start - 1, Math.min(s.start + 1, target));
    goTo(target, { damping: 0.9, response: 0.42, velocity: v });
  };

  return (
    <section className="hs" ref={hsRef} aria-roledescription="carousel" aria-label={t('heroTitle')} tabIndex={0}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
      onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}
      onMouseEnter={stopAuto}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { stopAuto(); goTo(idxRef.current + dir()); }
        if (e.key === 'ArrowLeft') { stopAuto(); goTo(idxRef.current - dir()); }
      }}>
      <div className="track" ref={trackRef}>
        {slides.map((x, i) => (
          <div key={i} className={`slide sl-${i + 1}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`} aria-hidden={i !== idx}>
            {i === 0 && <div className="bokeh" aria-hidden="true"><i /><i /><i /><i /></div>}
            <div className="wrap in">
              <div>
                <span className="label eb">{x.eb}</span>
                <h2>{x.t}</h2>
                <p>{x.p}</p>
                <button type="button" className={`btn ${i === 0 ? 'btn-w' : ''} label press`} tabIndex={i === idx ? 0 : -1} onClick={() => act(SLIDE_ACTS[i])}>{x.b} <Arrow /></button>
              </div>
              {VISUALS[i]}
            </div>
          </div>
        ))}
      </div>
      <div className="hs-ui" style={{ color: UI_TONE[idx] }}>
        <div className="wrap">
          <div className="dots">
            {slides.map((_, i) => (
              <button type="button" key={i} aria-label={`${i + 1} / ${n}`} aria-current={i === idx} onClick={() => { stopAuto(); goTo(i); }}><i /></button>
            ))}
          </div>
          <span className="ctr">{`${num(idx + 1)} / ${num(n)}`}</span>
          <div className="arrows">
            <button type="button" aria-label={t('prev')} onClick={() => { stopAuto(); goTo(idxRef.current - 1); }}><Icon.chev d={-1} /></button>
            <button type="button" aria-label={t('next')} onClick={() => { stopAuto(); goTo(idxRef.current + 1); }}><Icon.chev d={1} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignatureRail() {
  const { t } = useStore();
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const r = railRef.current!;
    const upd = () => {
      const max = r.scrollWidth - r.clientWidth - 2, pos = Math.abs(r.scrollLeft);
      setAtStart(pos < 2); setAtEnd(pos >= max);
    };
    upd();
    r.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    return () => { r.removeEventListener('scroll', upd); window.removeEventListener('resize', upd); };
  }, []);

  const step = (d: number) => {
    const r = railRef.current!;
    r.scrollBy({ left: d * dir() * r.clientWidth * 0.75, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section className="sec" style={{ paddingTop: 0 }}><div className="wrap">
      <div className="sec-head">
        <h2 className="display d2">{t('sigTitle')}</h2>
        <div className="rail-nav">
          <button type="button" aria-label={t('prev')} disabled={atStart} onClick={() => step(-1)}><Icon.chev d={-1} /></button>
          <button type="button" aria-label={t('next')} disabled={atEnd} onClick={() => step(1)}><Icon.chev d={1} /></button>
        </div>
      </div>
      <div className="rail" ref={railRef}>{sig.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
    </div></section>
  );
}

function Newsletter() {
  const { t } = useStore();
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setNote(ok ? t('joined') : t('badEmail'));
    if (ok) setEmail('');
  };
  return (
    <section className="letter"><div className="wrap in">
      <div><h2>{t('letterTitle')}</h2><p>{t('letterSub')}</p></div>
      <div>
        <form className="lform" noValidate onSubmit={onSubmit}>
          <label className="sr" htmlFor="lemail">{t('emailPh')}</label>
          <input id="lemail" type="email" autoComplete="email" placeholder={t('emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="label press" type="submit">{t('join')}</button>
        </form>
        <p className="lnote" aria-live="polite">{note}</p>
      </div>
    </div></section>
  );
}

export function HomeView() {
  const { t, L, act, consumePendingSection } = useStore();
  const craftIcons = [Icon.hand, Icon.gem, Icon.truck];

  // scroll to a section requested from another page (e.g. "Our story" in the nav)
  useEffect(() => {
    const id = consumePendingSection();
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'auto' }), 30);
  }, [consumePendingSection]);

  return (
    <>
      <HeroSlider />

      <section className="sec"><div className="wrap">
        <div className="sec-head">
          <h2 className="display d2">{t('catTitle')}</h2>
          <button type="button" className="more label" onClick={() => act('all')}>{t('viewAllJ')} <Arrow /></button>
        </div>
        <div className="tiles3">
          {CATS.map(([k, id, skin]) => (
            <button type="button" key={k} className={`t3 press ${skin}`} onClick={() => act('type:' + k)}>
              <PieceSvg p={byId[id]} /><span className="display">{t(k)}</span><span className="go label">{t('discover')} <Arrow /></span>
            </button>
          ))}
        </div>
      </div></section>

      <section className="sec" id="collections" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="sec-head"><div><h2 className="display d2">{t('colsTitle')}</h2><p>{t('colsSub')}</p></div></div>
        <div className="ctiles">
          {COL_KEYS.map((k) => {
            const c = COLS[k];
            return (
              <button type="button" key={k} className={`ctile press ${c.skin}`} onClick={() => act('col:' + k)}>
                <span className="label">{L(c.stone)}</span>
                <GemSvg cut={c.cut} color={c.gem} className="g" />
                <span><span className="nm" style={{ display: 'block', marginBottom: 12 }}>{L(c.name)}</span><span className="go label">{t('discover')} <Arrow /></span></span>
              </button>
            );
          })}
        </div>
      </div></section>

      <section className="sec" id="story" style={{ paddingTop: 0 }}><div className="wrap split">
        <div className="art art-story" aria-hidden="true"><Mono className="big" /><span className="sq"><Mono /></span></div>
        <div className="txt">
          <span className="label">{t('ourStory')}</span>
          <h2 className="display d2">{t('aboutTitle')}</h2>
          <blockquote>{t('manifesto')}</blockquote>
          <p>{t('aboutBody')}</p>
          <button type="button" className="btn btn-p label press" onClick={() => act('sec:collections')}>{t('storyBtn')} <Arrow /></button>
        </div>
      </div></section>

      <SignatureRail />

      <section className="sec" style={{ paddingTop: 0 }}><div className="wrap split rev">
        <div className="art art-gift" aria-hidden="true">
          <svg viewBox="0 0 200 220">
            <path d="M58 50 C40 120 30 170 46 196 Q100 214 154 196 C170 170 160 120 142 50 Z" fill="#12BDC1" />
            <path d="M58 50 Q100 64 142 50 L146 64 Q100 80 54 64 Z" fill="#0e9ea2" />
            <path d="M70 66 C64 110 62 160 70 196" stroke="rgba(255,255,255,.18)" strokeWidth={3} fill="none" />
            <path d="M84 60 C70 34 52 30 46 40 M116 60 C130 34 148 30 154 40" stroke="#F6B45B" strokeWidth={4} fill="none" strokeLinecap="round" />
            <circle cx="100" cy="60" r="6" fill="#F6B45B" />
          </svg>
          <Mono />
        </div>
        <div className="txt">
          <span className="label">{t('giftEb')}</span>
          <h2 className="display d2">{t('giftTitle')}</h2>
          <p>{t('giftBody')}</p>
          <button type="button" className="btn btn-p label press" onClick={() => act('all')}>{t('giftBtn')} <Arrow /></button>
        </div>
      </div></section>

      <section className="sec" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="sec-head"><h2 className="display d2">{t('craftTitle')}</h2></div>
        <div className="craft">
          {t('craft').map((c, i) => { const I = craftIcons[i]; return <div key={c[0]}><I /><h3>{c[0]}</h3><p>{c[1]}</p></div>; })}
        </div>
      </div></section>

      <Newsletter />
    </>
  );
}
