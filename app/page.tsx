"use client";

import { useTranslations } from "next-intl";
import { VacationPlanner } from "./_components/vacation-planner";

export default function Home() {
  const t = useTranslations("home");

  return (
    <>
      <VacationPlanner />
      <section aria-label={t("accessibleLabel")} className="sr-only">
        <h2>{t("accessibleTitle")}</h2>
        <p>{t("accessibleDescription")}</p>
      </section>
    </>
  );
}
