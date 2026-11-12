import type Lenis from 'lenis';

/** The page-wide smooth-scroll instance (null on touch-only use, reduced motion, or before mount). */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { lenis = l; };

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smoothly scroll to an element, going through Lenis when it is active so the two never fight. */
export function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  if (lenis && !reduce()) lenis.scrollTo(el, { duration: 1.25 });
  else el.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' });
}
