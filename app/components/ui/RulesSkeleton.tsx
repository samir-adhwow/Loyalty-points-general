import { Skeleton, Stack } from "@mui/material";

export default function RulesSkeleton() {
  return (
    <Stack spacing={1.25}>
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={36} />
      <Skeleton variant="rounded" height={36} />
      <Skeleton variant="rounded" height={36} />
      <Skeleton variant="rounded" height={36} />
    </Stack>
  );
}
