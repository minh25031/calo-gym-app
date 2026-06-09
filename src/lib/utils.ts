import { format, formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy", { locale: vi })
}

export function formatTimeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

export function formatCalories(cal: number) {
  return cal.toLocaleString("vi-VN") + " kcal"
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}
