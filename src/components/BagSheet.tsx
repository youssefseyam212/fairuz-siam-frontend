'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { byId, COLS, FREE_AT } from '@/lib/data';
import { dir, project, reduceMotion, rubber, Spring } from '@/lib/motion';
import { useStore } from '@/context/StoreProvider';
import { Icon, Mono, PieceSvg } from './Art';

/** Side sheet for the bag: spring-driven, drag-to-dismiss with momentum. */
export function BagSheet() {
  const { t, L, money, num, bag, subtotal, setQty, removeLine, bagOpen, setBagOpen, lang } = useStore();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const W = useRef(440);
  const closeVel = useRef<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const sp = useRef<Spring | null>(null);

  // create the spring before any other effect needs it
  useLayoutEffect(() => {
    sp.current = new Spring(0, (x) => {
      if (panelRef.current) panelRef.current.style.transform = `translate3d(${dir() * x}px,0,0)`;
      if (scrimRef.current) scrimRef.current.style.opacity = String(Math.max(0, Math.min(1, 1 - x / W.current)));
    });
    return () => sp.current?.stop();
  }, []);

  const runOpen = () => {
    const s = sp.current!;
    W.current = panelRef.current!.offsetWidth;
    if (reduceMotion()) s.set(0);
    else { if (s.x <= 0 || s.x > W.current) s.set(W.current); s.to(0, { damping: 1, response: 0.38 }); }
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30);
  };

  // open / close in response to the store flag
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (bagOpen) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      if (visible) runOpen(); // reopened mid-close
      else setVisible(true);
    } else if (visible) {
      const s = sp.current!;
      W.current = panelRef.current?.offsetWidth || W.current;
      const fin = () => { setVisible(false); document.body.style.overflow = ''; lastFocus.current?.focus?.({ preventScroll: true }); };
      const v = closeVel.current; closeVel.current = null;
      if (reduceMotion()) { s.set(W.current); fin(); }
      else s.to(W.current, v != null ? { damping: 0.85, response: 0.3, velocity: v } : { damping: 1, response: 0.32 }, fin);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bagOpen]);

  // run the opening animation once the sheet is in the DOM
  useLayoutEffect(() => {
    if (visible && bagOpen) runOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // language switch flips direction: re-apply the transform
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current !== lang && visible) sp.current?.set(0);
    prevLang.current = lang;
  }, [lang, visible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && bagOpen) setBagOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [bagOpen, setBagOpen]);

  // drag to dismiss: hysteresis, 1:1 tracking, rubber-band, momentum projection, velocity hand-off
  const drag = useRef<{ x0: number; y0: number; base: number; drag: boolean; id: number; h: [number, number][] } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button,a,input,select')) return;
    drag.current = { x0: e.clientX, y0: e.clientY, base: sp.current!.x, drag: false, id: e.pointerId, h: [[e.clientX, performance.now()]] };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const st = drag.current, s = sp.current!;
    if (!st || e.pointerId !== st.id) return;
    const dx = (e.clientX - st.x0) * dir(), dy = e.clientY - st.y0;
    if (!st.drag) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        st.drag = true; s.stop(); st.base = s.x; st.x0 = e.clientX;
        panelRef.current!.setPointerCapture(e.pointerId); panelRef.current!.style.cursor = 'grabbing';
      } else if (Math.abs(dy) > 10) drag.current = null;
      return;
    }
    let x = st.base + (e.clientX - st.x0) * dir();
    if (x < 0) x = rubber(x, W.current);
    s.x = x; s.on(x);
    st.h.push([e.clientX, performance.now()]); if (st.h.length > 6) st.h.shift();
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const st = drag.current, s = sp.current!;
    if (!st || e.pointerId !== st.id) return;
    drag.current = null; panelRef.current!.style.cursor = '';
    if (!st.drag) return;
    const a = st.h[0], b = st.h[st.h.length - 1], dt = Math.max(1, b[1] - a[1]);
    const v = ((b[0] - a[0]) / dt) * 1000 * dir();
    if (s.x + project(v) > W.current * 0.5) { closeVel.current = v; setBagOpen(false); }
    else s.to(0, { damping: 0.85, response: 0.3, velocity: v });
  };

  const close = () => setBagOpen(false);
  const left = Math.max(0, FREE_AT - subtotal);

  return (
    <div className="sheet" hidden={!visible}>
      <div className="scrim" ref={scrimRef} onClick={close} />
      <aside className="panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="bagTitle"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
        <header>
          <span className="grip" aria-hidden="true" />
          <h2 className="display d2" id="bagTitle" style={{ fontSize: '2rem' }}>{t('bagTitle')}</h2>
          <button className="xbtn press" type="button" ref={closeRef} aria-label={t('close')} onClick={close}><Icon.close /></button>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {!bag.length ? (
            <div className="bag-empty">
              <Mono />
              <p className="display d3">{t('empty')}</p>
              <p className="muted" style={{ margin: 0, maxWidth: '24em' }}>{t('emptySub')}</p>
              <button className="cta press label" type="button" style={{ flex: 'none', marginTop: 8 }}
                onClick={() => { close(); router.push('/shop'); }}>{t('browse')}</button>
            </div>
          ) : (
            <>
              <div className="items">
                {bag.map((l, i) => {
                  const p = byId[l.id];
                  return (
                    <div className="item" key={`${l.id}|${l.metal}|${l.size}`}>
                      <Link className={`th ${COLS[p.col].skin}`} href={`/product/${p.id}`} onClick={close}><PieceSvg p={p} metal={l.metal} /></Link>
                      <div style={{ minWidth: 0 }}>
                        <div className="top">
                          <Link className="nm" href={`/product/${p.id}`} onClick={close}>{L(p.name)}</Link>
                          <span className="price">{money(p.price * l.qty)}</span>
                        </div>
                        <div className="vr">{t(l.metal) + (l.size ? ' · ' + num(l.size) : '')}</div>
                        <div className="bot">
                          <div className="stepper" role="group" aria-label={t('qty')}>
                            <button className="press" type="button" aria-label="−" onClick={() => (l.qty > 1 ? setQty(i, l.qty - 1) : removeLine(i))}>−</button>
                            <output>{num(l.qty)}</output>
                            <button className="press" type="button" aria-label="+" onClick={() => setQty(i, l.qty + 1)}>+</button>
                          </div>
                          <button className="link" type="button" onClick={() => removeLine(i)}>{t('remove')}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <footer>
                <div className="ship">{left ? t('toFree')(money(left)) : t('gotFree')}
                  <div className="meter"><i style={{ width: `${Math.min(100, (subtotal / FREE_AT) * 100)}%` }} /></div>
                </div>
                <div className="totals" style={{ border: 0, padding: 0 }}><span>{t('subtotal')}</span><span className="price">{money(subtotal)}</span></div>
                <button className="cta press label" type="button" onClick={() => { close(); router.push('/checkout'); }}>
                  {t('checkout')} <span className="flip" aria-hidden="true">→</span>
                </button>
              </footer>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
