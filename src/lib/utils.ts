import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Latin digits to Persian digits. */
export function toFa(value: string | number) {
  return String(value).replace(/\d/g, (d) => faDigits[Number(d)]);
}
