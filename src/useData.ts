import { QueryKey, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface LoadingHook<TData> {
  isLoading: boolean;
  isError: boolean;
  data: TData | undefined;
  error: Error | undefined;
}

export type QueryFn<TData> = () => Promise<TData> | TData | undefined;

export function useData<TData, TQueryKey extends QueryKey>(
  queryKey: TQueryKey,
  queryFn: QueryFn<TData>
): LoadingHook<TData> {
  const {
    data: queryData,
    status: queryStatus,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn,
  });

  const value = useMemo<LoadingHook<TData>>(
    () => ({
      isLoading: queryStatus === "pending",
      isError: queryStatus === "error",
      data: queryData,
      error: queryError || undefined,
    }),
    [queryData, queryStatus]
  );

  return value;
}
