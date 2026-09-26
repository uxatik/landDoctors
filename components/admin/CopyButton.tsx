"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
      className="rounded-sm border border-accent px-3 py-1.5 text-sm font-semibold text-accent"
    >
      {done ? "কপি হয়েছে · Copied" : label}
    </button>
  );
}
