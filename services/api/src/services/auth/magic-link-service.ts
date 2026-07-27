import { createHash, randomBytes } from "crypto";
import { Config, Templates } from "../../config";
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
    // A role the account must already have, checked at issue and again after
    // the token is consumed. Authentication never grants this role.
    requiredRole: Role | null;
};

// Every client and intent combination must be listed here; unsupported flows
// are null. The Record key is exhaustive, so adding a new client or intent is
// a compile error until every combination has an explicit rule.
const FLOW_RULES: Record<FlowKey, FlowRule | null> = {
    "web:registration": {
        callback: Config.MAGIC_LINK_REGISTRATION_CALLBACK,
        createsAccount: true,
        requiredRole: null,
    },
    "web:login": {
        callback: Config.MAGIC_LINK_WEB_LOGIN_CALLBACK,
        createsAccount: true,
        requiredRole: null,
    },
    "mobile:login": {
        callback: Config.MAGIC_LINK_MOBILE_LOGIN_CALLBACK,
        createsAccount: false,
        requiredRole: Role.Enum.USER,
    },
    "web:resume-book": {
        callback: Config.MAGIC_LINK_RESUME_BOOK_CALLBACK,
        createsAccount: false,
        requiredRole: Role.Enum.CORPORATE,
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

async function hasRequiredRole(
    email: string,
    rule: FlowRule
): Promise<boolean> {
    if (rule.requiredRole === null) {
        return true;
    }
    const account = await findAccount(email);
    if (!account) {
        return false;
    }
    const roles = await rolesFor(account.userId);
    return roles.includes(rule.requiredRole);
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
    await SupabaseDB.MAGIC_LINK_TOKENS.insert({
        tokenDigest,
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
            body: renderMagicLinkEmail(link, normalizedRequest.intent),
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

export async function verifyMagicLink(
    token: string,
    client: MagicLinkClient
): Promise<string | null> {
    const consumed = await consumeToken(token, client);
    if (!consumed) {
        return null;
    }

    const intent = MagicLinkIntent.parse(consumed.intent);
    const rule = flowRuleFor(client, intent);
    if (!rule) {
        return null;
    }

    const email = normalizeEmail(consumed.subjectEmail);
    const account = rule.createsAccount
        ? await getOrCreateAccount(email)
        : await findAccount(email);
    if (!account) {
        return null;
    }

    const roles = await rolesFor(account.userId);
    if (rule.requiredRole !== null && !roles.includes(rule.requiredRole)) {
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

export const magicLinkTokenDigestForTest = digestToken;
