import Link from "next/link";
import { useTranslations } from "next-intl";

export function NewsletterConsentText() {
  const t = useTranslations("newsletter");
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
