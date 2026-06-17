"use client";

import { normalizeDomain, isValidDomainInput } from "@/lib/domain";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const HERO_INPUT_ID = "hero-url-input";

type HomeUrlContextValue = {
  urlInput: string;
  setUrlInput: (value: string) => void;
  debugEnabled: boolean;
  setDebugEnabled: (value: boolean) => void;
  scrollToHeroInput: () => void;
  navigateToProcessing: (value?: string) => boolean;
};

const HomeUrlContext = createContext<HomeUrlContextValue | null>(null);

export function HomeUrlProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");
  const [debugEnabled, setDebugEnabled] = useState(false);

  const scrollToHeroInput = useCallback(() => {
    const input = document.getElementById(HERO_INPUT_ID);
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }, []);

  const navigateToProcessing = useCallback(
    (value?: string) => {
      const raw = value ?? urlInput;
      if (!isValidDomainInput(raw)) {
        return false;
      }

      const domain = normalizeDomain(raw);
      const debugQuery = debugEnabled ? "&debug=true" : "";
      router.push(`/processing?domain=${encodeURIComponent(domain)}${debugQuery}`);
      return true;
    },
    [debugEnabled, router, urlInput],
  );

  const value = useMemo(
    () => ({
      urlInput,
      setUrlInput,
      debugEnabled,
      setDebugEnabled,
      scrollToHeroInput,
      navigateToProcessing,
    }),
    [urlInput, debugEnabled, scrollToHeroInput, navigateToProcessing],
  );

  return (
    <HomeUrlContext.Provider value={value}>{children}</HomeUrlContext.Provider>
  );
}

export function useHomeUrl() {
  const context = useContext(HomeUrlContext);
  if (!context) {
    throw new Error("useHomeUrl must be used within HomeUrlProvider");
  }
  return context;
}

export { HERO_INPUT_ID };
