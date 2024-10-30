import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
    integrations: [svelte(), tailwind()],
    vite: {
        plugins: [
            {
                name: 'threlte-preprocess',
                configureServer: (server) => {
                    server.middlewares.use((req, res, next) => {
                        if (req.url.endsWith('.svelte')) {
                            res.setHeader('Content-Type', 'application/javascript');
                        }
                        next();
                    });
                }
            }
        ]
    }
}); 