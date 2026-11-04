'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COLS, METALS, PRODUCTS, SIZES, byId, type Metal } from '@/lib/data';
import { useStore } from '@/context/StoreProvider';
import { Icon, Mono, PieceSvg } from '@/components/Art';
import { ProductCard } from '@/components/ProductCard';

const MARK_COLOR = { ember: 'var(--orange)', nile: 'var(--navy)', fayrouz: 'var(--purple)', mughal: 'var(--teal)' } as const;

export function ProductView({ id }: { id: string }) {
  const { t, L, money, num, addToBag, setCol, setType } = useStore();
  const p = byId[id];
  const c = COLS[p.col];
  const [metal, setMetal] = useState<Metal>('gold');
  const [size, setSize] = useState(54);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const skins = [c.skin, 'k-paper', c.skin];
  const rel = PRODUCTS.filter((x) => x.id !== p.id)
    .sort((a, b) => Number(b.col === p.col) - Number(a.col === p.col) || a.order - b.order)
    .slice(0, 4);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">{t('home')}</Link><span aria-hidden="true">/</span>
        <Link href="/shop">{t('shop')}</Link><span aria-hidden="true">/</span>
        <Link href="/shop" onClick={() => { setCol(p.col); setType('all'); }}>{L(c.name)}</Link><span aria-hidden="true">/</span>
        <span aria-current="page" style={{ color: 'var(--ink)' }}>{L(p.name)}</span>
      </nav>
      <div className="pdp">
        <div className="gallery">
          <div className={`bigstage ${skins[view]}`}>
            <PieceSvg key={`${metal}-${view}`} p={p} metal={metal} mode={view === 2 ? 'stone' : 'piece'} />
            <span className="mark"><Mono style={{ color: MARK_COLOR[p.col] }} /></span>
          </div>
          <div className="thumbs" role="group">
            {t('views').map((v, i) => (
              <button type="button" key={v} className={`thumb press ${skins[i]}`} aria-pressed={i === view} aria-label={v} onClick={() => setView(i)}>
                <PieceSvg p={p} metal={metal} mode={i === 2 ? 'stone' : 'piece'} />
              </button>
            ))}
          </div>
        </div>
        <div className="buy">
          <div>
            <span className="label" style={{ color: 'var(--fayrouz)' }}>{L(c.name)} · {L(c.stone)}</span>
            <h1 className="display d2" style={{ marginTop: 12 }}>{L(p.name)}</h1>
          </div>
          <span className="price bigprice">{money(p.price)}</span>
          <p className="lede">{L(p.desc)}</p>
          <fieldset>
            <legend className="label">{t('metal')}</legend>
            <div className="opts">
              {(['gold', 'silver'] as Metal[]).map((m) => (
                <label className="opt" key={m}>
                  <input type="radio" name="metal" value={m} checked={metal === m} onChange={() => setMetal(m)} />
                  <span><i className="swatch" style={{ background: METALS[m].base }} />{t(m)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {p.type === 'ring' && (
            <fieldset>
              <legend className="label">{t('size')}</legend>
              <div className="opts">
                {SIZES.map((s) => (
                  <label className="opt" key={s}>
                    <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} />
                    <span>{num(s)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="row">
            <div className="stepper" role="group" aria-label={t('qty')}>
              <button className="press" type="button" aria-label="−" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <output>{num(qty)}</output>
              <button className="press" type="button" aria-label="+" onClick={() => setQty((q) => Math.min(9, q + 1))}>+</button>
            </div>
            <button className="cta press label" type="button" onClick={() => addToBag(p.id, metal, size, qty)}>
              {t('addToBag')} · <span>{money(p.price * qty)}</span>
            </button>
          </div>
          <div className="note"><Icon.truck /><span>{t('freeNote')}</span></div>
          <dl className="specs">
            <dt>{t('stone')}</dt><dd>{L(c.stone)}</dd>
            <dt>{t('metal')}</dt><dd>{t(metal)}</dd>
            <dt>{t('made')}</dt><dd>{t('madeV')}</dd>
            <dt>{t('care')}</dt><dd>{t('careV')}</dd>
          </dl>
        </div>
      </div>
      <section className="related">
        <h2 className="display d2">{t('also')}</h2>
        <div className="grid">{rel.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div>
      </section>
    </div>
  );
}
