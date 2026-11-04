'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { COLS, COL_KEYS, PRODUCTS, byId, type PieceType } from '@/lib/data';
import { T, THEMES, TLBL } from '@/lib/i18n';
import { useStore } from '@/context/StoreProvider';
import { Icon, MiniGem, Mono, Logotype, PieceSvg } from './Art';

type MegaKind = 'jewelry' | 'collections' | 'search';
const PIECE_TYPES: PieceType[] = ['ring', 'earrings', 'necklace', 'bracelet'];

function SearchResults({ q, hideWhenEmpty, single }: { q: string; hideWhenEmpty?: boolean; single?: boolean }) {
  const { t, L, money, act } = useStore();
  const query = q.trim().toLowerCase();
  if (!query && hideWhenEmpty) return <div className="sres" style={single ? { gridTemplateColumns: '1fr' } : undefined} />;
  const list = !query ? PRODUCTS.filter((p) => p.isNew) : PRODUCTS.filter((p) =>
    [p.name.en, p.name.ar, COLS[p.col].stone.en, COLS[p.col].stone.ar, COLS[p.col].name.en, COLS[p.col].name.ar, T.en[p.type], T.ar[p.type]]
      .join(' ').toLowerCase().includes(query));
  return (
    <div className="sres" style={single ? { gridTemplateColumns: '1fr' } : undefined}>
      {list.length ? list.slice(0, 8).map((p) => (
        <button type="button" key={p.id} onClick={() => act('p:' + p.id)}>
          <span className={`th ${COLS[p.col].skin}`}><PieceSvg p={p} /></span>
          <span>{L(p.name)}<br /><small className="muted">{L(COLS[p.col].stone)}</small></span>
          <span className="price">{money(p.price)}</span>
        </button>
      )) : <p className="muted" style={{ margin: 0 }}>{t('noResults')}</p>}
    </div>
  );
}

