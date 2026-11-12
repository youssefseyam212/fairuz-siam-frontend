'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { COLS, COL_KEYS, PRODUCTS, type CollectionKey } from '@/lib/data';
import { useStore, type ColFilter, type SortKey, type TypeFilter } from '@/context/StoreProvider';
import { GemSvg } from '@/components/Art';
import { ProductCard } from '@/components/ProductCard';

const IND_BG: Record<ColFilter, string> = { all: 'var(--purple)', ember: 'var(--orange)', nile: 'var(--navy)', fayrouz: 'var(--fayrouz)', mughal: 'var(--teal)' };
const TYPES: TypeFilter[] = ['all', 'new', 'ring', 'earrings', 'necklace', 'bracelet'];

export function ShopView() {
  const { t, L, col, setCol, type, setType, sort, setSort, lang } = useStore();

  let list = PRODUCTS.filter((p) => (col === 'all' || p.col === col) && (type === 'all' || (type === 'new' ? p.isNew : p.type === type)));
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  const tabs: ColFilter[] = ['all', ...COL_KEYS];
  const c = col === 'all' ? null : COLS[col as CollectionKey];

  // sliding indicator behind the active collection tab
  const segRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const ready = useRef(false);
  const placeInd = useCallback(() => {
    const seg = segRef.current, ind = indRef.current;
    if (!seg || !ind) return;
    const on = seg.querySelector<HTMLElement>('[aria-pressed=true]');
    if (!on) return;
    const r = on.getBoundingClientRect(), s = seg.getBoundingClientRect();
    if (!ready.current) ind.style.transition = 'none';
    ind.style.width = r.width + 'px';
    ind.style.transform = `translateX(${r.left - s.left}px)`;
    ind.style.backgroundColor = IND_BG[on.dataset.col as ColFilter];
    if (!ready.current) { void ind.offsetWidth; ind.style.transition = ''; ready.current = true; }
  }, []);

  useLayoutEffect(() => { placeInd(); }, [col, lang, placeInd]);
  useLayoutEffect(() => {
    window.addEventListener('resize', placeInd);
    // fonts can change tab widths after load
    document.fonts?.ready.then(placeInd);
    return () => window.removeEventListener('resize', placeInd);
  }, [placeInd]);

  return (
    <div className="wrap">
      <div className="shop-head" data-reveal>
        <div><h1 className="display d1">{t('shopTitle')}</h1><p>{t('shopSub')}</p></div>
        <span className="label muted">{t('pieces')(list.length)}</span>
      </div>
      <div className="controls">
        <div className="seg-scroll">
          <div className="seg" ref={segRef} role="group" aria-label={t('collection')}>
            <span className="ind" ref={indRef} />
            {tabs.map((k) => (
              <button type="button" key={k} className="label press" data-col={k} aria-pressed={col === k} onClick={() => setCol(k)}>
                {k === 'all' ? t('all') : L(COLS[k].name)}
              </button>
            ))}
          </div>
        </div>
        <div className="types" role="group">
          {TYPES.map((k) => (
            <button type="button" key={k} className="chip press" aria-pressed={type === k} onClick={() => setType(k)}>
              {k === 'all' ? t('types') : k === 'new' ? t('newIn') : t(k)}
            </button>
          ))}
        </div>
        <label className="sort">
          <span className="sr">{t('sort')}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="feat">{t('sFeat')}</option>
            <option value="low">{t('sLow')}</option>
            <option value="high">{t('sHigh')}</option>
          </select>
        </label>
      </div>
      {c && (
        <div className={`story ${c.skin}`} key={col}>
          <GemSvg cut={c.cut} color={c.gem} />
          <div style={{ minWidth: 0 }}>
            <span className="label">{L(c.stone)}</span>
            <p className="display d3" style={{ fontSize: '1.5rem' }}>{L(c.line)}</p>
          </div>
        </div>
      )}
      <div className="grid">
        {list.length ? list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />) : <p className="empty-grid">{t('none')}</p>}
      </div>
    </div>
  );
}
