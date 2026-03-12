import { createContext, useContext, type ReactNode } from "react"
import type { StacItem } from "../-stac-schema"

const ItemContext = createContext<StacItem | undefined>(undefined)

interface ItemProviderProps {
    children: ReactNode
    item: StacItem
}

export function ItemProvider({ children, item }: ItemProviderProps) {
    return <ItemContext.Provider value={item}>{children}</ItemContext.Provider>
}

export function useItem(): StacItem {
    const item = useContext(ItemContext)

    if (item === undefined) {
        throw new Error("useItem must be used within an ItemProvider")
    }

    return item
}
