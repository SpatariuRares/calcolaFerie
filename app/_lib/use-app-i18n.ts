import { createTranslator, useLocale, useTranslations } from "next-intl";
import italianMessages from "../../messages/it.json";

export type TranslationNamespace =
  | "home"
  | "home.faq"
  | "planner"
  | "results"
  | "calendar"
  | "holidays"
  | "newsletter"
  | "footer"
  | "affiliates";

export function useAppTranslations(
  namespace: TranslationNamespace
): ReturnType<typeof useTranslations> {
  try {
    return useTranslations(namespace as never);
  } catch {
    return createTranslator({
      locale: "it",
      messages: italianMessages,
      namespace: namespace as never,
    }) as ReturnType<typeof useTranslations>;
  }
}

export function useAppLocale() {
  try {
    return useLocale();
  } catch {
    return "it";
  }
}
