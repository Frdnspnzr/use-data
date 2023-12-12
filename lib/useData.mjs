import { jsx } from 'react/jsx-runtime';
import { QueryClientProvider, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

function UseDataContextProvider({ client, children, }) {
    return jsx(QueryClientProvider, { client: client, children: children });
}

function useData(queryKey, queryFn) {
    const { data: queryData, status: queryStatus, error: queryError, } = useQuery({
        queryKey,
        queryFn,
    });
    const value = useMemo(() => ({
        isLoading: queryStatus === "pending",
        isError: queryStatus === "error",
        data: queryData,
        error: queryError || undefined,
    }), [queryData, queryStatus]);
    return value;
}

function useMutatingData(queryKey, queryFn, mutationFn) {
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

export { UseDataContextProvider, useData, useMutatingData };
//# sourceMappingURL=useData.mjs.map
