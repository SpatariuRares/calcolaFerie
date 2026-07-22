import { formatDateRange, formatSingleDay } from "../../_lib/opportunity-display";
import { useAppLocale, useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";
import { BookingCta } from "../molecules/booking-cta";
import type { SelectedVacationRange } from "./calendar-view";

export function SelectedVacationsTable({ ranges }: { ranges: SelectedVacationRange[] }) {
  const t = useAppTranslations("results");
  const locale = useAppLocale();

  if (ranges.length === 0) return null;

  const totalDays = ranges.reduce((total, range) => total + range.days, 0);
  const formatPeriod = (range: SelectedVacationRange) =>
    range.start === range.end
      ? formatSingleDay(range.start, locale)
      : formatDateRange(range.start, range.end, locale);

  function handleDownloadPdf() {
    const rowsHtml = ranges
      .map((range) => `<tr><td>${formatPeriod(range)}</td><td class="num">${range.days}</td></tr>`)
      .join("");
    const documentHtml = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${t("pdfTitle")}</title><style>
      body{font-family:Inter,Arial,sans-serif;color:#1b2620;margin:32px;}
      h1{font-size:20px;margin:0 0 16px;}
      table{width:100%;border-collapse:collapse;font-size:14px;}
      th,td{border-bottom:1px solid #d7dee2;padding:8px 10px;text-align:left;}
      thead th{background:#f2f5f6;text-transform:uppercase;font-size:11px;letter-spacing:0.04em;}
      td.num,th.num{text-align:right;}
      tfoot td{font-weight:700;background:#f8fafb;}
    </style></head><body>
      <h1>${t("pdfTitle")}</h1>
      <table>
        <thead><tr><th>${t("table.period")}</th><th class="num">${t("table.leaveDays")}</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr><td>${t("total")}</td><td class="num">${totalDays}</td></tr></tfoot>
      </table>
    </body></html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(documentHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener("load", () => {
      printWindow.print();
    });
    setTimeout(() => printWindow.print(), 300);
  }

  return (
    <section className={styles.outputSection} aria-labelledby="selected-vacations-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="selected-vacations-title">{t("selectedLeave")}</h2>
        </div>
        <button className={styles.secondaryButton} onClick={handleDownloadPdf} type="button">
          {t("downloadPdf")}
        </button>
      </div>
      <div className={styles.selectedTableWrap}>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th scope="col">{t("table.period")}</th>
              <th scope="col">{t("table.leaveDays")}</th>
              <th scope="col">{t("table.book")}</th>
            </tr>
          </thead>
          <tbody>
            {ranges.map((range) => (
              <tr key={range.start}>
                <th scope="row">{formatPeriod(range)}</th>
                <td>{range.days}</td>
                <td className={styles.bookingCell}>
                  <BookingCta endDate={range.end} startDate={range.start} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t("total")}</th>
              <td>{totalDays}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
