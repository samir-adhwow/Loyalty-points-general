"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

import Card from "./ui/Card";
import Button from "./ui/Button";
import FormTextField from "./ui/FormTextField";
import SelectField from "./ui/SelectField";
import KeyValueEditor from "./KeyValueEditor";
import TierEditor from "./TierEditor";
import Loading from "../loading";
import SectionBox from "./ui/SectionBox";

import { useApiMutation, useApiQuery } from "../lib/useApi";
import { createLoyaltyRule, getLoyaltyRules } from "../lib/api";
import { createRulePayloadSchema } from "@/app/lib/validation/createRuleSchema";

import {
  objectToRows,
  payloadToTiers,
  rowsToObject,
  tiersToPayload,
  getEditFormFromRule,
  getInitialCreateForm,
} from "@/app/lib/createRuleModal";
import DateTimePickerField from "./ui/DateTimePicker";

type RuleEditorMode = "create" | "edit";
type RuleForm = ReturnType<typeof getInitialCreateForm>;
type KeyValueRow = { key: string; value: string };
type TierRow = { minAmount: string; maxAmount: string; points: string };

const formatFieldLabel = (field: string) =>
  field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

type RuleEditorPageProps = {
  mode?: RuleEditorMode;
  ruleId?: string | number | null;
};

