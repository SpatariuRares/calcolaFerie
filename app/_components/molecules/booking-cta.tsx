import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BridgeOpportunity } from "@engine";
import {
  buildBookingDeepLink,
  KLOOK_AFFILIATE_URL,
  RADICAL_STORAGE_AFFILIATE_URL,
  SAILY_AFFILIATE_URL,
} from "../../_lib/affiliate-link";
import { useAppTranslations } from "../../_lib/use-app-i18n";
import styles from "../../styles/app.module.scss";

type AffiliateProgramKey =
  | "booking"
  | "saily"
  | "klook"
  | "radicalstorage"
  | "getyourguide"
  | "expedia"
  | "hostelworld";

const PROGRAM_ORDER: AffiliateProgramKey[] = [
  "booking",
  "saily",
  "klook",
  "radicalstorage",
  "getyourguide",
  "expedia",
  "hostelworld",
];

export function BookingCta({
  endDate,
  startDate,
}: Pick<BridgeOpportunity, "endDate" | "startDate">) {
  const t = useAppTranslations("results");
  const tPrograms = useAppTranslations("affiliates");
  // Programs with a live affiliate link. Booking.com's is per-opportunity
  // (dates-only, see buildBookingDeepLink); the rest are static short links.
  const programHref: Partial<Record<AffiliateProgramKey, string>> = {
    booking: buildBookingDeepLink({ startDate, endDate }),
    saily: SAILY_AFFILIATE_URL,
    klook: KLOOK_AFFILIATE_URL,
    radicalstorage: RADICAL_STORAGE_AFFILIATE_URL,
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Menu renders through a portal (see below), so closing on scroll avoids
  // it drifting away from the trigger button it's anchored to.
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  // Anchors the menu to the trigger's right edge (opens leftward), but clamps
  // it within the viewport so it doesn't get cut off when the trigger sits
  // near the screen edge, e.g. inside a narrow mobile card. Runs after the
  // menu mounts so it can measure its actual (max-content) width.
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const margin = 8;
    const preferredLeft = triggerRect.right - menuRect.width;
    const maxLeft = Math.max(window.innerWidth - menuRect.width - margin, margin);
    const left = Math.min(Math.max(preferredLeft, margin), maxLeft);
    setMenuPosition({ top: triggerRect.bottom + 4, left });
  }, [isOpen]);

  // Stop propagation so booking does not toggle the row/card selection.
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  const toggleMenu = (event: React.MouseEvent) => {
    stop(event);
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen((open) => !open);
  };

  return (
    <span className={styles.bookingMenu} onClick={stop}>
      <button
        aria-expanded={isOpen}
        aria-label={t("bookCta")}
        className={styles.bookingMenuTrigger}
        onClick={toggleMenu}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className={`material-symbols-outlined ${styles.hamburgerIcon}`}>
          menu
        </span>
      </button>
      {isOpen
        ? createPortal(
            <>
              <div className={styles.bookingMenuBackdrop} onClick={() => setIsOpen(false)} />
              <ul
                className={styles.bookingMenuList}
                ref={menuRef}
                style={{ top: menuPosition.top, left: menuPosition.left }}
              >
                {PROGRAM_ORDER.filter((program) => programHref[program]).map((program) => (
                  <li key={program}>
                    <a
                      className={styles.bookingMenuLink}
                      href={programHref[program]}
                      onClick={() => setIsOpen(false)}
                      rel="sponsored noopener noreferrer"
                      target="_blank"
                    >
                      {tPrograms(`programs.${program}.name`)}
                    </a>
                  </li>
                ))}
              </ul>
            </>,
            document.body
          )
        : null}
      <span className={styles.affiliateLabel}>{t("affiliateLabel")}</span>
    </span>
  );
}
