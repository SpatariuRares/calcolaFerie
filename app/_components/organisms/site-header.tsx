import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

export function SiteHeader() {
  const t = useAppTranslations("planner");

  return (
    <>
      <section className={styles.hero} aria-labelledby="page-title">
        <div>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="page-title">{t("title")}</h1>
        </div>
        <p>{t("subtitle")}</p>
        <div className={styles.heroFormula} aria-hidden="true">
          <span className={styles.heroFormulaNum}>9</span>
          <span className={styles.heroFormulaLabel}>{t("formula.freeDays")}</span>
          <span className={styles.heroFormulaOp}>÷</span>
          <span className={styles.heroFormulaNum}>4</span>
          <span className={styles.heroFormulaLabel}>{t("formula.leaveUsed")}</span>
          <span className={styles.heroFormulaOp}>=</span>
          <span className={styles.heroFormulaResult}>
            {t("formula.leverage", { value: "2,3" })}
          </span>
        </div>
      </section>

      <section aria-labelledby="about-title" className={styles.aboutSection}>
        <p className={styles.eyebrow}>{t("about.eyebrow")}</p>
        <h2 id="about-title">{t("about.title")}</h2>
        <p>{t("about.description")}</p>
        <p>{t("about.disclaimer")}</p>
      </section>
    </>
  );
}
