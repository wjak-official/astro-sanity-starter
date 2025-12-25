import type { APIRoute } from 'astro';
import { configManager } from '@admin/utils/config-manager';
import { getRecentPages } from '@admin/utils/sanity-api';

export const GET: APIRoute = async () => {
    try {
        const config = await configManager.load();

        if (!config.SANITY_PROJECT_ID || !config.SANITY_TOKEN) {
            return new Response(
                JSON.stringify({
                    pages: [],
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const pages = await getRecentPages(config, 5);

        return new Response(JSON.stringify({ pages }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching recent pages:', error);
        return new Response(
            JSON.stringify({
                pages: [],
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
