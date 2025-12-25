import { SignJWT, jwtVerify } from 'jose';
import type { SessionData } from './validation';

const SECRET_KEY = new TextEncoder().encode(
    process.env.SESSION_SECRET || 'change-this-secret-key-in-production'
);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Session management utilities
 */

/**
 * Create a new session token
 */
export async function createSession(userId: string, username: string): Promise<string> {
    const expiresAt = Date.now() + SESSION_DURATION;

    const token = await new SignJWT({
        userId,
        username,
        expiresAt,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(expiresAt / 1000))
        .sign(SECRET_KEY);

    return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);

        if (!payload.userId || !payload.username || !payload.expiresAt) {
            return null;
        }

        const expiresAt = payload.expiresAt as number;
        if (Date.now() > expiresAt) {
            return null;
        }

        return {
            userId: payload.userId as string,
            username: payload.username as string,
            expiresAt,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Get session from request cookies
 */
export function getSessionFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies['session'] || null;
}

/**
 * Create session cookie header
 */
export function createSessionCookie(token: string): string {
    return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION / 1000}`;
}

/**
 * Create logout cookie header
 */
export function clearSessionCookie(): string {
    return 'session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
}

/**
 * Check if session is valid from request
 */
export async function validateRequest(request: Request): Promise<SessionData | null> {
    const token = getSessionFromRequest(request);
    if (!token) {
        return null;
    }

    return verifySession(token);
}
