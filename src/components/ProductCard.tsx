'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { COLS, type Product } from '@/lib/data';
import { useStore } from '@/context/StoreProvider';
import { Icon, PieceSvg } from './Art';

export function ProductCard({ p, i }: { p: Product; i: number }) {
  const { t, L, money, addToBag } = useStore();
  const c = COLS[p.col];
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const quickAdd = () => {
    addToBag(p.id, 'gold', 54);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="card" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
      <div style={{ position: 'relative' }}>
        <Link className={`stage ${c.skin}`} href={`/product/${p.id}`} aria-label={L(p.name)}>
          <PieceSvg p={p} />
          {p.isNew && <span className="new label">{t('isNew')}</span>}
        </Link>
        <button className={`qadd press${added ? ' is-added' : ''}`} type="button" onClick={quickAdd}
          aria-label={`${t('addToBag')}: ${L(p.name)}`}>
          {added ? <Icon.check /> : <Icon.bag />}
          <span className="label">{added ? t('added') : t('addToBag')}</span>
        </button>
      </div>
      <div className="meta">
        <Link href={`/product/${p.id}`}>
          <span className="label">{L(c.name)} · {L(c.stone)}</span>
          <span className="display d3">{L(p.name)}</span>
        </Link>
        <span className="price">{money(p.price)}</span>
      </div>
    </article>
  );
}
