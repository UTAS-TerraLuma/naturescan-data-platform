import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./styles/global.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/tanstack-query-client"

const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },

    // Taken from https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query-file-based
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
}
