'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { byId, type BagLine, type CollectionKey, type Lang, type Localized, type Metal } from '@/lib/data';
import { T, type Dict, type DictKey, type ThemeMode } from '@/lib/i18n';

export type ColFilter = 'all' | CollectionKey;
export type TypeFilter = 'all' | 'new' | 'ring' | 'earrings' | 'necklace' | 'bracelet';
export type SortKey = 'feat' | 'low' | 'high';

export interface CheckoutForm {
  name: string; phone: string; email: string; gift: string;
  city: number; street: string; del: 'std' | 'exp'; pay: 'cod' | 'card';
}
export const emptyForm = (): CheckoutForm => ({ name: '', phone: '', email: '', gift: '', city: 0, street: '', del: 'std', pay: 'cod' });

interface ToastState { msg: string; act?: string; fn?: () => void; on: boolean }

interface Store {
  lang: Lang; setLang: (l: Lang) => void;
  t: <K extends DictKey>(k: K) => Dict[K];
  L: (o: Localized) => string;
  money: (n: number) => string;
  num: (n: number) => string;
  theme: ThemeMode; setTheme: (m: ThemeMode) => void;

  bag: BagLine[];
  addToBag: (id: string, metal: Metal, size: number | null, qty?: number) => void;
  setQty: (i: number, qty: number) => void;
  removeLine: (i: number) => void;
  clearBag: () => void;
  subtotal: number; bagCount: number;
  bumpKey: number;

  bagOpen: boolean; setBagOpen: (o: boolean) => void;

  col: ColFilter; setCol: (c: ColFilter) => void;
  type: TypeFilter; setType: (t: TypeFilter) => void;
  sort: SortKey; setSort: (s: SortKey) => void;

  form: CheckoutForm; setForm: (f: CheckoutForm | ((f: CheckoutForm) => CheckoutForm)) => void;
  order: { n: string; total: number } | null; setOrder: (o: { n: string; total: number } | null) => void;

  toast: (msg: string, act?: string, fn?: () => void) => void;
  hideToast: () => void;
  toastState: ToastState;

  /** Navigation actions shared by nav, menus, tiles and footer. */
  act: (a: string) => void;
  consumePendingSection: () => string | null;
  menuCloseKey: number;
}

const Ctx = createContext<Store | null>(null);

