"use client";

import { useTranslations } from "next-intl";
import { VacationPlanner } from "@components/templates/vacation-planner";
import { JsonLd } from "./_components/atoms/json-ld";
import { SeoFaq } from "./_components/organisms/seo-faq";

export default function Home() {
  const t = useTranslations("home");

  return (
    <>
      <JsonLd />
      <VacationPlanner />
      <SeoFaq />
      <section aria-label={t("accessibleLabel")} className="sr-only">
        <h2>{t("accessibleTitle")}</h2>
        <p>{t("accessibleDescription")}</p>
      </section>
    </>
  );
}
