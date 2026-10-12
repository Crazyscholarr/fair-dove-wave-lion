import { containsSecret, extractActions } from "@/lib/orbit/plugin-contract";
import { clearFinished, setQueueConcurrency, startBatch, stopBatch } from "@/lib/orbit/runner";
import {
  addProfiles,
  assignWallet,
  patchProfile,
  setSelected,
  useOrbit,
} from "@/lib/orbit/store";
import type { OsKind, Profile } from "@/lib/orbit/types";

export type PluginResult = { ok: boolean; op: string; message: string };

type Target = string[] | "selected" | "idle" | "all";

const OS: OsKind[] = ["windows", "macos", "android"];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function profilesOf(spec: unknown): Profile[] | string {
  const state = useOrbit.getState();
  if (spec === "all") return state.profiles;
  if (spec === "idle") return state.profiles.filter((profile) => profile.status === "idle");
  if (spec === "selected" || spec == null) {
    const chosen = state.profiles.filter((profile) => state.selectedIds.includes(profile.id));
    return chosen.length ? chosen : "Chưa chọn profile";
  }
  if (!Array.isArray(spec)) return "Danh sách profile không hợp lệ";
  const found: Profile[] = [];
  const missing: string[] = [];
  for (const item of spec) {
    const name = text(item);
    const profile = state.profiles.find(
      (row) => row.id === name || row.name.toLowerCase() === name.toLowerCase(),
    );
    if (profile) found.push(profile);
    else if (name) missing.push(name);
  }
  if (missing.length) return `Không thấy profile ${missing.join(", ")}`;
  if (!found.length) return "Chưa chọn profile";
  return found;
}

function findProxy(token: string) {
  const key = token.toLowerCase();
  return useOrbit.getState().proxies.find((proxy) => {
    const host = `${proxy.host}:${proxy.port}`.toLowerCase();
    return proxy.label.toLowerCase() === key || proxy.host.toLowerCase() === key || host === key;
  });
}

function findExtension(token: string) {
  const key = token.toLowerCase();
  return useOrbit.getState().extensions.find(
    (item) => item.name.toLowerCase() === key || item.extId.toLowerCase() === key,
  );
}

function findWallet(token: string) {
  const key = token.toLowerCase();
  return useOrbit.getState().wallets.find(
    (wallet) =>
      wallet.label.toLowerCase() === key ||
      wallet.address.toLowerCase() === key ||
      (wallet.address && key.length >= 6 && wallet.address.toLowerCase().startsWith(key)),
  );
}

function one(action: Record<string, unknown>): PluginResult {
  const op = text(action.op);
  if (op === "say") {
    const message = text(action.text).slice(0, 240);
    return { ok: true, op, message: message || "Không có gì để nói" };
  }
  if (op === "create_profiles") {
    const count = Math.max(1, Math.min(100, Math.floor(Number(action.count)) || 1));
    const os = OS.includes(action.os as OsKind) ? (action.os as OsKind) : "windows";
    const proxy = action.proxy === "round" ? "round" : "none";
    const made = addProfiles({
      base: text(action.base) || "Profile",
      count,
      group: text(action.group) || "Chung",
      os,
      proxyMode: proxy,
      extensionIds: [],
    });
    return { ok: true, op, message: `Đã tạo ${made} profile` };
  }
  if (op === "select") {
    const names = action.names;
    const rows =
      names === "all" || names === "idle" ? profilesOf(names) : profilesOf(Array.isArray(names) ? names : []);
    if (typeof rows === "string") return { ok: false, op, message: rows };
    setSelected(rows.map((profile) => profile.id));
    return { ok: true, op, message: `Đã chọn ${rows.length} profile` };
  }
  if (op === "assign_proxy") {
    const rows = profilesOf(action.profiles as Target);
    if (typeof rows === "string") return { ok: false, op, message: rows };
    const proxyToken = text(action.proxy);
    if (!proxyToken) return { ok: false, op, message: "Thiếu proxy" };
    if (proxyToken === "none") {
      for (const profile of rows) patchProfile(profile.id, { proxyId: null });
      return { ok: true, op, message: `Gỡ proxy khỏi ${rows.length} profile` };
    }
    if (proxyToken === "round") {
      const pool = useOrbit.getState().proxies;
      if (!pool.length) return { ok: false, op, message: "Chưa có proxy" };
      rows.forEach((profile, index) => {
        patchProfile(profile.id, { proxyId: pool[index % pool.length]?.id ?? null });
      });
      return { ok: true, op, message: `Gắn proxy vòng cho ${rows.length} profile` };
    }
    const proxy = findProxy(proxyToken);
    if (!proxy) return { ok: false, op, message: `Không thấy proxy ${proxyToken}` };
    for (const profile of rows) patchProfile(profile.id, { proxyId: proxy.id });
    return { ok: true, op, message: `Gắn ${proxy.label} cho ${rows.length} profile` };
  }
  if (op === "attach_extension") {
    const rows = profilesOf(action.profiles as Target);
    if (typeof rows === "string") return { ok: false, op, message: rows };
    const extension = findExtension(text(action.extension));
    if (!extension) return { ok: false, op, message: "Không thấy extension" };
    for (const profile of rows) {
      if (!profile.extensionIds.includes(extension.id)) {
        patchProfile(profile.id, { extensionIds: [...profile.extensionIds, extension.id] });
      }
    }
    return { ok: true, op, message: `Nạp ${extension.name} cho ${rows.length} profile` };
  }
  if (op === "note") {
    const rows = profilesOf([text(action.profile)]);
    if (typeof rows === "string") return { ok: false, op, message: rows };
    const note = text(action.text).slice(0, 240);
    patchProfile(rows[0].id, { notes: note });
    return { ok: true, op, message: `Đã ghi chú ${rows[0].name}` };
  }
  if (op === "assign_wallet") {
    const state = useOrbit.getState();
    if (state.vaultOn && state.locked) return { ok: false, op, message: "Kho ví đang khoá" };
    const wallet = findWallet(text(action.wallet));
    if (!wallet) return { ok: false, op, message: "Không thấy ví đã nhập" };
    const target = text(action.profile);
    if (!target || target.toLowerCase() === "none") {
      assignWallet(wallet.id, null);
      return { ok: true, op, message: `Gỡ ${wallet.label} khỏi profile` };
    }
    const rows = profilesOf([target]);
    if (typeof rows === "string") return { ok: false, op, message: rows };
    assignWallet(wallet.id, rows[0].id);
    return { ok: true, op, message: `Gán ${wallet.label} vào ${rows[0].name}` };
  }
  if (op === "enqueue") {
    const rows = profilesOf((action.profiles as Target) ?? "selected");
    if (typeof rows === "string") return { ok: false, op, message: rows };
    const ok = startBatch(rows.map((profile) => profile.id));
    return ok
      ? { ok: true, op, message: `Đưa ${rows.length} profile vào hàng` }
      : { ok: false, op, message: "Không đưa được vào hàng" };
  }
  if (op === "concurrency") {
    const n = Math.max(1, Math.min(5, Math.round(Number(action.n)) || 1));
    setQueueConcurrency(n);
    return { ok: true, op, message: `Song song ${n}` };
  }
  if (op === "stop") {
    stopBatch();
    return { ok: true, op, message: "Đã dừng hàng đợi" };
  }
  if (op === "clear_finished") {
    clearFinished();
    return { ok: true, op, message: "Đã xoá lịch sử hàng" };
  }
  return { ok: false, op: op || "?", message: "Lệnh không được phép" };
}

