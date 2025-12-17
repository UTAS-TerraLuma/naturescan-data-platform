import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        devtools(),
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        viteReact(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
