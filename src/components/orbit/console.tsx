import {
  AppWindow,
  KeyRound,
  ListOrdered,
  Puzzle,
  Waypoints,
} from "lucide-react";
import { useState } from "react";
import { Extensions } from "@/components/orbit/extensions";
import { Profiles } from "@/components/orbit/profiles";
import { Proxies } from "@/components/orbit/proxies";
import { Queue } from "@/components/orbit/queue";
import { Mark } from "@/components/orbit/ui";
import { Wallets } from "@/components/orbit/wallets";
import { cn } from "@/lib/cn";
import { useOrbit } from "@/lib/orbit/store";

type View = "profiles" | "proxies" | "extensions" | "wallets" | "queue";

const NAV: { id: View; label: string; icon: typeof AppWindow }[] = [
  { id: "profiles", label: "Profile", icon: AppWindow },
  { id: "proxies", label: "Proxy", icon: Waypoints },
  { id: "extensions", label: "Extension", icon: Puzzle },
  { id: "wallets", label: "Ví", icon: KeyRound },
  { id: "queue", label: "Hàng đợi", icon: ListOrdered },
];

export function Console() {
  const [view, setView] = useState<View>("profiles");
  const profiles = useOrbit((s) => s.profiles.length);
  const running = useOrbit((s) => s.profiles.filter((profile) => profile.status === "running").length);
  const activeJobs = useOrbit((s) =>
    s.jobs.filter((job) => job.status === "queued" || job.status === "running").length,
  );
  const notice = useOrbit((s) => s.notice);
  const counts: Partial<Record<View, number>> = {
    profiles,
    queue: activeJobs,
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg md:h-dvh md:flex-row md:overflow-hidden">
      <aside className="flex shrink-0 flex-col border-b border-line md:h-dvh md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Mark className="size-7 text-sage" />
            <div>
              <p className="font-medium leading-tight">Orbit</p>
              <p className="text-xs text-muted">Profile browser</p>
            </div>
          </div>
          <p className="text-xs tabular-nums text-muted md:hidden">
            {running} đang mở
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-elevated text-sage" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
                {counts[item.id] ? (
                  <span className="tabular-nums text-xs text-muted">{counts[item.id]}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto hidden space-y-1 px-4 py-4 text-sm text-muted md:block">
          <p className="tabular-nums">{profiles} profile</p>
          <p className="tabular-nums">{running} đang mở</p>
          <p className="text-xs">Khoá ví chỉ nằm trên trình duyệt này.</p>
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:overflow-hidden">
        {view === "profiles" && (
          <Profiles onOpenWallets={() => setView("wallets")} onRan={() => setView("queue")} />
        )}
        {view === "proxies" && <Proxies />}
        {view === "extensions" && <Extensions />}
        {view === "wallets" && <Wallets onRan={() => setView("queue")} />}
        {view === "queue" && <Queue />}
      </div>
      {notice ? (
        <button
          type="button"
          className="fixed bottom-4 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-md border border-line bg-elevated px-4 py-3 text-sm text-fg"
          onClick={() => useOrbit.setState({ notice: null })}
        >
          {notice}
        </button>
      ) : null}
    </div>
  );
}
