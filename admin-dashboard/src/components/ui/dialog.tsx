"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />

      {/* FULL SCREEN FLEX CENTER */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <DialogPrimitive.Content
          className={cn(
            "w-[420px] rounded-xl bg-white p-6 shadow-xl",
            className
          )}
          {...props}
        >
          {children}

          <DialogPrimitive.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100">
            <X />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
}


function DialogHeader(props: React.ComponentProps<"div">) {
  return <div className="space-y-1" {...props} />;
}

function DialogFooter(props: React.ComponentProps<"div">) {
  return <div className="flex justify-end gap-2" {...props} />;
}

function DialogTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className="text-lg font-semibold" {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
};
