import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

const SECTION_ICONS: Record<string, string> = {
  Identity: "fluent:tag-24-regular",
  Configuration: "fluent:settings-24-regular",
  "Reward Values": "fluent:gift-24-regular",
  "Validity Period": "fluent:calendar-24-regular",
  "Limits & Blackout": "fluent:shield-24-regular",
  "Reward Payload": "fluent:box-24-regular",
  "Criteria Expression": "fluent:filter-24-regular",
};

type SectionBoxProps = {
  title: string;
  children: ReactNode;
};

export default function SectionBox({ title, children }: SectionBoxProps) {
  const icon = SECTION_ICONS[title] ?? "fluent:circle-24-regular";

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-primary/10 border-t-primary/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-b-primary/10 bg-primary/5">
        <Icon icon={icon} className="text-base text-primary shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {title}
        </span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white px-4 py-4">
        {children}
      </div>
    </div>
  );
}
