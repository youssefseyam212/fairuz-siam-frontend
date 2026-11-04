export type Lang = 'en' | 'ar';
export type Localized = Record<Lang, string>;

export type CollectionKey = 'ember' | 'nile' | 'fayrouz' | 'mughal';
export type Cut = 'oval' | 'emerald' | 'round';
export type PieceType = 'ring' | 'earrings' | 'necklace' | 'bracelet';
export type Metal = 'gold' | 'silver';

export interface Collection {
  skin: string;
  gem: string;
  cut: Cut;
  stone: Localized;
  name: Localized;
  line: Localized;
}

export interface Product {
  id: string;
  col: CollectionKey;
  type: PieceType;
  price: number;
  isNew: boolean;
  name: Localized;
  desc: Localized;
  order: number;
}

export interface BagLine {
  id: string;
  metal: Metal;
  size: number | null;
  qty: number;
}

export const COLS: Record<CollectionKey, Collection> = {
  ember: {
    skin: 'k-ember', gem: '#a3153a', cut: 'oval',
    stone: { en: 'Garnet', ar: 'العقيق الأحمر' }, name: { en: 'Ember', ar: 'جمرة' },
    line: {
      en: 'Deep red, warm as a remembered evening. Settings drawn from old Persian jali screens.',
      ar: 'أحمر عميق، دافئ كأمسية في الذاكرة. ترصيعات مستوحاة من المشربيات الفارسية القديمة.',
    },
  },
  nile: {
    skin: 'k-nile', gem: '#6cc4ee', cut: 'emerald',
    stone: { en: 'Blue topaz', ar: 'التوباز الأزرق' }, name: { en: 'Nile', ar: 'نيل' },
    line: {
      en: 'Clear water light, framed in the stepped lines of riverside architecture.',
      ar: 'ضوء الماء الصافي، مؤطّر بخطوط متدرجة من عمارة ضفاف النهر.',
    },
  },
  fayrouz: {
    skin: 'k-fayrouz', gem: '#12BDC1', cut: 'round',
    stone: { en: 'Turquoise', ar: 'الفيروز' }, name: { en: 'Fayrouz', ar: 'فيروز' },
    line: {
      en: 'The stone that gave us our name, worn for protection from Sinai to Samarkand.',
      ar: 'الحجر الذي منحنا اسمنا، ارتُدي للحماية من سيناء إلى سمرقند.',
    },
  },
  mughal: {
    skin: 'k-mughal', gem: '#0f8a5f', cut: 'emerald',
    stone: { en: 'Emerald', ar: 'الزمرد' }, name: { en: 'Mughal', ar: 'مغولي' },
    line: {
      en: 'Green as palace gardens, cut in the patient geometry of courtly jewelers.',
      ar: 'أخضر كحدائق القصور، مقطوع بهندسة صبورة كصنعة جواهرجية البلاط.',
    },
  },
};

export const COL_KEYS = Object.keys(COLS) as CollectionKey[];

type Row = [string, CollectionKey, PieceType, number, 0 | 1, string, string, string, string];

const ROWS: Row[] = [
  ['ember-signet', 'ember', 'ring', 3200, 1, 'Ember Signet Ring', 'خاتم جمرة', 'A single oval garnet set high on a softly squared band, like a lantern in a carved window.', 'حجر عقيق بيضاوي واحد مرتفع على حلقة ناعمة الحواف، كفانوس في نافذة منحوتة.'],
  ['ember-drops', 'ember', 'earrings', 2850, 0, 'Ember Drop Earrings', 'أقراط جمرة', 'Two garnet drops that move when you do, catching light with every turn of the head.', 'قطرتان من العقيق تتحركان معك، وتلتقطان الضوء مع كل التفاتة.'],
  ['jali-pendant', 'ember', 'necklace', 3900, 0, 'Jali Pendant', 'قلادة المشربية', 'A garnet held in a pierced, screen-like setting on a fine chain.', 'عقيق في إطار مخرّم يشبه المشربية، على سلسلة رفيعة.'],
  ['nile-step', 'nile', 'ring', 2600, 1, 'Nile Step Ring', 'خاتم النيل المدرّج', 'An emerald-cut blue topaz on a band stepped like the banks of the river.', 'توباز أزرق بقطع الزمرد على حلقة متدرجة كضفاف النهر.'],
  ['riverbank-cuff', 'nile', 'bracelet', 4400, 0, 'Riverbank Cuff', 'سوار ضفة النهر', 'An open cuff lined with five small topaz stones, like light on moving water.', 'سوار مفتوح تصطف عليه خمسة أحجار توباز صغيرة، كالضوء على الماء الجاري.'],
  ['nile-drops', 'nile', 'earrings', 1950, 0, 'Nile Drops', 'أقراط النيل', 'Small and clear. Two blue topaz drops for every day.', 'صغيرة وصافية. قطرتان من التوباز الأزرق لكل يوم.'],
  ['dome-ring', 'fayrouz', 'ring', 2750, 0, 'Fayrouz Dome Ring', 'خاتم قبة الفيروز', 'A round turquoise on a smooth band. The stone that gave us our name.', 'فيروز مستدير على حلقة ناعمة. الحجر الذي منحنا اسمنا.'],
  ['sinai-necklace', 'fayrouz', 'necklace', 4800, 1, 'Sinai Necklace', 'قلادة سيناء', 'A turquoise pendant on a long chain, after the amulets worn across Sinai.', 'قلادة فيروز على سلسلة طويلة، مستوحاة من التمائم التي تُرتدى في سيناء.'],
  ['samarkand-drops', 'fayrouz', 'earrings', 3100, 0, 'Samarkand Drops', 'أقراط سمرقند', 'Turquoise drops shaped after the blue domes of Samarkand.', 'أقراط فيروز متدلية مستوحاة من القباب الزرقاء في سمرقند.'],
  ['garden-ring', 'mughal', 'ring', 5200, 0, 'Mughal Garden Ring', 'خاتم حديقة المغول', 'A rectangular emerald with stepped facets, set like a pool in a palace garden.', 'زمرد مستطيل بأوجه متدرجة، مرصّع كبركة في حديقة قصر.'],
  ['palace-pendant', 'mughal', 'necklace', 4600, 0, 'Palace Pendant', 'قلادة القصر', 'An emerald-cut stone on a fine chain, quiet and certain.', 'حجر بقطع الزمرد على سلسلة رفيعة، هادئ وواثق.'],
  ['courtyard-bracelet', 'mughal', 'bracelet', 5900, 1, 'Courtyard Bracelet', 'سوار الفناء', 'Five emeralds around the wrist, spaced like the arches of a courtyard.', 'خمسة أحجار زمرد حول المعصم، متباعدة كأقواس فناء.'],
];

export const PRODUCTS: Product[] = ROWS.map((r, i) => ({
  id: r[0], col: r[1], type: r[2], price: r[3], isNew: !!r[4],
  name: { en: r[5], ar: r[6] }, desc: { en: r[7], ar: r[8] }, order: i,
}));

export const byId: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export const SIZES = [50, 52, 54, 56, 58];
export const METALS: Record<Metal, { base: string; hi: string; lo: string }> = {
  gold: { base: '#d9a441', hi: '#f8e0a0', lo: '#a8761f' },
  silver: { base: '#c3c7cf', hi: '#f3f5f8', lo: '#868b96' },
};
export const FREE_AT = 3000;
export const STD_FEE = 80;
export const EXP_FEE = 150;
