import { Icon } from "@/components/icons/Icon";
import type { ScoreExplanation } from "@/types/audit";
import { reportStyles } from "./reportStyles";

type ScoreExplanationCardProps = {
  data: ScoreExplanation;
};

type ExplanationListProps = {
  title: string;
  icon: string;
  iconClassName: string;
  items: string[];
  emptyText: string;
};

function ExplanationList({
  title,
  icon,
  iconClassName,
  items,
  emptyText,
}: ExplanationListProps) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <Icon name={icon} size={18} className={iconClassName} />
        <h3 className={reportStyles.subsectionLabel}>{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-body-sm text-on-surface-variant"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-outline">{emptyText}</p>
      )}
    </div>
  );
}

export function ScoreExplanationCard({ data }: ScoreExplanationCardProps) {
  return (
    <section
      className={`${reportStyles.card} ${reportStyles.cardPaddingXl}`}
      style={{ animationDelay: "0.3s" }}
    >
      <h2 className={`${reportStyles.sectionTitle} mb-stack-sm text-primary`}>
        {data.scoreLabel}
      </h2>
      <p className="mb-stack-lg max-w-3xl text-body-md leading-relaxed text-on-surface-variant">
        {data.summary}
      </p>
      <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-3">
        <ExplanationList
          title="Strengths"
          icon="thumb_up"
          iconClassName="text-[#2E7D32]"
          items={data.strengths}
          emptyText="No category scored 80+ yet."
        />
        <ExplanationList
          title="Blockers"
          icon="warning"
          iconClassName="text-[#FF5A4F]"
          items={data.blockers}
          emptyText="No major category blockers under 60."
        />
        <ExplanationList
          title="Quick wins"
          icon="bolt"
          iconClassName="text-primary"
          items={data.quickWins}
          emptyText="No quick wins identified."
        />
      </div>
    </section>
  );
}
