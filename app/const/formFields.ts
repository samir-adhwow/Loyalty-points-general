export const createLoyaltyPointDetailsFields = ({ createFieldErrors }) => [
  {
    name: "externalAccount",
    label: "External Account",
    type: "text",
    required: true,
    error: Boolean(createFieldErrors.externalAccount),
    helperText: createFieldErrors.externalAccount || " ",
    onChange: (event) => {
      setCreateFieldErrors((prev) => ({
        ...prev,
        externalAccount: "",
      }));
      setCreateForm((prev) => ({
        ...prev,
        externalAccount: event.target.value,
      }));
    },
  },
  {
    name: "system",
    label: "System",
    type: "text",
    required: true,
    error: Boolean(createFieldErrors.system),
    helperText: createFieldErrors.system || " ",
    onChange: (event) => {
      setCreateFieldErrors((prev) => ({ ...prev, system: "" }));
      setCreateForm((prev) => ({
        ...prev,
        system: event.target.value,
      }));
    },
  },
  {
    name: "cardProductId",
    label: "Card Product Id",
    type: "text",
    required: true,
    error: Boolean(createFieldErrors.cardProductId),
    helperText: createFieldErrors.cardProductId || " ",
    onChange: (event) => {
      setCreateFieldErrors((prev) => ({ ...prev, cardProductId: "" }));
      setCreateForm((prev) => ({
        ...prev,
        cardProductId: event.target.value,
      }));
    },
  },
  {
    name: "transactionAmount",
    label: "Transaction Amount",
    type: "number",
    required: true,
    error: Boolean(createFieldErrors.transactionAmount),
    helperText: createFieldErrors.transactionAmount || " ",
    onChange: (event) => {
      setCreateFieldErrors((prev) => ({
        ...prev,
        transactionAmount: "",
      }));
      setCreateForm((prev) => ({
        ...prev,
        transactionAmount: event.target.value,
      }));
    },
  },
  {
    name: "transactionId",
    label: "Transaction Id",
    type: "number",
    required: true,
    error: Boolean(createFieldErrors.transactionId),
    helperText: createFieldErrors.transactionId || " ",
    onChange: (event) => {
      setCreateFieldErrors((prev) => ({ ...prev, transactionId: "" }));
      setCreateForm((prev) => ({
        ...prev,
        transactionId: event.target.value,
      }));
    },
  },
];
