"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { navLinks } from "@/lib/home-data";
import { useHomeUrl } from "./HomeUrlProvider";

export function Header() {
  const { scrollToHeroInput } = useHomeUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex w-full min-w-0 max-w-container-max flex-wrap items-center justify-between gap-3 px-margin-mobile py-3.5 md:gap-4 md:px-4 lg:px-margin-desktop lg:py-4">
        <div className="min-w-0 shrink-0 font-headline-md text-headline-lg-mobile font-bold text-primary md:text-headline-md">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="transition-colors hover:text-primary-container"
          >
            AI Search Audit
          </Link>
        </div>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "whitespace-nowrap border-b-2 border-primary pb-0.5 font-body-md text-body-md font-semibold text-primary"
                  : "whitespace-nowrap font-body-md text-body-md font-medium text-text-secondary transition-colors hover:text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
          <Button variant="ghost" className="hidden px-3 py-2 font-medium lg:inline-flex lg:px-4">
            Log in
          </Button>
          <Button
            type="button"
            className="whitespace-nowrap px-3 py-2 text-body-sm font-semibold sm:px-4"
            onClick={scrollToHeroInput}
          >
            Analyze Website
          </Button>
        </div>
      </div>
    </header>
  );
}
