import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FlowNote({
  tone,
  children,
  testId,
}: {
  tone: "loading" | "empty" | "error" | "success";
  children: ReactNode;
  testId?: string;
}) {
  return (
    <p
      data-testid={testId ?? `flow-${tone}`}
      className={cn(
        "text-sm",
        tone === "loading" && "text-neutral-500",
        tone === "empty" && "text-neutral-600",
        tone === "error" && "rounded-lg border border-black bg-white px-3 py-2 text-black",
        tone === "success" && "text-black",
      )}
    >
      {children}
    </p>
  );
}
