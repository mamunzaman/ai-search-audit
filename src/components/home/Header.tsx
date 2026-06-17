"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { navLinks } from "@/lib/home-data";
import { useHomeUrl } from "./HomeUrlProvider";

export function Header() {
  const { scrollToHeroInput } = useHomeUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-desktop py-4">
        <div className="font-headline-md text-headline-md font-bold text-on-surface">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="cursor-pointer transition-colors hover:text-primary"
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
                  ? "border-b-2 border-primary pb-1 font-body-md text-body-md font-bold text-primary"
                  : "font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-4 py-2">
            Log in
          </Button>
          <Button type="button" onClick={scrollToHeroInput}>
            Analyze Website
          </Button>
        </div>
      </div>
    </header>
  );
}
