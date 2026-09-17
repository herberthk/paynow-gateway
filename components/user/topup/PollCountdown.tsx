"use client";

import { memo, useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { POLL_DEADLINE_MS } from "@/lib/yo/constants";
import { PollProgress } from "@/components/user/DepositStatusCards";

export const PollCountdown = memo(function PollCountdown({
  startedAt,
}: {
  startedAt: number;
}) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const progress = Math.min(elapsed / POLL_DEADLINE_MS, 1);
  const remainingSecs = Math.max(
    0,
    Math.ceil((POLL_DEADLINE_MS - elapsed) / 1000),
  );

  return (
    <>
      <PollProgress value01={progress} />
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium mb-6"
      >
        <Clock3 size={14} />
        Confirming… {Math.floor(remainingSecs / 60)}:
        {String(remainingSecs % 60).padStart(2, "0")} remaining
      </div>
    </>
  );
});
