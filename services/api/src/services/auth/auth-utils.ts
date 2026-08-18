import { Config } from '../../config';
import { SupabaseDB } from '../../database';
import { JwtPayloadType, Role, SetupJwtPayloadType } from './auth-models';
import jsonwebtoken, { SignOptions } from 'jsonwebtoken';

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export async function getJwtPayloadFromDatabase(userId: string): Promise<JwtPayloadType> {
    const { data } = await SupabaseDB.AUTH_INFO.select('email, displayName')
        .eq('userId', userId)
        .maybeSingle()
        .throwOnError();

    if (!data) {
        throw new Error('NoUserFound');
    }
    const { email, displayName } = data;

    const { data: rolesRows } = await SupabaseDB.AUTH_ROLES.select()
        .eq('userId', userId)
        .throwOnError();
    const roles = rolesRows.map((row: { role: Role }) => row.role);

    return {
        userId,
        email,
        displayName,
        roles,
        tokenType: 'access',
    };
}

export async function generateJWT(
    userId: string,
    expiresIn: SignOptions['expiresIn'] = Config.JWT_EXPIRATION_TIME,
) {
    const jwtPayload = await getJwtPayloadFromDatabase(userId);
    return jsonwebtoken.sign(jwtPayload, Config.JWT_SIGNING_SECRET, {
        expiresIn,
    });
}

export async function generateSetupJWT(userId: string) {
    const { data } = await SupabaseDB.AUTH_INFO.select('email')
        .eq('userId', userId)
        .maybeSingle()
        .throwOnError();
    if (!data) {
        throw new Error('NoUserFound');
    }

    const payload: SetupJwtPayloadType = {
        userId,
        email: data.email,
        displayName: null,
        roles: [],
        tokenType: 'setup',
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
