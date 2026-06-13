const footerLinks = ["Privacy Policy", "Terms of Service", "Documentation"];

export function ReportFooter() {
  return (
    <footer className="mt-auto border-t border-outline-variant bg-white px-margin-desktop py-8">
      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-headline-md font-bold text-primary">
            AuditMetric
          </span>
          <span className="ml-2 border-l border-outline-variant pl-2 text-body-sm text-on-surface-variant">
            © 2026 Algorithmic Clarity Tooling.
          </span>
        </div>
        <div className="flex gap-6">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-label-md text-on-surface-variant hover:text-primary"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
