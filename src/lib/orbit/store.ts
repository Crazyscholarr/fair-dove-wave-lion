import { create } from "zustand";
import { makeFingerprint } from "@/lib/orbit/fingerprint";
import { uid } from "@/lib/orbit/format";
import { seedExtensions, seedProfiles, seedProxies } from "@/lib/orbit/seed";
import type {
  Extension,
  Job,
  OsKind,
  Profile,
  Proxy,
  VaultBlob,
  Wallet,
} from "@/lib/orbit/types";
import { decryptJson, encryptJson } from "@/lib/orbit/vault";

const KEY = "orbit.console.v1";

export type OrbitData = {
  profiles: Profile[];
  proxies: Proxy[];
  extensions: Extension[];
  wallets: Wallet[];
  jobs: Job[];
  selectedIds: string[];
  vaultOn: boolean;
  locked: boolean;
  vaultBlob: VaultBlob | null;
  notice: string | null;
};

type Disk = {
  v: 1;
  profiles: Profile[];
  proxies: Proxy[];
  extensions: Extension[];
  jobs: Job[];
  wallets?: Wallet[];
  vault?: VaultBlob | null;
};

function initial(): OrbitData {
  return {
    profiles: seedProfiles,
    proxies: seedProxies,
    extensions: seedExtensions,
    wallets: [],
    jobs: [],
    selectedIds: [],
    vaultOn: false,
    locked: false,
    vaultBlob: null,
    notice: null,
  };
}

export const useOrbit = create<OrbitData>(initial);

let sessionPass: string | null = null;
let hydrated = false;
let chain: Promise<void> = Promise.resolve();
let noticeTimer = 0;

function publicSlice(s: OrbitData) {
  return {
    v: 1 as const,
    profiles: s.profiles,
    proxies: s.proxies,
    extensions: s.extensions,
    jobs: s.jobs,
  };
}

async function commit() {
  const s = useOrbit.getState();
  const body = publicSlice(s);
  try {
    if (s.vaultOn && sessionPass) {
      const vault = await encryptJson(sessionPass, useOrbit.getState().wallets);
      useOrbit.setState({ vaultBlob: vault });
      localStorage.setItem(KEY, JSON.stringify({ ...publicSlice(useOrbit.getState()), vault }));
      return;
    }
    if (s.vaultOn) {
      localStorage.setItem(
        KEY,
        JSON.stringify({ ...body, vault: useOrbit.getState().vaultBlob }),
      );
      return;
    }
    localStorage.setItem(KEY, JSON.stringify({ ...body, wallets: useOrbit.getState().wallets }));
  } catch (error) {
    console.error(error);
    notify("Không lưu được trên trình duyệt này");
  }
}

export function persist() {
  chain = chain.then(() => commit()).catch((error) => {
    console.error(error);
  });
}

export function notify(message: string) {
  useOrbit.setState({ notice: message });
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    useOrbit.setState({ notice: null });
  }, 3200);
}

function readDisk(): Disk | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Disk;
    if (data?.v !== 1 || !Array.isArray(data.profiles)) return null;
    return data;
  } catch {
    return null;
  }
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const disk = readDisk();
  if (!disk) {
    persist();
    return;
  }
  sessionPass = null;
  useOrbit.setState({
    profiles: disk.profiles,
    proxies: disk.proxies ?? [],
    extensions: disk.extensions ?? [],
    jobs: (disk.jobs ?? []).map((job) =>
      job.status === "running" || job.status === "queued"
        ? {
            ...job,
            status: "stopped",
            log: [...job.log, "Phiên trước đã đóng"],
            finishedAt: Date.now(),
          }
        : job,
    ),
    wallets: disk.vault ? [] : (disk.wallets ?? []),
    vaultOn: Boolean(disk.vault),
    locked: Boolean(disk.vault),
    vaultBlob: disk.vault ?? null,
    selectedIds: [],
  });
}

export function patchProfile(id: string, patch: Partial<Profile>) {
  useOrbit.setState((s) => ({
    profiles: s.profiles.map((profile) => (profile.id === id ? { ...profile, ...patch } : profile)),
  }));
  persist();
}

