import { QueryClient } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
export declare function UseDataContextProvider({ client, children, }: Readonly<PropsWithChildren<{
    client: QueryClient;
}>>): import("react/jsx-runtime").JSX.Element;
