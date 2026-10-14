"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-ink/55 backdrop-blur-[2px]",
        "data-[state=open]:animate-[overlay-in_.5s_var(--ease-out-expo)] data-[state=closed]:animate-[overlay-out_.3s_ease-in_forwards]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * shadcn/ui Dialog content. `variant="sheet"` docks it to the left edge
 * (the reading end in RTL) as a full-height panel.
 */
function DialogContent({
  className,
  children,
  variant = "center",
  closeLabel = "بستن",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  variant?: "center" | "sheet";
  closeLabel?: string;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed z-50 bg-background text-foreground outline-none",
          variant === "center" &&
            "top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-lg p-3 shadow-2xl data-[state=open]:animate-[dialog-in_.6s_var(--ease-out-expo)] data-[state=closed]:animate-[dialog-out_.25s_ease-in_forwards]",
          variant === "sheet" &&
            "inset-y-0 left-0 flex w-full max-w-[min(100%,58rem)] flex-col shadow-2xl data-[state=open]:animate-[sheet-in_.75s_var(--ease-out-expo)] data-[state=closed]:animate-[sheet-out_.4s_cubic-bezier(.7,0,.84,0)_forwards]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="group absolute top-4 left-4 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground ring-1 ring-border backdrop-blur transition-colors hover:bg-foreground hover:text-background"
        >
          <XIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:rotate-90" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-display leading-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
