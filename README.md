# use-data

The opinionated API wrapper that does stuff the way I want! use-data wraps [TanStack Query](https://tanstack.com/query/latest) into simple to use hooks.

**This library is under development!** I'm changing things as I go while using it in some projects. There's still some features missing I'm sure I'll need soon, plenty of features missing I recon other people will need and I'm sure there's also a whole lot of features missing I didn't even think about.

## Usage

### UseDataContextProvider

You need to wrap your application in a `UseDataContextProvider` just as you wrap it in a `QueryClientProvider` to use TanStack Query. If you're using naked TanStack Query side by side with use-data they can share a Query Client and this allows them to share their cache!

A full example using both may look like this:

```
const queryClient = new QueryClient();
return (
  <QueryClientProvider client={queryClient}>
     <UseDataContextProvider client={queryClient}>
      {children}
    </UseDataContextProvider>
  </QueryClientProvider>
);
```

### useData(queryKey, queryFn)

The useData hook consumes data from a data source. Provide a unique `queryKey` to identify the data and a function to get the data. Most likely this will be fetched from an API and return a Promise but you can of course use any data source you want.

useData uses the default configuration of the [TanStack Query useQuery hook](https://tanstack.com/query/latest/docs/react/reference/useQuery), that is no refetching after some time but refetching on mount, on window focus and and on reconnect.

This way, a complete hook to fetch data from an API may look like this:

```
export function useUser(id: string) {
  const data = useData(["user", id], () => {
    return axios.get<User>(`/api/user/${id}`).then((response) => response.data);
  });
  return data;
}
```

The useData hook returns the following properties:

- `loading`: Boolean indicating if the data is currently loading.
- `data`: The actual data returned by the queryFn.

### useMutatingData(queryKey, queryFn, mutationFn)

The useMutatingData hook provides additional functionality to change the data accessed by useData. In addition to the parameters of useData it has a `mutationFn` that tells use-hook how to change the data. mutationFn always receives a partial object of the type returned by the queryFn.

useMutatingData implements optimistic updates by default. As soon as you call the `mutationFn` the data you receive from the hook is changed. After the `mutationFn` finishes use-hook updates the data once more to account for any additional server-side changes happening.

Here's a full example of a hook that allows you to read and update some data:

```
export function useOrder(id: string): DataHook<Order> {
  return useMutatingData(
    ["order", id],
    () => {
      return axios
        .get<Order>(`/api/orders/${id}`)
        .then((response) => response.data);
    },
    (order: Partial<Order>) => {
      return axios
        .patch<Order>(`/api/orders/${id}`, order)
        .then((response) => response.data);
    }
  );
}
```

The useMutatingData hook returns the following properties:

- `update`: The function to call when updating data. `update` has an optional paramter `callbacks` where you can provide a function that is called after the update finishes, no matter if it was successful or not. The callback always receives the current data; that may be the updated data or your old data in the case of a failure.
- `updating`: Boolean indicating if the data is currently updating.
- … and everything returned by useData
