"use client";

import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui";
import { isValidDomainInput } from "@/lib/domain";
import { useHomeUrl } from "./HomeUrlProvider";

export function CTASection() {
  const { urlInput, scrollToHeroInput, navigateToProcessing } = useHomeUrl();

  const handleClick = () => {
    if (isValidDomainInput(urlInput)) {
      navigateToProcessing();
      return;
    }

    scrollToHeroInput();
  };

  return (
    <section id="pricing" className="px-margin-desktop py-stack-xl">
      <div className="relative mx-auto max-w-container-max overflow-hidden rounded-[32px] bg-primary p-12 text-center md:p-20">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div
            className="absolute left-0 top-0 h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="mx-auto max-w-2xl font-headline-lg text-headline-lg text-white">
            Ready to Improve Your AI Search Visibility?
          </h2>
          <p className="mx-auto max-w-lg font-body-lg text-body-lg text-white/80">
            Get your LLM Visibility Report in seconds. No credit card, no complex
            setup.
          </p>
          <Button
            type="button"
            className="inline-flex items-center gap-3 rounded-xl px-10 py-4 text-body-lg"
            onClick={handleClick}
          >
            Analyze Website Now
            <Icon name="arrow_forward" className="text-white" />
          </Button>
        </div>
      </div>
    </section>
  );
}