const store = {
  get<V>(k: string, d: V): V { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as V) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const key = (l: { id: string; metal: Metal; size: number | null }) => l.id + '|' + l.metal + '|' + (l.size || '');

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [lang, setLangState] = useState<Lang>('en');
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [bag, setBag] = useState<BagLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [bagOpen, setBagOpen] = useState(false);
  const [col, setCol] = useState<ColFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<SortKey>('feat');
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [order, setOrder] = useState<{ n: string; total: number } | null>(null);
  const [toastState, setToastState] = useState<ToastState>({ msg: '', on: false });
  const [menuCloseKey, setMenuCloseKey] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastRemoved = useRef<{ l: BagLine; i: number } | null>(null);
  const pendingSection = useRef<string | null>(null);

  // Load persisted preferences after mount (avoids hydration mismatch).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLangState(store.get<Lang>('fs-lang', 'en'));
    setThemeState(store.get<ThemeMode>('fs-theme', 'system'));
    setBag(store.get<BagLine[]>('fs-bag', []).filter((l) => byId[l.id]));
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => { if (loaded) store.set('fs-bag', bag); }, [bag, loaded]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  const setLang = useCallback((l: Lang) => { setLangState(l); store.set('fs-lang', l); }, []);
  const setTheme = useCallback((m: ThemeMode) => {
    const root = document.documentElement;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theming');
      setTimeout(() => root.classList.remove('theming'), 400);
    }
    setThemeState(m); store.set('fs-theme', m);
  }, []);

  const t = useCallback(<K extends DictKey>(k: K): Dict[K] => T[lang][k], [lang]);
  const L = useCallback((o: Localized) => o[lang], [lang]);
  const money = useCallback((n: number) =>
    new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(n), [lang]);
  const num = useCallback((n: number) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(n), [lang]);

  const hideToast = useCallback(() => setToastState((s) => ({ ...s, on: false })), []);
  const toast = useCallback((msg: string, act?: string, fn?: () => void) => {
    setToastState({ msg, act, fn, on: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(hideToast, 4200);
  }, [hideToast]);

  const addToBag = useCallback((id: string, metal: Metal, size: number | null, qty = 1) => {
    const p = byId[id];
    const sz = p.type === 'ring' ? size || 54 : null;
    setBag((b) => {
      const k = key({ id, metal, size: sz });
      const ex = b.find((l) => key(l) === k);
      if (ex) return b.map((l) => (l === ex ? { ...l, qty: Math.min(9, l.qty + qty) } : l));
      return [...b, { id, metal, size: sz, qty }];
    });
    setBumpKey((n) => n + 1);
    toast(T[lang].added + ' · ' + p.name[lang], T[lang].viewBag, () => setBagOpen(true));
  }, [lang, toast]);

  const setQty = useCallback((i: number, qty: number) =>
    setBag((b) => b.map((l, j) => (j === i ? { ...l, qty: Math.max(1, Math.min(9, qty)) } : l))), []);

  const removeLine = useCallback((i: number) => {
    setBag((b) => {
      lastRemoved.current = { l: b[i], i };
      return b.filter((_, j) => j !== i);
    });
    toast(T[lang].removed, T[lang].undo, () => {
      const r = lastRemoved.current;
      if (!r) return;
      lastRemoved.current = null;
      setBag((b) => { const n = [...b]; n.splice(Math.min(r.i, n.length), 0, r.l); return n; });
    });
  }, [lang, toast]);

  const clearBag = useCallback(() => setBag([]), []);

  const subtotal = bag.reduce((a, l) => a + byId[l.id].price * l.qty, 0);
  const bagCount = bag.reduce((a, l) => a + l.qty, 0);

  const act = useCallback((a: string) => {
    setMenuCloseKey((n) => n + 1);
    const i = a.indexOf(':'), k = i < 0 ? a : a.slice(0, i), v = i < 0 ? '' : a.slice(i + 1);
    if (k === 'type') { setCol('all'); setType(v as TypeFilter); router.push('/shop'); }
    else if (k === 'col') { setCol(v as CollectionKey); setType('all'); router.push('/shop'); }
    else if (k === 'all') { setCol('all'); setType('all'); router.push('/shop'); }
    else if (k === 'new') { setCol('all'); setType('new'); router.push('/shop'); }
    else if (k === 'home') { router.push('/'); }
    else if (k === 'sec') {
      if (pathname === '/') {
        document.getElementById(v)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      } else { pendingSection.current = v; router.push('/'); }
    }
    else if (k === 'p') { router.push('/product/' + v); }
    else if (k === 'soon') { toast(T[lang].soon); }
  }, [router, pathname, toast, lang]);

  const consumePendingSection = useCallback(() => { const s = pendingSection.current; pendingSection.current = null; return s; }, []);

  const value = useMemo<Store>(() => ({
    lang, setLang, t, L, money, num, theme, setTheme,
    bag, addToBag, setQty, removeLine, clearBag, subtotal, bagCount, bumpKey,
    bagOpen, setBagOpen, col, setCol, type, setType, sort, setSort,
    form, setForm, order, setOrder, toast, hideToast, toastState, act, consumePendingSection, menuCloseKey,
  }), [lang, setLang, t, L, money, num, theme, setTheme, bag, addToBag, setQty, removeLine, clearBag, subtotal, bagCount, bumpKey,
    bagOpen, col, type, sort, form, order, toast, hideToast, toastState, act, consumePendingSection, menuCloseKey]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
