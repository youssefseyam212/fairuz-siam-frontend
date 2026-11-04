'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/context/StoreProvider';
import { Mono } from '@/components/Art';

export function DoneView() {
  const { t, money, order } = useStore();
  const router = useRouter();
  useEffect(() => { if (!order) router.replace('/shop'); }, [order, router]);
  if (!order) return null;
  return (
    <div className="wrap"><div className="done">
      <Mono />
      <h1 className="display d2">{t('doneTitle')}</h1>
      <p style={{ margin: 0 }}>{t('orderNum')}: <span className="num" dir="ltr">{order.n}</span> · <span className="price">{money(order.total)}</span></p>
      <p className="muted" style={{ margin: 0, maxWidth: '30em' }}>{t('doneNote')}</p>
      <Link className="cta press label" href="/shop" style={{ flex: 'none', textDecoration: 'none', marginTop: 10 }}>{t('cont')}</Link>
    </div></div>
  );
}