export default function RuleEditorPage({
  mode = "create",
  ruleId = null,
}: RuleEditorPageProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const { register, setFocus } = useForm();

  // ---------------- STATE ----------------
  const [form, setForm] = useState<RuleForm>(getInitialCreateForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [criteriaRows, setCriteriaRows] = useState<KeyValueRow[]>([]);
  const [rewardRows, setRewardRows] = useState<KeyValueRow[]>([]);
  const [tierRows, setTierRows] = useState<TierRow[]>([]);

  // ---------------- FETCH ----------------
  const {
    data: rules = [],
    isLoading,
    error,
  } = useApiQuery(
    {
      queryKey: ["loyalty-rules"],
      queryFn: async () => {
        const res = await getLoyaltyRules();
        return Array.isArray(res?.data) ? res.data : [];
      },
      fallbackData: [],
    },
    { enabled: isEdit },
  );

  // ---------------- LOAD EDIT DATA ----------------
  useEffect(() => {
    if (!isEdit) return;
    const id = Number(ruleId);
    if (!id) return;
    const rule = rules.find((r) => Number(r.id) === id);
    if (!rule) return;

    const normalized = getEditFormFromRule(rule);
    setForm(normalized);
    setErrors({});
    setCriteriaRows(objectToRows(rule.criteriaExpression));

    if (normalized.rewardMode === "FLEXIBLE") {
      setTierRows(payloadToTiers(rule.rewardPayload));
      setRewardRows([]);
    } else {
      setRewardRows(objectToRows(rule.rewardPayload));
      setTierRows([]);
    }
  }, [rules, isEdit, ruleId]);

  // ---------------- MUTATION ----------------
  const { mutateAsync, isPending } = useApiMutation({
    mutationFn: createLoyaltyRule,
    invalidateQueryKeys: [["loyalty-rules"]],
  });

  // ---------------- DERIVED FLAGS ----------------
  const isMultiplier = form.rewardType === "MULTIPLIER";
  const isTiered = form.rewardType === "TIERED";
  const isTieredFlexible = isTiered && form.rewardMode === "FLEXIBLE";
  const showExpiryDays = isTieredFlexible && tierRows.length > 0;
  const isPercentage = form.rewardType === "PERCENTAGE";

  // ---------------- HANDLERS ----------------
  const update =
    (field: keyof RuleForm) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent,
    ) => {
      const rawValue = e.target.value;
      const value =
        field === "priority"
          ? Number(rawValue)
          : (rawValue as RuleForm[typeof field]);

      setErrors((p) => ({ ...p, [field]: "" }));

      setForm((prev) => {
        if (field === "rewardType") {
          return {
            ...prev,
            rewardType: String(value),
            rewardMode: "FIXED",
            multiplier: "",
            minEventValue: "",
            maxPointsPerTxn: "",
            expiryDays: "",
          };
        }
        if (field === "rewardMode") {
          return {
            ...prev,
            rewardMode: String(value),
            minEventValue: "",
            maxPointsPerTxn: "",
            expiryDays: "",
          };
        }
        return { ...prev, [field]: value };
      });
    };

  const updateDate = (field: keyof RuleForm) => (value: Dayjs | null) => {
    setErrors((p) => ({ ...p, [field]: "" }));
    setForm((p) => ({
      ...p,
      [field]: value && value.isValid() ? value.toISOString() : "",
    }));
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const criteriaExpression = rowsToObject(criteriaRows);
    const rewardPayload = isTieredFlexible
      ? {
          ...tiersToPayload(tierRows),
          ...(showExpiryDays && {
            expiryDays: form.expiryDays ? Number(form.expiryDays) : null,
          }),
        }
      : rowsToObject(rewardRows);

    const payload = {
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      eventType: form.eventType.trim(),
      criteriaExpression,
      rewardPayload,
    };

    const result = createRulePayloadSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        const field = i.path?.[0];
        if (typeof field === "string" && !nextErrors[field]) {
          nextErrors[field] = i.message;
        }
      });
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      if (firstField) {
        try {
          setTimeout(() => setFocus(firstField as any), 0);
        } catch (e) {
          console.warn("Failed to set focus on field:", firstField, e);
        }
      }
      return;
    }

    await mutateAsync({
      ...result.data,
      ...(isEdit ? { id: Number(form.id) } : {}),
    });

    toast.success(isEdit ? "Updated!" : "Created!");
    router.push(isEdit ? `/rules/${form.id}/view` : "/rules");
  };

  // ---------------- UI STATES ----------------
  if (isEdit && isLoading) return <Loading />;
  if (isEdit && error)
    return <p className="text-red-500 p-4">Failed to load rule.</p>;

  return (
    <Card
      title={isEdit ? "Edit Rule" : "Create Rule"}
      subtitle={
        isEdit
          ? `Edit the rule with ID ${form.id}`
          : "Define a new loyalty rule by filling out the form below."
      }
    >
      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-6">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* ── Identity ─────────────────────────────────────── */}
          <SectionBox title="Identity">
            {(["id", "code", "name", "description", "eventType"] as const).map(
              (f) => (
                <FormTextField
                  key={f}
                  name={f}
                  inputRef={register(f).ref}
                  label={formatFieldLabel(f)}
                  value={form[f]}
                  onChange={update(f)}
                  disabled={f === "id"}
                  required={["code", "name", "eventType"].includes(f)}
                  error={!!errors[f]}
                  helperText={errors[f] || " "}
                />
              ),
            )}
          </SectionBox>

          {/* ── Configuration ────────────────────────────────── */}
          <SectionBox title="Configuration">
            <SelectField
              dataField="ruleType"
              label="Rule Type"
              value={form.ruleType}
              onChange={update("ruleType")}
              error={Boolean(errors.ruleType)}
              helperText={errors.ruleType || " "}
            >
              <MenuItem value="TRANSACTION_EVENT">Transaction</MenuItem>
              <MenuItem value="BEHAVIOURAL">Behavioural</MenuItem>
              <MenuItem value="PROMOTIONAL">Promotional</MenuItem>
            </SelectField>

            <SelectField
              dataField="rewardType"
              label="Reward Type"
              value={form.rewardType}
              onChange={update("rewardType")}
              error={Boolean(errors.rewardType)}
              helperText={errors.rewardType || " "}
            >
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="MULTIPLIER">Multiplier</MenuItem>
              <MenuItem value="TIERED">Tiered</MenuItem>
              <MenuItem value="PERCENTAGE">Percentage</MenuItem>
            </SelectField>

            {isTiered && (
              <SelectField
                dataField="rewardMode"
                label="Reward Mode"
                value={form.rewardMode}
                onChange={update("rewardMode")}
                error={Boolean(errors.rewardMode)}
                helperText={errors.rewardMode || " "}
              >
                <MenuItem value="FIXED">Fixed</MenuItem>
                <MenuItem value="FLEXIBLE">Flexible</MenuItem>
              </SelectField>
            )}

            <SelectField
              dataField="status"
              label="Status"
              value={form.status}
              onChange={update("status")}
              required
              error={Boolean(errors.status)}
              helperText={errors.status || " "}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </SelectField>

            <SelectField
              dataField="priority"
              label="Priority"
              value={form.priority}
              onChange={update("priority")}
              error={Boolean(errors.priority)}
              helperText={errors.priority || " "}
            >
              <MenuItem value={1}>Low</MenuItem>
              <MenuItem value={2}>Medium</MenuItem>
              <MenuItem value={3}>High</MenuItem>
            </SelectField>
          </SectionBox>

          {/* ── Reward Values ──────────────────────────────────*/}
          <SectionBox title="Reward Values">
            <FormTextField
              name="rewardValue"
              inputRef={register("rewardValue").ref}
              label="Reward Value"
              type="number"
              value={form.rewardValue}
              onChange={update("rewardValue")}
              disabled={isMultiplier || isTiered}
              required
              error={Boolean(errors.rewardValue)}
              helperText={errors.rewardValue || " "}
            />
            <FormTextField
              name="multiplier"
              inputRef={register("multiplier").ref}
              label="Multiplier"
              type="number"
              value={form.multiplier}
              onChange={update("multiplier")}
              disabled={!isMultiplier}
              error={Boolean(errors.multiplier)}
              helperText={errors.multiplier || " "}
            />
            <FormTextField
              name="minEventValue"
              inputRef={register("minEventValue").ref}
              label="Min Event Value"
              type="number"
              value={form.minEventValue}
              onChange={update("minEventValue")}
              disabled={isMultiplier || isTieredFlexible}
              error={Boolean(errors.minEventValue)}
              helperText={errors.minEventValue || " "}
            />
            <FormTextField
              name="maxPointsPerTxn"
              inputRef={register("maxPointsPerTxn").ref}
              label="Max Points / Txn"
              type="number"
              value={form.maxPointsPerTxn}
              onChange={update("maxPointsPerTxn")}
              disabled={isTieredFlexible}
              error={Boolean(errors.maxPointsPerTxn)}
              helperText={errors.maxPointsPerTxn || " "}
            />
          </SectionBox>

          {/* ── Validity Period ───────────────────────────────── */}
          <SectionBox title="Validity Period">
            <DateTimePickerField
              label="From"
              name="appliesFrom"
              value={form.appliesFrom}
              onChange={updateDate("appliesFrom")}
              inputRef={register("appliesFrom").ref}
              error={Boolean(errors.appliesFrom)}
              helperText={errors.appliesFrom || " "}
              required
            />
            <DateTimePickerField
              label="To"
              name="appliesTo"
              value={form.appliesTo}
              onChange={updateDate("appliesTo")}
              inputRef={register("appliesTo").ref}
              error={Boolean(errors.appliesTo)}
              helperText={errors.appliesTo || " "}
              required
            />
          </SectionBox>

          {/* ── Limits & Blackout ────────────────────────────── */}
          <SectionBox title="Limits & Blackout">
            <FormTextField
              name="partnerId"
              inputRef={register("partnerId").ref}
              label="Partner ID"
              value={form.partnerId ?? ""}
              onChange={update("partnerId")}
              helperText={errors.partnerId || " "}
            />
            <FormTextField
              name="maxPointsDaily"
              inputRef={register("maxPointsDaily").ref}
              label="Max Points Daily"
              type="number"
              value={form.maxPointsDaily ?? ""}
              onChange={update("maxPointsDaily")}
              helperText={errors.maxPointsDaily || " "}
            />
            <FormTextField
              name="maxPointsWeekly"
              inputRef={register("maxPointsWeekly").ref}
              label="Max Points Weekly"
              type="number"
              value={form.maxPointsWeekly ?? ""}
              onChange={update("maxPointsWeekly")}
              helperText={errors.maxPointsWeekly || " "}
            />
            <FormTextField
              name="maxPointsMonthly"
              inputRef={register("maxPointsMonthly").ref}
              label="Max Points Monthly"
              type="number"
              value={form.maxPointsMonthly ?? ""}
              onChange={update("maxPointsMonthly")}
              helperText={errors.maxPointsMonthly || " "}
            />
            <DateTimePickerField
              label="Blackout From"
              name="blackoutFrom"
              value={form.blackoutFrom ?? null}
              onChange={updateDate("blackoutFrom")}
              inputRef={register("blackoutFrom").ref}
              error={Boolean(errors.blackoutFrom)}
              helperText={errors.blackoutFrom || " "}
            />
            <DateTimePickerField
              label="Blackout To"
              name="blackoutTo"
              value={form.blackoutTo ?? null}
              onChange={updateDate("blackoutTo")}
              inputRef={register("blackoutTo").ref}
              error={Boolean(errors.blackoutTo)}
              helperText={errors.blackoutTo || " "}
            />
          </SectionBox>

          {/* ── Reward Payload ───────────────────────────────── */}
          <SectionBox title="Reward Payload">
            {isTieredFlexible ? (
              <>
                <div className="col-span-full">
                  <FormTextField
                    name="expiryDays"
                    inputRef={register("expiryDays").ref}
                    label="Expiry Days"
                    type="number"
                    value={form.expiryDays}
                    onChange={update("expiryDays")}
                    helperText={errors.expiryDays || " "}
                  />
                </div>
                {/* Tier table */}
                <TierEditor tiers={tierRows} onChange={setTierRows} />
              </>
            ) : (
              <KeyValueEditor
                label="Reward Payload"
                rows={rewardRows}
                onChange={setRewardRows}
              />
            )}
          </SectionBox>

          {/* ── Criteria Expression ──────────────────────────── */}
          <SectionBox title="Criteria Expression">
            <KeyValueEditor
              label="Criteria"
              rows={criteriaRows}
              onChange={setCriteriaRows}
            />
          </SectionBox>
        </LocalizationProvider>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button onClick={() => router.push("/rules")} className="btn_ghost">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Icon
                  icon="fluent:spinner-ios-20-regular"
                  className="animate-spin"
                />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
