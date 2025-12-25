import type { APIRoute } from 'astro';
import { configManager } from '@admin/utils/config-manager';
import { getContentStats } from '@admin/utils/sanity-api';

export const GET: APIRoute = async () => {
    try {
        const config = await configManager.load();

        if (!config.SANITY_PROJECT_ID || !config.SANITY_TOKEN) {
            return new Response(
                JSON.stringify({
                    totalPages: 0,
                    publishedPages: 0,
                    draftPages: 0,
                    totalAssets: 0,
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const stats = await getContentStats(config);

        return new Response(JSON.stringify(stats), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching content stats:', error);
        return new Response(
            JSON.stringify({
                totalPages: 0,
                publishedPages: 0,
                draftPages: 0,
                totalAssets: 0,
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
