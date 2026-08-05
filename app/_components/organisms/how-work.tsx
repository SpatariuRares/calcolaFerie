import { useAppTranslations } from "@lib/use-app-i18n";
import styles from "@styles/app.module.scss";

export function HowWorkSection() {
    const t = useAppTranslations("planner");

    return (
        <>
            <section aria-labelledby="about-title" className={styles.aboutSection}>
                <p className={styles.eyebrow}>{t("about.eyebrow")}</p>
                <h2 id="about-title">{t("about.title")}</h2>
                <p>{t("about.description")}</p>
                <p>{t("about.disclaimer")}</p>
            </section>
        </>
    );
}
