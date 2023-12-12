import { QueryKey } from "@tanstack/react-query";
import { LoadingHook, QueryFn } from "./useData";
export interface UpdateCallbacks<TData> {
    onSettled?: (data: TData) => void;
}
interface UpdateHook<TData> extends LoadingHook<TData> {
    update: (data: Partial<TData>, callbacks?: UpdateCallbacks<TData>) => void;
    updating: boolean;
}
export declare function useMutatingData<TData extends object, TQueryKey extends QueryKey>(queryKey: TQueryKey, queryFn: QueryFn<TData>, mutationFn: (data: Partial<TData>) => Promise<TData>): UpdateHook<TData>;
export {};
