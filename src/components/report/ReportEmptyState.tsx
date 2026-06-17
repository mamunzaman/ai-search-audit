import Link from "next/link";
import { Button } from "@/components/ui";

export function ReportEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-outline-variant bg-white p-stack-xl text-center card-shadow">
      <h2 className="text-headline-md text-on-surface">No audit data found</h2>
      <p className="mt-2 max-w-md text-body-sm text-on-surface-variant">
        Run an audit from the homepage to view this report section.
      </p>
      <Link href="/" className="mt-stack-md">
        <Button type="button">Return to Homepage</Button>
      </Link>
    </div>
  );
}
