"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClientProvider, useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { useMemo } from "react";
export function UseDataContextProvider({ client, children, }) {
    return _jsx(QueryClientProvider, { client: client, children: children });
}
export function useData(queryKey, queryFn) {
    const { data: queryData, status: queryStatus } = useQuery({
        queryKey,
        queryFn,
    });
    const value = useMemo(() => ({
        loading: queryStatus === "pending",
        data: queryData,
    }), [queryData, queryStatus]);
    return value;
}
export function useMutatingData(queryKey, queryFn, mutationFn) {
    const queryClient = useQueryClient();
    const dataHook = useData(queryKey, queryFn);
    const { mutate, isPending } = useMutation({
        mutationFn,
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey });
            queryClient.setQueryData(queryKey, (oldData) => ({ ...oldData, ...newData }));
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
    const value = useMemo(() => ({
        ...dataHook,
        update: (data, callbacks) => mutate(data, {
            onSettled: (data) => {
                if (callbacks && callbacks.onSettled && data) {
                    callbacks.onSettled(data);
                }
            },
        }),
        updating: isPending,
    }), [dataHook, isPending]);
    return value;
}
