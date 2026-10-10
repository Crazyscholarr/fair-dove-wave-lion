import type { VaultBlob } from "@/lib/orbit/types";

function bytesToB64(bytes: Uint8Array) {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin);
}

function b64ToBytes(value: string) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const saltCopy = new Uint8Array(salt.byteLength);
  saltCopy.set(salt);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltCopy, iterations: 80_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(passphrase: string, data: unknown): Promise<VaultBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    data: bytesToB64(new Uint8Array(buf)),
  };
}

export async function decryptJson<T>(passphrase: string, blob: VaultBlob): Promise<T> {
  try {
    const salt = b64ToBytes(blob.salt);
    const iv = b64ToBytes(blob.iv);
    const data = b64ToBytes(blob.data);
    const key = await deriveKey(passphrase, salt);
    const ivCopy = new Uint8Array(iv.byteLength);
    ivCopy.set(iv);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivCopy }, key, data);
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    throw new Error("Sai mật khẩu hoặc kho bị hỏng");
  }
}
