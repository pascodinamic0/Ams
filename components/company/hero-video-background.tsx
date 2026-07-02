"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const VIDEO_SRC = "/videos/hero-school-stem.mp4";
const POSTER_SRC = "/images/hero-school-stem-poster.jpg";

export function HeroVideoBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {reduceMotion ? (
        <Image
          src={POSTER_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90 dark:opacity-75"
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90 dark:opacity-75"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-teal-950/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/80 via-teal-950/40 to-teal-950/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950/70 via-transparent to-teal-950/50" />

      <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px] animate-pulse sm:h-96 sm:w-96 sm:blur-[120px]" />
      <div className="absolute bottom-1/3 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse delay-700 sm:h-96 sm:w-96 sm:blur-[120px]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white dark:to-[#0c1222] sm:h-36" />
    </div>
  );
}
