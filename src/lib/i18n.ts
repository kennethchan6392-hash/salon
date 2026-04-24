import en from "../../messages/en.json";
import zhHK from "../../messages/zh-HK.json";

export const supportedLocales = ["zh-HK", "en"] as const;

export type Locale = (typeof supportedLocales)[number];
export type Messages = typeof en;

export function isSupportedLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getMessages(locale: Locale): Messages {
  return locale === "zh-HK" ? zhHK : en;
}
