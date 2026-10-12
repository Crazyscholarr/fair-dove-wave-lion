import { useState } from "react";
import { Button } from "@/components/orbit/ui";
import { clearFinished, setQueueConcurrency, startBatch, stopBatch } from "@/lib/orbit/runner";
import { useOrbit } from "@/lib/orbit/store";
import { STEPS, type JobStatus } from "@/lib/orbit/types";

const JOB_LABEL: Record<JobStatus, string> = {
  queued: "Hàng đợi",
  running: "Đang chạy",
  done: "Xong",
  failed: "Lỗi",
  stopped: "Đã dừng",
};

export function Queue() {
  const jobs = useOrbit((s) => s.jobs);
  const selectedIds = useOrbit((s) => s.selectedIds);
  const concurrency = useOrbit((s) => s.concurrency);
  const [focus, setFocus] = useState<string | null>(null);
  const active = jobs.some((job) => job.status === "queued" || job.status === "running");
  const current = jobs.find((job) => job.id === focus) ?? jobs[0] ?? null;
  const done = jobs.filter((job) => job.status === "done").length;
  const failed = jobs.filter((job) => job.status === "failed").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h1 className="text-lg font-medium">Hàng đợi đăng nhập</h1>
          <p className="max-w-xl text-sm text-muted">
            Chạy lần lượt: mở profile, gắn proxy, nạp extension, nạp ví, mở khoá. Bí mật không được ghi vào nhật ký.
            Đây là phiên trên web, không mở Chromium thật.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">
            Song song
            <input
              type="range"
              min={1}
              max={5}
              value={concurrency}
              className="w-24 accent-sage"
              onChange={(event) => setQueueConcurrency(Number(event.target.value))}
              aria-label="Số profile chạy cùng lúc"
            />
            <span className="tabular-nums text-fg">{concurrency}</span>
          </label>
          <Button
            variant="primary"
            disabled={!selectedIds.length}
            onClick={() => {
              setQueueConcurrency(concurrency);
              startBatch(selectedIds);
            }}
          >
            Chạy profile đã chọn
          </Button>
          <Button variant="danger" disabled={!active} onClick={() => stopBatch()}>
            Dừng
          </Button>
          <Button variant="quiet" onClick={() => clearFinished()} disabled={!jobs.length}>
            Xoá lịch sử
          </Button>
        </div>
      </header>
      <p className="border-b border-line px-4 py-2 text-xs tabular-nums text-muted">
        {jobs.length} phiên · {done} xong · {failed} lỗi
      </p>
      {jobs.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted">
          Chọn profile ở tab Profile rồi bấm Chạy. Profile chưa có ví sẽ dừng ở bước nạp ví.
        </p>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[18rem_1fr]">
          <ul className="min-h-0 overflow-y-auto border-b border-line lg:border-b-0 lg:border-r">
            {jobs.map((job) => {
              const pct = job.status === "done" ? 100 : Math.round((job.step / (STEPS.length - 1)) * 100);
              const on = current?.id === job.id;
              return (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => setFocus(job.id)}
                    className={`w-full px-4 py-3 text-left ${on ? "bg-elevated" : "hover:bg-elevated"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium">{job.profileName}</span>
                      <span
                        className={`text-xs ${
                          job.status === "failed" ? "text-danger" : job.status === "done" ? "text-sage" : "text-muted"
                        }`}
                      >
                        {JOB_LABEL[job.status]}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted">{job.walletLabel}</span>
                    <span className="mt-2 block h-1 bg-line">
                      <span className="block h-1 bg-sage" style={{ width: `${pct}%` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="min-h-0 overflow-y-auto px-4 py-4">
            {current ? (
              <>
                <p className="text-sm text-muted">
                  {STEPS[current.step] ?? "Sẵn sàng"} · {JOB_LABEL[current.status]}
                </p>
                <ol className="mt-3 space-y-2 font-mono text-xs text-fg">
                  {current.log.map((line, index) => (
                    <li key={`${current.id}-${index}`} className="border-l border-line pl-3">
                      <span className="text-muted">{String(index + 1).padStart(2, "0")} </span>
                      {line}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
