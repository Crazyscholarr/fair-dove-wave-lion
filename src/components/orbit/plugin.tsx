import { useEffect, useState } from "react";
import { Button, fieldClass } from "@/components/orbit/ui";
import { askOperator } from "@/lib/orbit/operator";
import { actionsFromModel, publicSnapshot, runPluginText } from "@/lib/orbit/plugin";
import { PLUGIN_OPS } from "@/lib/orbit/plugin-contract";

const SETTINGS = "orbit.plugin.settings.v1";
const KEY = "orbit.plugin.key";

type LogLine = { id: number; ok: boolean; text: string };

const SAMPLE = `[
  { "op": "create_profiles", "count": 2, "base": "Farm", "os": "windows", "proxy": "round" },
  { "op": "enqueue", "profiles": "idle" }
]`;

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS);
    if (!raw) return { baseUrl: "https://api.x.ai/v1", model: "grok-4" };
    const data = JSON.parse(raw) as { baseUrl?: string; model?: string };
    return {
      baseUrl: data.baseUrl || "https://api.x.ai/v1",
      model: data.model || "grok-4",
    };
  } catch {
    return { baseUrl: "https://api.x.ai/v1", model: "grok-4" };
  }
}

export function Plugin() {
  const saved = readSettings();
  const [baseUrl, setBaseUrl] = useState(saved.baseUrl);
  const [model, setModel] = useState(saved.model);
  const [apiKey, setApiKey] = useState("");
  const [instruction, setInstruction] = useState(
    "Tạo 2 profile Windows tên Farm, gắn proxy vòng, rồi đưa profile đang rảnh vào hàng.",
  );
  const [command, setCommand] = useState(SAMPLE);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<LogLine[]>([]);

  useEffect(() => {
    setApiKey(sessionStorage.getItem(KEY) ?? "");
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS, JSON.stringify({ baseUrl, model }));
  }, [baseUrl, model]);

  function push(ok: boolean, text: string) {
    setLines((current) => [{ id: Date.now() + Math.random(), ok, text }, ...current].slice(0, 30));
  }

  function saveKey(value: string) {
    setApiKey(value);
    setConnected(false);
    if (value.trim()) sessionStorage.setItem(KEY, value);
    else sessionStorage.removeItem(KEY);
  }

  async function ping() {
    setBusy(true);
    try {
      const reply = await askOperator({
        data: {
          baseUrl,
          apiKey,
          model,
          instruction: "Kiểm tra kết nối. Trả về đúng {\"actions\":[]}.",
          snapshot: { ping: true },
        },
      });
      if (!reply.ok) {
        setConnected(false);
        push(false, reply.error);
        return;
      }
      setConnected(true);
      push(true, "Đã kết nối AI. Khoá chỉ gửi tới địa chỉ bạn nhập.");
    } catch (error) {
      setConnected(false);
      push(false, error instanceof Error ? error.message : "Không kết nối được");
    } finally {
      setBusy(false);
    }
  }

  async function operate() {
    setBusy(true);
    try {
      const reply = await askOperator({
        data: {
          baseUrl,
          apiKey,
          model,
          instruction,
          snapshot: publicSnapshot(),
        },
      });
      if (!reply.ok) {
        push(false, reply.error);
        return;
      }
      const results = actionsFromModel(reply.text);
      for (const result of results) push(result.ok, result.message);
    } catch (error) {
      push(false, error instanceof Error ? error.message : "AI không chạy được");
    } finally {
      setBusy(false);
    }
  }

  function runLocal() {
    try {
      const results = runPluginText(command);
      for (const result of results) push(result.ok, result.message);
    } catch {
      push(false, "JSON không đọc được");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-line px-4 py-3">
        <h1 className="text-lg font-medium">Plugin</h1>
        <p className="max-w-2xl text-sm text-muted">
          Nối AI hoặc script để tự tạo profile, gắn proxy, nạp extension và chạy hàng đợi. Cụm từ và private key
          không được gửi đi, và lệnh nào chứa chúng sẽ bị chặn.
        </p>
      </header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <section className="min-h-0 space-y-3 overflow-y-auto border-b border-line px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium">AI tự vận hành</h2>
            <p className="text-xs text-muted">{connected ? "Đã kết nối" : "Chưa kết nối"}</p>
          </div>
          <label className="block text-sm text-muted">
            Địa chỉ API
            <input
              className={`${fieldClass} mt-1`}
              value={baseUrl}
              onChange={(event) => {
                setBaseUrl(event.target.value);
                setConnected(false);
              }}
              spellCheck={false}
              aria-label="Địa chỉ API"
            />
          </label>
          <label className="block text-sm text-muted">
            Model
            <input
              className={`${fieldClass} mt-1`}
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
                setConnected(false);
              }}
              spellCheck={false}
              aria-label="Tên model"
            />
          </label>
          <label className="block text-sm text-muted">
            Khoá API
            <input
              className={`${fieldClass} mt-1`}
              type="password"
              value={apiKey}
              onChange={(event) => saveKey(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Khoá API"
            />
          </label>
          <p className="text-xs text-muted">
            Tương thích kiểu OpenAI. xAI: https://api.x.ai/v1 · model grok-4. Ollama trên máy bạn:
            http://127.0.0.1:11434/v1. Khoá nằm trong phiên trình duyệt này và chỉ được chuyển tiếp tới địa chỉ trên.
          </p>
          <label className="block text-sm text-muted">
            Việc cần làm
            <textarea
              className={`${fieldClass} mt-1 h-28 py-2`}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              aria-label="Lệnh cho AI"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="quiet" disabled={busy || !apiKey.trim()} onClick={() => void ping()}>
              Kiểm tra kết nối
            </Button>
            <Button variant="primary" disabled={busy || !apiKey.trim() || !instruction.trim()} onClick={() => void operate()}>
              Để AI chạy
            </Button>
          </div>
        </section>
        <section className="min-h-0 space-y-3 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium">Cầu nối script</h2>
            <p className="text-xs text-sage">window.orbitPlugin sẵn sàng</p>
          </div>
          <p className="text-sm text-muted">
            Script cùng trang gọi snapshot() để xem trạng thái, rồi run() với mảng lệnh. Không có mật khẩu proxy, không
            có bí mật ví.
          </p>
          <pre className="overflow-x-auto rounded-md border border-line bg-bg p-3 text-xs leading-relaxed text-fg">
            {`const state = window.orbitPlugin.snapshot()
window.orbitPlugin.run(${SAMPLE})`}
          </pre>
          <label className="block text-sm text-muted">
            JSON lệnh
            <textarea
              className={`${fieldClass} mt-1 h-36 py-2 font-mono text-xs`}
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              spellCheck={false}
              aria-label="JSON lệnh plugin"
            />
          </label>
          <Button variant="primary" onClick={runLocal}>
            Chạy lệnh
          </Button>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted">{PLUGIN_OPS}</p>
        </section>
      </div>
      <div className="max-h-48 overflow-y-auto border-t border-line px-4 py-3">
        <p className="text-sm font-medium">Nhật ký</p>
        {lines.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Chưa có lệnh nào.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {lines.map((line) => (
              <li key={line.id} className={line.ok ? "text-sm text-fg" : "text-sm text-danger"}>
                {line.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