export function addProfiles(input: {
  base: string;
  count: number;
  group: string;
  os: OsKind;
  proxyMode: "none" | "round";
  extensionIds: string[];
}) {
  const count = Math.max(1, Math.min(100, Math.floor(input.count) || 1));
  useOrbit.setState((s) => {
    const made: Profile[] = [];
    const stem = input.base.trim() || "Profile";
    for (let i = 0; i < count; i++) {
      const names = new Set([...s.profiles, ...made].map((profile) => profile.name));
      let n = 1;
      while (names.has(`${stem}-${String(n).padStart(2, "0")}`)) n += 1;
      const proxyId =
        input.proxyMode === "round" && s.proxies.length
          ? (s.proxies[(s.profiles.length + i) % s.proxies.length]?.id ?? null)
          : null;
      made.push({
        id: uid(),
        name: `${stem}-${String(n).padStart(2, "0")}`,
        group: input.group.trim() || "Chung",
        os: input.os,
        notes: "",
        proxyId,
        extensionIds: [...input.extensionIds],
        fingerprint: makeFingerprint(input.os),
        status: "idle",
        createdAt: Date.now(),
        lastRunAt: null,
      });
    }
    return { profiles: [...s.profiles, ...made] };
  });
  persist();
  return count;
}

export function duplicateProfile(id: string) {
  const source = useOrbit.getState().profiles.find((profile) => profile.id === id);
  if (!source) return;
  const copy: Profile = {
    ...source,
    id: uid(),
    name: `${source.name} bản`,
    fingerprint: makeFingerprint(source.os),
    status: "idle",
    createdAt: Date.now(),
    lastRunAt: null,
    extensionIds: [...source.extensionIds],
  };
  useOrbit.setState((s) => ({ profiles: [...s.profiles, copy] }));
  persist();
}

export function removeProfiles(ids: string[]) {
  const drop = new Set(ids);
  useOrbit.setState((s) => ({
    profiles: s.profiles.filter((profile) => !drop.has(profile.id)),
    wallets: s.wallets.map((wallet) =>
      wallet.profileId && drop.has(wallet.profileId) ? { ...wallet, profileId: null } : wallet,
    ),
    selectedIds: s.selectedIds.filter((id) => !drop.has(id)),
  }));
  persist();
}

export function toggleProfileExtension(profileId: string, extensionId: string) {
  useOrbit.setState((s) => ({
    profiles: s.profiles.map((profile) => {
      if (profile.id !== profileId) return profile;
      const has = profile.extensionIds.includes(extensionId);
      return {
        ...profile,
        extensionIds: has
          ? profile.extensionIds.filter((id) => id !== extensionId)
          : [...profile.extensionIds, extensionId],
      };
    }),
  }));
  persist();
}

export function toggleSelected(id: string) {
  useOrbit.setState((s) => ({
    selectedIds: s.selectedIds.includes(id)
      ? s.selectedIds.filter((item) => item !== id)
      : [...s.selectedIds, id],
  }));
}

export function setSelected(ids: string[]) {
  useOrbit.setState({ selectedIds: ids });
}

export function addProxies(rows: Omit<Proxy, "id" | "latencyMs" | "alive">[]) {
  if (!rows.length) return 0;
  useOrbit.setState((s) => ({
    proxies: [
      ...s.proxies,
      ...rows.map((row) => ({ ...row, id: uid(), latencyMs: null, alive: null })),
    ],
  }));
  persist();
  return rows.length;
}

export function removeProxies(ids: string[]) {
  const drop = new Set(ids);
  useOrbit.setState((s) => ({
    proxies: s.proxies.filter((proxy) => !drop.has(proxy.id)),
    profiles: s.profiles.map((profile) =>
      profile.proxyId && drop.has(profile.proxyId) ? { ...profile, proxyId: null } : profile,
    ),
  }));
  persist();
}

export async function checkProxy(id: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 420 + Math.random() * 700));
  const alive = Math.random() > 0.18;
  useOrbit.setState((s) => ({
    proxies: s.proxies.map((proxy) =>
      proxy.id === id
        ? { ...proxy, alive, latencyMs: alive ? 35 + Math.floor(Math.random() * 420) : null }
        : proxy,
    ),
  }));
  persist();
}

