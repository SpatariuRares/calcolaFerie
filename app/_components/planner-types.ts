import type { DayOff } from "@engine";

export type DayOffRow = Omit<DayOff, "date"> & { date: string; id: string };
export type NewsletterStatus = "idle" | "success" | "error";
