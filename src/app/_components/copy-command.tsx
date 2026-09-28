"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MONO_FONT =
  "[font-family:var(--vx-provision-machine),ui-monospace,SFMono-Regular,Menlo,monospace]";

type CopyCommandProps = {
  command: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * A terminal-styled command line with a copy-to-clipboard button.
 * Shows "Copied" feedback for two seconds after a successful copy.
 * Falls back to a hidden textarea when the async clipboard API is
 * unavailable (non-secure contexts, restrictive permissions policies).
 */
export function CopyCommand({ command, className, ariaLabel }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // Clipboard API unavailable — fall back to execCommand.
      try {
        const area = document.createElement("textarea");
        area.value = command;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        // Give up quietly; the command remains selectable on screen.
      }
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black py-2.5 pl-4 pr-2.5",
        className
      )}
    >
      <code
        className={cn(
          "min-w-0 break-words text-[13px] leading-relaxed text-zinc-200",
          MONO_FONT
        )}
      >
        <span aria-hidden="true" className="mr-2 select-none text-zinc-600">
          $
        </span>
        {command}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={ariaLabel ?? `Copy command: ${command}`}
        className={cn(
          // tap-expand: mobile-only hit-area expansion (44px+ target), zero visual shift
          "tap-expand shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          copied
            ? "border-[#5B8CFF]/60 bg-[#5B8CFF]/10 text-[#9db4ff]"
            : "border-white/15 text-zinc-400 hover:border-[#5B8CFF]/50 hover:text-[#9db4ff]"
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
