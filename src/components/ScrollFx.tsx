'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/scroll';

/*
 * Scroll motion for the whole site. Markup opts in with two attributes:
 *
 *   data-reveal          fades / lifts / un-blurs once when it enters the viewport (stagger with style --i)
 *   data-scene="view"    gets --p (0 → 1 while it crosses the viewport) and --e (0 → 1 as its top enters)
 *   data-scene="pin"     --p runs 0 → 1 while a tall section scrolls past its sticky child
 *   data-scene="exit"    --p runs 0 → 1 while it scrolls away (hero recede)
 *
 * CSS turns those numbers into motion (see "scroll motion" in globals.css), so effects stay declarative,
 * run on the compositor (transform / opacity), and are switched off under prefers-reduced-motion.
 */
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function ScrollFx() {
  // Smooth, weighted wheel scrolling (desktop). Touch keeps native momentum.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      prevent: (n) => !!n.closest?.('.sheet, .msheet, .mega, [data-lenis-prevent]'),
    });
    setLenis(l);
    let raf = requestAnimationFrame(function loop(t) { l.raf(t); raf = requestAnimationFrame(loop); });

    // pause while the intro plays or a sheet / menu has locked the page
    const root = document.documentElement;
    const sync = () => {
      const locked = root.classList.contains('intro-play') || document.body.style.overflow === 'hidden';
      if (locked && !l.isStopped) l.stop();
      else if (!locked && l.isStopped) l.start();
    };
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    sync();

    return () => { cancelAnimationFrame(raf); mo.disconnect(); l.destroy(); setLenis(null); };
  }, []);

  // Reveals + scroll-linked scenes. Re-scans when the DOM changes (route changes, filters).
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scenes: HTMLElement[] = [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    );

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight, sy = window.scrollY;
      for (const el of scenes) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue; // off-screen: leave as is
        const mode = el.dataset.scene;
        let p: number;
        if (mode === 'pin') p = -r.top / Math.max(1, r.height - vh);
        else if (mode === 'exit') {
          const top = r.top + sy, start = top < vh ? 0 : top;
          p = (sy - start) / Math.max(1, top + r.height - start);
        } else p = (vh - r.top) / (vh + r.height);
        el.style.setProperty('--p', clamp01(p).toFixed(4));
        el.style.setProperty('--e', clamp01((vh - r.top) / vh).toFixed(4));
      }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };

    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
        if (reduce) el.classList.add('is-in'); else io.observe(el);
      });
      scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
      req();
    };
    let pending = 0;
    const mo = new MutationObserver(() => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan(); }); });

    // Don't touch the DOM until React has finished hydrating streamed parts of the page
    // (writing --p / .is-in earlier causes hydration mismatches): wait for load, then an idle moment.
    let started = false, idle = 0, timer = 0;
    const start = () => {
      if (started) return;
      started = true;
      scan();
      mo.observe(document.getElementById('app') ?? document.body, { childList: true, subtree: true });
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', req);
    };
    const afterLoad = () => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(start, { timeout: 600 });
      else timer = setTimeout(start, 200) as unknown as number;
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });

    return () => {
      io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(pending);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      window.removeEventListener('load', afterLoad);
      window.removeEventListener('scroll', req); window.removeEventListener('resize', req);
    };
  }, []);

  return null;
}
