export const locales = ["it", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";
export const localeCookieName = "calcolaferie_locale";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}
