import { useState } from "react";
import { Button, fieldClass, Modal } from "@/components/orbit/ui";
import { describeSecret } from "@/lib/orbit/derive";
import { CHAIN_LABEL, shortAddr } from "@/lib/orbit/format";
import { parseSecrets } from "@/lib/orbit/parse";
import { startBatch } from "@/lib/orbit/runner";
import {
  addWallets,
  assignWallet,
  disableVault,
  downloadJson,
  enableVault,
  lockVault,
  notify,
  removeWallets,
  renameWallet,
  unlockVault,
  useOrbit,
} from "@/lib/orbit/store";
import type { Chain } from "@/lib/orbit/types";

export function Wallets({ onRan }: { onRan: () => void }) {
  const wallets = useOrbit((s) => s.wallets);
  const profiles = useOrbit((s) => s.profiles);
  const vaultOn = useOrbit((s) => s.vaultOn);
  const locked = useOrbit((s) => s.locked);
  const [importOpen, setImportOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [shown, setShown] = useState<string | null>(null);

  if (vaultOn && locked) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-line px-4 py-3">
          <h1 className="text-lg font-medium">Kho ví</h1>
          <p className="text-sm text-muted">Kho đang khoá. Bí mật không hiện và không nằm dạng chữ thường.</p>
        </header>
        <UnlockForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h1 className="text-lg font-medium">Kho ví</h1>
          <p className="max-w-xl text-sm text-muted">
            Dán không giới hạn cụm từ hoặc private key. Chúng chỉ ở lại trình duyệt này, không gửi đi đâu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {vaultOn ? (
            <>
              <Button variant="quiet" onClick={() => lockVault()}>
                Khoá
              </Button>
              <Button
                variant="quiet"
                onClick={() => {
                  const blob = useOrbit.getState().vaultBlob;
                  if (!blob) {
                    notify("Chưa có bản mã hoá");
                    return;
                  }
                  downloadJson("orbit-vault.json", blob);
                }}
              >
                Tải kho mã hoá
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  try {
                    disableVault();
                    notify("Đã gỡ mật khẩu. Ví lưu cục bộ, không mã hoá");
                  } catch (error) {
                    notify(error instanceof Error ? error.message : "Không gỡ được");
                  }
                }}
              >
                Gỡ mật khẩu
              </Button>
            </>
          ) : (
            <Button variant="quiet" onClick={() => setPassOpen(true)}>
              Đặt mật khẩu kho
            </Button>
          )}
          <Button variant="primary" onClick={() => setImportOpen(true)}>
            Nhập ví
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {wallets.length === 0 ? (
          <div className="px-4 py-8">
            <p className="text-sm text-muted">
              Chưa có ví. Mỗi dòng một cụm 12/24 từ, hoặc một private key hex. Có thể ghi nhãn phía trước dấu |.
            </p>
            <Button className="mt-4" variant="primary" onClick={() => setImportOpen(true)}>
              Nhập ví
            </Button>
          </div>
        ) : (
          <ul>
            {wallets.map((wallet) => {
              const profile = profiles.find((item) => item.id === wallet.profileId);
              const open = shown === wallet.id;
              return (
                <li key={wallet.id} className="border-b border-line px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <input
                        className="w-full bg-transparent text-base font-medium text-fg outline-none md:text-sm"
                        value={wallet.label}
                        onChange={(event) => renameWallet(wallet.id, event.target.value)}
                        aria-label="Tên ví"
                      />
                      <p className="mt-1 text-xs text-muted">
                        {CHAIN_LABEL[wallet.chain]} · {wallet.kind === "seed" ? "cụm từ" : "khoá riêng"}
                        {wallet.valid ? "" : " · không suy được địa chỉ"}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted">
                        {wallet.address ? shortAddr(wallet.address) : `dấu ${wallet.mark}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="quiet" onClick={() => setShown(open ? null : wallet.id)}>
                        {open ? "Ẩn" : "Hiện"}
                      </Button>
                      <Button
                        variant="primary"
                        disabled={!wallet.profileId}
                        onClick={() => {
                          if (wallet.profileId && startBatch([wallet.profileId])) onRan();
                        }}
                      >
                        Chạy
                      </Button>
                      <Button variant="danger" onClick={() => removeWallets([wallet.id])}>
                        Xoá
                      </Button>
                    </div>
                  </div>
                  {open ? (
                    <p className="mt-2 break-all rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-fg">
                      {wallet.secret}
                    </p>
                  ) : null}
                  <label className="mt-2 block text-xs text-muted">
                    Profile
                    <select
                      className={`${fieldClass} mt-1`}
                      value={wallet.profileId ?? ""}
                      onChange={(event) => assignWallet(wallet.id, event.target.value || null)}
                    >
                      <option value="">Chưa gắn</option>
                      {profiles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                          {profile && item.id === profile.id ? "" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {importOpen ? (
        <ImportDialog
          onClose={() => setImportOpen(false)}
          onRan={onRan}
        />
      ) : null}
      {passOpen ? <PassDialog onClose={() => setPassOpen(false)} /> : null}
    </div>
  );
}

function UnlockForm() {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="mx-auto w-full max-w-sm space-y-3 px-4 py-8"
      onSubmit={(event) => {
        event.preventDefault();
        void unlockVault(pass)
          .then(() => notify("Đã mở kho"))
          .catch((reason: unknown) => {
            setError(reason instanceof Error ? reason.message : "Không mở được");
          });
      }}
    >
      <label className="block text-sm text-muted">
        Mật khẩu kho
        <input
          className={`${fieldClass} mt-1`}
          type="password"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button variant="primary" type="submit">
        Mở khoá
      </Button>
    </form>
  );
}

function PassDialog({ onClose }: { onClose: () => void }) {
  const [pass, setPass] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal open onClose={onClose} title="Mật khẩu kho" description="Dùng để mã hoá ví trước khi ghi vào trình duyệt.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (pass !== again) {
            setError("Hai lần nhập chưa khớp");
            return;
          }
          void enableVault(pass)
            .then(() => {
              notify("Kho đã được mã hoá trên máy này");
              onClose();
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Không đặt được mật khẩu");
            });
        }}
      >
        <input
          className={fieldClass}
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          autoComplete="new-password"
          aria-label="Mật khẩu"
        />
        <input
          className={fieldClass}
          type="password"
          placeholder="Nhập lại"
          value={again}
          onChange={(event) => setAgain(event.target.value)}
          autoComplete="new-password"
          aria-label="Nhập lại mật khẩu"
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="quiet" onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="primary" type="submit">
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ImportDialog({ onClose }: { onClose: () => void; onRan: () => void }) {
  const profiles = useOrbit((s) => s.profiles);
  const selectedIds = useOrbit((s) => s.selectedIds);
  const [raw, setRaw] = useState("");
  const [chain, setChain] = useState<Chain>("evm");
  const [assign, setAssign] = useState("round");
  const [busy, setBusy] = useState(false);
  const targets = selectedIds.length ? selectedIds : profiles.map((profile) => profile.id);

  return (
    <Modal
      open
      onClose={onClose}
      title="Nhập ví"
      description="Mỗi dòng một ví. Nhãn tuỳ chọn: Tên | cụm từ hoặc private key."
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const parsed = parseSecrets(raw, chain).slice(0, 100);
          if (!parsed.length) {
            notify("Không nhận ra cụm từ hay private key nào");
            return;
          }
          setBusy(true);
          void (async () => {
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
                valid: described.valid,
              });
            }
            const count = addWallets(
              rows,
              assign === "none"
                ? { mode: "none" }
                : assign === "one"
                  ? { mode: "one", profileId: targets[0] ?? "" }
                  : { mode: "round", profileIds: targets },
            );
            const bad = rows.filter((row) => row.chain === "evm" && !row.valid).length;
            notify(
              bad
                ? `Đã thêm ${count} ví · ${bad} ví EVM không hợp lệ vẫn được lưu`
                : `Đã thêm ${count} ví`,
            );
            setBusy(false);
            onClose();
          })();
        }}
      >
        <label className="block text-sm text-muted">
          Chain cho cụm từ
          <select
            className={`${fieldClass} mt-1`}
            value={chain}
            onChange={(event) => setChain(event.target.value as Chain)}
          >
            <option value="evm">EVM</option>
            <option value="solana">Solana</option>
            <option value="aptos">Aptos</option>
            <option value="sui">Sui</option>
            <option value="ton">TON</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          Gán vào profile
          <select className={`${fieldClass} mt-1`} value={assign} onChange={(event) => setAssign(event.target.value)}>
            <option value="round">
              Chia vòng {selectedIds.length ? "profile đang chọn" : "mọi profile"}
            </option>
            <option value="one">Tất cả vào profile đầu</option>
            <option value="none">Để trong kho, chưa gắn</option>
          </select>
        </label>
        <textarea
          className="min-h-40 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-fg outline-none"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={"Ví A | word word word …\n0xabc… 64 ký tự hex"}
          aria-label="Danh sách ví"
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="quiet" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button variant="primary" type="submit" disabled={busy}>
            {busy ? "Đang đọc…" : "Nhập"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
