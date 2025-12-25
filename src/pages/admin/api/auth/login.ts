import type { APIRoute } from 'astro';
import { createSession, createSessionCookie } from '@admin/utils/session';
import { loginSchema } from '@admin/utils/validation';
import { activityTracker, ActivityTypes } from '@admin/utils/activity-tracker';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        
        // Validate input
        const { username, password } = loginSchema.parse(body);

        // For demo purposes, we'll use a simple credential check
        // In production, you should validate against a proper user database
        const validUsername = process.env.ADMIN_USERNAME;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (!validUsername || !validPassword) {
            if (process.env.NODE_ENV === 'production') {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Admin credentials not configured',
                    }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
            // Development defaults
            if (username !== 'admin' || password !== 'password123') {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Invalid username or password',
                    }),
                    {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
        } else if (username !== validUsername || password !== validPassword) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid username or password',
                }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Create session
        const userId = 'admin-user-1';
        const sessionToken = await createSession(userId, username);

        // Track login activity
        await activityTracker.addActivity(
            ActivityTypes.USER_LOGIN,
            `User "${username}" logged in`,
            '🔐',
            userId
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Login successful',
                user: { username },
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': createSessionCookie(sessionToken),
                },
            }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error?.message || 'Login failed',
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
