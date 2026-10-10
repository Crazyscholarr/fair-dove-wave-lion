export type OsKind = "windows" | "macos" | "android";
export type ProxyProto = "http" | "socks5";
export type Chain = "evm" | "solana" | "aptos" | "sui" | "ton";
export type SecretKind = "seed" | "privateKey";
export type ProfileStatus = "idle" | "running" | "error";
export type JobStatus = "queued" | "running" | "done" | "failed" | "stopped";

export type Fingerprint = {
  userAgent: string;
  platform: string;
  screen: string;
  timezone: string;
  language: string;
  webgl: string;
  cores: number;
  memory: number;
  canvas: string;
  audio: string;
};

export type Profile = {
  id: string;
  name: string;
  group: string;
  os: OsKind;
  notes: string;
  proxyId: string | null;
  extensionIds: string[];
  fingerprint: Fingerprint;
  status: ProfileStatus;
  createdAt: number;
  lastRunAt: number | null;
};

export type Proxy = {
  id: string;
  label: string;
  protocol: ProxyProto;
  host: string;
  port: number;
  username: string;
  password: string;
  country: string;
  latencyMs: number | null;
  alive: boolean | null;
};

export type Extension = {
  id: string;
  name: string;
  extId: string;
  kind: "store" | "file";
  version: string;
};

export type Wallet = {
  id: string;
  label: string;
  chain: Chain;
  kind: SecretKind;
  secret: string;
  address: string;
  mark: string;
  valid: boolean;
  profileId: string | null;
  createdAt: number;
};

export type Job = {
  id: string;
  profileId: string;
  profileName: string;
  walletLabel: string;
  status: JobStatus;
  step: number;
  log: string[];
  startedAt: number;
  finishedAt: number | null;
};

export type VaultBlob = {
  salt: string;
  iv: string;
  data: string;
};

export const STEPS = [
  "Mở profile",
  "Gắn proxy",
  "Nạp extension",
  "Nạp ví",
  "Mở khoá",
  "Sẵn sàng",
] as const;
