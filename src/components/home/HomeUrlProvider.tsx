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
  scrollToHeroInput: () => void;
  navigateToProcessing: (value?: string) => boolean;
};

const HomeUrlContext = createContext<HomeUrlContextValue | null>(null);

export function HomeUrlProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");

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
      router.push(`/processing?domain=${encodeURIComponent(domain)}`);
      return true;
    },
    [router, urlInput],
  );

  const value = useMemo(
    () => ({
      urlInput,
      setUrlInput,
      scrollToHeroInput,
      navigateToProcessing,
    }),
    [urlInput, scrollToHeroInput, navigateToProcessing],
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
