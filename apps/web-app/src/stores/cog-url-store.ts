import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CogUrlStore {
    url: string | null
    setUrl: (url: string | null) => void
}

export const useCogUrlStore = create<CogUrlStore>()(
    persist(
        (set) => ({
            url: null,
            setUrl: (url) => set({ url }),
        }),
        { name: "cog-url" },
    ),
)
