"use client";

import { useLocale } from "next-intl";
import { localeCookieName, locales, type Locale } from "../../i18n/config";
import styles from "../styles/app.module.scss";

const labels: Record<Locale, string> = {
  it: "It",
  en: "En",
};

function useCurrentLocale(): Locale {
  try {
    const locale = useLocale();
    return locales.includes(locale as Locale) ? (locale as Locale) : "it";
  } catch {
    return "it";
  }
}

function persistLocale(locale: Locale) {
  document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.location.reload();
}
export function LanguageSwitcher() {
  const locale = useCurrentLocale();

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    persistLocale(nextLocale);
  }

  return (
    <div className={styles.languageSwitcher} role="group" aria-label="Language">
      <span className={styles.languageSwitcherLabel}>Language</span>
      <div className={styles.languageSwitcherOptions}>
        {locales.map((availableLocale) => {
          const isActive = availableLocale === locale;

          return (
            <button
              aria-pressed={isActive}
              className={`${styles.languageSwitcherButton}${isActive ? ` ${styles.languageSwitcherButtonActive}` : ""
                }`}
              key={availableLocale}
              onClick={() => changeLocale(availableLocale)}
              type="button"
            >
              {labels[availableLocale]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
