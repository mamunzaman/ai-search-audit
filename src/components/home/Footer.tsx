import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between px-margin-desktop py-stack-xl md:flex-row">
        <div className="mb-8 flex flex-col items-center md:mb-0 md:items-start">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="mb-2 cursor-pointer font-headline-md text-headline-md font-bold text-primary transition-colors hover:text-primary-container"
          >
            AI Search Audit
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 AI Search Audit. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          <Link
            href="/"
            className="font-body-sm text-body-sm text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100 hover:underline decoration-primary"
          >
            Home
          </Link>
          <Link
            href="/#features"
            className="font-body-sm text-body-sm text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100 hover:underline decoration-primary"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="font-body-sm text-body-sm text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100 hover:underline decoration-primary"
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="font-body-sm text-body-sm text-on-surface-variant opacity-80 transition-opacity hover:text-primary hover:opacity-100 hover:underline decoration-primary"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </footer>
  );
}
