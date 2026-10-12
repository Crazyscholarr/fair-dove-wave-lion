import { createServerFn } from "@tanstack/react-start";
import { PLUGIN_OPS } from "@/lib/orbit/plugin-contract";

export type OperatorRequest = {
  baseUrl: string;
  apiKey: string;
  model: string;
  instruction: string;
  snapshot: unknown;
};

export type OperatorReply = { ok: true; text: string } | { ok: false; error: string };

function cleanBase(value: string) {
  const base = value.trim().replace(/\/+$/, "");
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    throw new Error("Địa chỉ API không hợp lệ");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Chỉ nhận địa chỉ http hoặc https");
  }
  if (url.hostname === "169.254.169.254" || url.hostname === "metadata.google.internal") {
    throw new Error("Địa chỉ này không được dùng");
  }
  return url.toString().replace(/\/+$/, "");
}

export const askOperator = createServerFn({ method: "POST" })
  .validator((data: OperatorRequest) => data)
  .handler(async ({ data }): Promise<OperatorReply> => {
    try {
      const base = cleanBase(data.baseUrl);
      const model = data.model.trim();
      const instruction = data.instruction.trim().slice(0, 2000);
      const apiKey = data.apiKey.trim();
      if (!model) return { ok: false, error: "Thiếu tên model" };
      if (!instruction) return { ok: false, error: "Thiếu lệnh" };
      if (!apiKey) return { ok: false, error: "Thiếu khoá API" };
      const state = JSON.stringify(data.snapshot);
      if (state.length > 80_000) return { ok: false, error: "Trạng thái quá lớn để gửi cho AI" };
      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            {
              role: "system",
              content: `Bạn vận hành bàn điều khiển Orbit. Chỉ trả về một JSON {"actions":[...]} , không markdown, không giải thích ngoài JSON. ${PLUGIN_OPS} Dùng đúng tên profile, proxy, extension, ví trong state. Nếu không đủ dữ liệu, trả {"actions":[{"op":"say","text":"..."}]}.`,
            },
            { role: "user", content: JSON.stringify({ instruction, state: data.snapshot }) },
          ],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      const raw = await response.text();
      if (!response.ok) {
        return { ok: false, error: `API ${response.status}: ${raw.slice(0, 280)}` };
      }
      const parsed = JSON.parse(raw) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = parsed.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false, error: "API không trả nội dung" };
      return { ok: true, text };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gọi được API";
      return { ok: false, error: message };
    }
  });