export function publicSnapshot() {
  const state = useOrbit.getState();
  return {
    profiles: state.profiles.map((profile) => ({
      name: profile.name,
      group: profile.group,
      os: profile.os,
      status: profile.status,
      notes: profile.notes,
      proxy: state.proxies.find((proxy) => proxy.id === profile.proxyId)?.label ?? null,
      extensions: profile.extensionIds
        .map((id) => state.extensions.find((item) => item.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
      wallets: state.wallets
        .filter((wallet) => wallet.profileId === profile.id)
        .map((wallet) => wallet.label),
    })),
    proxies: state.proxies.map((proxy) => ({
      label: proxy.label,
      protocol: proxy.protocol,
      host: proxy.host,
      port: proxy.port,
      country: proxy.country,
      alive: proxy.alive,
    })),
    extensions: state.extensions.map((item) => ({ name: item.name, extId: item.extId })),
    wallets: state.wallets.map((wallet) => ({
      label: wallet.label,
      chain: wallet.chain,
      address: wallet.address,
      profile: state.profiles.find((profile) => profile.id === wallet.profileId)?.name ?? null,
      valid: wallet.valid,
    })),
    vaultLocked: state.vaultOn && state.locked,
    selected: state.profiles
      .filter((profile) => state.selectedIds.includes(profile.id))
      .map((profile) => profile.name),
    queue: {
      queued: state.jobs.filter((job) => job.status === "queued").length,
      running: state.jobs.filter((job) => job.status === "running").length,
    },
  };
}

export function runPlugin(input: unknown): PluginResult[] {
  if (containsSecret(input)) {
    return [{ ok: false, op: "blocked", message: "Lệnh bị chặn vì có vẻ chứa cụm từ hoặc private key" }];
  }
  const record = asRecord(input);
  const list = Array.isArray(input) ? input : record && Array.isArray(record.actions) ? record.actions : null;
  if (!list) return [{ ok: false, op: "blocked", message: "Cần một mảng lệnh hoặc { actions: [] }" }];
  if (list.length > 20) return [{ ok: false, op: "blocked", message: "Tối đa 20 lệnh mỗi lần" }];
  return list.map((item) => {
    const action = asRecord(item);
    if (!action) return { ok: false, op: "?", message: "Lệnh không hợp lệ" };
    if (containsSecret(action)) {
      return { ok: false, op: text(action.op) || "?", message: "Bị chặn vì có bí mật" };
    }
    return one(action);
  });
}

export function runPluginText(raw: string) {
  const parsed = JSON.parse(raw) as unknown;
  return runPlugin(parsed);
}

export function actionsFromModel(text: string) {
  const parsed = extractActions(text);
  return runPlugin(parsed);
}

export function installOrbitPlugin() {
  if (typeof window === "undefined") return;
  window.orbitPlugin = {
    snapshot: publicSnapshot,
    run: runPlugin,
  };
}

declare global {
  interface Window {
    orbitPlugin?: {
      snapshot: typeof publicSnapshot;
      run: typeof runPlugin;
    };
  }
}
