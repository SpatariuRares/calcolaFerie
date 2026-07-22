"use client";

import { useId, useState, type FormEvent } from "react";
import { NewsletterConsentText } from "../atoms/newsletter-consent-text";
import type { NewsletterStatus } from "../planner-types";
import styles from "../../styles/app.module.scss";

export function NewsletterSignup({ isVisible }: { isVisible: boolean }) {
  const emailId = useId();
  const consentId = useId();
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const canSubmit = email.trim() !== "" && hasConsent && !isSubmitting;

  if (!isVisible) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: hasConsent }),
      });

      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.newsletterPanel} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>Newsletter</p>
        <h2>Aggiornamenti utili</h2>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          autoComplete="email"
          className={styles.input}
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </div>

      <label className={styles.checkboxLine} htmlFor={consentId}>
        <input
          id={consentId}
          checked={hasConsent}
          onChange={(event) => setHasConsent(event.target.checked)}
          type="checkbox"
        />
        <span>
          <NewsletterConsentText />
        </span>
      </label>

      <button className={styles.primaryButton} disabled={!canSubmit} type="submit">
        {isSubmitting ? "Invio..." : "Iscrivimi"}
      </button>

      {status === "success" ? (
        <p className={styles.shareStatus} role="status">
          Controlla la tua email per confermare l'iscrizione.
        </p>
      ) : null}
      {status === "error" ? (
        <p className={styles.formError} role="alert">
          Iscrizione non riuscita. Riprova tra poco.
        </p>
      ) : null}
    </form>
  );
}