export function Header() {
  const store = useStore();
  const { t, L, lang, setLang, theme, setTheme, toast, hideToast, act, bagCount, num, setBagOpen, type, setCol, setType, bumpKey, menuCloseKey } = store;
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [megaKind, setMegaKind] = useState<MegaKind | null>(null);
  const [megaQ, setMegaQ] = useState('');
  const megaT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const [menuShown, setMenuShown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQ, setMenuQ] = useState('');
  const menuFocusSearch = useRef(false);
  const mSearchRef = useRef<HTMLInputElement>(null);
  const mCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const openMega = (k: MegaKind) => {
    clearTimeout(megaT.current);
    if (k !== megaKind) { setMegaQ(''); if (k === 'search') setTimeout(() => searchRef.current?.focus(), 60); }
    setMegaKind(k);
  };
  const closeMega = () => { clearTimeout(megaT.current); setMegaKind(null); };

  const openMenu = (withSearch: boolean) => {
    menuFocusSearch.current = withSearch;
    setMenuQ('');
    setMenuShown(true);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => setMenuOpen(true)));
    setTimeout(() => (withSearch ? mSearchRef.current : mCloseRef.current)?.focus({ preventScroll: true }), 80);
  };
  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
    setTimeout(() => setMenuShown(false), 420);
  };

  // close menus on navigation / action
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    closeMega();
    if (menuShown) closeMenu();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menuCloseKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMegaKind(null); setMenuOpen((o) => { if (o) { document.body.style.overflow = ''; setTimeout(() => setMenuShown(false), 420); } return false; }); } };
    const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('#hdr')) setMegaKind(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, []);

  // bump the bag count badge whenever something is added
  useEffect(() => {
    const c = countRef.current;
    if (!c || !bumpKey) return;
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }, [bumpKey]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % 3];
    setTheme(next);
    toast(TLBL[lang][next]);
  };
  const toggleLang = () => { hideToast(); setLang(lang === 'en' ? 'ar' : 'en'); };
  const ThemeIcon = Icon[theme];

  const toggleMega = (k: MegaKind) => (megaKind === k ? closeMega() : openMega(k));
  const hoverMega = (k: MegaKind) => { clearTimeout(megaT.current); megaT.current = setTimeout(() => openMega(k), 90); };

  return (
    <>
      <div className="announce label">{t('announce')}</div>
      <header className={`hdr${scrolled ? ' scrolled' : ''}`} id="hdr"
        onMouseLeave={() => { if (megaKind && megaKind !== 'search') { clearTimeout(megaT.current); megaT.current = setTimeout(closeMega, 200); } }}>
        <div className="wrap bar">
          <div className="hl">
            <button className="iconbtn menubtn press" type="button" aria-label={t('menu')} onClick={() => openMenu(false)}><Icon.menu /></button>
            <nav className="nav" aria-label="Main">
              <button type="button" className="label" aria-expanded={megaKind === 'jewelry'} onClick={() => toggleMega('jewelry')} onMouseEnter={() => hoverMega('jewelry')}>{t('jewelry')}<Icon.caret /></button>
              <button type="button" className="label" aria-expanded={megaKind === 'collections'} onClick={() => toggleMega('collections')} onMouseEnter={() => hoverMega('collections')}>{t('collections')}<Icon.caret /></button>
              <button type="button" className="label" aria-current={pathname === '/shop' && type === 'new'} onClick={() => act('new')}>{t('newIn')}</button>
              <button type="button" className="label" onClick={() => act('sec:story')}>{t('ourStory')}</button>
            </nav>
          </div>
          <Link className="home press" href="/" onClick={() => { setCol('all'); setType('all'); }}>
            <Mono /><Logotype />
          </Link>
          <div className="tools">
            <button className="iconbtn press" type="button" aria-label={t('search')} aria-expanded={megaKind === 'search'}
              onClick={() => { if (window.innerWidth <= 980) { openMenu(true); return; } if (megaKind === 'search') closeMega(); else openMega('search'); }}>
              <Icon.search />
            </button>
            <button className="pill press themebtn" id="themeBtn" type="button" aria-label={TLBL[lang][theme]} title={TLBL[lang][theme]} onClick={cycleTheme}><ThemeIcon /></button>
            <button className="pill press label" id="langBtn" type="button" aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'} onClick={toggleLang}>
              {lang === 'ar' ? 'EN' : <span className="ar">عربي</span>}
            </button>
            <button className="bagbtn press" type="button" aria-haspopup="dialog" aria-label={`${t('bag')}, ${bagCount}`} onClick={() => setBagOpen(true)}>
              <Icon.bag />
              <span className="label">{t('bag')}</span><span className="count" ref={countRef}>{num(bagCount)}</span>
            </button>
          </div>
        </div>
        <div className={`mega${megaKind ? ' open' : ''}`} aria-hidden={!megaKind} onMouseEnter={() => clearTimeout(megaT.current)}>
          <div className="wrap mega-in">
            {megaKind === 'jewelry' && (
              <>
                <div className="mcol"><h4 className="label">{t('byPiece')}</h4><ul>
                  {PIECE_TYPES.map((k) => <li key={k}><button type="button" className="mlink" onClick={() => act('type:' + k)}>{t(k)}</button></li>)}
                  <li><button type="button" className="mlink" style={{ color: 'var(--accent)' }} onClick={() => act('all')}>{t('viewAllJ')}</button></li>
                </ul></div>
                <div className="mcol"><h4 className="label">{t('byStone')}</h4><ul>
                  {COL_KEYS.map((k) => <li key={k}><button type="button" className="mlink" onClick={() => act('col:' + k)}>{L(COLS[k].stone)}</button></li>)}
                </ul></div>
                <button type="button" className="mfeat k-fayrouz" onClick={() => act('new')}><span className="label">{t('newIn')}</span><PieceSvg p={byId['sinai-necklace']} /><span className="display">{L(byId['sinai-necklace'].name)}</span></button>
                <button type="button" className="mfeat k-ember" onClick={() => act('type:ring')}><span className="label">{t('ring')}</span><PieceSvg p={byId['ember-signet']} /><span className="display">{L(byId['ember-signet'].name)}</span></button>
              </>
            )}
            {megaKind === 'collections' && COL_KEYS.map((k) => {
              const c = COLS[k];
              return (
                <button type="button" key={k} className={`mcolt ${c.skin}`} onClick={() => act('col:' + k)}>
                  <MiniGem c={c} /><span className="label">{L(c.stone)}</span><span className="display">{L(c.name)}</span><p>{L(c.line)}</p>
                </button>
              );
            })}
            {megaKind === 'search' && (
              <div className="msearch">
                <label className="sr" htmlFor="sq">{t('search')}</label>
                <input id="sq" ref={searchRef} type="search" placeholder={t('searchPh')} autoComplete="off" value={megaQ} onChange={(e) => setMegaQ(e.target.value)} />
                <SearchResults q={megaQ} />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`msheet${menuOpen ? ' open' : ''}`} hidden={!menuShown}>
        <div className="mscrim" onClick={closeMenu} />
        <aside className="mpanel" role="dialog" aria-modal="true">
          {menuShown && (
            <>
              <div className="mtop"><Mono /><button type="button" className="xbtn press" ref={mCloseRef} aria-label={t('closeMenu')} onClick={closeMenu}><Icon.close /></button></div>
              <div className="msearch" style={{ maxWidth: 'none' }}>
                <label className="sr" htmlFor="msq">{t('search')}</label>
                <input id="msq" ref={mSearchRef} type="search" placeholder={t('searchPh')} autoComplete="off" style={{ fontSize: '1.4rem' }} value={menuQ} onChange={(e) => setMenuQ(e.target.value)} />
                <SearchResults q={menuQ} hideWhenEmpty single />
              </div>
              <div className="mbig">
                <button type="button" onClick={() => act('home')}>{t('home')}</button>
                <button type="button" onClick={() => act('all')}>{t('shopAll')}</button>
                <button type="button" onClick={() => act('new')}>{t('newIn')}</button>
                <button type="button" onClick={() => act('sec:story')}>{t('ourStory')}</button>
              </div>
              <div><p className="label muted" style={{ margin: '0 0 10px' }}>{t('byPiece')}</p><div className="mgrid">
                {PIECE_TYPES.map((k) => <button type="button" key={k} className="k-paper" onClick={() => act('type:' + k)}>{t(k)}</button>)}
              </div></div>
              <div><p className="label muted" style={{ margin: '0 0 10px' }}>{t('collections')}</p><div className="mgrid">
                {COL_KEYS.map((k) => <button type="button" key={k} className={COLS[k].skin} onClick={() => act('col:' + k)}><MiniGem c={COLS[k]} />{L(COLS[k].name)}</button>)}
              </div></div>
              <div className="mrow">
                <button type="button" className="pill press" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={cycleTheme}>
                  <span style={{ width: 18, height: 18, display: 'grid' }}><ThemeIcon /></span><span>{TLBL[lang][theme].split(': ')[1]}</span>
                </button>
                <button type="button" className="pill press label" onClick={() => { closeMenu(); toggleLang(); }}>
                  {lang === 'ar' ? 'English' : <span className="ar">العربية</span>}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
