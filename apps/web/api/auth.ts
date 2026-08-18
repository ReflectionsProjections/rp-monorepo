import type { Role } from './types';

export type JwtClaims = {
    userId: string;
    email: string;
    displayName: string | null;
    roles: Role[];
    tokenType: 'access' | 'setup';
};

function base64UrlDecode(value: string) {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    const binary = atob(base64 + '='.repeat(padding));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

/**
 * Reads the claims out of a JWT without verifying it. The API is the only
 * authority on whether a token is valid; this exists so the client can tell a
 * setup token (a verified account that has no roles yet, and so must finish
 * registering) apart from a full access token before deciding what to render.
 */
export function readJwtClaims(jwt: string): JwtClaims | null {
    const payload = jwt.split('.')[1];
    if (!payload) {
        return null;
    }

    let decoded: unknown;
    try {
        decoded = JSON.parse(base64UrlDecode(payload));
    } catch {
        return null;
    }

    if (typeof decoded !== 'object' || decoded === null) {
        return null;
    }

    const claims = decoded as Record<string, unknown>;
    if (typeof claims.userId !== 'string' || typeof claims.email !== 'string') {
        return null;
    }

    return {
        userId: claims.userId,
        email: claims.email,
        displayName: typeof claims.displayName === 'string' ? claims.displayName : null,
        roles: Array.isArray(claims.roles) ? (claims.roles as Role[]) : [],
        tokenType: claims.tokenType === 'setup' ? 'setup' : 'access',
    };
}

const RETURN_TO_KEY = 'magicLinkReturnTo';

/**
 * Sends a signed-out visitor to the magic-link page, remembering where they
 * were headed. The link itself carries no state — the API builds that URL from
 * a fixed callback — so the destination is stashed here for the callback to
 * pick up. Opening the link on another device simply falls back to the
 * callback's own default.
 */
export function magicLinkSignIn({ remember = true } = {}) {
    if (remember) {
        const returnTo = window.location.pathname + window.location.search + window.location.hash;
        localStorage.setItem(RETURN_TO_KEY, returnTo);
    } else {
        // Pass remember: false when coming back would fail the same way, so the
        // two pages can't bounce the visitor between them.
        localStorage.removeItem(RETURN_TO_KEY);
    }
    window.location.href = '/login';
}

/** Reads and clears the path stashed by {@link magicLinkSignIn}. */
export function takeMagicLinkReturnTo() {
    const returnTo = localStorage.getItem(RETURN_TO_KEY);
    localStorage.removeItem(RETURN_TO_KEY);

    // Only same-origin paths; "//host" would leave the site entirely.
    if (returnTo === null || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
        return null;
    }
    return returnTo;
}
