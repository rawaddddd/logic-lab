import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    root: "./",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    css: {
        postcss: {
            plugins: [tailwindcss(), autoprefixer()]
        }
    },
    build: {
        outDir: "dist",
        sourcemap: false,
        rollupOptions: {
            output: {
                entryFileNames: 'index.min.js',
                assetFileNames: 'styles.min.css',
            }
        }
    },
})
