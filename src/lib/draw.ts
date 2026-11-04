// Procedural SVG drawing for gems and jewelry pieces.
// Functions return SVG *inner markup* strings built only from internal data.
import { COLS, METALS, type Cut, type Metal, type Product } from './data';

type Pt = [number, number];
const f2 = (n: number) => n.toFixed(2);
const poly = (pts: Pt[], fill: string) =>
  `<polygon points="${pts.map((p) => f2(p[0]) + ',' + f2(p[1])).join(' ')}" fill="${fill}"/>`;

function shade(a: number) {
  const v = Math.cos(a + (3 * Math.PI) / 4);
  return v >= 0 ? `rgba(255,255,255,${(v * 0.5).toFixed(3)})` : `rgba(0,0,0,${(-v * 0.32).toFixed(3)})`;
}

export interface Gem { w: number; h: number; s: string }

function brilliant(rx: number, ry: number, c: string): Gem {
  const cx = rx, cy = ry, G: Pt[] = [], Tb: Pt[] = [];
  for (let j = 0; j < 16; j++) { const a = (j * Math.PI) / 8 - Math.PI / 2; G.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 - Math.PI / 2; Tb.push([cx + rx * 0.52 * Math.cos(a), cy + ry * 0.52 * Math.sin(a)]); }
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    s += poly([Tb[i], G[(2 * i + 15) % 16], G[2 * i], G[(2 * i + 1) % 16]], shade(a));
    s += poly([Tb[i], G[(2 * i + 1) % 16], Tb[(i + 1) % 8]], shade(a + Math.PI / 8 + 0.6));
  }
  s += poly(Tb, 'rgba(255,255,255,.14)') + poly([Tb[7], Tb[0], [cx, cy]], 'rgba(255,255,255,.28)');
  return { w: rx * 2, h: ry * 2, s };
}

function emeraldCut(c: string): Gem {
  const o: Pt[] = [[25, 0], [75, 0], [100, 25], [100, 105], [75, 130], [25, 130], [0, 105], [0, 25]];
  const tb: Pt[] = [[35, 22], [65, 22], [78, 35], [78, 95], [65, 108], [35, 108], [22, 95], [22, 35]];
  const f = ['rgba(255,255,255,.38)', 'rgba(255,255,255,.18)', 'rgba(0,0,0,.16)', 'rgba(0,0,0,.1)', 'rgba(0,0,0,.28)', 'rgba(0,0,0,.2)', 'rgba(255,255,255,.12)', 'rgba(255,255,255,.46)'];
  let s = poly(o, c);
  for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; s += poly([o[i], o[j], tb[j], tb[i]], f[i]); }
  s += poly(tb, 'rgba(255,255,255,.06)') + poly([[30, 30], [70, 30], [72, 34], [28, 34]], 'rgba(255,255,255,.2)') + poly([[26, 62], [74, 62], [74, 65], [26, 65]], 'rgba(255,255,255,.1)');
  return { w: 100, h: 130, s };
}

export function gemRaw(cut: Cut, c: string): Gem {
  return cut === 'emerald' ? emeraldCut(c) : cut === 'oval' ? brilliant(38, 50, c) : brilliant(50, 50, c);
}

function gemAt(cut: Cut, c: string, cx: number, cy: number, w: number) {
  const g = gemRaw(cut, c), h = (w * g.h) / g.w;
  return `<svg x="${f2(cx - w / 2)}" y="${f2(cy - h / 2)}" width="${f2(w)}" height="${f2(h)}" viewBox="0 0 ${g.w} ${g.h}">${g.s}</svg>`;
}

export type PieceMode = 'piece' | 'stone';

/** Inner markup for a 200×200 viewBox. */
export function pieceInner(p: Product, metal: Metal = 'gold', mode: PieceMode = 'piece'): string {
  const c = COLS[p.col], m = METALS[metal], cut = c.cut, gc = c.gem;
  let s = '';
  if (mode === 'stone') {
    s = gemAt(cut, gc, 100, 100, cut === 'emerald' ? 110 : cut === 'oval' ? 104 : 130);
  } else if (p.type === 'ring') {
    s = `<ellipse cx="100" cy="128" rx="50" ry="54" fill="none" stroke="${m.lo}" stroke-width="15"/>
       <ellipse cx="100" cy="128" rx="50" ry="54" fill="none" stroke="${m.base}" stroke-width="10"/>
       <path d="M56 104 A50 54 0 0 1 92 74.6" fill="none" stroke="${m.hi}" stroke-width="3" stroke-linecap="round"/>
       <path d="M84 84 L100 62 L116 84Z" fill="${m.lo}"/>` + gemAt(cut, gc, 100, 62, cut === 'emerald' ? 50 : cut === 'oval' ? 46 : 58);
  } else if (p.type === 'earrings') {
    [66, 134].forEach((x) => {
      s += `<path d="M${x - 9} 52 C${x - 11} 22 ${x + 15} 20 ${x + 12} 44" fill="none" stroke="${m.base}" stroke-width="3.5" stroke-linecap="round"/>
       <circle cx="${x}" cy="60" r="6" fill="none" stroke="${m.base}" stroke-width="3.5"/><circle cx="${x}" cy="60" r="6" fill="none" stroke="${m.hi}" stroke-width="1" opacity=".7"/>
       <line x1="${x}" y1="66" x2="${x}" y2="80" stroke="${m.base}" stroke-width="3"/>` + gemAt(cut, gc, x, 112, cut === 'emerald' ? 40 : cut === 'oval' ? 40 : 46);
    });
  } else if (p.type === 'necklace') {
    s = `<path d="M26 14 C38 112 162 112 174 14" fill="none" stroke="${m.lo}" stroke-width="3.6" stroke-dasharray="5 2.4"/>
       <path d="M26 14 C38 112 162 112 174 14" fill="none" stroke="${m.base}" stroke-width="2.2" stroke-dasharray="5 2.4"/>
       <circle cx="100" cy="94" r="6" fill="none" stroke="${m.base}" stroke-width="3.5"/>` +
      (p.col === 'ember' ? `<circle cx="100" cy="136" r="34" fill="none" stroke="${m.base}" stroke-width="5"/><circle cx="100" cy="136" r="34" fill="none" stroke="${m.lo}" stroke-width="2" stroke-dasharray="2 5"/>` : '') +
      gemAt(cut, gc, 100, 136, cut === 'emerald' ? 50 : cut === 'oval' ? 46 : 58);
  } else {
    s = `<path d="M22 100 A78 40 0 0 1 178 100" fill="none" stroke="${m.lo}" stroke-width="12" stroke-linecap="round"/>
       <path d="M22 100 A78 40 0 0 1 178 100" fill="none" stroke="${m.base}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
       <path d="M22 100 A78 40 0 0 0 178 100" fill="none" stroke="${m.lo}" stroke-width="13" stroke-linecap="round"/>
       <path d="M22 100 A78 40 0 0 0 178 100" fill="none" stroke="${m.base}" stroke-width="9" stroke-linecap="round"/>
       <path d="M40 122 A78 40 0 0 0 100 140" fill="none" stroke="${m.hi}" stroke-width="2.5" stroke-linecap="round"/>`;
    [150, 120, 90, 60, 30].forEach((d) => {
      const a = (d * Math.PI) / 180;
      s += gemAt(cut, gc, 100 + 78 * Math.cos(a), 100 + 40 * Math.sin(a), cut === 'emerald' ? 20 : 24);
    });
  }
  return s;
}
