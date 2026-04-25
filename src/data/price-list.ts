import type { Locale } from "@/lib/i18n";

/** Five stylist tiers: same order as W52 reference layout. */
export type TieredRow = {
  service: string;
  /** Stylist → Salon Director */
  prices: [string, string, string, string, string];
};

export type PriceTieredSub = {
  /** Subtable title, e.g. "Hair cut" */
  name: string;
  /** One empty label + 5 header cells */
  columnHeaders: [string, string, string, string, string, string];
  rows: TieredRow[];
};

export type PriceTieredSection = {
  kind: "tiered";
  id: string;
  title: string;
  subsections: PriceTieredSub[];
};

export type PriceSimpleSection = {
  kind: "simple";
  id: string;
  title: string;
  note?: string;
  rows: { name: string; price: string }[];
};

export type PriceListData = {
  sections: (PriceTieredSection | PriceSimpleSection)[];
};

type P5 = readonly [string, string, string, string, string];

/** Single source of truth for numeric cells — edit here when prices change. */
const T = {
  ladiesCut: ["650", "770", "880", "1,100", "1,300"] as const satisfies P5,
  gentsCut: ["500", "550", "600", "700", "800"] as const satisfies P5,
  childUnder2: ["250", "350", "400", "450", "500"] as const satisfies P5,
  child212: ["400", "450", "500", "600", "700"] as const satisfies P5,
  shampooBlow: ["450", "450", "500", "550", "700"] as const satisfies P5,
  longStyle: ["500–550", "500–550", "600–700", "770–880", "950"] as const satisfies P5,
  roughDry: ["280", "280", "280", "280", "280"] as const satisfies P5,
} as const;

type TierRowSrc = { prices: P5; en: string; zhHK: string };

const cutRows: TierRowSrc[] = [
  { prices: T.ladiesCut, en: "Ladies cut & finish", zhHK: "女士剪髮及造型" },
  { prices: T.gentsCut, en: "Gents cut & finish", zhHK: "男士剪髮及造型" },
  { prices: T.childUnder2, en: "Children’s haircut (under 2y)", zhHK: "兒童剪髮（2 歲以下）" },
  { prices: T.child212, en: "Children’s haircut (2–12y)", zhHK: "兒童剪髮（2–12 歲）" },
];

const stylingRows: TierRowSrc[] = [
  { prices: T.shampooBlow, en: "Shampoo & blow-dry from", zhHK: "洗髮及吹髮 起" },
  { prices: T.longStyle, en: "Long hair styling from", zhHK: "長髮造型 起" },
  { prices: T.roughDry, en: "Rough dry from", zhHK: "速乾 起" },
];

const tierColumnHeaders: Record<Locale, [string, string, string, string, string, string]> = {
  en: [
    "",
    "Stylist",
    "Senior stylist",
    "Creative stylist",
    "Creative director",
    "Salon director",
  ],
  "zh-HK": ["", "髮型師", "高級髮型師", "創意髮型師", "創作總監", "沙龍總監"],
};

function tierRow(locale: Locale, r: TierRowSrc): TieredRow {
  return {
    service: locale === "zh-HK" ? r.zhHK : r.en,
    prices: [...r.prices],
  };
}

type SimpleRowSrc = { en: string; zhHK: string; price: string };

const conditioningRows: SimpleRowSrc[] = [
  { en: "KC Vital shot", zhHK: "KC Vital 注射護理", price: "240" },
  { en: "3.1 Reparative treatment", zhHK: "3.1 深層修復療程", price: "825" },
  { en: "K18 treatment", zhHK: "K18 髮絲療程", price: "770" },
];

export function getPriceListData(locale: Locale): PriceListData {
  const headers = tierColumnHeaders[locale];

  return {
    sections: [
      {
        kind: "tiered",
        id: "cut-styling",
        title: locale === "zh-HK" ? "洗剪及造型" : "Cut & styling",
        subsections: [
          {
            name: locale === "zh-HK" ? "剪髮" : "Hair cut",
            columnHeaders: headers,
            rows: cutRows.map((r) => tierRow(locale, r)),
          },
          {
            name: locale === "zh-HK" ? "造型" : "Hair styling",
            columnHeaders: headers,
            rows: stylingRows.map((r) => tierRow(locale, r)),
          },
        ],
      },
      {
        kind: "simple",
        id: "conditioning",
        title: locale === "zh-HK" ? "護理及療程" : "Conditioning & treatments",
        note:
          locale === "zh-HK" ? "（不含剪髮及造型）" : "(excludes cutting & styling)",
        rows: conditioningRows.map((r) => ({
          name: locale === "zh-HK" ? r.zhHK : r.en,
          price: r.price,
        })),
      },
    ],
  };
}
