import { createHash, createHmac, randomBytes, randomInt } from "crypto";
import { Config, EnvironmentEnum, Templates } from "../../config";
import { SupabaseDB, supabase } from "../../database";
import { sendTemplateEmail } from "../ses/ses-utils";
import { Role } from "./auth-models";
import { generateJWT, generateSetupJWT, normalizeEmail } from "./auth-utils";
import { renderMagicLinkEmail } from "./magic-link-email";
import {
    MagicLinkClient,
    MagicLinkIntent,
    MagicLinkIssueRequest,
} from "./magic-link-schema";

type Account = {
    userId: string;
    email: string;
    displayName: string | null;
};

type FlowKey = `${MagicLinkClient}:${MagicLinkIntent}`;

type FlowRule = {
    callback: string;
    // Whether verification may create a roleless base account for the email.
    createsAccount: boolean;
    // Roles of which the account must already hold at least one, checked at
    // issue and again after the token is consumed. Authentication itself never
    // grants these roles — STAFF/ADMIN come from the admin-site rosters via
    // syncRosterRoles, and USER from completing registration.
    requiredRoles: Role[] | null;
};

// Every client and intent combination must be listed here; unsupported flows
// are null. The Record key is exhaustive, so adding a new client or intent is
// a compile error until every combination has an explicit rule.
const FLOW_RULES: Record<FlowKey, FlowRule | null> = {
    "web:registration": {
        callback: Config.MAGIC_LINK_REGISTRATION_CALLBACK,
        createsAccount: true,
        requiredRoles: null,
    },
    "web:login": {
        callback: Config.MAGIC_LINK_WEB_LOGIN_CALLBACK,
        createsAccount: true,
        requiredRoles: null,
    },
    "mobile:login": {
        callback: Config.MAGIC_LINK_MOBILE_LOGIN_CALLBACK,
        createsAccount: false,
        // STAFF alongside USER so staff can use the app without having
        // registered as attendees, as they could when Google login existed.
        requiredRoles: [Role.Enum.USER, Role.Enum.STAFF],
    },
    "web:resume-book": {
        callback: Config.MAGIC_LINK_RESUME_BOOK_CALLBACK,
        createsAccount: false,
        requiredRoles: [Role.Enum.CORPORATE],
    },
    "mobile:registration": null,
    "mobile:resume-book": null,
};

function flowRuleFor(
    client: MagicLinkClient,
    intent: MagicLinkIntent
): FlowRule | null {
    return FLOW_RULES[`${client}:${intent}`];
}

function digestToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

// A 6-digit code has only a million possibilities, so a plain hash could be
// brute-forced offline from a leaked row; keying the digest with a server
// secret means the stored value is useless without it.
function digestCode(email: string, code: string): string {
    return createHmac("sha256", Config.JWT_SIGNING_SECRET)
        .update(`magic-link-code:${email}:${code}`)
        .digest("hex");
}

function generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

async function findAccount(email: string): Promise<Account | null> {
    const { data } = await SupabaseDB.AUTH_INFO.select(
        "userId,email,displayName"
    )
        .eq("email", normalizeEmail(email))
        .maybeSingle()
        .throwOnError();
    return data;
}

async function rolesFor(userId: string): Promise<Role[]> {
    const { data } = await SupabaseDB.AUTH_ROLES.select("role")
        .eq("userId", userId)
        .throwOnError();
    return data.map((row) => row.role);
}

async function isRosteredStaff(email: string): Promise<boolean> {
    const { data } = await SupabaseDB.STAFF.select("email")
        .eq("email", email)
        .maybeSingle()
        .throwOnError();
    return data !== null;
}

async function isRosteredCorporate(email: string): Promise<boolean> {
    const { data } = await SupabaseDB.CORPORATE.select("email")
        .eq("email", email)
        .maybeSingle()
        .throwOnError();
    return data !== null;
}

/**
 * Grants roles from the admin-site rosters, exactly as Google login used to on
 * every sign-in: an email on the staff roster gets STAFF, an email on the
 * corporate roster gets CORPORATE, and a whitelisted email gets ADMIN, taking
 * effect the next time the person signs in. Roles are only ever added here —
 * removing someone from a roster is handled by the roster endpoints revoking
 * the role directly.
 */
async function syncRosterRoles(userId: string, email: string): Promise<void> {
    if (await isRosteredStaff(email)) {
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.STAFF,
        }).throwOnError();
    }

    if (await isRosteredCorporate(email)) {
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.CORPORATE,
        }).throwOnError();
    }

    if (Config.AUTH_ADMIN_WHITELIST.has(email)) {
        await SupabaseDB.AUTH_ROLES.upsert({
            userId,
            role: Role.Enum.ADMIN,
        }).throwOnError();
    }

    // In development, allow a specific email to be admin for local testing
    if (
        Config.ENV === EnvironmentEnum.DEVELOPMENT &&
        Config.DEV_ADMIN_EMAIL &&
        email === Config.DEV_ADMIN_EMAIL
    ) {
        for (const role of [
            Role.Enum.SUPER_ADMIN,
            Role.Enum.ADMIN,
            Role.Enum.STAFF,
        ]) {
            await SupabaseDB.AUTH_ROLES.upsert({ userId, role }).throwOnError();
        }
    }
}

