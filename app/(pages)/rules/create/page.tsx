"use client";

import RuleEditorPage from "@/app/components/RuleEditorPage";

export default function CreateRulePage() {
  return (
    <div className="flex w-full flex-col space-y-6">
      <RuleEditorPage mode="create" />
    </div>
  );
}
