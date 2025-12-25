import type { APIRoute } from 'astro';
import { configManager } from '@admin/utils/config-manager';

export const GET: APIRoute = async () => {
    try {
        const config = await configManager.load();

        return new Response(JSON.stringify({ config }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load configuration';
        return new Response(
            JSON.stringify({
                error: errorMessage,
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
