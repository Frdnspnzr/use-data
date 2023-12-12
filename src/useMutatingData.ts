import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { LoadingHook, QueryFn, useData } from "./useData";

export interface UpdateCallbacks<TData> {
  onSettled?: (data: TData) => void;
}

interface UpdateHook<TData> extends LoadingHook<TData> {
  update: (data: Partial<TData>, callbacks?: UpdateCallbacks<TData>) => void;
  updating: boolean;
}

export function useMutatingData<
  TData extends object,
  TQueryKey extends QueryKey
>(
  queryKey: TQueryKey,
  queryFn: QueryFn<TData>,
  mutationFn: (data: Partial<TData>) => Promise<TData>
): UpdateHook<TData> {
  const queryClient = useQueryClient();
  const dataHook = useData(queryKey, queryFn);

  const { mutate, isPending } = useMutation({
    mutationFn,
    onMutate: async (newData: Partial<TData>) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<TData>(
        queryKey,
        (oldData) => ({ ...oldData, ...newData } as TData)
      );
      const updatedData = queryClient.getQueryData(queryKey);
      return { data: updatedData };
    },
    onError: (err, newData, context) => {
      //TODO Pass error to caller
      queryClient.setQueryData(queryKey, context?.data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
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
      updating: isPending,
    }),
    [dataHook, isPending]
  );

  return value;
}
