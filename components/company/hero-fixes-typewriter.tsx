"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const ROTATE_MS = 2800;

type HeroFixesTypewriterProps = {
  fixes: string[];
  className?: string;
};

export function HeroFixesTypewriter({ fixes, className }: HeroFixesTypewriterProps) {
  const reduceMotion = useReducedMotion();
  const slides = useMemo(() => fixes.filter(Boolean), [fixes]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      ROTATE_MS
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length]);

  if (slides.length === 0) return null;

  if (reduceMotion || slides.length === 1) {
    return (
      <span className={cn(className, "inline-block text-left sm:text-center")}>
        {slides[0]}
      </span>
    );
  }

  return (
    <span
      className={cn(
        className,
        "relative mx-auto inline-block min-h-[1.2em] w-full max-w-2xl text-left sm:text-center"
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={slides[index]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease }}
          className="inline-block"
        >
          {slides[index]}
          <span
            className="ml-0.5 inline-block w-[2px] animate-pulse bg-amber-500 align-middle"
            style={{ height: "0.85em" }}
            aria-hidden
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
