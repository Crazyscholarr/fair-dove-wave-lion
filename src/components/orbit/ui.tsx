import * as Dialog from "@radix-ui/react-dialog";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ProfileStatus } from "@/lib/orbit/types";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      <circle cx="25.2" cy="11.2" r="2" fill="currentColor" />
    </svg>
  );
}

export function StatusDot({ status }: { status: ProfileStatus }) {
  const color =
    status === "running" ? "bg-sage dot-live" : status === "error" ? "bg-danger" : "bg-muted";
  return <span className={cn("inline-block size-2 rounded-full", color)} />;
}

const buttonStyles = {
  primary: "bg-sage text-bg hover:opacity-90",
  quiet: "bg-elevated text-fg hover:opacity-90",
  ghost: "bg-transparent text-fg hover:bg-elevated",
  danger: "bg-transparent text-danger hover:bg-elevated",
} as const;

export function Button({
  variant = "ghost",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium disabled:opacity-40",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export const fieldClass =
  "h-11 w-full rounded-md border border-line bg-bg px-3 text-base text-fg outline-none placeholder:text-muted md:text-sm";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/80" />
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <Dialog.Content className="max-h-full w-full max-w-lg overflow-y-auto rounded-md border border-line bg-surface p-4 text-fg">
            <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
            ) : (
              <Dialog.Description className="sr-only">{title}</Dialog.Description>
            )}
            <div className="mt-4">{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
