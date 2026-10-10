import { useMemo, useState } from "react";
import { Button, fieldClass, Modal, StatusDot } from "@/components/orbit/ui";
import { ago, OS_LABEL, STATUS_LABEL } from "@/lib/orbit/format";
import { makeFingerprint } from "@/lib/orbit/fingerprint";
import { setQueueConcurrency, startBatch } from "@/lib/orbit/runner";
import {
  addProfiles,
  assignWallet,
  downloadJson,
  duplicateProfile,
  notify,
  patchProfile,
  removeProfiles,
  setSelected,
  toggleProfileExtension,
  toggleSelected,
  useOrbit,
} from "@/lib/orbit/store";
import type { OsKind, Profile } from "@/lib/orbit/types";

export function Profiles({
  onOpenWallets,
  onRan,
}: {
  onOpenWallets: () => void;
  onRan: () => void;
}) {
  const profiles = useOrbit((s) => s.profiles);
  const proxies = useOrbit((s) => s.proxies);
  const wallets = useOrbit((s) => s.wallets);
  const locked = useOrbit((s) => s.locked);
  const selectedIds = useOrbit((s) => s.selectedIds);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(profiles[0]?.id ?? null);
  const [sheet, setSheet] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const groups = useMemo(
    () => [...new Set(profiles.map((profile) => profile.group))].sort(),
    [profiles],
  );
  const visible = profiles.filter((profile) => {
    const blob = `${profile.name} ${profile.group} ${profile.notes}`.toLowerCase();
    if (query && !blob.includes(query.trim().toLowerCase())) return false;
    if (group !== "all" && profile.group !== group) return false;
    if (status !== "all" && profile.status !== status) return false;
    return true;
  });
  const selected = profiles.find((profile) => profile.id === openId) ?? null;
  const allOn = visible.length > 0 && visible.every((profile) => selectedIds.includes(profile.id));

  function run(ids: string[]) {
    setQueueConcurrency(2);
    if (startBatch(ids)) onRan();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h1 className="text-lg font-medium">Profile</h1>
          <p className="text-sm text-muted">Không giới hạn. Mỗi profile một vân tay, một proxy, một bộ ví.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="quiet" onClick={() => downloadConfig()}>
            Xuất JSON
          </Button>
          <Button
            variant="danger"
            disabled={!selectedIds.length}
            onClick={() => setConfirmDelete(true)}
          >
            Xoá {selectedIds.length || ""}
          </Button>
          <Button variant="primary" onClick={() => run(selectedIds)} disabled={!selectedIds.length}>
            Chạy {selectedIds.length || ""}
          </Button>
          <Button variant="primary" onClick={() => setCreating(true)}>
            Tạo profile
          </Button>
        </div>
      </header>
      <div className="flex flex-col gap-2 border-b border-line px-4 py-3 md:flex-row">
        <input
          className={fieldClass}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm tên, nhóm, ghi chú"
          aria-label="Tìm profile"
        />
        <select className={fieldClass} value={group} onChange={(event) => setGroup(event.target.value)} aria-label="Nhóm">
          <option value="all">Mọi nhóm</option>
          {groups.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Trạng thái"
        >
          <option value="all">Mọi trạng thái</option>
          <option value="idle">Nghỉ</option>
          <option value="running">Đang mở</option>
          <option value="error">Lỗi</option>
        </select>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 lg:overflow-y-auto">
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">Không có profile khớp bộ lọc.</p>
          ) : (
            <>
              <table className="hidden w-full text-sm lg:table">
                <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
                  <tr>
                    <th className="w-12 px-4 py-3 font-medium">
                      <input
                        type="checkbox"
                        className="size-4 accent-sage"
                        checked={allOn}
                        onChange={() => {
                          const visibleIds = new Set(visible.map((profile) => profile.id));
                          setSelected(
                            allOn
                              ? selectedIds.filter((id) => !visibleIds.has(id))
                              : [...new Set([...selectedIds, ...visible.map((profile) => profile.id)])],
                          );
                        }}
                        aria-label="Chọn tất cả"
                      />
                    </th>
                    <th className="px-2 py-3 font-medium">Tên</th>
                    <th className="px-2 py-3 font-medium">Nhóm</th>
                    <th className="px-2 py-3 font-medium">Proxy</th>
                    <th className="px-2 py-3 font-medium">Ext</th>
                    <th className="px-2 py-3 font-medium">Ví</th>
                    <th className="px-2 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((profile) => (
                    <ProfileRow
                      key={profile.id}
                      profile={profile}
                      proxy={proxies.find((item) => item.id === profile.proxyId)}
                      walletCount={
                        locked ? 0 : wallets.filter((wallet) => wallet.profileId === profile.id).length
                      }
                      selected={selectedIds.includes(profile.id)}
                      active={profile.id === openId}
                      onOpen={() => {
                        setOpenId(profile.id);
                        setSheet(true);
                      }}
                    />
                  ))}
                </tbody>
              </table>
              <ul className="lg:hidden">
                {visible.map((profile) => {
                  const proxy = proxies.find((item) => item.id === profile.proxyId);
                  return (
                    <li key={profile.id} className="flex items-stretch border-b border-line">
                      <label className="flex w-12 items-center justify-center">
                        <input
                          type="checkbox"
                          className="size-4 accent-sage"
                          checked={selectedIds.includes(profile.id)}
                          onChange={() => toggleSelected(profile.id)}
                          aria-label={`Chọn ${profile.name}`}
                        />
                      </label>
                      <button
                        type="button"
                        className="min-w-0 flex-1 px-2 py-3 text-left"
                        onClick={() => {
                          setOpenId(profile.id);
                          setSheet(true);
                        }}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">{profile.name}</span>
                          <span className="flex items-center gap-2 text-xs text-muted">
                            <StatusDot status={profile.status} />
                            {STATUS_LABEL[profile.status]}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-sm text-muted">
                          {profile.group}
                          {" · "}
                          {proxy ? `${proxy.country || proxy.protocol} ${proxy.host}` : "không proxy"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
        {selected ? (
          <Inspector
            profile={selected}
            className="hidden min-h-0 w-96 shrink-0 overflow-y-auto border-l border-line lg:block"
            onOpenWallets={onOpenWallets}
            onRun={() => run([selected.id])}
            onClose={() => setOpenId(null)}
          />
        ) : null}
      </div>
      {sheet && selected ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-30 overflow-y-auto bg-bg">
            <Inspector
              profile={selected}
              className="min-h-dvh"
              onOpenWallets={onOpenWallets}
              onRun={() => run([selected.id])}
              onClose={() => setSheet(false)}
            />
          </div>
        </div>
      ) : null}
      {creating ? <CreateDialog groups={groups} onClose={() => setCreating(false)} /> : null}
      {confirmDelete ? (
        <Modal
          open
          onClose={() => setConfirmDelete(false)}
          title={`Xoá ${selectedIds.length} profile?`}
          description="Ví gắn kèm được thả về kho, không bị xoá theo."
        >
          <div className="flex justify-end gap-2">
            <Button variant="quiet" onClick={() => setConfirmDelete(false)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeProfiles(selectedIds);
                setConfirmDelete(false);
              }}
            >
              Xoá
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function downloadConfig() {
  const state = useOrbit.getState();
  downloadJson("orbit-profiles.json", {
    profiles: state.profiles,
    proxies: state.proxies,
    extensions: state.extensions,
  });
}

function ProfileRow({
  profile,
  proxy,
  walletCount,
  selected,
  active,
  onOpen,
}: {
  profile: Profile;
  proxy?: { country: string; host: string; port: number; alive: boolean | null };
  walletCount: number;
  selected: boolean;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <tr className={active ? "bg-elevated" : "hover:bg-elevated"}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          className="size-4 accent-sage"
          checked={selected}
          onChange={() => toggleSelected(profile.id)}
          aria-label={`Chọn ${profile.name}`}
        />
      </td>
      <td className="px-2 py-3">
        <button type="button" className="text-left font-medium" onClick={onOpen}>
          {profile.name}
        </button>
        <p className="text-xs text-muted">{OS_LABEL[profile.os]} · {ago(profile.lastRunAt)}</p>
      </td>
      <td className="px-2 py-3 text-muted">{profile.group}</td>
      <td className="max-w-40 truncate px-2 py-3 font-mono text-xs text-muted">
        {proxy ? (
          <span className={proxy.alive === false ? "text-danger" : undefined}>
            {proxy.country ? `${proxy.country} · ` : ""}
            {proxy.host}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-2 py-3 tabular-nums text-muted">{profile.extensionIds.length}</td>
      <td className="px-2 py-3 tabular-nums text-muted">{walletCount || "—"}</td>
      <td className="px-2 py-3">
        <span className="inline-flex items-center gap-2 text-muted">
          <StatusDot status={profile.status} />
          {STATUS_LABEL[profile.status]}
        </span>
      </td>
    </tr>
  );
}

function Inspector({
  profile,
  className,
  onClose,
  onRun,
  onOpenWallets,
}: {
  profile: Profile;
  className?: string;
  onClose: () => void;
  onRun: () => void;
  onOpenWallets: () => void;
}) {
  const proxies = useOrbit((s) => s.proxies);
  const extensions = useOrbit((s) => s.extensions);
  const wallets = useOrbit((s) => s.wallets);
  const locked = useOrbit((s) => s.locked);
  const mine = locked ? [] : wallets.filter((wallet) => wallet.profileId === profile.id);
  const free = locked ? [] : wallets.filter((wallet) => !wallet.profileId);
  const fp = profile.fingerprint;

  return (
    <aside className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="font-medium">{profile.name}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={onRun}>
            Đăng nhập ví
          </Button>
          <Button variant="quiet" onClick={() => duplicateProfile(profile.id)}>
            Nhân bản
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
      <div className="space-y-4 px-4 py-4">
        <label className="block text-sm text-muted">
          Tên
          <input
            className={`${fieldClass} mt-1`}
            value={profile.name}
            onChange={(event) => patchProfile(profile.id, { name: event.target.value })}
          />
        </label>
        <label className="block text-sm text-muted">
          Nhóm
          <input
            className={`${fieldClass} mt-1`}
            value={profile.group}
            onChange={(event) => patchProfile(profile.id, { group: event.target.value })}
          />
        </label>
        <label className="block text-sm text-muted">
          Hệ điều hành
          <select
            className={`${fieldClass} mt-1`}
            value={profile.os}
            onChange={(event) => {
              const os = event.target.value as OsKind;
              patchProfile(profile.id, { os, fingerprint: makeFingerprint(os) });
            }}
          >
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="android">Android</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          Proxy
          <select
            className={`${fieldClass} mt-1`}
            value={profile.proxyId ?? ""}
            onChange={(event) => patchProfile(profile.id, { proxyId: event.target.value || null })}
          >
            <option value="">Không proxy</option>
            {proxies.map((proxy) => (
              <option key={proxy.id} value={proxy.id}>
                {(proxy.country || proxy.protocol).toUpperCase()} · {proxy.host}:{proxy.port}
              </option>
            ))}
          </select>
        </label>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-muted">Vân tay</p>
            <button
              type="button"
              className="text-sm text-sage"
              onClick={() => patchProfile(profile.id, { fingerprint: makeFingerprint(profile.os) })}
            >
              Đổi vân tay
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Fact label="Màn hình" value={fp.screen} />
            <Fact label="Múi giờ" value={fp.timezone} />
            <Fact label="Ngôn ngữ" value={fp.language} />
            <Fact label="Máy" value={`${fp.cores} nhân · ${fp.memory} GB`} />
            <Fact label="Canvas" value={fp.canvas} />
            <Fact label="Audio" value={fp.audio} />
          </dl>
          <p className="mt-2 break-all font-mono text-xs text-muted">{fp.userAgent}</p>
          <p className="mt-1 break-all text-xs text-muted">{fp.webgl}</p>
        </div>
        <div>
          <p className="mb-2 text-sm text-muted">Extension</p>
          <ul className="space-y-1">
            {extensions.length === 0 ? (
              <li className="text-sm text-muted">Thư viện đang trống.</li>
            ) : (
              extensions.map((item) => (
                <li key={item.id}>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-sage"
                      checked={profile.extensionIds.includes(item.id)}
                      onChange={() => toggleProfileExtension(profile.id, item.id)}
                    />
                    {item.name}
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-muted">Ví trên profile</p>
            <button type="button" className="text-sm text-sage" onClick={onOpenWallets}>
              Mở kho
            </button>
          </div>
          {locked ? (
            <p className="text-sm text-muted">Kho đang khoá.</p>
          ) : mine.length === 0 ? (
            <p className="text-sm text-muted">Chưa gắn ví.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {mine.map((wallet) => (
                <li key={wallet.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{wallet.label}</span>
                  <span className="text-xs uppercase text-muted">{wallet.chain}</span>
                </li>
              ))}
            </ul>
          )}
          {!locked && free.length > 0 ? (
            <select
              className={`${fieldClass} mt-2`}
              value=""
              onChange={(event) => {
                if (!event.target.value) return;
                assignWallet(event.target.value, profile.id);
              }}
              aria-label="Gắn ví có sẵn"
            >
              <option value="">Gắn ví có sẵn…</option>
              {free.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <label className="block text-sm text-muted">
          Ghi chú
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-line bg-bg px-3 py-2 text-base text-fg outline-none md:text-sm"
            value={profile.notes}
            onChange={(event) => patchProfile(profile.id, { notes: event.target.value })}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            onClick={() => {
              removeProfiles([profile.id]);
              onClose();
            }}
          >
            Xoá profile
          </Button>
        </div>
      </div>
    </aside>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-2 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 break-all font-mono text-fg">{value}</dd>
    </div>
  );
}

function CreateDialog({ groups, onClose }: { groups: string[]; onClose: () => void }) {
  const extensions = useOrbit((s) => s.extensions);
  const proxyCount = useOrbit((s) => s.proxies.length);
  const [base, setBase] = useState("HCM");
  const [count, setCount] = useState(5);
  const [group, setGroup] = useState(groups[0] ?? "Airdrop");
  const [os, setOs] = useState<OsKind>("windows");
  const [proxyMode, setProxyMode] = useState<"none" | "round">(proxyCount ? "round" : "none");
  const [extensionIds, setExtensionIds] = useState<string[]>(
    extensions.filter((item) => item.name === "MetaMask").map((item) => item.id),
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="Tạo profile"
      description="Mỗi lần tối đa 100. Tạo tiếp bao nhiêu lần cũng được — không có trần."
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const made = addProfiles({ base, count, group, os, proxyMode, extensionIds });
          notify(`Đã tạo ${made} profile`);
          onClose();
        }}
      >
        <label className="block text-sm text-muted">
          Tên gốc
          <input className={`${fieldClass} mt-1`} value={base} onChange={(event) => setBase(event.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          Số lượng
          <input
            className={`${fieldClass} mt-1 tabular-nums`}
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
        <label className="block text-sm text-muted">
          Nhóm
          <input
            className={`${fieldClass} mt-1`}
            list="orbit-groups"
            value={group}
            onChange={(event) => setGroup(event.target.value)}
          />
          <datalist id="orbit-groups">
            {groups.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
        <label className="block text-sm text-muted">
          Hệ điều hành
          <select
            className={`${fieldClass} mt-1`}
            value={os}
            onChange={(event) => setOs(event.target.value as OsKind)}
          >
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="android">Android</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          Proxy
          <select
            className={`${fieldClass} mt-1`}
            value={proxyMode}
            onChange={(event) => setProxyMode(event.target.value as "none" | "round")}
          >
            <option value="none">Không gắn</option>
            <option value="round">Chia vòng các proxy đã có</option>
          </select>
        </label>
        <fieldset>
          <legend className="text-sm text-muted">Extension gắn sẵn</legend>
          <ul className="mt-1">
            {extensions.map((item) => (
              <li key={item.id}>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-sage"
                    checked={extensionIds.includes(item.id)}
                    onChange={() =>
                      setExtensionIds((current) =>
                        current.includes(item.id)
                          ? current.filter((id) => id !== item.id)
                          : [...current, item.id],
                      )
                    }
                  />
                  {item.name}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button variant="quiet" onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="primary" type="submit">
            Tạo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
