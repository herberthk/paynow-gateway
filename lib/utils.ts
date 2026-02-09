import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//If date is greater than 24 hours, return the date in format dd/mm, if date is greater that current year return full date else return the time
export const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  if (hours > 24) {
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
    } else {
      return date.toLocaleDateString();
    }
  } else {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
};
