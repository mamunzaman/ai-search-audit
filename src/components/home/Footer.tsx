import { footerLinks } from "@/lib/home-data";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between px-margin-desktop py-stack-xl md:flex-row">
        <div className="mb-8 flex flex-col items-center md:mb-0 md:items-start">
          <div className="mb-2 font-headline-md text-headline-md font-bold text-primary">
            AI Search Audit
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 AI Search Audit. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="font-body-sm text-body-sm text-on-surface-variant opacity-80 transition-opacity hover:opacity-100 hover:underline decoration-primary"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