async function hasRequiredRole(
    email: string,
    rule: FlowRule
): Promise<boolean> {
    if (rule.requiredRoles === null) {
        return true;
    }
    // The rosters stand in for their roles so a freshly granted staff member
    // or sponsor can sign in before their first login materializes the role.
    if (
        rule.requiredRoles.includes(Role.Enum.STAFF) &&
        (await isRosteredStaff(email))
    ) {
        return true;
    }
    if (
        rule.requiredRoles.includes(Role.Enum.CORPORATE) &&
        (await isRosteredCorporate(email))
    ) {
        return true;
    }
    const account = await findAccount(email);
    if (!account) {
        return false;
    }
    const roles = await rolesFor(account.userId);
    return rule.requiredRoles.some((role) => roles.includes(role));
}

export async function issueMagicLink(
    request: MagicLinkIssueRequest
): Promise<void> {
    const normalizedRequest = {
        ...request,
        email: normalizeEmail(request.email),
    };
    const rule = flowRuleFor(
        normalizedRequest.client,
        normalizedRequest.intent
    );
    if (!rule || !(await hasRequiredRole(normalizedRequest.email, rule))) {
        return;
    }

    const token = randomBytes(32).toString("base64url");
    const tokenDigest = digestToken(token);
    const code = generateCode();

    // A new request supersedes any earlier one: at most one live token per
    // email, so an emailed code always refers to the newest email.
    await SupabaseDB.MAGIC_LINK_TOKENS.delete()
        .eq("subjectEmail", normalizedRequest.email)
        .is("usedAt", null)
        .throwOnError();

    await SupabaseDB.MAGIC_LINK_TOKENS.insert({
        tokenDigest,
        codeDigest: digestCode(normalizedRequest.email, code),
        subjectEmail: normalizedRequest.email,
        client: normalizedRequest.client,
        intent: normalizedRequest.intent,
        expiresAt: new Date(
            Date.now() + Config.VERIFY_EXP_TIME_MS
        ).toISOString(),
    }).throwOnError();

    const link = `${rule.callback}?token=${encodeURIComponent(token)}`;
    try {
        await sendTemplateEmail(normalizedRequest.email, Templates.RP_EMAILS, {
            subject: "Your Reflections | Projections sign-in link",
            body: renderMagicLinkEmail(link, code, normalizedRequest.intent),
        });
    } catch (error) {
        await SupabaseDB.MAGIC_LINK_TOKENS.delete()
            .eq("tokenDigest", tokenDigest)
            .throwOnError();
        throw error;
    }
}

async function getOrCreateAccount(email: string): Promise<Account> {
    const { data, error } = await supabase.rpc(
        "get_or_create_magic_link_account",
        { p_email: email }
    );
    if (error) {
        throw error;
    }
    const account = data.at(0);
    if (!account) {
        throw new Error("NoUserFound");
    }
    return account;
}

async function consumeToken(token: string, client: MagicLinkClient) {
    const { data, error } = await supabase.rpc("consume_magic_link_token", {
        p_token_digest: digestToken(token),
        p_client: client,
    });
    if (error) {
        throw error;
    }
    return data.at(0) ?? null;
}

async function consumeCode(
    email: string,
    code: string,
    client: MagicLinkClient
) {
    const { data, error } = await supabase.rpc("consume_magic_link_code", {
        p_email: email,
        p_code_digest: digestCode(email, code),
        p_client: client,
        p_max_attempts: Config.MAGIC_LINK_CODE_MAX_ATTEMPTS,
    });
    if (error) {
        throw error;
    }
    return data.at(0) ?? null;
}

type ConsumedToken = {
    subjectEmail: string;
    intent: string;
};

/**
 * Turns a consumed token into a session JWT. The link and code paths both end
 * here, so they mint identical sessions: same account lookup and creation,
 * same roster role sync, same role checks, and the same setup or access token.
 */
async function sessionForConsumed(
    consumed: ConsumedToken,
    client: MagicLinkClient
): Promise<string | null> {
    const intent = MagicLinkIntent.parse(consumed.intent);
    const rule = flowRuleFor(client, intent);
    if (!rule) {
        return null;
    }

    const email = normalizeEmail(consumed.subjectEmail);
    let account = rule.createsAccount
        ? await getOrCreateAccount(email)
        : await findAccount(email);
    if (
        !account &&
        ((await isRosteredStaff(email)) || (await isRosteredCorporate(email)))
    ) {
        // Rostered staff and sponsors signing in for the first time get the
        // account Google login used to create on the fly.
        account = await getOrCreateAccount(email);
    }
    if (!account) {
        return null;
    }

    await syncRosterRoles(account.userId, email);

    const roles = await rolesFor(account.userId);
    if (
        rule.requiredRoles !== null &&
        !rule.requiredRoles.some((role) => roles.includes(role))
    ) {
        return null;
    }

    if (roles.length === 0) {
        return generateSetupJWT(account.userId);
    }
    return generateJWT(
        account.userId,
        client === "mobile"
            ? Config.MOBILE_JWT_EXPIRATION_TIME
            : Config.JWT_EXPIRATION_TIME
    );
}

export async function verifyMagicLink(
    token: string,
    client: MagicLinkClient
): Promise<string | null> {
    const consumed = await consumeToken(token, client);
    if (!consumed) {
        return null;
    }
    return sessionForConsumed(consumed, client);
}

export async function verifyMagicLinkCode(
    email: string,
    code: string,
    client: MagicLinkClient
): Promise<string | null> {
    const consumed = await consumeCode(normalizeEmail(email), code, client);
    if (!consumed) {
        return null;
    }
    return sessionForConsumed(consumed, client);
}

export const magicLinkTokenDigestForTest = digestToken;
export const magicLinkCodeDigestForTest = digestCode;
