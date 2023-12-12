"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

export function UseDataContextProvider({
  client,
  children,
}: Readonly<PropsWithChildren<{ client: QueryClient }>>) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
