import type { Chain, SecretKind } from "@/lib/orbit/types";

async function markOf(secret: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return [...new Uint8Array(buf)]
    .slice(0, 4)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function describeSecret(chain: Chain, kind: SecretKind, secret: string) {
  const mark = await markOf(secret);
  if (chain !== "evm") return { address: "", mark, valid: true };
  try {
    const { mnemonicToAccount, privateKeyToAccount } = await import("viem/accounts");
    if (kind === "privateKey") {
      const key = secret as `0x${string}`;
      if (!/^0x[0-9a-f]{64}$/.test(key)) return { address: "", mark, valid: false };
      return { address: privateKeyToAccount(key).address, mark, valid: true };
    }
    return { address: mnemonicToAccount(secret).address, mark, valid: true };
  } catch {
    return { address: "", mark, valid: false };
  }
}
