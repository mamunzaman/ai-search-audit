"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { navLinks } from "@/lib/home-data";
import { useHomeUrl } from "./HomeUrlProvider";

export function Header() {
  const { scrollToHeroInput } = useHomeUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-mobile py-3.5 md:px-margin-desktop md:py-4">
        <div className="font-headline-md text-headline-md font-bold text-primary">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="transition-colors hover:text-primary-container"
          >
            AI Search Audit
          </Link>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "border-b-2 border-primary pb-0.5 font-body-md text-body-md font-semibold text-primary"
                  : "font-body-md text-body-md font-medium text-text-secondary transition-colors hover:text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" className="hidden px-4 py-2 font-medium sm:inline-flex">
            Log in
          </Button>
          <Button type="button" className="px-4 py-2 text-body-sm font-semibold" onClick={scrollToHeroInput}>
            Analyze Website
          </Button>
        </div>
      </div>
    </header>
  );
}