export function addExtension(row: Omit<Extension, "id">) {
  const exists = useOrbit
    .getState()
    .extensions.some((item) => item.extId.toLowerCase() === row.extId.toLowerCase());
  if (exists) {
    notify("Extension này đã có trong thư viện");
    return false;
  }
  useOrbit.setState((s) => ({ extensions: [...s.extensions, { ...row, id: uid() }] }));
  persist();
  return true;
}

export function removeExtensions(ids: string[]) {
  const drop = new Set(ids);
  useOrbit.setState((s) => ({
    extensions: s.extensions.filter((item) => !drop.has(item.id)),
    profiles: s.profiles.map((profile) => ({
      ...profile,
      extensionIds: profile.extensionIds.filter((id) => !drop.has(id)),
    })),
  }));
  persist();
}

export function addWallets(
  rows: Omit<Wallet, "id" | "createdAt" | "profileId">[],
  assign: { mode: "none" } | { mode: "one"; profileId: string } | { mode: "round"; profileIds: string[] },
) {
  if (!rows.length) return 0;
  useOrbit.setState((s) => {
    const made = rows.map((row, index) => {
      let profileId: string | null = null;
      if (assign.mode === "one") profileId = assign.profileId || null;
      if (assign.mode === "round" && assign.profileIds.length) {
        profileId = assign.profileIds[index % assign.profileIds.length] ?? null;
      }
      return {
        ...row,
        id: uid(),
        createdAt: Date.now(),
        profileId,
        label: row.label.trim() || `Ví ${String(s.wallets.length + index + 1).padStart(2, "0")}`,
      };
    });
    return { wallets: [...s.wallets, ...made] };
  });
  persist();
  return rows.length;
}

export function assignWallet(id: string, profileId: string | null) {
  useOrbit.setState((s) => ({
    wallets: s.wallets.map((wallet) => (wallet.id === id ? { ...wallet, profileId } : wallet)),
  }));
  persist();
}

export function renameWallet(id: string, label: string) {
  useOrbit.setState((s) => ({
    wallets: s.wallets.map((wallet) => (wallet.id === id ? { ...wallet, label } : wallet)),
  }));
  persist();
}

export function removeWallets(ids: string[]) {
  const drop = new Set(ids);
  useOrbit.setState((s) => ({ wallets: s.wallets.filter((wallet) => !drop.has(wallet.id)) }));
  persist();
}

export async function enableVault(passphrase: string) {
  const pass = passphrase.trim();
  if (pass.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
  sessionPass = pass;
  const vault = await encryptJson(pass, useOrbit.getState().wallets);
  useOrbit.setState({ vaultOn: true, locked: false, vaultBlob: vault });
  persist();
}

export function lockVault() {
  if (!useOrbit.getState().vaultOn) return;
  const pass = sessionPass;
  sessionPass = null;
  useOrbit.setState({ locked: true });
  chain = chain.then(async () => {
    const wallets = useOrbit.getState().wallets;
    const blob = pass ? await encryptJson(pass, wallets) : useOrbit.getState().vaultBlob;
    useOrbit.setState({ vaultBlob: blob, wallets: [] });
    const s = useOrbit.getState();
    localStorage.setItem(KEY, JSON.stringify({ ...publicSlice(s), vault: blob }));
  });
}

export async function unlockVault(passphrase: string) {
  const blob = useOrbit.getState().vaultBlob;
  if (!blob) throw new Error("Chưa có kho");
  const wallets = await decryptJson<Wallet[]>(passphrase, blob);
  if (!Array.isArray(wallets)) throw new Error("Kho hỏng");
  sessionPass = passphrase;
  useOrbit.setState({ wallets, locked: false });
}

export function disableVault() {
  if (!useOrbit.getState().vaultOn) return;
  if (useOrbit.getState().locked || !sessionPass) {
    throw new Error("Mở khoá trước khi gỡ mật khẩu");
  }
  sessionPass = null;
  useOrbit.setState({ vaultOn: false, vaultBlob: null, locked: false });
  persist();
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
