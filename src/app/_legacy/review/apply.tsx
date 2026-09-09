"use client";

import { useState, useTransition } from "react";
import { applyAdaptation } from "@/lib/actions/review";
import { Button, Pill } from "@/components/ui";

/** The adjustment is announced and accepted, never applied silently (REQ-072). */
export function ApplyAdaptation({
  utilization,
  unchanged,
}: {
  utilization: number;
  unchanged: boolean;
}) {
  const [applied, setApplied] = useState(false);
  const [pending, start] = useTransition();

  if (unchanged) return <Pill tone="neutral">No change needed</Pill>;
  if (applied) return <Pill tone="ok">Applied</Pill>;

  return (
    <Button
      variant="quiet"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await applyAdaptation(utilization);
          setApplied(true);
        })
      }
    >
      {pending ? "Applying…" : "Apply to next week"}
    </Button>
  );
}
