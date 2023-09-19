import { QueryClient, QueryKey } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
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
export declare function UseDataContextProvider({ client, children, }: PropsWithChildren<{
    client: QueryClient;
}>): import("react/jsx-runtime").JSX.Element;
export declare function useData<TData, TQueryKey extends QueryKey>(queryKey: TQueryKey, queryFn: QueryFn<TData>): LoadingHook<TData>;
export declare function useMutatingData<TData, TQueryKey extends QueryKey>(queryKey: TQueryKey, queryFn: QueryFn<TData>, mutationFn: (data: Partial<TData>) => Promise<TData>): UpdateHook<TData>;
export {};
