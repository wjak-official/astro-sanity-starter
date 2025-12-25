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
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                error: error?.message || 'Failed to load configuration',
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
