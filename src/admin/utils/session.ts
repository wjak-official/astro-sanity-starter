import { SignJWT, jwtVerify } from 'jose';
import type { SessionData } from './validation';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get the secret key for session signing
 * Lazy-loaded to avoid issues during static build
 */
function getSecretKey(): Uint8Array {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
        const isDevelopment = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
        
        if (!isDevelopment) {
            // Fail fast in production/test environments
            throw new Error('SECURITY ERROR: SESSION_SECRET environment variable is required in production. Generate a secure secret with: openssl rand -base64 32');
        }
        
        // Only log warning once in development
        if (typeof globalThis !== 'undefined' && !(globalThis as any).__SESSION_SECRET_WARNING_SHOWN) {
            console.warn('\n⚠️  WARNING: Using default SESSION_SECRET for development only!');
            console.warn('   Generate a secure secret for production with: openssl rand -base64 32\n');
            (globalThis as any).__SESSION_SECRET_WARNING_SHOWN = true;
        }
        
        return new TextEncoder().encode('default-dev-secret-change-in-production-min-32-chars');
    }
    return new TextEncoder().encode(secret);
}

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
        .sign(getSecretKey());

    return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey());

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
        const [key, ...valueParts] = cookie.trim().split('=');
        if (key && valueParts.length > 0) {
            acc[key] = valueParts.join('=');
        }
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
