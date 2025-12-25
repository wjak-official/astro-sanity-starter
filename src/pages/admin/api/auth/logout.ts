import type { APIRoute } from 'astro';
import { clearSessionCookie } from '@admin/utils/session';

export const POST: APIRoute = async () => {
    return new Response(
        JSON.stringify({
            success: true,
            message: 'Logged out successfully',
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': clearSessionCookie(),
            },
        }
    );
};
