'use strict';

var jsxRuntime = require('react/jsx-runtime');
var reactQuery = require('@tanstack/react-query');
var react = require('react');

function UseDataContextProvider({ client, children, }) {
    return jsxRuntime.jsx(reactQuery.QueryClientProvider, { client: client, children: children });
}

function useData(queryKey, queryFn) {
    const { data: queryData, status: queryStatus, error: queryError, } = reactQuery.useQuery({
        queryKey,
        queryFn,
    });
    const value = react.useMemo(() => ({
        isLoading: queryStatus === "pending",
        isError: queryStatus === "error",
        data: queryData,
        error: queryError || undefined,
    }), [queryData, queryStatus]);
    return value;
}

function useMutatingData(queryKey, queryFn, mutationFn) {
    const queryClient = reactQuery.useQueryClient();
    const dataHook = useData(queryKey, queryFn);
    const { mutate, isPending } = reactQuery.useMutation({
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
    const value = react.useMemo(() => ({
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

exports.UseDataContextProvider = UseDataContextProvider;
exports.useData = useData;
exports.useMutatingData = useMutatingData;
//# sourceMappingURL=useData.cjs.map
