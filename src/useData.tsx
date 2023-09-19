"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";

export interface UpdateCallbacks<TData> {
  onSettled?: (data: TData) => void;
}

interface LoadingHook<TData> {
  loading: boolean;
  data: TData | undefined;
}

interface UpdateHook<TData> extends LoadingHook<TData> {
  update: (data: Partial<TData>, callbacks?: UpdateCallbacks<TData>) => void;
  updating: boolean;
}

type QueryFn<TData> = () => Promise<TData> | TData | undefined;

export function UseDataContextProvider({
  client,
  children,
}: PropsWithChildren<{ client: QueryClient }>) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function useData<TData, TQueryKey extends QueryKey>(
  queryKey: TQueryKey,
  queryFn: QueryFn<TData>
): LoadingHook<TData> {
  const { data: queryData, status: queryStatus } = useQuery({
    queryKey,
    queryFn,
  });

  const value = useMemo<LoadingHook<TData>>(
    () => ({
      loading: queryStatus === "loading",
      data: queryData,
    }),
    [queryData, queryStatus]
  );

  return value;
}

export function useMutatingData<TData, TQueryKey extends QueryKey>(
  queryKey: TQueryKey,
  queryFn: QueryFn<TData>,
  mutationFn: (data: Partial<TData>) => Promise<TData>
): UpdateHook<TData> {
  const queryClient = useQueryClient();
  const dataHook = useData(queryKey, queryFn);

  const { mutate, isLoading } = useMutation({
    mutationFn,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const oldData = queryClient.getQueryData<TData>(queryKey);
      queryClient.setQueryData(queryKey, () => ({ ...oldData, ...newData }));
      return { oldUser: oldData };
    },
    onError: (err, newData, context) => {
      //TODO Pass error to caller
      queryClient.setQueryData(queryKey, context?.oldUser);
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const value = useMemo<UpdateHook<TData>>(
    () => ({
      ...dataHook,
      update: (data, callbacks) =>
        mutate(data, {
          onSettled: (data) => {
            if (callbacks && callbacks.onSettled && data) {
              callbacks.onSettled(data);
            }
          },
        }),
      updating: isLoading,
    }),
    [dataHook, isLoading]
  );

  return value;
}
