"use client";

import { createContext, useContext } from "react";

const FeatureNavContext = createContext<readonly string[]>([]);

export function FeatureNavProvider({
  hiddenHrefs,
  children,
}: {
  hiddenHrefs: readonly string[];
  children: React.ReactNode;
}) {
  return (
    <FeatureNavContext.Provider value={hiddenHrefs}>
      {children}
    </FeatureNavContext.Provider>
  );
}

export function useHiddenNavHrefs(): readonly string[] {
  return useContext(FeatureNavContext);
}
