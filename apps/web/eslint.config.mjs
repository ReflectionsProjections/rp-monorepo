import { defineConfig } from "eslint/config"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"

export default defineConfig([
    { ignores: ["dist/**", ".yarn/**", "node_modules/**"] },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },

            parserOptions: {
                projectService: {
                    allowDefaultProject: ["eslint.config.mjs"],
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            ...reactHooks.configs["recommended-latest"].rules,
            // TODO: The below should all be errors
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/refs": "warn",
            "react-hooks/purity": "warn",
            "react-hooks/preserve-manual-memoization": "warn",
        },
    },
])
