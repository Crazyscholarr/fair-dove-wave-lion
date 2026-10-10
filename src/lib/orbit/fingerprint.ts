import type { Fingerprint, OsKind } from "@/lib/orbit/types";

const SCREENS: Record<OsKind, string[]> = {
  windows: ["1920×1080", "1536×864", "2560×1440", "1366×768"],
  macos: ["1440×900", "1512×982", "1728×1117", "2560×1440"],
  android: ["360×800", "393×873", "412×915"],
};

const TZ = [
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "America/Los_Angeles",
  "Europe/Berlin",
];

const LANG = ["vi-VN,vi,en-US", "en-US,en", "en-GB,en", "th-TH,th,en-US", "ja-JP,ja,en-US"];

const GPU = [
  "ANGLE (NVIDIA GeForce GTX 1650 Direct3D11)",
  "ANGLE (Intel(R) UHD Graphics 620 Direct3D11)",
  "ANGLE (AMD Radeon RX 580 Direct3D11)",
  "ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)",
];

const CHROME = ["128.0.6613.138", "129.0.6668.100", "130.0.6723.116", "131.0.6778.85"];

function pick<T>(list: T[], rnd: () => number) {
  return list[Math.floor(rnd() * list.length)] ?? list[0];
}

function hex(rnd: () => number, n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(rnd() * 16).toString(16);
  return s;
}

export function makeFingerprint(os: OsKind, rnd: () => number = Math.random): Fingerprint {
  const chrome = pick(CHROME, rnd);
  const platform = os === "windows" ? "Win32" : os === "macos" ? "MacIntel" : "Linux armv8l";
  let userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
  if (os === "macos") {
    userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
  }
  if (os === "android") {
    userAgent = `Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Mobile Safari/537.36`;
  }
  const cores = os === "android" ? pick([4, 8], rnd) : pick([4, 8, 12, 16], rnd);
  return {
    userAgent,
    platform,
    screen: pick(SCREENS[os], rnd),
    timezone: pick(TZ, rnd),
    language: pick(LANG, rnd),
    webgl: pick(GPU, rnd),
    cores,
    memory: pick([4, 8, 16], rnd),
    canvas: hex(rnd, 8),
    audio: hex(rnd, 8),
  };
}

export function seededRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
