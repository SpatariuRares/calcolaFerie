import Link from "next/link";
import { useAppTranslations } from "../../_lib/use-app-i18n";

export function NewsletterConsentText() {
  const t = useAppTranslations("newsletter");
  const privacyPolicy = t("privacyPolicy");
  const [before, after = ""] = t("consent", { privacyPolicy }).split(privacyPolicy);

  return (
    <>
      {before}
      <Link href="/privacy">{privacyPolicy}</Link>
      {after}
    </>
  );
}
