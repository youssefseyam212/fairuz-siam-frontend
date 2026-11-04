'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { COLS, EXP_FEE, FREE_AT, STD_FEE, byId } from '@/lib/data';
import { emptyForm, useStore, type CheckoutForm } from '@/context/StoreProvider';
import { Mono, PieceSvg } from '@/components/Art';

type Checked = 'name' | 'phone' | 'email' | 'street';
const RULES: Record<Checked, (v: string) => boolean> = {
  name: (v) => v.trim().length > 1,
  phone: (v) => /^(\+?20|0)?1[0125]\d{8}$/.test(v.replace(/[\s-]/g, '')),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  street: (v) => v.trim().length > 3,
};
const MSGS = { name: 'eName', phone: 'ePhone', email: 'eEmail', street: 'eStreet' } as const;
const ORDER: Checked[] = ['name', 'phone', 'email', 'street'];

export function CheckoutView() {
  const { t, L, money, num, bag, subtotal, form: f, setForm, setOrder, clearBag, setBagOpen } = useStore();
  const router = useRouter();
  const [bad, setBad] = useState<Partial<Record<Checked, boolean>>>({});
  const [placed, setPlaced] = useState(false);
  const inputs = useRef<Partial<Record<Checked, HTMLInputElement | null>>>({});

  if (placed) return null;
  if (!bag.length) {
    return (
      <div className="wrap"><div className="done">
        <Mono />
        <h1 className="display d2">{t('empty')}</h1>
        <p className="muted" style={{ margin: 0 }}>{t('emptySub')}</p>
        <Link className="cta press label" href="/shop" style={{ flex: 'none', textDecoration: 'none' }}>{t('browse')}</Link>
      </div></div>
    );
  }

  const fee = f.del === 'exp' ? EXP_FEE : subtotal >= FREE_AT ? 0 : STD_FEE;
  const grand = subtotal + fee;
  const set = <K extends keyof CheckoutForm>(k: K, v: CheckoutForm[K]) => setForm((p) => ({ ...p, [k]: v }));

  const check = (k: Checked, value: string, show: boolean) => {
    const ok = RULES[k](value);
    if (show || bad[k]) setBad((b) => ({ ...b, [k]: !ok }));
    return ok;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    let first: Checked | null = null;
    const next: Partial<Record<Checked, boolean>> = {};
    for (const k of ORDER) { const ok = RULES[k](f[k]); next[k] = !ok; if (!ok && !first) first = k; }
    setBad(next);
    if (first) { inputs.current[first]?.focus(); return; }
    setPlaced(true);
    setOrder({ n: 'FS-' + String(Date.now()).slice(-6), total: grand });
    clearBag();
    setForm(emptyForm());
    router.push('/thank-you');
  };

  const field = (k: Checked | 'gift', label: string, type: string, ac: string, cls = '') => {
    const isChecked = k !== 'gift';
    const isBad = isChecked && !!bad[k as Checked];
    return (
      <div className={`field ${cls}${isBad ? ' bad' : ''}`}>
        <label htmlFor={`f-${k}`}>{label}</label>
        <input id={`f-${k}`} type={type} autoComplete={ac} value={f[k]}
          ref={(el) => { if (isChecked) inputs.current[k as Checked] = el; }}
          {...(type === 'tel' ? { inputMode: 'tel' as const, dir: 'ltr' } : {})}
          aria-describedby={`m-${k}`} aria-invalid={isChecked ? isBad : undefined}
          onChange={(e) => { set(k, e.target.value); if (isChecked) check(k as Checked, e.target.value, false); }}
          onBlur={(e) => { if (isChecked && e.target.value) check(k as Checked, e.target.value, true); }} />
        <span className="msg" id={`m-${k}`} aria-live="polite">{isBad ? t(MSGS[k as Checked]) : ''}</span>
      </div>
    );
  };

  const radio = <N extends 'del' | 'pay'>(n: N, v: CheckoutForm[N], title: string, desc: string, side: string) => (
    <label className="radio">
      <input type="radio" name={n} value={v} checked={f[n] === v} onChange={() => set(n, v)} />
      <span className="t"><b>{title}</b><span>{desc}</span></span>
      {side && <span className="price">{side}</span>}
    </label>
  );

  return (
    <div className="wrap">
      <nav className="crumbs"><Link href="/shop">{t('shop')}</Link><span aria-hidden="true">/</span><span style={{ color: 'var(--ink)' }}>{t('coTitle')}</span></nav>
      <h1 className="display d1" style={{ paddingBottom: 28 }}>{t('coTitle')}</h1>
      <div className="co">
        <form noValidate onSubmit={onSubmit}>
          <section><h2>{t('contact')}</h2><div className="fields">
            {field('name', t('fullName'), 'text', 'name', 'full')}
            {field('phone', t('phone'), 'tel', 'tel')}
            {field('email', t('email'), 'email', 'email')}
            {field('gift', t('giftMsg'), 'text', 'off', 'full')}
          </div></section>
          <section><h2>{t('address')}</h2><div className="fields">
            <div className="field">
              <label htmlFor="f-city">{t('city')}</label>
              <select id="f-city" value={f.city} onChange={(e) => set('city', +e.target.value)}>
                {t('cities').map((c, i) => <option key={c} value={i}>{c}</option>)}
              </select>
            </div>
            {field('street', t('street'), 'text', 'street-address')}
          </div></section>
          <section><h2>{t('delOpt')}</h2><div className="radios">
            {radio('del', 'std', t('std'), t('stdD'), subtotal >= FREE_AT ? t('free') : money(STD_FEE))}
            {radio('del', 'exp', t('exp'), t('expD'), money(EXP_FEE))}
          </div></section>
          <section><h2>{t('payment')}</h2><div className="radios">
            {radio('pay', 'cod', t('cod'), t('codD'), '')}
            {radio('pay', 'card', t('card'), t('cardD'), '')}
          </div></section>
          <button className="cta press label" type="submit" style={{ flex: 'none', minHeight: 56 }}>{t('place')} · <span>{money(grand)}</span></button>
        </form>
        <aside className="summary" aria-label={t('summary')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2 className="display d3" style={{ fontSize: '1.6rem' }}>{t('summary')}</h2>
            <button className="link" type="button" onClick={() => setBagOpen(true)}>{t('edit')}</button>
          </div>
          {bag.map((l) => {
            const p = byId[l.id];
            return (
              <div className="line" key={`${l.id}|${l.metal}|${l.size}`}>
                <span className={`th ${COLS[p.col].skin}`}><PieceSvg p={p} metal={l.metal} /><span className="q">{num(l.qty)}</span></span>
                <div style={{ minWidth: 0 }}><div className="nm">{L(p.name)}</div><div className="vr">{t(l.metal) + (l.size ? ' · ' + num(l.size) : '')}</div></div>
                <span className="price">{money(p.price * l.qty)}</span>
              </div>
            );
          })}
          <div className="totals">
            <span>{t('subtotal')}</span><span>{money(subtotal)}</span>
            <span>{t('delivery')}</span><span>{fee ? money(fee) : t('free')}</span>
            <span className="grand">{t('total')}</span><span className="grand">{money(grand)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
