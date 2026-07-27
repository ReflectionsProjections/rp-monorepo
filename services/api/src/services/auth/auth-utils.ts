// Create a function to generate GoogleStrategy instances
import { TokenPayload } from "google-auth-library";
import { Config, EnvironmentEnum } from "../../config";
import { SupabaseDB } from "../../database";
import { JwtPayloadType, Role, SetupJwtPayloadType } from "./auth-models";
import jsonwebtoken, { SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export type TokenPayloadWithProperScopes = TokenPayload & {
    sub: string;
    name: string;
    email: string;
};
export function payloadHasProperScopes(
    payload: TokenPayload
): payload is TokenPayloadWithProperScopes {
    return "email" in payload && "sub" in payload && "name" in payload;
}

export async function updateDatabaseWithAuthPayload(
    payload: TokenPayloadWithProperScopes
): Promise<string> {
    const authId = payload.sub; // If we ever support multiple platforms, will need to change this, but fine for now
    const displayName = payload.name;
    const email = normalizeEmail(payload.email);

    const { data: authIdMatch } = await SupabaseDB.AUTH_INFO.select("userId")
        .eq("authId", authId)
        .maybeSingle()
        .throwOnError();

    const { data: emailMatch } = authIdMatch
        ? { data: null }
        : await SupabaseDB.AUTH_INFO.select("userId")
              .eq("email", email)
              .maybeSingle()
              .throwOnError();

    const userId = authIdMatch?.userId ?? emailMatch?.userId ?? randomUUID();

    await SupabaseDB.AUTH_INFO.upsert(
        {
            authId,
            email,
            displayName,
            userId,
        },
        {
            onConflict: "userId",
        }
    ).throwOnError();

    // If the user is STAFF, add the staff role to them
    const { data: staff } = await SupabaseDB.STAFF.select()
        .eq("email", email)
        .maybeSingle();
    if (staff) {
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.STAFF,
        });
    }

    // In development, allow a specific email to be admin for local testing
    if (
        Config.ENV === EnvironmentEnum.DEVELOPMENT &&
        Config.DEV_ADMIN_EMAIL &&
        email === Config.DEV_ADMIN_EMAIL
    ) {
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.SUPER_ADMIN,
        });
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.ADMIN,
        });

        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.STAFF,
        });
    }

    // If the user is ADMIN, add the admin role to them
    if (Config.AUTH_ADMIN_WHITELIST.has(email)) {
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.ADMIN,
        });
    }

    // Return the userId updated
    return userId;
}

export async function getJwtPayloadFromDatabase(
    userId: string
): Promise<JwtPayloadType> {
    const { data } = await SupabaseDB.AUTH_INFO.select("email, displayName")
        .eq("userId", userId)
        .maybeSingle()
        .throwOnError();

    if (!data) {
        throw new Error("NoUserFound");
    }
    const { email, displayName } = data;

    const { data: rolesRows } = await SupabaseDB.AUTH_ROLES.select()
        .eq("userId", userId)
        .throwOnError();
    const roles = rolesRows.map((row: { role: Role }) => row.role);

    return {
        userId,
        email,
        displayName,
        roles,
        tokenType: "access",
    };
}

export async function generateJWT(
    userId: string,
    expiresIn: SignOptions["expiresIn"] = Config.JWT_EXPIRATION_TIME
) {
    const jwtPayload = await getJwtPayloadFromDatabase(userId);
    return jsonwebtoken.sign(jwtPayload, Config.JWT_SIGNING_SECRET, {
        expiresIn,
    });
}

export async function generateSetupJWT(userId: string) {
    const { data } = await SupabaseDB.AUTH_INFO.select("email")
        .eq("userId", userId)
        .maybeSingle()
        .throwOnError();
    if (!data) {
        throw new Error("NoUserFound");
    }

    const payload: SetupJwtPayloadType = {
        userId,
        email: data.email,
        displayName: null,
        roles: [],
        tokenType: "setup",
    };
    return jsonwebtoken.sign(payload, Config.JWT_SIGNING_SECRET, {
        expiresIn: Config.JWT_EXPIRATION_TIME,
    });
}

export function isUser(payload?: JwtPayloadType) {
    return payload?.roles.includes(Role.Enum.USER);
}

export function isStaff(payload?: JwtPayloadType) {
    return payload?.roles.includes(Role.Enum.STAFF);
}

export function isAdmin(payload?: JwtPayloadType) {
    return payload?.roles.includes(Role.Enum.ADMIN);
}
