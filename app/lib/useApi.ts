import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

type ApiLikeResponse<T> = { data?: T } | T | null | undefined;

type UseApiQueryInput<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<ApiLikeResponse<TData>>;
  fallbackData: TData;
  enabled?: boolean;
};

type UseApiMutationInput<TPayload, TResult = unknown> = {
  mutationFn: (payload: TPayload) => Promise<TResult>;
  invalidateQueryKeys?: QueryKey[];
};

function resolveResponseData<T>(response: ApiLikeResponse<T>, fallback: T): T {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as { data?: T }).data;
    return (data ?? fallback) as T;
  }

  return (response ?? fallback) as T;
}

export function useApiQuery<TData>(
  { queryKey, queryFn, fallbackData, enabled = true }: UseApiQueryInput<TData>,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
) {
  return useQuery<TData>({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      return resolveResponseData(response, fallbackData);
    },
    enabled,
    ...options,
  });
}

export function useApiMutation<TPayload, TResult = unknown>(
  {
    mutationFn,
    invalidateQueryKeys = [],
  }: UseApiMutationInput<TPayload, TResult>,
  options?: Omit<UseMutationOptions<TResult, Error, TPayload>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TPayload>({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateQueryKeys.length > 0) {
        await Promise.all(
          invalidateQueryKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
