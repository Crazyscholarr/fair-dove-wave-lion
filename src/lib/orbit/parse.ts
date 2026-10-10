import type { Chain, Proxy, ProxyProto, SecretKind } from "@/lib/orbit/types";

export type ParsedSecret = {
  label: string;
  chain: Chain;
  kind: SecretKind;
  secret: string;
};

const WORD = /^[a-z]+$/i;
const SEED_LENGTHS = new Set([12, 15, 18, 21, 24]);

export function parseSecrets(raw: string, chain: Chain): ParsedSecret[] {
  const out: ParsedSecret[] = [];
  const lines = raw.split(/\r?\n/);
  for (const original of lines) {
    let line = original.trim();
    if (!line || line.startsWith("#")) continue;
    line = line.replace(/^\d+[\.\)\-:]\s*/, "").replace(/^[-*•]\s*/, "").trim();
    let label = "";
    let body = line;
    const pipe = line.indexOf("|");
    if (pipe > 0) {
      label = line.slice(0, pipe).trim();
      body = line.slice(pipe + 1).trim();
    }
    body = body.replace(/^["']|["']$/g, "").trim();
    const words = body
      .toLowerCase()
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    if (
      SEED_LENGTHS.has(words.length) &&
      words.every((word) => WORD.test(word) && word.length > 1)
    ) {
      out.push({ label, chain, kind: "seed", secret: words.join(" ") });
      continue;
    }
    const hexBody = body.startsWith("0x") || body.startsWith("0X") ? body.slice(2) : body;
    if (/^[0-9a-fA-F]{64}$/.test(hexBody)) {
      out.push({
        label,
        chain: chain === "solana" ? "evm" : chain,
        kind: "privateKey",
        secret: `0x${hexBody.toLowerCase()}`,
      });
      continue;
    }
    if (/^[1-9A-HJ-NP-Za-km-z]{80,128}$/.test(body)) {
      out.push({ label, chain: "solana", kind: "privateKey", secret: body });
    }
  }
  return out;
}

export function parseExtId(input: string) {
  const match = input.trim().toLowerCase().match(/[a-p]{32}/);
  return match ? match[0] : null;
}

type ProxyDraft = Omit<Proxy, "id" | "latencyMs" | "alive">;

function draft(
  protocol: ProxyProto,
  host: string,
  port: number,
  username: string,
  password: string,
): ProxyDraft | null {
  if (!host || !Number.isFinite(port) || port < 1 || port > 65535) return null;
  return {
    label: host,
    protocol,
    host,
    port,
    username,
    password,
    country: "",
  };
}

export function parseProxyLine(line: string): ProxyDraft | null {
  const text = line.trim();
  if (!text || text.startsWith("#")) return null;
  const urlLike = text.match(/^(https?|socks5):\/\/(?:([^:@\s]+):([^@\s]+)@)?([^:\s\/]+):(\d+)/i);
  if (urlLike) {
    const protocol: ProxyProto = urlLike[1].toLowerCase() === "socks5" ? "socks5" : "http";
    return draft(protocol, urlLike[4], Number(urlLike[5]), urlLike[2] ?? "", urlLike[3] ?? "");
  }
  const parts = text.split(":");
  if ((parts.length === 2 || parts.length === 4) && /^\d+$/.test(parts[1] ?? "")) {
    return draft(
      "http",
      parts[0] ?? "",
      Number(parts[1]),
      parts[2] ?? "",
      parts[3] ?? "",
    );
  }
  return null;
}

export function parseProxies(raw: string) {
  const out: ProxyDraft[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const row = parseProxyLine(line);
    if (row) out.push(row);
  }
  return out;
}
