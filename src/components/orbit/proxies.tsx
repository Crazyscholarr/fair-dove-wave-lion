import { useState } from "react";
import { Button, fieldClass } from "@/components/orbit/ui";
import { parseProxies } from "@/lib/orbit/parse";
import { addProxies, checkProxy, notify, removeProxies, useOrbit } from "@/lib/orbit/store";
import type { ProxyProto } from "@/lib/orbit/types";

export function Proxies() {
  const proxies = useOrbit((s) => s.proxies);
  const profiles = useOrbit((s) => s.profiles);
  const [raw, setRaw] = useState("");
  const [checking, setChecking] = useState<string | "all" | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    protocol: "socks5" as ProxyProto,
    host: "",
    port: "1080",
    username: "",
    password: "",
    country: "",
  });

  async function check(id: string) {
    setChecking(id);
    await checkProxy(id);
    setChecking((current) => (current === id ? null : current));
  }

  async function checkAll() {
    setChecking("all");
    for (const proxy of useOrbit.getState().proxies) {
      await checkProxy(proxy.id);
    }
    setChecking(null);
    notify("Đã kiểm tra xong danh sách proxy");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h1 className="text-lg font-medium">Proxy</h1>
          <p className="text-sm text-muted">HTTP hoặc SOCKS5. Dán hàng loạt theo kiểu host:port:user:pass.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="quiet" onClick={() => void checkAll()} disabled={!proxies.length || checking === "all"}>
            {checking === "all" ? "Đang kiểm tra…" : "Kiểm tra tất cả"}
          </Button>
          <Button variant="primary" onClick={() => setOpen((value) => !value)}>
            Thêm proxy
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {open ? (
          <form
            className="space-y-3 border-b border-line px-4 py-4"
            onSubmit={(event) => {
              event.preventDefault();
              const parsed = parseProxies(raw);
              const manual = form.host.trim()
                ? parseProxies(
                    `${form.protocol}://${
                      form.username ? `${form.username}:${form.password}@` : ""
                    }${form.host.trim()}:${form.port}`,
                  ).map((row) => ({ ...row, country: form.country.trim().toUpperCase() }))
                : [];
              const rows = [...manual, ...parsed];
              if (!rows.length) {
                notify("Không đọc được proxy nào");
                return;
              }
              const count = addProxies(rows);
              setRaw("");
              setForm({ protocol: "socks5", host: "", port: "1080", username: "", password: "", country: "" });
              setOpen(false);
              notify(`Đã thêm ${count} proxy`);
            }}
          >
            <div className="grid gap-2 md:grid-cols-3">
              <select
                className={fieldClass}
                value={form.protocol}
                onChange={(event) => setForm({ ...form, protocol: event.target.value as ProxyProto })}
                aria-label="Giao thức"
              >
                <option value="socks5">SOCKS5</option>
                <option value="http">HTTP</option>
              </select>
              <input
                className={fieldClass}
                placeholder="Host"
                value={form.host}
                onChange={(event) => setForm({ ...form, host: event.target.value })}
                aria-label="Host"
              />
              <input
                className={`${fieldClass} tabular-nums`}
                placeholder="Cổng"
                value={form.port}
                onChange={(event) => setForm({ ...form, port: event.target.value })}
                aria-label="Cổng"
              />
              <input
                className={fieldClass}
                placeholder="User"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                aria-label="User"
              />
              <input
                className={fieldClass}
                placeholder="Mật khẩu"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                aria-label="Mật khẩu proxy"
              />
              <input
                className={fieldClass}
                placeholder="Quốc gia, ví dụ VN"
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                aria-label="Quốc gia"
              />
            </div>
            <textarea
              className="min-h-28 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-sm text-fg outline-none"
              placeholder={"Dán nhiều dòng\nsocks5://user:pass@203.0.113.8:1080\n198.51.100.9:8000:user:pass"}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              aria-label="Dán danh sách proxy"
            />
            <div className="flex justify-end gap-2">
              <Button variant="quiet" onClick={() => setOpen(false)}>
                Đóng
              </Button>
              <Button variant="primary" type="submit">
                Lưu
              </Button>
            </div>
          </form>
        ) : null}
        {proxies.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">Chưa có proxy.</p>
        ) : (
          <ul>
            {proxies.map((proxy) => {
              const used = profiles.filter((profile) => profile.proxyId === proxy.id).length;
              const tone =
                proxy.alive === true ? "text-sage" : proxy.alive === false ? "text-danger" : "text-warn";
              const label = proxy.alive === true ? "sống" : proxy.alive === false ? "chết" : "chưa kiểm tra";
              return (
                <li key={proxy.id} className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {proxy.country ? `${proxy.country} · ` : ""}
                      {proxy.label}
                    </p>
                    <p className="truncate font-mono text-xs text-muted">
                      {proxy.protocol}://{proxy.host}:{proxy.port}
                      {proxy.username ? ` · ${proxy.username}` : ""}
                    </p>
                    <p className={`text-xs ${tone}`}>
                      {label}
                      {proxy.latencyMs ? ` · ${proxy.latencyMs} ms` : ""} · {used} profile
                    </p>
                  </div>
                  <Button variant="quiet" onClick={() => void check(proxy.id)} disabled={checking !== null}>
                    {checking === proxy.id ? "…" : "Kiểm tra"}
                  </Button>
                  <Button variant="danger" onClick={() => removeProxies([proxy.id])}>
                    Xoá
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
