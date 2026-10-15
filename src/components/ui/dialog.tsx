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
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-[overlay-in_.5s_var(--ease-out-expo)] data-[state=closed]:animate-[overlay-out_.3s_ease-in_forwards]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * shadcn/ui Dialog content. `variant="sheet"` docks it as a full-height
 * panel on the reading-end edge: left in RTL, right in LTR.
 */
function DialogContent({
  className,
  children,
  variant = "center",
  closeLabel = "بستن",
  enter = "slide",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  variant?: "center" | "sheet";
  closeLabel?: string;
  /** "fade" lets a shared-element transition carry the entrance instead of a slide. */
  enter?: "slide" | "fade";
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-enter={enter}
        className={cn(
          "fixed z-50 bg-background text-foreground outline-none",
          variant === "center" &&
            "top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-xl p-3 shadow-2xl data-[state=open]:animate-[dialog-in_.6s_var(--ease-out-expo)] data-[state=closed]:animate-[dialog-out_.25s_ease-in_forwards]",
          variant === "sheet" &&
            "inset-y-0 end-0 flex w-full max-w-[min(100%,58rem)] flex-col shadow-2xl",
          variant === "sheet" &&
            "rtl:data-[state=open]:animate-[sheet-in-left_.75s_var(--ease-out-expo)] rtl:data-[state=closed]:animate-[sheet-out-left_.4s_cubic-bezier(.7,0,.84,0)_forwards] ltr:data-[state=open]:animate-[sheet-in-right_.75s_var(--ease-out-expo)] ltr:data-[state=closed]:animate-[sheet-out-right_.4s_cubic-bezier(.7,0,.84,0)_forwards]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="group absolute top-4 end-4 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground ring-1 ring-border backdrop-blur transition-colors hover:bg-foreground hover:text-background"
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
