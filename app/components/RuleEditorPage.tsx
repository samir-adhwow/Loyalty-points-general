"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Grid, MenuItem, Typography } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import toast from "react-hot-toast";

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
      return;
    }

    await mutateAsync({
      ...result.data,
      ...(isEdit ? { id: Number(form.id) } : {}),
    });

    toast.success(isEdit ? "Updated!" : "Created!");
    router.push("/dashboard");
  };

  // ---------------- UI STATES ----------------
  if (isEdit && isLoading) return <Loading />;
  if (isEdit && error)
    return <Typography color="error">Failed to load</Typography>;

  return (
    <Card
      title={isEdit ? "Edit Rule" : "Create Rule"}
      subtitle={
        isEdit
          ? `Edit the rule with ID ${form.id}`
          : "Define a new loyalty rule by filling out the form below."
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 4 }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* ── Identity ──────────────────────────────────────── */}
          <SectionBox title="Identity">
            <Grid container spacing={2}>
              {(
                ["id", "code", "name", "description", "eventType"] as const
              ).map((f) => (
                <Grid key={f} size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    label={formatFieldLabel(f)}
                    value={form[f]}
                    onChange={update(f)}
                    disabled={f === "id"}
                    error={!!errors[f]}
                    helperText={errors[f] || " "}
                  />
                </Grid>
              ))}
            </Grid>
          </SectionBox>

          {/* ── Configuration ─────────────────────────────────── */}
          <SectionBox title="Configuration">
            <Grid container spacing={2}>
              <SelectField
                size={{ xs: 12, sm: 6 }}
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
                size={{ xs: 12, sm: 6 }}
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
              </SelectField>

              {isTiered && (
                <SelectField
                  size={{ xs: 12, sm: 6 }}
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
                size={{ xs: 12, sm: 6 }}
                dataField="status"
                label="Status"
                value={form.status}
                onChange={update("status")}
                error={Boolean(errors.status)}
                helperText={errors.status || " "}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </SelectField>

              <SelectField
                size={{ xs: 12, sm: 6 }}
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
            </Grid>
          </SectionBox>

          {/* ── Reward Values ─────────────────────────────────── */}
          <SectionBox title="Reward Values">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Reward Value"
                  type="number"
                  value={form.rewardValue}
                  onChange={update("rewardValue")}
                  disabled={isMultiplier || isTiered}
                  helperText={errors.rewardValue || " "}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Multiplier"
                  type="number"
                  value={form.multiplier}
                  onChange={update("multiplier")}
                  disabled={!isMultiplier}
                  helperText={errors.multiplier || " "}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Min Event Value"
                  type="number"
                  value={form.minEventValue}
                  onChange={update("minEventValue")}
                  disabled={isMultiplier || isTieredFlexible}
                  helperText={errors.minEventValue || " "}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Max Points / Txn"
                  type="number"
                  value={form.maxPointsPerTxn}
                  onChange={update("maxPointsPerTxn")}
                  disabled={isTieredFlexible}
                  helperText={errors.maxPointsPerTxn || " "}
                />
              </Grid>
            </Grid>
          </SectionBox>

          {/* ── Validity Period ───────────────────────────────── */}
          <SectionBox title="Validity Period">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DateTimePicker
                  label="From"
                  value={dayjs(form.appliesFrom)}
                  onChange={updateDate("appliesFrom")}
                  sx={{ width: "100%" }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: errors.appliesFrom || " ",
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DateTimePicker
                  label="To"
                  value={dayjs(form.appliesTo)}
                  onChange={updateDate("appliesTo")}
                  sx={{ width: "100%" }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: errors.appliesTo || " ",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </SectionBox>

          {/* ── Reward Payload ────────────────────────────────── */}
          <SectionBox title="Reward Payload">
            {isTieredFlexible ? (
              <TierEditor tiers={tierRows} onChange={setTierRows} />
            ) : (
              <KeyValueEditor
                label="Reward Payload"
                rows={rewardRows}
                onChange={setRewardRows}
              />
            )}
            {showExpiryDays && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    label="Expiry Days"
                    type="number"
                    value={form.expiryDays}
                    onChange={update("expiryDays")}
                    helperText={errors.expiryDays || " "}
                  />
                </Grid>
              </Grid>
            )}
          </SectionBox>

          {/* ── Criteria ──────────────────────────────────────── */}
          <SectionBox title="Criteria Expression">
            <KeyValueEditor
              label="Criteria"
              rows={criteriaRows}
              onChange={setCriteriaRows}
            />
          </SectionBox>
        </LocalizationProvider>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            className="btn_ghost"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
