import type { APIRoute } from 'astro';
import { validateRequest } from '@admin/utils/session';

export const GET: APIRoute = async ({ request }) => {
    const session = await validateRequest(request);

    if (!session) {
        return new Response(
            JSON.stringify({
                authenticated: false,
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    return new Response(
        JSON.stringify({
            authenticated: true,
            user: {
                userId: session.userId,
                username: session.username,
            },
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
