"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const BEAT_MS = 1200;

interface HeroMobileSubtitleProps {
  frags: string;
  payoff: string;
  className?: string;
}

export function HeroMobileSubtitle({
  frags,
  payoff,
  className,
}: HeroMobileSubtitleProps) {
  const reduceMotion = useReducedMotion();
  const beats = useMemo(
    () => frags.split(",").map((s) => s.trim()).filter(Boolean),
    [frags]
  );
  const slides = useMemo(() => [...beats, payoff], [beats, payoff]);
  const [index, setIndex] = useState(0);
  const isPayoff = index === slides.length - 1;

  useEffect(() => {
    if (reduceMotion || isPayoff) return;
    const timer = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, slides.length - 1)),
      BEAT_MS
    );
    return () => window.clearTimeout(timer);
  }, [index, isPayoff, reduceMotion, slides.length]);

  if (reduceMotion) {
    return (
      <p
        className={cn(
          className,
          "text-pretty text-sm leading-snug text-white/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]"
        )}
      >
        {frags}. {payoff}
      </p>
    );
  }

  return (
    <p
      className={cn(
        className,
        "relative mx-auto min-h-[3rem] max-w-[18rem] text-pretty [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]"
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={slides[index]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease }}
          className={cn(
            "absolute inset-x-0 top-0 block px-1",
            isPayoff
              ? "text-sm font-medium leading-snug text-white/80"
              : "text-base font-semibold uppercase tracking-[0.08em] leading-snug text-white"
          )}
        >
          {slides[index]}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}
