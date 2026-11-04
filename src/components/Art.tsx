import type { CSSProperties } from 'react';
import { COLS, type Collection, type Cut, type Metal, type Product } from '@/lib/data';
import { gemRaw, pieceInner, type PieceMode } from '@/lib/draw';

/** A jewelry piece drawn procedurally (200×200). */
export function PieceSvg({ p, metal = 'gold', mode = 'piece' }: { p: Product; metal?: Metal; mode?: PieceMode }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: pieceInner(p, metal, mode) }} />
  );
}

/** A single loose gem. */
export function GemSvg({ cut, color, className, style }: { cut: Cut; color: string; className?: string; style?: CSSProperties }) {
  const g = gemRaw(cut, color);
  return <svg className={className} style={style} viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: g.s }} />;
}

export const MiniGem = ({ c }: { c: Collection }) => <GemSvg cut={c.cut} color={c.gem} />;
export const colOf = (p: Product) => COLS[p.col];

export const Mono = ({ className = '', style }: { className?: string; style?: CSSProperties }) =>
  <span className={`mono ${className}`.trim()} style={style} aria-hidden="true" />;

export const Logotype = () => <span className="logotype" role="img" aria-label="Fairuz Siam" />;

const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const Icon = {
  bag: () => <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.8} aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>,
  check: () => <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  truck: () => <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.7} aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>,
  back: () => <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.7} aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" /></svg>,
  gem: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true"><path d="M6 4h12l3 5-9 11L3 9z" /><path d="M3 9h18M9 4l3 16 3-16" /></svg>,
  hand: () => <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.7} aria-hidden="true"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8 9.5 8z" /></svg>,
  close: () => <svg viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>,
  menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>,
  caret: () => <svg className="caret" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path d="M2 3.5l3 3 3-3" /></svg>,
  chev: ({ d }: { d: -1 | 1 }) => <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2} aria-hidden="true"><path d={d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>,
  system: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /></svg>,
  light: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" /></svg>,
  dark: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>,
};

export const Arrow = () => <span className="flip" aria-hidden="true">→</span>;
