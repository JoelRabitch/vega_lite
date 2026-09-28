import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: './vega_vis.js',
            output: {
                entryFileNames: `assets/vega_vis.js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[ext]/[name].[ext]`
            }
        }
    }
})