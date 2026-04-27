import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random rotation between -2 and 2 degrees for sticky notes
export function randomRotation(seed: string): number {
  // Deterministic based on post id so it doesn't change on re-render
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 200) / 100) - 1; // -2 to 2
}

// Post type config
export const POST_TYPE_CONFIG = {
  ANNOUNCEMENT: {
    label: "Thông báo",
    icon: "📢",
    color: "#FFD166",
    stripColor: "bg-cb-yellow",
    badgeClass: "bg-cb-yellow text-yellow-900",
  },
  BORROWING: {
    label: "Cho/Mượn đồ",
    icon: "🔄",
    color: "#06D6A0",
    stripColor: "bg-cb-mint",
    badgeClass: "bg-cb-mint text-green-900",
  },
  QNA: {
    label: "Hỏi & Đáp",
    icon: "❓",
    color: "#118AB2",
    stripColor: "bg-cb-blue",
    badgeClass: "bg-cb-blue text-white",
  },
} as const;

// Post status config
export const POST_STATUS_CONFIG = {
  OPEN: {
    label: "Còn trống",
    badgeClass: "bg-cb-mint text-green-900",
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    badgeClass: "bg-cb-yellow text-yellow-900",
  },
  DONE: {
    label: "Đã xong",
    badgeClass: "bg-gray-200 text-gray-600",
  },
} as const;

// Board color options
export const BOARD_COLORS = [
  { value: "#FFD166", label: "Vàng" },
  { value: "#06D6A0", label: "Xanh lá" },
  { value: "#F24236", label: "Đỏ" },
  { value: "#118AB2", label: "Xanh dương" },
  { value: "#1A1A2E", label: "Đen" },
] as const;

// Board emoji options
export const BOARD_EMOJIS = ["🏘️", "🏢", "🏫", "🌆", "👨‍👩‍👧", "🎯", "🏠", "🌳"];

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return "Vừa xong";
}
