"use client";

import { useTranslations } from "next-intl";
import { VacationPlanner } from "@components/templates/vacation-planner";
import { JsonLd } from "./_components/atoms/json-ld";

export default function Home() {
  const t = useTranslations("home");

  return (
    <>
      <JsonLd />
      <VacationPlanner />
      <section aria-label={t("accessibleLabel")} className="sr-only">
        <h2>{t("accessibleTitle")}</h2>
        <p>{t("accessibleDescription")}</p>
      </section>
    </>
  );
}
