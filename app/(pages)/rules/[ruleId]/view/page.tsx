"use client";

import { useParams } from "next/navigation";
import RuleDetailsPage from "@/app/components/RuleDetailsPage";

export default function ViewRulePage() {
  const params = useParams();
  const ruleIdParam = params?.ruleId;
  const ruleId = Array.isArray(ruleIdParam) ? ruleIdParam[0] : ruleIdParam;

  return (
    <div className="flex w-full flex-col space-y-6">
      <RuleDetailsPage ruleId={ruleId} />
    </div>
  );
}
