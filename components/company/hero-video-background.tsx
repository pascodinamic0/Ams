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
          className="scale-105 object-cover object-center brightness-95 contrast-105 saturate-[0.95]"
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
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center brightness-95 contrast-105 saturate-[0.95]"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}

      {/* Light navy tint — keep video visible, vignette for text contrast */}
      <div className="absolute inset-0 bg-mkt-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-mkt-navy/55 via-transparent to-mkt-navy/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-mkt-navy/45 via-transparent to-mkt-navy/30" />

      <div className="absolute top-1/4 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-mkt-navy/80 sm:h-40" />
    </div>
  );
}
