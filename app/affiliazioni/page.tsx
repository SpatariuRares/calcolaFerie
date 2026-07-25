import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AffiliateProgramsView } from "@components/templates/affiliate-programs-view";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";
const PAGE_URL = `${BASE_URL}/affiliazioni`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const title = t("affiliatesTitle");
  const description = t("affiliatesDescription");

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

export default function AffiliateProgramsPage() {
  return <AffiliateProgramsView />;
}
