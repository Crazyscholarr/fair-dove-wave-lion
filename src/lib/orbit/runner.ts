import { uid } from "@/lib/orbit/format";
import type { Job, Profile } from "@/lib/orbit/types";
import { STEPS } from "@/lib/orbit/types";
import { notify, persist, useOrbit, type OrbitData } from "@/lib/orbit/store";

let timer: number | null = null;
let concurrency = 2;

export function setQueueConcurrency(value: number) {
  concurrency = Math.max(1, Math.min(5, Math.round(value) || 1));
  if (useOrbit.getState().concurrency !== concurrency) {
    useOrbit.setState({ concurrency });
  }
}

function short(value: string) {
  if (value.length < 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function perform(job: Job, state: OrbitData): Job {
  const log = [...job.log];
  const profile = state.profiles.find((item) => item.id === job.profileId);
  if (!profile) {
    log.push("Profile đã bị xoá");
    return { ...job, status: "failed", log, finishedAt: Date.now() };
  }
  let status: Job["status"] = "running";
  let line = "";
  if (job.step === 0) {
    line = `${profile.fingerprint.platform} · ${profile.fingerprint.screen} · ${profile.fingerprint.timezone}`;
  } else if (job.step === 1) {
    const proxy = profile.proxyId
      ? state.proxies.find((item) => item.id === profile.proxyId)
      : null;
    if (!proxy) line = "Không gắn proxy — bỏ qua";
    else if (proxy.alive === false) {
      line = `Proxy chết ${proxy.host}:${proxy.port}`;
      status = "failed";
    } else {
      const auth = proxy.username ? " · có xác thực" : "";
      const latency = proxy.latencyMs ? ` · ${proxy.latencyMs} ms` : "";
      line = `${proxy.protocol}://${proxy.host}:${proxy.port}${auth}${latency}`;
    }
  } else if (job.step === 2) {
    const names = profile.extensionIds
      .map((id) => state.extensions.find((item) => item.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    line = names.length ? `Nạp ${names.join(", ")}` : "Không nạp extension";
  } else if (job.step === 3) {
    const wallets = state.wallets.filter((wallet) => wallet.profileId === profile.id && wallet.secret);
    if (!wallets.length) {
      line = "Không có ví để đăng nhập";
      status = "failed";
    } else {
      line = wallets
        .map((wallet) => {
          const detail = wallet.kind === "seed" ? `${wallet.secret.trim().split(/\s+/).length} từ` : "khoá riêng";
          const who = wallet.address ? short(wallet.address) : `dấu ${wallet.mark}`;
          const flag = wallet.valid ? "" : " · không hợp lệ";
          return `${wallet.label} · ${wallet.chain} · ${detail} · ${who}${flag}`;
        })
        .join(" | ");
    }
  } else if (job.step === 4) {
    line = "Mở khoá ví trên profile";
  } else {
    line = "Profile sẵn sàng";
    status = "done";
  }
  log.push(line);
  if (status === "failed" || status === "done") {
    return { ...job, status, log, finishedAt: Date.now() };
  }
  return { ...job, status: "running", step: Math.min(job.step + 1, STEPS.length - 1), log };
}

function advance(state: OrbitData) {
  const jobs = state.jobs.map((job) => ({ ...job, log: [...job.log] }));
  const patches = new Map<string, Partial<Profile>>();
  const touch = (id: string, patch: Partial<Profile>) => {
    patches.set(id, { ...patches.get(id), ...patch });
  };
  let terminal = false;
  const just = new Set<string>();
  let running = jobs.filter((job) => job.status === "running").length;
  for (const job of jobs) {
    if (running >= concurrency) break;
    if (job.status !== "queued") continue;
    job.status = "running";
    job.log.push("Bắt đầu phiên");
    just.add(job.id);
    running += 1;
    touch(job.profileId, { status: "running" });
  }
  for (const job of jobs) {
    if (job.status !== "running" || just.has(job.id)) continue;
    const next = perform(job, state);
    jobs[jobs.indexOf(job)] = next;
    if (next.status === "done") {
      terminal = true;
      touch(job.profileId, { status: "idle", lastRunAt: next.finishedAt });
    } else if (next.status === "failed") {
      terminal = true;
      touch(job.profileId, { status: "error" });
    }
  }
  const profiles = state.profiles.map((profile) =>
    patches.has(profile.id) ? { ...profile, ...patches.get(profile.id) } : profile,
  );
  return { jobs, profiles, terminal };
}

function tick() {
  let terminal = false;
  useOrbit.setState((state) => {
    const next = advance(state);
    terminal = next.terminal;
    return { jobs: next.jobs, profiles: next.profiles };
  });
  const left = useOrbit.getState().jobs.some((job) => job.status === "queued" || job.status === "running");
  if (terminal || !left) persist();
  if (!left && timer != null) {
    window.clearInterval(timer);
    timer = null;
  }
}

function ensureTimer() {
  if (timer != null) return;
  tick();
  timer = window.setInterval(tick, 700);
}

export function startBatch(profileIds: string[]) {
  const state = useOrbit.getState();
  if (state.vaultOn && state.locked) {
    notify("Mở khoá kho ví trước khi chạy");
    return false;
  }
  const active = new Set(
    state.jobs.filter((job) => job.status === "queued" || job.status === "running").map((job) => job.profileId),
  );
  const ids = [...new Set(profileIds)].filter((id) => !active.has(id));
  if (!ids.length) {
    notify(profileIds.length ? "Profile này đã ở trong hàng" : "Chọn ít nhất một profile");
    return false;
  }
  const jobs: Job[] = ids.map((id) => {
    const profile = state.profiles.find((item) => item.id === id);
    const labels = state.wallets.filter((wallet) => wallet.profileId === id).map((wallet) => wallet.label);
    return {
      id: uid(),
      profileId: id,
      profileName: profile?.name ?? id,
      walletLabel: labels.join(", ") || "—",
      status: "queued",
      step: 0,
      log: ["Vào hàng đợi"],
      startedAt: Date.now(),
      finishedAt: null,
    };
  });
  useOrbit.setState((current) => ({ jobs: [...jobs, ...current.jobs].slice(0, 40) }));
  persist();
  ensureTimer();
  return true;
}

export function stopBatch() {
  if (timer != null) {
    window.clearInterval(timer);
    timer = null;
  }
  useOrbit.setState((state) => ({
    jobs: state.jobs.map((job) =>
      job.status === "queued" || job.status === "running"
        ? { ...job, status: "stopped", log: [...job.log, "Đã dừng"], finishedAt: Date.now() }
        : job,
    ),
    profiles: state.profiles.map((profile) =>
      profile.status === "running" ? { ...profile, status: "idle" } : profile,
    ),
  }));
  persist();
}

export function clearFinished() {
  useOrbit.setState((state) => ({
    jobs: state.jobs.filter((job) => job.status === "queued" || job.status === "running"),
  }));
  persist();
}
