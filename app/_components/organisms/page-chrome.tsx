import type { ReactNode } from "react";
import styles from "@styles/app.module.scss";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

export function PageChrome({ children }: { children: ReactNode }) {
  return (
    <main className={styles.pageShell}>
      <SiteNav />
      {children}
      <SiteFooter />
    </main>
  );
}
