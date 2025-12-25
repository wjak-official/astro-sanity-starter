import type { APIRoute } from 'astro';
import { testSanityConnection } from '@admin/utils/sanity-api';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const result = await testSanityConnection(body);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                success: false,
                message: error?.message || 'Failed to test connection',
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
