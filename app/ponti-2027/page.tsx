import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Ponti2027View } from "@components/templates/ponti-2027-view";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";
const PAGE_URL = `${BASE_URL}/ponti-2027`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const title = t("ponti2027Title");
  const description = t("ponti2027Description");

  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title,
      description,
      url: PAGE_URL,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function Ponti2027Page() {
  return <Ponti2027View />;
}
