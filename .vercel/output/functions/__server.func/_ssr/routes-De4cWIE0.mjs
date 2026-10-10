import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as KeyRound, i as ListOrdered, o as AppWindow, r as Puzzle, t as Waypoints } from "../_libs/lucide-react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-De4cWIE0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "10.5",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "2.4",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "25.2",
				cy: "11.2",
				r: "2",
				fill: "currentColor"
			})
		]
	});
}
function StatusDot({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("inline-block size-2 rounded-full", status === "running" ? "bg-sage dot-live" : status === "error" ? "bg-danger" : "bg-muted") });
}
var buttonStyles = {
	primary: "bg-sage text-bg hover:opacity-90",
	quiet: "bg-elevated text-fg hover:opacity-90",
	ghost: "bg-transparent text-fg hover:bg-elevated",
	danger: "bg-transparent text-danger hover:bg-elevated"
};
function Button({ variant = "ghost", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium disabled:opacity-40", buttonStyles[variant], className),
		...props
	});
}
var fieldClass = "h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none placeholder:text-muted md:text-sm";
function Modal({ open, onClose, title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => !next && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center",
			onMouseDown: (event) => {
				if (event.target === event.currentTarget) onClose();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-full w-full max-w-lg overflow-y-auto rounded-md border border-line bg-surface p-4 text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-lg font-medium",
						children: title
					}),
					description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "mt-1 text-sm text-muted",
						children: description
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "sr-only",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children
					})
				]
			})
		})] })
	});
}
var WORD = /^[a-z]+$/i;
var SEED_LENGTHS = /* @__PURE__ */ new Set([
	12,
	15,
	18,
	21,
	24
]);
function parseSecrets(raw, chain) {
	const out = [];
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
		const words = body.toLowerCase().replace(/,/g, " ").split(/\s+/).filter(Boolean);
		if (SEED_LENGTHS.has(words.length) && words.every((word) => WORD.test(word) && word.length > 1)) {
			out.push({
				label,
				chain,
				kind: "seed",
				secret: words.join(" ")
			});
			continue;
		}
		const hexBody = body.startsWith("0x") || body.startsWith("0X") ? body.slice(2) : body;
		if (/^[0-9a-fA-F]{64}$/.test(hexBody)) {
			out.push({
				label,
				chain: chain === "solana" ? "evm" : chain,
				kind: "privateKey",
				secret: `0x${hexBody.toLowerCase()}`
			});
			continue;
		}
		if (/^[1-9A-HJ-NP-Za-km-z]{80,128}$/.test(body)) out.push({
			label,
			chain: "solana",
			kind: "privateKey",
			secret: body
		});
	}
	return out;
}
function parseExtId(input) {
	const match = input.trim().toLowerCase().match(/[a-p]{32}/);
	return match ? match[0] : null;
}
function draft(protocol, host, port, username, password) {
	if (!host || !Number.isFinite(port) || port < 1 || port > 65535) return null;
	return {
		label: host,
		protocol,
		host,
		port,
		username,
		password,
		country: ""
	};
}
function parseProxyLine(line) {
	const text = line.trim();
	if (!text || text.startsWith("#")) return null;
	const urlLike = text.match(/^(https?|socks5):\/\/(?:([^:@\s]+):([^@\s]+)@)?([^:\s\/]+):(\d+)/i);
	if (urlLike) return draft(urlLike[1].toLowerCase() === "socks5" ? "socks5" : "http", urlLike[4], Number(urlLike[5]), urlLike[2] ?? "", urlLike[3] ?? "");
	const parts = text.split(":");
	if ((parts.length === 2 || parts.length === 4) && /^\d+$/.test(parts[1] ?? "")) return draft("http", parts[0] ?? "", Number(parts[1]), parts[2] ?? "", parts[3] ?? "");
	return null;
}
function parseProxies(raw) {
	const out = [];
	for (const line of raw.split(/\r?\n/)) {
		const row = parseProxyLine(line);
		if (row) out.push(row);
	}
	return out;
}
var SCREENS = {
	windows: [
		"1920×1080",
		"1536×864",
		"2560×1440",
		"1366×768"
	],
	macos: [
		"1440×900",
		"1512×982",
		"1728×1117",
		"2560×1440"
	],
	android: [
		"360×800",
		"393×873",
		"412×915"
	]
};
var TZ = [
	"Asia/Ho_Chi_Minh",
	"Asia/Bangkok",
	"Asia/Singapore",
	"Asia/Tokyo",
	"America/Los_Angeles",
	"Europe/Berlin"
];
var LANG = [
	"vi-VN,vi,en-US",
	"en-US,en",
	"en-GB,en",
	"th-TH,th,en-US",
	"ja-JP,ja,en-US"
];
var GPU = [
	"ANGLE (NVIDIA GeForce GTX 1650 Direct3D11)",
	"ANGLE (Intel(R) UHD Graphics 620 Direct3D11)",
	"ANGLE (AMD Radeon RX 580 Direct3D11)",
	"ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)"
];
var CHROME = [
	"128.0.6613.138",
	"129.0.6668.100",
	"130.0.6723.116",
	"131.0.6778.85"
];
function pick(list, rnd) {
	return list[Math.floor(rnd() * list.length)] ?? list[0];
}
function hex(rnd, n) {
	let s = "";
	for (let i = 0; i < n; i++) s += Math.floor(rnd() * 16).toString(16);
	return s;
}
function makeFingerprint(os, rnd = Math.random) {
	const chrome = pick(CHROME, rnd);
	const platform = os === "windows" ? "Win32" : os === "macos" ? "MacIntel" : "Linux armv8l";
	let userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
	if (os === "macos") userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
	if (os === "android") userAgent = `Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Mobile Safari/537.36`;
	const cores = os === "android" ? pick([4, 8], rnd) : pick([
		4,
		8,
		12,
		16
	], rnd);
	return {
		userAgent,
		platform,
		screen: pick(SCREENS[os], rnd),
		timezone: pick(TZ, rnd),
		language: pick(LANG, rnd),
		webgl: pick(GPU, rnd),
		cores,
		memory: pick([
			4,
			8,
			16
		], rnd),
		canvas: hex(rnd, 8),
		audio: hex(rnd, 8)
	};
}
function seededRng(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var OS_LABEL = {
	windows: "Windows",
	macos: "macOS",
	android: "Android"
};
var CHAIN_LABEL = {
	evm: "EVM",
	solana: "Solana",
	aptos: "Aptos",
	sui: "Sui",
	ton: "TON"
};
var STATUS_LABEL = {
	idle: "Nghỉ",
	running: "Đang mở",
	error: "Lỗi"
};
function shortAddr(value) {
	if (value.length < 14) return value;
	return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
function ago(ts) {
	if (!ts) return "chưa chạy";
	const s = Math.max(0, Math.round((Date.now() - ts) / 1e3));
	if (s < 60) return `${s} giây trước`;
	const m = Math.round(s / 60);
	if (m < 60) return `${m} phút trước`;
	const h = Math.round(m / 60);
	if (h < 48) return `${h} giờ trước`;
	return `${Math.round(h / 24)} ngày trước`;
}
function uid() {
	return crypto.randomUUID();
}
var seedExtensions = [
	{
		id: "ext_mm",
		name: "MetaMask",
		extId: "nkbihfbeogaeaoehlefnkodbefgpgknn",
		kind: "store",
		version: "cửa hàng"
	},
	{
		id: "ext_rabby",
		name: "Rabby",
		extId: "acmacodkjbdgmoleebolmdjonilkdbch",
		kind: "store",
		version: "cửa hàng"
	},
	{
		id: "ext_phantom",
		name: "Phantom",
		extId: "bfnaelmomeimhlpmgjnjophhpkkoljpa",
		kind: "store",
		version: "cửa hàng"
	},
	{
		id: "ext_keplr",
		name: "Keplr",
		extId: "dmkamcknogkgcdfhhbddcghachkejeap",
		kind: "store",
		version: "cửa hàng"
	}
];
var seedProxies = [
	{
		id: "px_vn",
		label: "VN residential",
		protocol: "socks5",
		host: "203.0.113.21",
		port: 1080,
		username: "orbit",
		password: "demo",
		country: "VN",
		latencyMs: 86,
		alive: true
	},
	{
		id: "px_sg",
		label: "SG datacenter",
		protocol: "http",
		host: "203.0.113.10",
		port: 8e3,
		username: "orbit",
		password: "demo",
		country: "SG",
		latencyMs: 140,
		alive: true
	},
	{
		id: "px_jp",
		label: "JP mobile",
		protocol: "http",
		host: "198.51.100.14",
		port: 8080,
		username: "",
		password: "",
		country: "JP",
		latencyMs: null,
		alive: null
	},
	{
		id: "px_us",
		label: "US sticky",
		protocol: "socks5",
		host: "198.51.100.40",
		port: 1080,
		username: "orbit",
		password: "demo",
		country: "US",
		latencyMs: null,
		alive: false
	}
];
var now = Date.UTC(2026, 9, 10, 2, 0, 0);
var seedProfiles = [
	{
		id: "pf_hcm",
		name: "HCM-01",
		group: "Airdrop",
		os: "windows",
		notes: "Ví chính EVM",
		proxyId: "px_vn",
		extensionIds: ["ext_mm", "ext_rabby"],
		fingerprint: makeFingerprint("windows", seededRng(11)),
		status: "idle",
		createdAt: now,
		lastRunAt: now - 252e4
	},
	{
		id: "pf_hn",
		name: "HN-02",
		group: "Airdrop",
		os: "windows",
		notes: "Solana",
		proxyId: "px_vn",
		extensionIds: ["ext_phantom"],
		fingerprint: makeFingerprint("windows", seededRng(22)),
		status: "idle",
		createdAt: now,
		lastRunAt: null
	},
	{
		id: "pf_dn",
		name: "ĐN-03",
		group: "Mạng xã hội",
		os: "macos",
		notes: "Page nội bộ",
		proxyId: "px_sg",
		extensionIds: [],
		fingerprint: makeFingerprint("macos", seededRng(33)),
		status: "idle",
		createdAt: now,
		lastRunAt: now - 18e6
	},
	{
		id: "pf_sg",
		name: "SG-04",
		group: "Airdrop",
		os: "android",
		notes: "Phiên mobile",
		proxyId: "px_jp",
		extensionIds: ["ext_mm"],
		fingerprint: makeFingerprint("android", seededRng(44)),
		status: "idle",
		createdAt: now,
		lastRunAt: null
	},
	{
		id: "pf_us",
		name: "US-05",
		group: "Nghiên cứu",
		os: "macos",
		notes: "Proxy này đang chết — dùng để thử lỗi",
		proxyId: "px_us",
		extensionIds: ["ext_keplr"],
		fingerprint: makeFingerprint("macos", seededRng(55)),
		status: "error",
		createdAt: now,
		lastRunAt: now - 72e4
	},
	{
		id: "pf_jp",
		name: "JP-06",
		group: "Nghiên cứu",
		os: "windows",
		notes: "",
		proxyId: null,
		extensionIds: ["ext_rabby"],
		fingerprint: makeFingerprint("windows", seededRng(66)),
		status: "idle",
		createdAt: now,
		lastRunAt: null
	}
];
function bytesToB64(bytes) {
	let bin = "";
	for (const byte of bytes) bin += String.fromCharCode(byte);
	return btoa(bin);
}
function b64ToBytes(value) {
	const bin = atob(value);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
async function deriveKey(passphrase, salt) {
	const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
	const saltCopy = new Uint8Array(salt.byteLength);
	saltCopy.set(salt);
	return crypto.subtle.deriveKey({
		name: "PBKDF2",
		salt: saltCopy,
		iterations: 8e4,
		hash: "SHA-256"
	}, base, {
		name: "AES-GCM",
		length: 256
	}, false, ["encrypt", "decrypt"]);
}
async function encryptJson(passphrase, data) {
	const salt = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));
	const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
	const key = await deriveKey(passphrase, salt);
	const encoded = new TextEncoder().encode(JSON.stringify(data));
	const buf = await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, encoded);
	return {
		salt: bytesToB64(salt),
		iv: bytesToB64(iv),
		data: bytesToB64(new Uint8Array(buf))
	};
}
async function decryptJson(passphrase, blob) {
	try {
		const salt = b64ToBytes(blob.salt);
		const iv = b64ToBytes(blob.iv);
		const data = b64ToBytes(blob.data);
		const key = await deriveKey(passphrase, salt);
		const ivCopy = new Uint8Array(iv.byteLength);
		ivCopy.set(iv);
		const plain = await crypto.subtle.decrypt({
			name: "AES-GCM",
			iv: ivCopy
		}, key, data);
		return JSON.parse(new TextDecoder().decode(plain));
	} catch {
		throw new Error("Sai mật khẩu hoặc kho bị hỏng");
	}
}
var KEY = "orbit.console.v1";
function initial() {
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
		notice: null
	};
}
var useOrbit = create(initial);
var sessionPass = null;
var hydrated = false;
var chain = Promise.resolve();
var noticeTimer = 0;
function publicSlice(s) {
	return {
		v: 1,
		profiles: s.profiles,
		proxies: s.proxies,
		extensions: s.extensions,
		jobs: s.jobs
	};
}
async function commit() {
	const s = useOrbit.getState();
	const body = publicSlice(s);
	try {
		if (s.vaultOn && sessionPass) {
			const vault = await encryptJson(sessionPass, useOrbit.getState().wallets);
			useOrbit.setState({ vaultBlob: vault });
			localStorage.setItem(KEY, JSON.stringify({
				...publicSlice(useOrbit.getState()),
				vault
			}));
			return;
		}
		if (s.vaultOn) {
			localStorage.setItem(KEY, JSON.stringify({
				...body,
				vault: useOrbit.getState().vaultBlob
			}));
			return;
		}
		localStorage.setItem(KEY, JSON.stringify({
			...body,
			wallets: useOrbit.getState().wallets
		}));
	} catch (error) {
		console.error(error);
		notify("Không lưu được trên trình duyệt này");
	}
}
function persist() {
	chain = chain.then(() => commit()).catch((error) => {
		console.error(error);
	});
}
function notify(message) {
	useOrbit.setState({ notice: message });
	window.clearTimeout(noticeTimer);
	noticeTimer = window.setTimeout(() => {
		useOrbit.setState({ notice: null });
	}, 3200);
}
function readDisk() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (data?.v !== 1 || !Array.isArray(data.profiles)) return null;
		return data;
	} catch {
		return null;
	}
}
function hydrate() {
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
		jobs: (disk.jobs ?? []).map((job) => job.status === "running" || job.status === "queued" ? {
			...job,
			status: "stopped",
			log: [...job.log, "Phiên trước đã đóng"],
			finishedAt: Date.now()
		} : job),
		wallets: disk.vault ? [] : disk.wallets ?? [],
		vaultOn: Boolean(disk.vault),
		locked: Boolean(disk.vault),
		vaultBlob: disk.vault ?? null,
		selectedIds: []
	});
}
function patchProfile(id, patch) {
	useOrbit.setState((s) => ({ profiles: s.profiles.map((profile) => profile.id === id ? {
		...profile,
		...patch
	} : profile) }));
	persist();
}
function addProfiles(input) {
	const count = Math.max(1, Math.min(100, Math.floor(input.count) || 1));
	useOrbit.setState((s) => {
		const made = [];
		const stem = input.base.trim() || "Profile";
		for (let i = 0; i < count; i++) {
			const names = new Set([...s.profiles, ...made].map((profile) => profile.name));
			let n = 1;
			while (names.has(`${stem}-${String(n).padStart(2, "0")}`)) n += 1;
			const proxyId = input.proxyMode === "round" && s.proxies.length ? s.proxies[(s.profiles.length + i) % s.proxies.length]?.id ?? null : null;
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
				lastRunAt: null
			});
		}
		return { profiles: [...s.profiles, ...made] };
	});
	persist();
	return count;
}
function duplicateProfile(id) {
	const source = useOrbit.getState().profiles.find((profile) => profile.id === id);
	if (!source) return;
	const copy = {
		...source,
		id: uid(),
		name: `${source.name} bản`,
		fingerprint: makeFingerprint(source.os),
		status: "idle",
		createdAt: Date.now(),
		lastRunAt: null,
		extensionIds: [...source.extensionIds]
	};
	useOrbit.setState((s) => ({ profiles: [...s.profiles, copy] }));
	persist();
}
function removeProfiles(ids) {
	const drop = new Set(ids);
	useOrbit.setState((s) => ({
		profiles: s.profiles.filter((profile) => !drop.has(profile.id)),
		wallets: s.wallets.map((wallet) => wallet.profileId && drop.has(wallet.profileId) ? {
			...wallet,
			profileId: null
		} : wallet),
		selectedIds: s.selectedIds.filter((id) => !drop.has(id))
	}));
	persist();
}
function toggleProfileExtension(profileId, extensionId) {
	useOrbit.setState((s) => ({ profiles: s.profiles.map((profile) => {
		if (profile.id !== profileId) return profile;
		const has = profile.extensionIds.includes(extensionId);
		return {
			...profile,
			extensionIds: has ? profile.extensionIds.filter((id) => id !== extensionId) : [...profile.extensionIds, extensionId]
		};
	}) }));
	persist();
}
function toggleSelected(id) {
	useOrbit.setState((s) => ({ selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((item) => item !== id) : [...s.selectedIds, id] }));
}
function setSelected(ids) {
	useOrbit.setState({ selectedIds: ids });
}
function addProxies(rows) {
	if (!rows.length) return 0;
	useOrbit.setState((s) => ({ proxies: [...s.proxies, ...rows.map((row) => ({
		...row,
		id: uid(),
		latencyMs: null,
		alive: null
	}))] }));
	persist();
	return rows.length;
}
function removeProxies(ids) {
	const drop = new Set(ids);
	useOrbit.setState((s) => ({
		proxies: s.proxies.filter((proxy) => !drop.has(proxy.id)),
		profiles: s.profiles.map((profile) => profile.proxyId && drop.has(profile.proxyId) ? {
			...profile,
			proxyId: null
		} : profile)
	}));
	persist();
}
async function checkProxy(id) {
	await new Promise((resolve) => window.setTimeout(resolve, 420 + Math.random() * 700));
	const alive = Math.random() > .18;
	useOrbit.setState((s) => ({ proxies: s.proxies.map((proxy) => proxy.id === id ? {
		...proxy,
		alive,
		latencyMs: alive ? 35 + Math.floor(Math.random() * 420) : null
	} : proxy) }));
	persist();
}
function addExtension(row) {
	if (useOrbit.getState().extensions.some((item) => item.extId.toLowerCase() === row.extId.toLowerCase())) {
		notify("Extension này đã có trong thư viện");
		return false;
	}
	useOrbit.setState((s) => ({ extensions: [...s.extensions, {
		...row,
		id: uid()
	}] }));
	persist();
	return true;
}
function removeExtensions(ids) {
	const drop = new Set(ids);
	useOrbit.setState((s) => ({
		extensions: s.extensions.filter((item) => !drop.has(item.id)),
		profiles: s.profiles.map((profile) => ({
			...profile,
			extensionIds: profile.extensionIds.filter((id) => !drop.has(id))
		}))
	}));
	persist();
}
function addWallets(rows, assign) {
	if (!rows.length) return 0;
	useOrbit.setState((s) => {
		const made = rows.map((row, index) => {
			let profileId = null;
			if (assign.mode === "one") profileId = assign.profileId || null;
			if (assign.mode === "round" && assign.profileIds.length) profileId = assign.profileIds[index % assign.profileIds.length] ?? null;
			return {
				...row,
				id: uid(),
				createdAt: Date.now(),
				profileId,
				label: row.label.trim() || `Ví ${String(s.wallets.length + index + 1).padStart(2, "0")}`
			};
		});
		return { wallets: [...s.wallets, ...made] };
	});
	persist();
	return rows.length;
}
function assignWallet(id, profileId) {
	useOrbit.setState((s) => ({ wallets: s.wallets.map((wallet) => wallet.id === id ? {
		...wallet,
		profileId
	} : wallet) }));
	persist();
}
function renameWallet(id, label) {
	useOrbit.setState((s) => ({ wallets: s.wallets.map((wallet) => wallet.id === id ? {
		...wallet,
		label
	} : wallet) }));
	persist();
}
function removeWallets(ids) {
	const drop = new Set(ids);
	useOrbit.setState((s) => ({ wallets: s.wallets.filter((wallet) => !drop.has(wallet.id)) }));
	persist();
}
async function enableVault(passphrase) {
	const pass = passphrase.trim();
	if (pass.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
	sessionPass = pass;
	const vault = await encryptJson(pass, useOrbit.getState().wallets);
	useOrbit.setState({
		vaultOn: true,
		locked: false,
		vaultBlob: vault
	});
	persist();
}
function lockVault() {
	if (!useOrbit.getState().vaultOn) return;
	const pass = sessionPass;
	sessionPass = null;
	useOrbit.setState({ locked: true });
	chain = chain.then(async () => {
		const wallets = useOrbit.getState().wallets;
		const blob = pass ? await encryptJson(pass, wallets) : useOrbit.getState().vaultBlob;
		useOrbit.setState({
			vaultBlob: blob,
			wallets: []
		});
		const s = useOrbit.getState();
		localStorage.setItem(KEY, JSON.stringify({
			...publicSlice(s),
			vault: blob
		}));
	});
}
async function unlockVault(passphrase) {
	const blob = useOrbit.getState().vaultBlob;
	if (!blob) throw new Error("Chưa có kho");
	const wallets = await decryptJson(passphrase, blob);
	if (!Array.isArray(wallets)) throw new Error("Kho hỏng");
	sessionPass = passphrase;
	useOrbit.setState({
		wallets,
		locked: false
	});
}
function disableVault() {
	if (!useOrbit.getState().vaultOn) return;
	if (useOrbit.getState().locked || !sessionPass) throw new Error("Mở khoá trước khi gỡ mật khẩu");
	sessionPass = null;
	useOrbit.setState({
		vaultOn: false,
		vaultBlob: null,
		locked: false
	});
	persist();
}
function downloadJson(filename, data) {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
var CATALOG = [
	{
		name: "MetaMask",
		extId: "nkbihfbeogaeaoehlefnkodbefgpgknn"
	},
	{
		name: "Rabby",
		extId: "acmacodkjbdgmoleebolmdjonilkdbch"
	},
	{
		name: "Phantom",
		extId: "bfnaelmomeimhlpmgjnjophhpkkoljpa"
	},
	{
		name: "Keplr",
		extId: "dmkamcknogkgcdfhhbddcghachkejeap"
	},
	{
		name: "OKX Wallet",
		extId: "mcohilncbfahbmgdjkbpemcciiolgcge"
	}
];
function Extensions() {
	const extensions = useOrbit((s) => s.extensions);
	const profiles = useOrbit((s) => s.profiles);
	const fileRef = (0, import_react.useRef)(null);
	const [custom, setCustom] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-medium",
				children: "Extension"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Thư viện gắn vào profile. Gói .zip / .crx được ghi tên tại đây — trình duyệt web không cài được vào Chrome thật."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "border-b border-line px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm text-muted",
						children: "Thêm nhanh"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-wrap gap-2",
						children: CATALOG.map((item) => {
							const owned = extensions.some((ext) => ext.extId === item.extId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: owned ? "quiet" : "primary",
								disabled: owned,
								onClick: () => addExtension({
									name: item.name,
									extId: item.extId,
									kind: "store",
									version: "cửa hàng"
								}),
								children: owned ? item.name : `Thêm ${item.name}`
							}) }, item.extId);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]",
						onSubmit: (event) => {
							event.preventDefault();
							const extId = parseExtId(custom);
							if (!extId) {
								notify("Cần ID 32 ký tự của Chrome Web Store hoặc đường dẫn có ID đó");
								return;
							}
							if (addExtension({
								name: name.trim() || extId.slice(0, 8),
								extId,
								kind: "store",
								version: "cửa hàng"
							})) {
								setCustom("");
								setName("");
								notify("Đã thêm vào thư viện");
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								placeholder: "Tên, ví dụ Unisat",
								value: name,
								onChange: (event) => setName(event.target.value),
								"aria-label": "Tên extension"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								placeholder: "ID hoặc link Chrome Web Store",
								value: custom,
								onChange: (event) => setCustom(event.target.value),
								"aria-label": "ID extension"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								type: "submit",
								children: "Thêm ID"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => fileRef.current?.click(),
							children: "Tải gói .zip / .crx"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileRef,
							type: "file",
							accept: ".zip,.crx,.xpi",
							className: "hidden",
							onChange: (event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (!file) return;
								if (addExtension({
									name: file.name.replace(/\.(zip|crx|xpi)$/i, "") || "Gói local",
									extId: file.name,
									kind: "file",
									version: "local"
								})) notify(`Đã ghi ${file.name} vào thư viện`);
							}
						})]
					})
				]
			}), extensions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-8 text-sm text-muted",
				children: "Thư viện trống."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: extensions.map((item) => {
				const used = profiles.filter((profile) => profile.extensionIds.includes(item.id)).length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 border-b border-line px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: item.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate font-mono text-xs text-muted",
								children: [item.kind === "file" ? "gói local · " : "", item.extId]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [used, " profile"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => removeExtensions([item.id]),
						children: "Gỡ"
					})]
				}, item.id);
			}) })]
		})]
	});
}
var STEPS = [
	"Mở profile",
	"Gắn proxy",
	"Nạp extension",
	"Nạp ví",
	"Mở khoá",
	"Sẵn sàng"
];
var timer = null;
var concurrency = 2;
function setQueueConcurrency(value) {
	concurrency = Math.max(1, Math.min(5, Math.round(value) || 1));
}
function short(value) {
	if (value.length < 14) return value;
	return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
function perform(job, state) {
	const log = [...job.log];
	const profile = state.profiles.find((item) => item.id === job.profileId);
	if (!profile) {
		log.push("Profile đã bị xoá");
		return {
			...job,
			status: "failed",
			log,
			finishedAt: Date.now()
		};
	}
	let status = "running";
	let line = "";
	if (job.step === 0) line = `${profile.fingerprint.platform} · ${profile.fingerprint.screen} · ${profile.fingerprint.timezone}`;
	else if (job.step === 1) {
		const proxy = profile.proxyId ? state.proxies.find((item) => item.id === profile.proxyId) : null;
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
		const names = profile.extensionIds.map((id) => state.extensions.find((item) => item.id === id)?.name).filter((name) => Boolean(name));
		line = names.length ? `Nạp ${names.join(", ")}` : "Không nạp extension";
	} else if (job.step === 3) {
		const wallets = state.wallets.filter((wallet) => wallet.profileId === profile.id && wallet.secret);
		if (!wallets.length) {
			line = "Không có ví để đăng nhập";
			status = "failed";
		} else line = wallets.map((wallet) => {
			const detail = wallet.kind === "seed" ? `${wallet.secret.trim().split(/\s+/).length} từ` : "khoá riêng";
			const who = wallet.address ? short(wallet.address) : `dấu ${wallet.mark}`;
			const flag = wallet.valid ? "" : " · không hợp lệ";
			return `${wallet.label} · ${wallet.chain} · ${detail} · ${who}${flag}`;
		}).join(" | ");
	} else if (job.step === 4) line = "Mở khoá ví trên profile";
	else {
		line = "Profile sẵn sàng";
		status = "done";
	}
	log.push(line);
	if (status === "failed" || status === "done") return {
		...job,
		status,
		log,
		finishedAt: Date.now()
	};
	return {
		...job,
		status: "running",
		step: Math.min(job.step + 1, STEPS.length - 1),
		log
	};
}
function advance(state) {
	const jobs = state.jobs.map((job) => ({
		...job,
		log: [...job.log]
	}));
	const patches = /* @__PURE__ */ new Map();
	const touch = (id, patch) => {
		patches.set(id, {
			...patches.get(id),
			...patch
		});
	};
	let terminal = false;
	const just = /* @__PURE__ */ new Set();
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
			touch(job.profileId, {
				status: "idle",
				lastRunAt: next.finishedAt
			});
		} else if (next.status === "failed") {
			terminal = true;
			touch(job.profileId, { status: "error" });
		}
	}
	return {
		jobs,
		profiles: state.profiles.map((profile) => patches.has(profile.id) ? {
			...profile,
			...patches.get(profile.id)
		} : profile),
		terminal
	};
}
function tick() {
	let terminal = false;
	useOrbit.setState((state) => {
		const next = advance(state);
		terminal = next.terminal;
		return {
			jobs: next.jobs,
			profiles: next.profiles
		};
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
function startBatch(profileIds) {
	const state = useOrbit.getState();
	if (state.vaultOn && state.locked) {
		notify("Mở khoá kho ví trước khi chạy");
		return false;
	}
	const active = new Set(state.jobs.filter((job) => job.status === "queued" || job.status === "running").map((job) => job.profileId));
	const ids = [...new Set(profileIds)].filter((id) => !active.has(id));
	if (!ids.length) {
		notify(profileIds.length ? "Profile này đã ở trong hàng" : "Chọn ít nhất một profile");
		return false;
	}
	const jobs = ids.map((id) => {
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
			finishedAt: null
		};
	});
	useOrbit.setState((current) => ({ jobs: [...jobs, ...current.jobs].slice(0, 40) }));
	persist();
	ensureTimer();
	return true;
}
function stopBatch() {
	if (timer != null) {
		window.clearInterval(timer);
		timer = null;
	}
	useOrbit.setState((state) => ({
		jobs: state.jobs.map((job) => job.status === "queued" || job.status === "running" ? {
			...job,
			status: "stopped",
			log: [...job.log, "Đã dừng"],
			finishedAt: Date.now()
		} : job),
		profiles: state.profiles.map((profile) => profile.status === "running" ? {
			...profile,
			status: "idle"
		} : profile)
	}));
	persist();
}
function clearFinished() {
	useOrbit.setState((state) => ({ jobs: state.jobs.filter((job) => job.status === "queued" || job.status === "running") }));
	persist();
}
function Profiles({ onOpenWallets, onRan }) {
	const profiles = useOrbit((s) => s.profiles);
	const proxies = useOrbit((s) => s.proxies);
	const wallets = useOrbit((s) => s.wallets);
	const locked = useOrbit((s) => s.locked);
	const selectedIds = useOrbit((s) => s.selectedIds);
	const [query, setQuery] = (0, import_react.useState)("");
	const [group, setGroup] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [openId, setOpenId] = (0, import_react.useState)(profiles[0]?.id ?? null);
	const [sheet, setSheet] = (0, import_react.useState)(false);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const groups = (0, import_react.useMemo)(() => [...new Set(profiles.map((profile) => profile.group))].sort(), [profiles]);
	const visible = profiles.filter((profile) => {
		const blob = `${profile.name} ${profile.group} ${profile.notes}`.toLowerCase();
		if (query && !blob.includes(query.trim().toLowerCase())) return false;
		if (group !== "all" && profile.group !== group) return false;
		if (status !== "all" && profile.status !== status) return false;
		return true;
	});
	const selected = profiles.find((profile) => profile.id === openId) ?? null;
	const allOn = visible.length > 0 && visible.every((profile) => selectedIds.includes(profile.id));
	function run(ids) {
		setQueueConcurrency(2);
		if (startBatch(ids)) onRan();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-medium",
					children: "Profile"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Không giới hạn. Mỗi profile một vân tay, một proxy, một bộ ví."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => downloadConfig(),
							children: "Xuất JSON"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "danger",
							disabled: !selectedIds.length,
							onClick: () => setConfirmDelete(true),
							children: ["Xoá ", selectedIds.length || ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "primary",
							onClick: () => run(selectedIds),
							disabled: !selectedIds.length,
							children: ["Chạy ", selectedIds.length || ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							onClick: () => setCreating(true),
							children: "Tạo profile"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 border-b border-line px-4 py-3 md:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClass,
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Tìm tên, nhóm, ghi chú",
						"aria-label": "Tìm profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: fieldClass,
						value: group,
						onChange: (event) => setGroup(event.target.value),
						"aria-label": "Nhóm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Mọi nhóm"
						}), groups.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item,
							children: item
						}, item))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: fieldClass,
						value: status,
						onChange: (event) => setStatus(event.target.value),
						"aria-label": "Trạng thái",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Mọi trạng thái"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "idle",
								children: "Nghỉ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "running",
								children: "Đang mở"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "error",
								children: "Lỗi"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 min-w-0 flex-1 lg:overflow-y-auto",
					children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-8 text-sm text-muted",
						children: "Không có profile khớp bộ lọc."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "hidden w-full text-sm lg:table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "sticky top-0 bg-surface text-left text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "w-12 px-4 py-3 font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										className: "size-4 accent-sage",
										checked: allOn,
										onChange: () => {
											const visibleIds = new Set(visible.map((profile) => profile.id));
											setSelected(allOn ? selectedIds.filter((id) => !visibleIds.has(id)) : [.../* @__PURE__ */ new Set([...selectedIds, ...visible.map((profile) => profile.id)])]);
										},
										"aria-label": "Chọn tất cả"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 font-medium",
									children: "Tên"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 font-medium",
									children: "Nhóm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 font-medium",
									children: "Proxy"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 font-medium",
									children: "Ext"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 font-medium",
									children: "Ví"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 font-medium",
									children: "Trạng thái"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((profile) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileRow, {
							profile,
							proxy: proxies.find((item) => item.id === profile.proxyId),
							walletCount: locked ? 0 : wallets.filter((wallet) => wallet.profileId === profile.id).length,
							selected: selectedIds.includes(profile.id),
							active: profile.id === openId,
							onOpen: () => {
								setOpenId(profile.id);
								setSheet(true);
							}
						}, profile.id)) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "lg:hidden",
						children: visible.map((profile) => {
							const proxy = proxies.find((item) => item.id === profile.proxyId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-stretch border-b border-line",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "flex w-12 items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										className: "size-4 accent-sage",
										checked: selectedIds.includes(profile.id),
										onChange: () => toggleSelected(profile.id),
										"aria-label": `Chọn ${profile.name}`
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "min-w-0 flex-1 px-2 py-3 text-left",
									onClick: () => {
										setOpenId(profile.id);
										setSheet(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: profile.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2 text-xs text-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, { status: profile.status }), STATUS_LABEL[profile.status]]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block truncate text-sm text-muted",
										children: [
											profile.group,
											" · ",
											proxy ? `${proxy.country || proxy.protocol} ${proxy.host}` : "không proxy"
										]
									})]
								})]
							}, profile.id);
						})
					})] })
				}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {
					profile: selected,
					className: "hidden min-h-0 w-96 shrink-0 overflow-y-auto border-l border-line lg:block",
					onOpenWallets,
					onRun: () => run([selected.id]),
					onClose: () => setOpenId(null)
				}) : null]
			}),
			sheet && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixed inset-0 z-30 overflow-y-auto bg-bg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {
						profile: selected,
						className: "min-h-dvh",
						onOpenWallets,
						onRun: () => run([selected.id]),
						onClose: () => setSheet(false)
					})
				})
			}) : null,
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateDialog, {
				groups,
				onClose: () => setCreating(false)
			}) : null,
			confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setConfirmDelete(false),
				title: `Xoá ${selectedIds.length} profile?`,
				description: "Ví gắn kèm được thả về kho, không bị xoá theo.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: () => setConfirmDelete(false),
						children: "Huỷ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => {
							removeProfiles(selectedIds);
							setConfirmDelete(false);
						},
						children: "Xoá"
					})]
				})
			}) : null
		]
	});
}
function downloadConfig() {
	const state = useOrbit.getState();
	downloadJson("orbit-profiles.json", {
		profiles: state.profiles,
		proxies: state.proxies,
		extensions: state.extensions
	});
}
function ProfileRow({ profile, proxy, walletCount, selected, active, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: active ? "bg-elevated" : "hover:bg-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "size-4 accent-sage",
					checked: selected,
					onChange: () => toggleSelected(profile.id),
					"aria-label": `Chọn ${profile.name}`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
				className: "px-2 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-left font-medium",
					onClick: onOpen,
					children: profile.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						OS_LABEL[profile.os],
						" · ",
						ago(profile.lastRunAt)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-3 text-muted",
				children: profile.group
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "max-w-40 truncate px-2 py-3 font-mono text-xs text-muted",
				children: proxy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: proxy.alive === false ? "text-danger" : void 0,
					children: [proxy.country ? `${proxy.country} · ` : "", proxy.host]
				}) : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-3 tabular-nums text-muted",
				children: profile.extensionIds.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-3 tabular-nums text-muted",
				children: walletCount || "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2 text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, { status: profile.status }), STATUS_LABEL[profile.status]]
				})
			})
		]
	});
}
function Inspector({ profile, className, onClose, onRun, onOpenWallets }) {
	const proxies = useOrbit((s) => s.proxies);
	const extensions = useOrbit((s) => s.extensions);
	const wallets = useOrbit((s) => s.wallets);
	const locked = useOrbit((s) => s.locked);
	const mine = locked ? [] : wallets.filter((wallet) => wallet.profileId === profile.id);
	const free = locked ? [] : wallets.filter((wallet) => !wallet.profileId);
	const fp = profile.fingerprint;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium",
				children: profile.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						onClick: onRun,
						children: "Đăng nhập ví"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: () => duplicateProfile(profile.id),
						children: "Nhân bản"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: onClose,
						children: "Đóng"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Tên", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: `${fieldClass} mt-1`,
						value: profile.name,
						onChange: (event) => patchProfile(profile.id, { name: event.target.value })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Nhóm", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: `${fieldClass} mt-1`,
						value: profile.group,
						onChange: (event) => patchProfile(profile.id, { group: event.target.value })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Hệ điều hành", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-1`,
						value: profile.os,
						onChange: (event) => {
							const os = event.target.value;
							patchProfile(profile.id, {
								os,
								fingerprint: makeFingerprint(os)
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "windows",
								children: "Windows"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "macos",
								children: "macOS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "android",
								children: "Android"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Proxy", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-1`,
						value: profile.proxyId ?? "",
						onChange: (event) => patchProfile(profile.id, { proxyId: event.target.value || null }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Không proxy"
						}), proxies.map((proxy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: proxy.id,
							children: [
								(proxy.country || proxy.protocol).toUpperCase(),
								" · ",
								proxy.host,
								":",
								proxy.port
							]
						}, proxy.id))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Vân tay"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-sage",
							onClick: () => patchProfile(profile.id, { fingerprint: makeFingerprint(profile.os) }),
							children: "Đổi vân tay"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid grid-cols-2 gap-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Màn hình",
								value: fp.screen
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Múi giờ",
								value: fp.timezone
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Ngôn ngữ",
								value: fp.language
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Máy",
								value: `${fp.cores} nhân · ${fp.memory} GB`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Canvas",
								value: fp.canvas
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Audio",
								value: fp.audio
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 break-all font-mono text-xs text-muted",
						children: fp.userAgent
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 break-all text-xs text-muted",
						children: fp.webgl
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm text-muted",
					children: "Extension"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: extensions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "Thư viện đang trống."
					}) : extensions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "size-4 accent-sage",
							checked: profile.extensionIds.includes(item.id),
							onChange: () => toggleProfileExtension(profile.id, item.id)
						}), item.name]
					}) }, item.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Ví trên profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-sage",
							onClick: onOpenWallets,
							children: "Mở kho"
						})]
					}),
					locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Kho đang khoá."
					}) : mine.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Chưa gắn ví."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1 text-sm",
						children: mine.map((wallet) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: wallet.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs uppercase text-muted",
								children: wallet.chain
							})]
						}, wallet.id))
					}),
					!locked && free.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-2`,
						value: "",
						onChange: (event) => {
							if (!event.target.value) return;
							assignWallet(event.target.value, profile.id);
						},
						"aria-label": "Gắn ví có sẵn",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Gắn ví có sẵn…"
						}), free.map((wallet) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: wallet.id,
							children: wallet.label
						}, wallet.id))]
					}) : null
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Ghi chú", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "mt-1 min-h-24 w-full rounded-md border border-line bg-bg px-3 py-2 text-base text-fg outline-none md:text-sm",
						value: profile.notes,
						onChange: (event) => patchProfile(profile.id, { notes: event.target.value })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => {
							removeProfiles([profile.id]);
							onClose();
						},
						children: "Xoá profile"
					})
				})
			]
		})]
	});
}
function Fact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 break-all font-mono text-fg",
			children: value
		})]
	});
}
function CreateDialog({ groups, onClose }) {
	const extensions = useOrbit((s) => s.extensions);
	const proxyCount = useOrbit((s) => s.proxies.length);
	const [base, setBase] = (0, import_react.useState)("HCM");
	const [count, setCount] = (0, import_react.useState)(5);
	const [group, setGroup] = (0, import_react.useState)(groups[0] ?? "Airdrop");
	const [os, setOs] = (0, import_react.useState)("windows");
	const [proxyMode, setProxyMode] = (0, import_react.useState)(proxyCount ? "round" : "none");
	const [extensionIds, setExtensionIds] = (0, import_react.useState)(extensions.filter((item) => item.name === "MetaMask").map((item) => item.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open: true,
		onClose,
		title: "Tạo profile",
		description: "Mỗi lần tối đa 100. Tạo tiếp bao nhiêu lần cũng được — không có trần.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				notify(`Đã tạo ${addProfiles({
					base,
					count,
					group,
					os,
					proxyMode,
					extensionIds
				})} profile`);
				onClose();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Tên gốc", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: `${fieldClass} mt-1`,
						value: base,
						onChange: (event) => setBase(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Số lượng", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: `${fieldClass} mt-1 tabular-nums`,
						type: "number",
						min: 1,
						max: 100,
						value: count,
						onChange: (event) => setCount(Number(event.target.value))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: [
						"Nhóm",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: `${fieldClass} mt-1`,
							list: "orbit-groups",
							value: group,
							onChange: (event) => setGroup(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
							id: "orbit-groups",
							children: groups.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: item }, item))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Hệ điều hành", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-1`,
						value: os,
						onChange: (event) => setOs(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "windows",
								children: "Windows"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "macos",
								children: "macOS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "android",
								children: "Android"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Proxy", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-1`,
						value: proxyMode,
						onChange: (event) => setProxyMode(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "none",
							children: "Không gắn"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "round",
							children: "Chia vòng các proxy đã có"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-sm text-muted",
					children: "Extension gắn sẵn"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1",
					children: extensions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "size-4 accent-sage",
							checked: extensionIds.includes(item.id),
							onChange: () => setExtensionIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])
						}), item.name]
					}) }, item.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: onClose,
						children: "Huỷ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						type: "submit",
						children: "Tạo"
					})]
				})
			]
		})
	});
}
function Proxies() {
	const proxies = useOrbit((s) => s.proxies);
	const profiles = useOrbit((s) => s.profiles);
	const [raw, setRaw] = (0, import_react.useState)("");
	const [checking, setChecking] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		protocol: "socks5",
		host: "",
		port: "1080",
		username: "",
		password: "",
		country: ""
	});
	async function check(id) {
		setChecking(id);
		await checkProxy(id);
		setChecking((current) => current === id ? null : current);
	}
	async function checkAll() {
		setChecking("all");
		for (const proxy of useOrbit.getState().proxies) await checkProxy(proxy.id);
		setChecking(null);
		notify("Đã kiểm tra xong danh sách proxy");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-medium",
				children: "Proxy"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "HTTP hoặc SOCKS5. Dán hàng loạt theo kiểu host:port:user:pass."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "quiet",
					onClick: () => void checkAll(),
					disabled: !proxies.length || checking === "all",
					children: checking === "all" ? "Đang kiểm tra…" : "Kiểm tra tất cả"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					onClick: () => setOpen((value) => !value),
					children: "Thêm proxy"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto",
			children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 border-b border-line px-4 py-4",
				onSubmit: (event) => {
					event.preventDefault();
					const parsed = parseProxies(raw);
					const rows = [...form.host.trim() ? parseProxies(`${form.protocol}://${form.username ? `${form.username}:${form.password}@` : ""}${form.host.trim()}:${form.port}`).map((row) => ({
						...row,
						country: form.country.trim().toUpperCase()
					})) : [], ...parsed];
					if (!rows.length) {
						notify("Không đọc được proxy nào");
						return;
					}
					const count = addProxies(rows);
					setRaw("");
					setForm({
						protocol: "socks5",
						host: "",
						port: "1080",
						username: "",
						password: "",
						country: ""
					});
					setOpen(false);
					notify(`Đã thêm ${count} proxy`);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: fieldClass,
								value: form.protocol,
								onChange: (event) => setForm({
									...form,
									protocol: event.target.value
								}),
								"aria-label": "Giao thức",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "socks5",
									children: "SOCKS5"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "http",
									children: "HTTP"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								placeholder: "Host",
								value: form.host,
								onChange: (event) => setForm({
									...form,
									host: event.target.value
								}),
								"aria-label": "Host"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: `${fieldClass} tabular-nums`,
								placeholder: "Cổng",
								value: form.port,
								onChange: (event) => setForm({
									...form,
									port: event.target.value
								}),
								"aria-label": "Cổng"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								placeholder: "User",
								value: form.username,
								onChange: (event) => setForm({
									...form,
									username: event.target.value
								}),
								"aria-label": "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								placeholder: "Mật khẩu",
								value: form.password,
								onChange: (event) => setForm({
									...form,
									password: event.target.value
								}),
								"aria-label": "Mật khẩu proxy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								placeholder: "Quốc gia, ví dụ VN",
								value: form.country,
								onChange: (event) => setForm({
									...form,
									country: event.target.value
								}),
								"aria-label": "Quốc gia"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "min-h-28 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-fg outline-none",
						placeholder: "Dán nhiều dòng\nsocks5://user:pass@203.0.113.8:1080\n198.51.100.9:8000:user:pass",
						value: raw,
						onChange: (event) => setRaw(event.target.value),
						"aria-label": "Dán danh sách proxy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setOpen(false),
							children: "Đóng"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							type: "submit",
							children: "Lưu"
						})]
					})
				]
			}) : null, proxies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-8 text-sm text-muted",
				children: "Chưa có proxy."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: proxies.map((proxy) => {
				const used = profiles.filter((profile) => profile.proxyId === proxy.id).length;
				const tone = proxy.alive === true ? "text-sage" : proxy.alive === false ? "text-danger" : "text-warn";
				const label = proxy.alive === true ? "sống" : proxy.alive === false ? "chết" : "chưa kiểm tra";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-3 border-b border-line px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [proxy.country ? `${proxy.country} · ` : "", proxy.label]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate font-mono text-xs text-muted",
									children: [
										proxy.protocol,
										"://",
										proxy.host,
										":",
										proxy.port,
										proxy.username ? ` · ${proxy.username}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: `text-xs ${tone}`,
									children: [
										label,
										proxy.latencyMs ? ` · ${proxy.latencyMs} ms` : "",
										" · ",
										used,
										" profile"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => void check(proxy.id),
							disabled: checking !== null,
							children: checking === proxy.id ? "…" : "Kiểm tra"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => removeProxies([proxy.id]),
							children: "Xoá"
						})
					]
				}, proxy.id);
			}) })]
		})]
	});
}
var JOB_LABEL = {
	queued: "Hàng đợi",
	running: "Đang chạy",
	done: "Xong",
	failed: "Lỗi",
	stopped: "Đã dừng"
};
function Queue() {
	const jobs = useOrbit((s) => s.jobs);
	const selectedIds = useOrbit((s) => s.selectedIds);
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [concurrency, setConcurrency] = (0, import_react.useState)(2);
	const active = jobs.some((job) => job.status === "queued" || job.status === "running");
	const current = jobs.find((job) => job.id === focus) ?? jobs[0] ?? null;
	const done = jobs.filter((job) => job.status === "done").length;
	const failed = jobs.filter((job) => job.status === "failed").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-medium",
					children: "Hàng đợi đăng nhập"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted",
					children: "Chạy lần lượt: mở profile, gắn proxy, nạp extension, nạp ví, mở khoá. Bí mật không được ghi vào nhật ký. Đây là phiên trên web, không mở Chromium thật."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm text-muted",
							children: [
								"Song song",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 1,
									max: 5,
									value: concurrency,
									className: "w-24 accent-sage",
									onChange: (event) => {
										const value = Number(event.target.value);
										setConcurrency(value);
										setQueueConcurrency(value);
									},
									"aria-label": "Số profile chạy cùng lúc"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-fg",
									children: concurrency
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							disabled: !selectedIds.length,
							onClick: () => {
								setQueueConcurrency(concurrency);
								startBatch(selectedIds);
							},
							children: "Chạy profile đã chọn"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							disabled: !active,
							onClick: () => stopBatch(),
							children: "Dừng"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => clearFinished(),
							disabled: !jobs.length,
							children: "Xoá lịch sử"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "border-b border-line px-4 py-2 text-xs tabular-nums text-muted",
				children: [
					jobs.length,
					" phiên · ",
					done,
					" xong · ",
					failed,
					" lỗi"
				]
			}),
			jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-8 text-sm text-muted",
				children: "Chọn profile ở tab Profile rồi bấm Chạy. Profile chưa có ví sẽ dừng ở bước nạp ví."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 lg:grid-cols-[18rem_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "min-h-0 overflow-y-auto border-b border-line lg:border-b-0 lg:border-r",
					children: jobs.map((job) => {
						const pct = job.status === "done" ? 100 : Math.round(job.step / (STEPS.length - 1) * 100);
						const on = current?.id === job.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setFocus(job.id),
							className: `w-full px-4 py-3 text-left ${on ? "bg-elevated" : "hover:bg-elevated"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: job.profileName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-xs ${job.status === "failed" ? "text-danger" : job.status === "done" ? "text-sage" : "text-muted"}`,
										children: JOB_LABEL[job.status]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block truncate text-xs text-muted",
									children: job.walletLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-2 block h-1 bg-line",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block h-1 bg-sage",
										style: { width: `${pct}%` }
									})
								})
							]
						}) }, job.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 overflow-y-auto px-4 py-4",
					children: current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							STEPS[current.step] ?? "Sẵn sàng",
							" · ",
							JOB_LABEL[current.status]
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-2 font-mono text-xs text-fg",
						children: current.log.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-l border-line pl-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [String(index + 1).padStart(2, "0"), " "]
							}), line]
						}, `${current.id}-${index}`))
					})] }) : null
				})]
			})
		]
	});
}
async function markOf(secret) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
	return [...new Uint8Array(buf)].slice(0, 4).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function describeSecret(chain, kind, secret) {
	const mark = await markOf(secret);
	if (chain !== "evm") return {
		address: "",
		mark,
		valid: true
	};
	try {
		const { mnemonicToAccount, privateKeyToAccount } = await import("../_libs/viem.mjs").then((n) => n.t);
		if (kind === "privateKey") {
			const key = secret;
			if (!/^0x[0-9a-f]{64}$/.test(key)) return {
				address: "",
				mark,
				valid: false
			};
			return {
				address: privateKeyToAccount(key).address,
				mark,
				valid: true
			};
		}
		return {
			address: mnemonicToAccount(secret).address,
			mark,
			valid: true
		};
	} catch {
		return {
			address: "",
			mark,
			valid: false
		};
	}
}
function Wallets({ onRan }) {
	const wallets = useOrbit((s) => s.wallets);
	const profiles = useOrbit((s) => s.profiles);
	const vaultOn = useOrbit((s) => s.vaultOn);
	const locked = useOrbit((s) => s.locked);
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [passOpen, setPassOpen] = (0, import_react.useState)(false);
	const [shown, setShown] = (0, import_react.useState)(null);
	if (vaultOn && locked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-medium",
				children: "Kho ví"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Kho đang khoá. Bí mật không hiện và không nằm dạng chữ thường."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockForm, {})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-medium",
					children: "Kho ví"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted",
					children: "Dán không giới hạn cụm từ hoặc private key. Chúng chỉ ở lại trình duyệt này, không gửi đi đâu."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [vaultOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => lockVault(),
							children: "Khoá"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => {
								const blob = useOrbit.getState().vaultBlob;
								if (!blob) {
									notify("Chưa có bản mã hoá");
									return;
								}
								downloadJson("orbit-vault.json", blob);
							},
							children: "Tải kho mã hoá"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								try {
									disableVault();
									notify("Đã gỡ mật khẩu. Ví lưu cục bộ, không mã hoá");
								} catch (error) {
									notify(error instanceof Error ? error.message : "Không gỡ được");
								}
							},
							children: "Gỡ mật khẩu"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: () => setPassOpen(true),
						children: "Đặt mật khẩu kho"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						onClick: () => setImportOpen(true),
						children: "Nhập ví"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: wallets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Chưa có ví. Mỗi dòng một cụm 12/24 từ, hoặc một private key hex. Có thể ghi nhãn phía trước dấu |."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "primary",
						onClick: () => setImportOpen(true),
						children: "Nhập ví"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: wallets.map((wallet) => {
					const profile = profiles.find((item) => item.id === wallet.profileId);
					const open = shown === wallet.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-b border-line px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "w-full bg-transparent text-base font-medium text-fg outline-none md:text-sm",
											value: wallet.label,
											onChange: (event) => renameWallet(wallet.id, event.target.value),
											"aria-label": "Tên ví"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted",
											children: [
												CHAIN_LABEL[wallet.chain],
												" · ",
												wallet.kind === "seed" ? "cụm từ" : "khoá riêng",
												wallet.valid ? "" : " · không suy được địa chỉ"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-mono text-xs text-muted",
											children: wallet.address ? shortAddr(wallet.address) : `dấu ${wallet.mark}`
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "quiet",
											onClick: () => setShown(open ? null : wallet.id),
											children: open ? "Ẩn" : "Hiện"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "primary",
											disabled: !wallet.profileId,
											onClick: () => {
												if (wallet.profileId && startBatch([wallet.profileId])) onRan();
											},
											children: "Chạy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "danger",
											onClick: () => removeWallets([wallet.id]),
											children: "Xoá"
										})
									]
								})]
							}),
							open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 break-all rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-fg",
								children: wallet.secret
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-2 block text-xs text-muted",
								children: ["Profile", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: `${fieldClass} mt-1`,
									value: wallet.profileId ?? "",
									onChange: (event) => assignWallet(wallet.id, event.target.value || null),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Chưa gắn"
									}), profiles.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: item.id,
										children: [item.name, profile && item.id === profile.id ? "" : ""]
									}, item.id))]
								})]
							})
						]
					}, wallet.id);
				}) })
			}),
			importOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDialog, {
				onClose: () => setImportOpen(false),
				onRan
			}) : null,
			passOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassDialog, { onClose: () => setPassOpen(false) }) : null
		]
	});
}
function UnlockForm() {
	const [pass, setPass] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mx-auto w-full max-w-sm space-y-3 px-4 py-8",
		onSubmit: (event) => {
			event.preventDefault();
			unlockVault(pass).then(() => notify("Đã mở kho")).catch((reason) => {
				setError(reason instanceof Error ? reason.message : "Không mở được");
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm text-muted",
				children: ["Mật khẩu kho", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: `${fieldClass} mt-1`,
					type: "password",
					value: pass,
					onChange: (event) => setPass(event.target.value),
					autoComplete: "current-password"
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "primary",
				type: "submit",
				children: "Mở khoá"
			})
		]
	});
}
function PassDialog({ onClose }) {
	const [pass, setPass] = (0, import_react.useState)("");
	const [again, setAgain] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open: true,
		onClose,
		title: "Mật khẩu kho",
		description: "Dùng để mã hoá ví trước khi ghi vào trình duyệt.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				if (pass !== again) {
					setError("Hai lần nhập chưa khớp");
					return;
				}
				enableVault(pass).then(() => {
					notify("Kho đã được mã hoá trên máy này");
					onClose();
				}).catch((reason) => {
					setError(reason instanceof Error ? reason.message : "Không đặt được mật khẩu");
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClass,
					type: "password",
					placeholder: "Tối thiểu 6 ký tự",
					value: pass,
					onChange: (event) => setPass(event.target.value),
					autoComplete: "new-password",
					"aria-label": "Mật khẩu"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClass,
					type: "password",
					placeholder: "Nhập lại",
					value: again,
					onChange: (event) => setAgain(event.target.value),
					autoComplete: "new-password",
					"aria-label": "Nhập lại mật khẩu"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: onClose,
						children: "Huỷ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						type: "submit",
						children: "Lưu"
					})]
				})
			]
		})
	});
}
function ImportDialog({ onClose }) {
	const profiles = useOrbit((s) => s.profiles);
	const selectedIds = useOrbit((s) => s.selectedIds);
	const [raw, setRaw] = (0, import_react.useState)("");
	const [chain, setChain] = (0, import_react.useState)("evm");
	const [assign, setAssign] = (0, import_react.useState)("round");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const targets = selectedIds.length ? selectedIds : profiles.map((profile) => profile.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open: true,
		onClose,
		title: "Nhập ví",
		description: "Mỗi dòng một ví. Nhãn tuỳ chọn: Tên | cụm từ hoặc private key.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				const parsed = parseSecrets(raw, chain).slice(0, 100);
				if (!parsed.length) {
					notify("Không nhận ra cụm từ hay private key nào");
					return;
				}
				setBusy(true);
				(async () => {
					const rows = [];
					for (const item of parsed) {
						const described = await describeSecret(item.chain, item.kind, item.secret);
						rows.push({
							label: item.label,
							chain: item.chain,
							kind: item.kind,
							secret: item.secret,
							address: described.address,
							mark: described.mark,
							valid: described.valid
						});
					}
					const count = addWallets(rows, assign === "none" ? { mode: "none" } : assign === "one" ? {
						mode: "one",
						profileId: targets[0] ?? ""
					} : {
						mode: "round",
						profileIds: targets
					});
					const bad = rows.filter((row) => row.chain === "evm" && !row.valid).length;
					notify(bad ? `Đã thêm ${count} ví · ${bad} ví EVM không hợp lệ vẫn được lưu` : `Đã thêm ${count} ví`);
					setBusy(false);
					onClose();
				})();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Chain cho cụm từ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-1`,
						value: chain,
						onChange: (event) => setChain(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "evm",
								children: "EVM"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "solana",
								children: "Solana"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "aptos",
								children: "Aptos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "sui",
								children: "Sui"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ton",
								children: "TON"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: ["Gán vào profile", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${fieldClass} mt-1`,
						value: assign,
						onChange: (event) => setAssign(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "round",
								children: ["Chia vòng ", selectedIds.length ? "profile đang chọn" : "mọi profile"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "one",
								children: "Tất cả vào profile đầu"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "none",
								children: "Để trong kho, chưa gắn"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "min-h-40 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-fg outline-none",
					value: raw,
					onChange: (event) => setRaw(event.target.value),
					placeholder: "Ví A | word word word …\n0xabc… 64 ký tự hex",
					"aria-label": "Danh sách ví",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: onClose,
						disabled: busy,
						children: "Huỷ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						type: "submit",
						disabled: busy,
						children: busy ? "Đang đọc…" : "Nhập"
					})]
				})
			]
		})
	});
}
var NAV = [
	{
		id: "profiles",
		label: "Profile",
		icon: AppWindow
	},
	{
		id: "proxies",
		label: "Proxy",
		icon: Waypoints
	},
	{
		id: "extensions",
		label: "Extension",
		icon: Puzzle
	},
	{
		id: "wallets",
		label: "Ví",
		icon: KeyRound
	},
	{
		id: "queue",
		label: "Hàng đợi",
		icon: ListOrdered
	}
];
function Console() {
	const [view, setView] = (0, import_react.useState)("profiles");
	const profiles = useOrbit((s) => s.profiles.length);
	const running = useOrbit((s) => s.profiles.filter((profile) => profile.status === "running").length);
	const activeJobs = useOrbit((s) => s.jobs.filter((job) => job.status === "queued" || job.status === "running").length);
	const notice = useOrbit((s) => s.notice);
	const counts = {
		profiles,
		queue: activeJobs
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg md:h-dvh md:flex-row md:overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "flex shrink-0 flex-col border-b border-line md:h-dvh md:w-56 md:border-b-0 md:border-r",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-7 text-sage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium leading-tight",
								children: "Orbit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Profile browser"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs tabular-nums text-muted md:hidden",
							children: [running, " đang mở"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const active = view === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setView(item.id),
								className: cn("flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm", active ? "bg-elevated text-sage" : "text-muted hover:bg-elevated hover:text-fg"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										"aria-hidden": "true"
									}),
									item.label,
									counts[item.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-xs text-muted",
										children: counts[item.id]
									}) : null
								]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto hidden space-y-1 px-4 py-4 text-sm text-muted md:block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "tabular-nums",
								children: [profiles, " profile"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "tabular-nums",
								children: [running, " đang mở"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs",
								children: "Khoá ví chỉ nằm trên trình duyệt này."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 min-w-0 flex-1 flex-col md:overflow-hidden",
				children: [
					view === "profiles" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Profiles, {
						onOpenWallets: () => setView("wallets"),
						onRan: () => setView("queue")
					}),
					view === "proxies" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Proxies, {}),
					view === "extensions" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extensions, {}),
					view === "wallets" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallets, { onRan: () => setView("queue") }),
					view === "queue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Queue, {})
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed bottom-4 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-md border border-line bg-elevated px-4 py-3 text-sm text-fg",
				onClick: () => useOrbit.setState({ notice: null }),
				children: notice
			}) : null
		]
	});
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		hydrate();
		setReady(true);
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8 text-sage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-medium",
				children: "Orbit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Bàn điều khiển profile"
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Console, {});
}
//#endregion
export { Home as component };
