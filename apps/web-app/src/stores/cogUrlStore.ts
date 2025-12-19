import { create } from "zustand"

interface CogUrlStore {
    url: string | null
    setUrl: (url: string) => void
}

export const useCogUrlStore = create<CogUrlStore>((set) => ({
    url: null,
    setUrl: (url: string | null) => set({ url }),
}))
