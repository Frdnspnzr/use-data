import { QueryKey } from "@tanstack/react-query";
export interface LoadingHook<TData> {
    isLoading: boolean;
    isError: boolean;
    data: TData | undefined;
    error: Error | undefined;
}
export type QueryFn<TData> = () => Promise<TData> | TData | undefined;
export declare function useData<TData, TQueryKey extends QueryKey>(queryKey: TQueryKey, queryFn: QueryFn<TData>): LoadingHook<TData>;
