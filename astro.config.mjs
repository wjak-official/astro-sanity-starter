import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { sanityConfig } from './src/utils/sanity-client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
    image: {
        domains: ['cdn.sanity.io']
    },
    integrations: [
        sanity(sanityConfig),
        react(),
        tailwind({
            applyBaseStyles: false
        })
    ],
    vite: {
        resolve: {
            alias: {
                '@admin': path.resolve(__dirname, 'src/admin')
            }
        },
        server: {
            hmr: { path: '/vite-hmr/' }
        }
    },
    server: {
        port: 3000
    }
});