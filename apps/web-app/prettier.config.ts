import { type Config } from "prettier"

import * as tailwindPlugin from "prettier-plugin-tailwindcss"
import * as oxcPlugin from "@prettier/plugin-oxc"

const config: Config = {
    semi: false,
    tabWidth: 4,
    plugins: [tailwindPlugin, oxcPlugin],
}

export default config
