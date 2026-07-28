import Config from "../constants/config";
import type { Role } from "./types";

export type JwtClaims = {
  userId: string;
  email: string;
  displayName: string | null;
  roles: Role[];
  tokenType: "access" | "setup";
};

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + "=".repeat(padding));
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
  const payload = jwt.split(".")[1];
  if (!payload) {
    return null;
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }

  if (typeof decoded !== "object" || decoded === null) {
    return null;
  }

  const claims = decoded as Record<string, unknown>;
  if (typeof claims.userId !== "string" || typeof claims.email !== "string") {
    return null;
  }

  return {
    userId: claims.userId,
    email: claims.email,
    displayName:
      typeof claims.displayName === "string" ? claims.displayName : null,
    roles: Array.isArray(claims.roles) ? (claims.roles as Role[]) : [],
    tokenType: claims.tokenType === "setup" ? "setup" : "access"
  };
}

export function authRefresh() {
  const currentPath =
    window.location.pathname + window.location.search + window.location.hash;
  window.location.href = `/auth/refresh?redirect=${encodeURIComponent(currentPath)}`;
}

export function googleAuth(selectAccount?: boolean, state?: string) {
  const params = new URLSearchParams({
    client_id: Config.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    state:
      state ??
      encodeURIComponent(
        window.location.pathname + window.location.search + window.location.hash
      )
  });

  if (selectAccount) {
    params.set("prompt", "select_account");
  }

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
