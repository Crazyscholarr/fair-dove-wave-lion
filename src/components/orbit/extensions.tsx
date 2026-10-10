import { useRef, useState } from "react";
import { Button, fieldClass } from "@/components/orbit/ui";
import { parseExtId } from "@/lib/orbit/parse";
import { addExtension, notify, removeExtensions, useOrbit } from "@/lib/orbit/store";

const CATALOG = [
  { name: "MetaMask", extId: "nkbihfbeogaeaoehlefnkodbefgpgknn" },
  { name: "Rabby", extId: "acmacodkjbdgmoleebolmdjonilkdbch" },
  { name: "Phantom", extId: "bfnaelmomeimhlpmgjnjophhpkkoljpa" },
  { name: "Keplr", extId: "dmkamcknogkgcdfhhbddcghachkejeap" },
  { name: "OKX Wallet", extId: "mcohilncbfahbmgdjkbpemcciiolgcge" },
];

export function Extensions() {
  const extensions = useOrbit((s) => s.extensions);
  const profiles = useOrbit((s) => s.profiles);
  const fileRef = useRef<HTMLInputElement>(null);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-line px-4 py-3">
        <h1 className="text-lg font-medium">Extension</h1>
        <p className="text-sm text-muted">
          Thư viện gắn vào profile. Gói .zip / .crx được ghi tên tại đây — trình duyệt web không cài được vào Chrome thật.
        </p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-line px-4 py-4">
          <h2 className="text-sm text-muted">Thêm nhanh</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {CATALOG.map((item) => {
              const owned = extensions.some((ext) => ext.extId === item.extId);
              return (
                <li key={item.extId}>
                  <Button
                    variant={owned ? "quiet" : "primary"}
                    disabled={owned}
                    onClick={() =>
                      addExtension({ name: item.name, extId: item.extId, kind: "store", version: "cửa hàng" })
                    }
                  >
                    {owned ? item.name : `Thêm ${item.name}`}
                  </Button>
                </li>
              );
            })}
          </ul>
          <form
            className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              const extId = parseExtId(custom);
              if (!extId) {
                notify("Cần ID 32 ký tự của Chrome Web Store hoặc đường dẫn có ID đó");
                return;
              }
              const ok = addExtension({
                name: name.trim() || extId.slice(0, 8),
                extId,
                kind: "store",
                version: "cửa hàng",
              });
              if (ok) {
                setCustom("");
                setName("");
                notify("Đã thêm vào thư viện");
              }
            }}
          >
            <input
              className={fieldClass}
              placeholder="Tên, ví dụ Unisat"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Tên extension"
            />
            <input
              className={fieldClass}
              placeholder="ID hoặc link Chrome Web Store"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              aria-label="ID extension"
            />
            <Button variant="quiet" type="submit">
              Thêm ID
            </Button>
          </form>
          <div className="mt-3">
            <Button variant="quiet" onClick={() => fileRef.current?.click()}>
              Tải gói .zip / .crx
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".zip,.crx,.xpi"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                const ok = addExtension({
                  name: file.name.replace(/\.(zip|crx|xpi)$/i, "") || "Gói local",
                  extId: file.name,
                  kind: "file",
                  version: "local",
                });
                if (ok) notify(`Đã ghi ${file.name} vào thư viện`);
              }}
            />
          </div>
        </section>
        {extensions.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">Thư viện trống.</p>
        ) : (
          <ul>
            {extensions.map((item) => {
              const used = profiles.filter((profile) => profile.extensionIds.includes(item.id)).length;
              return (
                <li key={item.id} className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="truncate font-mono text-xs text-muted">
                      {item.kind === "file" ? "gói local · " : ""}
                      {item.extId}
                    </p>
                    <p className="text-xs text-muted">{used} profile</p>
                  </div>
                  <Button variant="danger" onClick={() => removeExtensions([item.id])}>
                    Gỡ
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
