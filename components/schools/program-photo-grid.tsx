"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Program = {
  title: string;
  description: string;
  image_url: string;
};

export function ProgramPhotoGrid({
  programs,
  accent = "#c9a227",
}: {
  programs: Program[];
  accent?: string;
}) {
  const t = useTranslations("common");
  const [active, setActive] = useState<string | null>(null);

  if (programs.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => {
        const isActive = active === program.title;
        return (
          <article
            key={program.title}
            className="relative aspect-[4/3] overflow-hidden"
            onMouseEnter={() => setActive(program.title)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(program.title)}
            onBlur={() => setActive(null)}
            onClick={() =>
              setActive((current) => (current === program.title ? null : program.title))
            }
            tabIndex={0}
          >
            <img
              src={program.image_url}
              alt={program.title}
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
            <div
              className={`absolute inset-0 transition-colors duration-300 ${
                isActive ? "bg-black/65" : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              }`}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-white sm:p-5">
              <h3
                className={`text-base font-semibold tracking-wide transition-all duration-300 sm:text-lg ${
                  isActive ? "-translate-y-2" : ""
                }`}
              >
                {program.title}
              </h3>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  {program.description}
                </p>
                <a
                  href="#contact"
                  className="mt-3 inline-flex h-9 items-center rounded-full border border-white/80 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-stone-900"
                >
                  {t("learnMore")}
                </a>
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 h-[3px] w-full transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundColor: accent }}
            />
          </article>
        );
      })}
    </div>
  );
}
