import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqView } from "@components/templates/faq-view";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";
const PAGE_URL = `${BASE_URL}/faq`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const title = t("faqTitle");
  const description = t("faqDescription");

  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title,
      description,
      url: PAGE_URL,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function FaqPage() {
  return <FaqView />;
}
