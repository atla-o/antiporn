import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
        className,
      )}
      {...props}
    />
  );
}
