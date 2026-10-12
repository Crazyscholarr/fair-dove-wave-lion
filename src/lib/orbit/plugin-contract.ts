export const PLUGIN_OPS = `Các lệnh hợp lệ, mỗi lệnh là một object:
- {"op":"create_profiles","count":3,"base":"Farm","group":"Chung","os":"windows|macos|android","proxy":"none|round"}
- {"op":"select","names":["US-01"] | "all" | "idle"}
- {"op":"assign_proxy","profiles":["US-01"] | "selected" | "idle" | "all","proxy":"none|round|nhãn hoặc host:port"}
- {"op":"attach_extension","profiles":"selected","extension":"tên hoặc id"}
- {"op":"note","profile":"US-01","text":"ghi chú ngắn"}
- {"op":"assign_wallet","wallet":"nhãn hoặc địa chỉ","profile":"US-01 hoặc none"}
- {"op":"enqueue","profiles":"selected" | "idle" | ["US-01"]}
- {"op":"concurrency","n":2}
- {"op":"stop"}
- {"op":"clear_finished"}
- {"op":"say","text":"giải thích ngắn khi không làm được"}
Không xoá profile. Không nhận cụm từ, private key, mật khẩu.`;

const SECRET_KEY = /^(secret|seed|mnemonic|privatekey|private_key|passphrase|password)$/i;

export function containsSecret(value: unknown): boolean {
  if (typeof value === "string") return looksLikeSecret(value);
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsSecret);
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) return true;
    if (containsSecret(item)) return true;
  }
  return false;
}

export function looksLikeSecret(text: string) {
  const trimmed = text.trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return true;
  const words = trimmed.split(/\s+/);
  return words.length >= 12 && words.length <= 24 && words.every((word) => /^[a-z]+$/.test(word));
}

export function extractActions(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence?.[1] ?? trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI không trả JSON");
  return JSON.parse(body.slice(start, end + 1)) as unknown;
}
