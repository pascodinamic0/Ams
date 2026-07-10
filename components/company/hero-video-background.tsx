"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const VIDEO_SRC = "/videos/hero-school-stem.mp4";
const POSTER_SRC = "/images/hero-school-stem-poster.jpg";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    // Defer video download until after first paint / idle so HTML + poster win.
    const start = () => setShouldLoadVideo(true);
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      const idleId = win.requestIdleCallback(start, { timeout: 1200 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(start, 400);
    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion]);

  useEffect(() => {
    if (!shouldLoadVideo || reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      // Autoplay can fail; poster remains visible.
    });
  }, [shouldLoadVideo, reduceMotion]);

  return (
    <div className="absolute inset-0 z-0">
      {reduceMotion || !shouldLoadVideo ? (
        <Image
          src={POSTER_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-center brightness-[0.7] contrast-125 saturate-[0.85]"
        />
      ) : null}

      {!reduceMotion && shouldLoadVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_SRC}
          aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center brightness-[0.7] contrast-125 saturate-[0.85]"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}

      {/* Low-key cinematic grade — black, not teal */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/15 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/40" />

      {/* Soft edge light — amber accent, sparse */}
      <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-amber-500/15 blur-[120px] sm:h-96 sm:w-96" />
      <div className="absolute bottom-1/4 -right-20 h-64 w-64 rounded-full bg-white/8 blur-[100px] sm:h-80 sm:w-80" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-stone-50 sm:h-40 dark:to-black" />
    </div>
  );
}
