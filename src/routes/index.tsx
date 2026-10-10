import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Console } from "@/components/orbit/console";
import { Mark } from "@/components/orbit/ui";
import { hydrate } from "@/lib/orbit/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hydrate();
    setReady(true);
  }, []);
  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg text-fg">
        <div className="flex items-center gap-3">
          <Mark className="size-8 text-sage" />
          <div>
            <p className="text-lg font-medium">Orbit</p>
            <p className="text-sm text-muted">Bàn điều khiển profile</p>
          </div>
        </div>
      </main>
    );
  }
  return <Console />;
}
