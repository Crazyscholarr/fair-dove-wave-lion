import type { Chain, OsKind, ProfileStatus } from "@/lib/orbit/types";

export const OS_LABEL: Record<OsKind, string> = {
  windows: "Windows",
  macos: "macOS",
  android: "Android",
};

export const CHAIN_LABEL: Record<Chain, string> = {
  evm: "EVM",
  solana: "Solana",
  aptos: "Aptos",
  sui: "Sui",
  ton: "TON",
};

export const STATUS_LABEL: Record<ProfileStatus, string> = {
  idle: "Nghỉ",
  running: "Đang mở",
  error: "Lỗi",
};

export function shortAddr(value: string) {
  if (value.length < 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function ago(ts: number | null) {
  if (!ts) return "chưa chạy";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s} giây trước`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} giờ trước`;
  return `${Math.round(h / 24)} ngày trước`;
}

export function uid() {
  return crypto.randomUUID();
}
