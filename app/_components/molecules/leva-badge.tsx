import { getLevaTier } from "../../_lib/opportunity-display";
import styles from "../../styles/app.module.scss";

export function LevaBadge({ leva }: { leva: number }) {
  const tier = getLevaTier(leva);

  return (
    <span className={`${styles.levaBadge} ${styles[`levaBadge_${tier}`]}`}>
      {leva.toFixed(1)}×
    </span>
  );
}
