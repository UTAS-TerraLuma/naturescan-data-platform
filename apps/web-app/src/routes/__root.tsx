import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
    {
        component: () => (
            <>
                <Outlet />
                <ReactQueryDevtools buttonPosition="top-right" />
                <TanStackRouterDevtools position="bottom-right" />
            </>
        ),
    },
)
