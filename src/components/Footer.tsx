'use client';

import { useStore } from '@/context/StoreProvider';
import { Icon, Logotype } from './Art';

export function Footer() {
  const { t, act } = useStore();
  const col = (h: string, items: [string, string][]) => (
    <>
      <h4 className="label">{h}</h4>
      <ul>{items.map(([l, a]) => <li key={l}><button type="button" onClick={() => act(a)}>{l}</button></li>)}</ul>
    </>
  );
  const svcIcons = [Icon.truck, Icon.back, Icon.hand];

  return (
    <footer className="foot">
      <div className="wrap">
        <ul className="trust">
          {t('svc').map((s, i) => { const I = svcIcons[i]; return <li key={s}><I /><span>{s}</span></li>; })}
        </ul>
        <div className="fgrid" data-reveal>
          <div className="fbrand">
            <Logotype />
            <p className="label worn">{t('worn')}</p>
            <p className="closing">{t('closing')}</p>
            <p>{t('atelierLoc')}</p>
          </div>
          <div className="fcol">{col(t('fShop'), [[t('shopAll'), 'all'], [t('newIn'), 'new'], [t('ring'), 'type:ring'], [t('earrings'), 'type:earrings'], [t('necklace'), 'type:necklace'], [t('bracelet'), 'type:bracelet']])}</div>
          <div className="fcol">{col(t('fCare'), t('careList').map((c) => [c, 'soon'] as [string, string]))}</div>
          <div className="fcol">{col(t('fWorld'), [[t('world')[0], 'sec:story'], [t('world')[1], 'sec:collections'], [t('world')[2], 'soon']])}</div>
        </div>
        <div className="fpay">
          <span className="label">{t('payTitle')}</span>
          {t('pays').map((p) => <span className="chip2" key={p}>{p}</span>)}
        </div>
        <div className="base"><span>{t('copy')}</span><span>{t('credit')}</span></div>
      </div>
    </footer>
  );
}
