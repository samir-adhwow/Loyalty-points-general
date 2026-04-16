"use client";

import RuleEditorPage from "@/app/components/RuleEditorPage";
import { useParams } from "next/navigation";

export default function EditRulePage() {
  const params = useParams();
  const ruleIdParam = params?.ruleId;
  const ruleId = Array.isArray(ruleIdParam) ? ruleIdParam[0] : ruleIdParam;

  return (
    <div className="flex w-full flex-col space-y-6">
      <RuleEditorPage mode="edit" ruleId={ruleId ?? null} />
    </div>
  );
}
