import { Icon } from "@/components/icons/Icon";
import { features } from "@/lib/home-data";

export function FeaturesRow() {
  return (
    <div
      id="features"
      className="border-y border-outline-variant/30 bg-surface-container-low py-12"
    >
      <div className="mx-auto max-w-container-max px-margin-desktop">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white soft-elevation transition-transform group-hover:scale-110">
                <Icon name={feature.icon} className="text-primary" />
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
