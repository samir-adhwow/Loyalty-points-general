"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Card from "./ui/Card";
import FormTextField from "./ui/FormTextField";
import Button from "./ui/Button";
import { createLoyaltyPointDetailsFields } from "@/app/const/formFields";
import { useApiMutation } from "@/app/lib/useApi";
import { createLoyaltyPointDetails } from "@/app/lib/api";
import type { z } from "zod";
import { createLoyaltyPointDetailsSchema } from "@/app/lib/validation/loyaltyPointDetailsSchema";

export type CreateFormValues = z.infer<typeof createLoyaltyPointDetailsSchema>;

export default function CreateLoyaltyPointDetails() {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createLoyaltyPointDetailsSchema),
    defaultValues: {
      externalAccount: "",
      system: "",
      cardProductId: "",
      transactionAmount: 0,
      transactionId: 0,
    },
  });

  const createMutation = useApiMutation({
    mutationFn: (payload: CreateFormValues) => createLoyaltyPointDetails(payload),
    invalidateQueryKeys: [["loyalty-point-details"]],
  });

  const handleCreate = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Loyalty point details created successfully.");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create loyalty point details.",
      );
    }
  });

  const fields = createLoyaltyPointDetailsFields({
    createFieldErrors: Object.fromEntries(
      Object.entries(form.formState.errors).map(([k, v]) => [k, v?.message]),
    ),
  });

  return (
    <Card title="Create Loyalty Point Details">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map((field) => {
          const fieldName = field.name as keyof CreateFormValues;
          const fieldError = form.formState.errors[fieldName];
          const { ref, ...registered } = form.register(fieldName, {
            valueAsNumber: field.type === "number",
          });
          return (
            <FormTextField
              key={field.name}
              label={field.label}
              type={field.type}
              required={field.required}
              inputRef={ref}
              error={Boolean(fieldError)}
              helperText={fieldError?.message ?? " "}
              {...registered}
            />
          );
        })}
        <div className="mb-6 flex items-end justify-end">
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            text={
              createMutation.isPending
                ? "Creating..."
                : "Create Loyalty Point Details"
            }
          />
        </div>
      </div>
    </Card>
  );
}
