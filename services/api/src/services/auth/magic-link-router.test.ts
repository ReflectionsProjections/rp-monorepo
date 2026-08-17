import { StatusCodes } from "http-status-codes";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { post } from "../../../testing/testingTools";
import { Config } from "../../config";
import { SupabaseDB } from "../../database";
import * as sesUtils from "../ses/ses-utils";
import { Role } from "./auth-models";
import {
    magicLinkCodeDigestForTest,
    magicLinkTokenDigestForTest,
} from "./magic-link-service";

const sendTemplateEmail = jest
    .spyOn(sesUtils, "sendTemplateEmail")
    .mockResolvedValue();

function lastMagicLinkToken(): string {
    const templateData = sendTemplateEmail.mock.calls.at(-1)?.[2];
    const html =
        typeof templateData?.body === "string" ? templateData.body : undefined;
    const match = html?.match(/[?&]token=([^"]+)/);
    if (!match?.[1]) {
        throw new Error("Magic-link token was not found in the email");
    }
    return decodeURIComponent(match[1]);
}

function lastMagicLinkCode(): string {
    const templateData = sendTemplateEmail.mock.calls.at(-1)?.[2];
    const html =
        typeof templateData?.body === "string" ? templateData.body : undefined;
    const match = html?.match(/<span class="code">(\d{6})<\/span>/);
    if (!match?.[1]) {
        throw new Error("Sign-in code was not found in the email");
    }
    return match[1];
}

function wrongCodeFor(code: string): string {
    return code === "000000" ? "000001" : "000000";
}

beforeEach(() => {
    sendTemplateEmail.mockClear();
});

describe("POST /auth/magic-links", () => {
    it("returns the same response for eligible and ineligible requests", async () => {
        await post("/auth/magic-links")
            .send({
                email: "new@example.com",
                client: "web",
                intent: "login",
            })
            .expect(StatusCodes.ACCEPTED);
        expect(sendTemplateEmail).toHaveBeenCalledTimes(1);

        await post("/auth/magic-links")
            .send({
                email: "unknown@example.com",
                client: "mobile",
                intent: "login",
            })
            .expect(StatusCodes.ACCEPTED);
        expect(sendTemplateEmail).toHaveBeenCalledTimes(1);
    });

    it("rejects unsupported client and intent combinations", async () => {
        await post("/auth/magic-links")
            .send({
                email: "new@example.com",
                client: "mobile",
                intent: "registration",
            })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("stores only a digest of the opaque token", async () => {
        await post("/auth/magic-links")
            .send({
                email: "Person@Example.com ",
                client: "web",
                intent: "registration",
            })
            .expect(StatusCodes.ACCEPTED);

        const token = lastMagicLinkToken();
        expect(Buffer.from(token, "base64url")).toHaveLength(32);
        expect(token).not.toContain("person@example.com");

        const { data: row } = await SupabaseDB.MAGIC_LINK_TOKENS.select()
            .single()
            .throwOnError();
        expect(row.subjectEmail).toBe("person@example.com");
        expect(row.tokenDigest).toBe(magicLinkTokenDigestForTest(token));
        expect(JSON.stringify(row)).not.toContain(token);
    });
});

describe("POST /auth/magic-links/verify", () => {
    async function issueWebLink(
        email: string,
        intent: "registration" | "login" | "resume-book" = "login"
    ) {
        await post("/auth/magic-links")
            .send({ email, client: "web", intent })
            .expect(StatusCodes.ACCEPTED);
        return lastMagicLinkToken();
    }

    it("creates one roleless base account and returns a setup token", async () => {
        const token = await issueWebLink("New@Example.com");
        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);

        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload).toMatchObject({
            email: "new@example.com",
            displayName: null,
            roles: [],
            tokenType: "setup",
        });

        const { data: accounts } = await SupabaseDB.AUTH_INFO.select()
            .eq("email", "new@example.com")
            .throwOnError();
        expect(accounts).toHaveLength(1);

        await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("does not consume a valid token after an invalid attempt", async () => {
        const token = await issueWebLink("new@example.com");

        await post("/auth/magic-links/verify")
            .send({
                token: "this-is-an-invalid-token-with-enough-characters",
                client: "web",
            })
            .expect(StatusCodes.UNAUTHORIZED);

        await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);
    });

    it("requires USER for mobile login", async () => {
        await SupabaseDB.AUTH_INFO.insert({
            userId: "mobile-user",
            email: "mobile@example.com",
            displayName: "Mobile User",
        });

        await post("/auth/magic-links")
            .send({
                email: "mobile@example.com",
                client: "mobile",
                intent: "login",
            })
            .expect(StatusCodes.ACCEPTED);
        expect(sendTemplateEmail).not.toHaveBeenCalled();

        await SupabaseDB.AUTH_ROLES.insert({
            userId: "mobile-user",
            role: Role.Enum.USER,
        });
        await post("/auth/magic-links")
            .send({
                email: "mobile@example.com",
                client: "mobile",
                intent: "login",
            })
            .expect(StatusCodes.ACCEPTED);
        const token = lastMagicLinkToken();

        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "mobile" })
            .expect(StatusCodes.OK);
        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload.roles).toContain(Role.Enum.USER);
        expect(payload.exp! - payload.iat!).toBe(10 * 24 * 60 * 60);
    });

    it("honors a directly assigned CORPORATE role and its revocation", async () => {
        const loginToken = await issueWebLink("sponsor@example.com");
        const loginResponse = await post("/auth/magic-links/verify")
            .send({ token: loginToken, client: "web" })
            .expect(StatusCodes.OK);
        const setupPayload = jsonwebtoken.verify(
            loginResponse.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;

        await SupabaseDB.AUTH_ROLES.insert({
            userId: setupPayload.userId,
            role: Role.Enum.CORPORATE,
        });
        const resumeToken = await issueWebLink(
            "sponsor@example.com",
            "resume-book"
        );

        await SupabaseDB.AUTH_ROLES.delete()
            .eq("userId", setupPayload.userId)
            .eq("role", Role.Enum.CORPORATE);
        await post("/auth/magic-links/verify")
            .send({ token: resumeToken, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("lets rostered sponsors use the resume book without an account", async () => {
        await SupabaseDB.CORPORATE.insert({
            name: "Acme Corp",
            email: "sponsor@acme.com",
        });

        const token = await issueWebLink("Sponsor@Acme.com", "resume-book");
        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);

        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        // An access token, not a setup token — sponsors are never routed into
        // attendee registration.
        expect(payload.tokenType).toBe("access");
        expect(payload.roles).toEqual([Role.Enum.CORPORATE]);
    });

    it("does not email resume-book links to emails off the corporate roster", async () => {
        await post("/auth/magic-links")
            .send({
                email: "stranger@example.com",
                client: "web",
                intent: "resume-book",
            })
            .expect(StatusCodes.ACCEPTED);
        expect(sendTemplateEmail).not.toHaveBeenCalled();
    });

    it("stops sign-in once a sponsor is removed from the roster", async () => {
        await SupabaseDB.CORPORATE.insert({
            name: "Former Corp",
            email: "former@sponsor.com",
        });
        const token = await issueWebLink("former@sponsor.com", "resume-book");

        await SupabaseDB.CORPORATE.delete().eq("email", "former@sponsor.com");
        await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("grants STAFF from the roster on the next sign-in", async () => {
        await SupabaseDB.AUTH_INFO.insert({
            userId: "attendee-turned-staff",
            email: "newstaff@example.com",
            displayName: "New Staff",
        });
        await SupabaseDB.AUTH_ROLES.insert({
            userId: "attendee-turned-staff",
            role: Role.Enum.USER,
        });
        await SupabaseDB.STAFF.insert({
            email: "newstaff@example.com",
            name: "New Staff",
            team: "DEV",
            attendances: {},
        });

        const token = await issueWebLink("newstaff@example.com");
        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);

        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload.roles).toEqual(
            expect.arrayContaining([Role.Enum.USER, Role.Enum.STAFF])
        );
    });

    it("lets rostered staff sign in on web without registering", async () => {
        await SupabaseDB.STAFF.insert({
            email: "unregistered-staff@example.com",
            name: "Unregistered Staff",
            team: "DEV",
            attendances: {},
        });

        const token = await issueWebLink("unregistered-staff@example.com");
        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);

        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        // An access token, not a setup token — staff are never routed into
        // attendee registration.
        expect(payload.tokenType).toBe("access");
        expect(payload.roles).toEqual([Role.Enum.STAFF]);
        // Staff never fill in attendee registration, so the roster name is
        // the only source for the fresh account's displayName.
        expect(payload.displayName).toBe("Unregistered Staff");
    });

    it("keeps an existing displayName over the roster name", async () => {
        await SupabaseDB.AUTH_INFO.insert({
            userId: "renamed-staff",
            email: "renamed@example.com",
            displayName: "Chosen Name",
        });
        await SupabaseDB.STAFF.insert({
            email: "renamed@example.com",
            name: "Roster Name",
            team: "DEV",
            attendances: {},
        });

        const token = await issueWebLink("renamed@example.com");
        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);

        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload.displayName).toBe("Chosen Name");
    });

    it("lets rostered staff without an account sign in on mobile", async () => {
        await SupabaseDB.STAFF.insert({
            email: "scanner@example.com",
            name: "Scanner Staff",
            team: "DEV",
            attendances: {},
        });

        await post("/auth/magic-links")
            .send({
                email: "scanner@example.com",
                client: "mobile",
                intent: "login",
            })
            .expect(StatusCodes.ACCEPTED);
        const token = lastMagicLinkToken();

        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "mobile" })
            .expect(StatusCodes.OK);
        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload.roles).toContain(Role.Enum.STAFF);
        expect(payload.tokenType).toBe("access");
    });

    it("grants ADMIN from the whitelist on sign-in", async () => {
        const adminEmail = [...Config.AUTH_ADMIN_WHITELIST][0];
        const token = await issueWebLink(adminEmail);
        const response = await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);

        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload.roles).toContain(Role.Enum.ADMIN);
    });

    it("always stores emails normalized and never duplicates an account", async () => {
        const firstToken = await issueWebLink("  Casing@Example.COM ");
        await post("/auth/magic-links/verify")
            .send({ token: firstToken, client: "web" })
            .expect(StatusCodes.OK);

        const secondToken = await issueWebLink("CASING@example.com");
        await post("/auth/magic-links/verify")
            .send({ token: secondToken, client: "web" })
            .expect(StatusCodes.OK);

        const { data: tokenRows } =
            await SupabaseDB.MAGIC_LINK_TOKENS.select(
                "subjectEmail"
            ).throwOnError();
        expect(tokenRows).toHaveLength(2);
        for (const row of tokenRows) {
            expect(row.subjectEmail).toBe("casing@example.com");
        }

        const { data: accounts } = await SupabaseDB.AUTH_INFO.select("email")
            .ilike("email", "casing@example.com")
            .throwOnError();
        expect(accounts).toHaveLength(1);
        expect(accounts[0].email).toBe("casing@example.com");
    });
});

describe("POST /auth/magic-links/verify-code", () => {
    async function issueFor(
        email: string,
        client: "web" | "mobile" = "web",
        intent: "registration" | "login" | "resume-book" = "login"
    ) {
        await post("/auth/magic-links")
            .send({ email, client, intent })
            .expect(StatusCodes.ACCEPTED);
        return { token: lastMagicLinkToken(), code: lastMagicLinkCode() };
    }

    function verifiedPayload(token: string): JwtPayload {
        return jsonwebtoken.verify(
            token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
    }

    it("stores only a keyed digest of the code", async () => {
        const { code } = await issueFor("Person@Example.com ");

        const { data: row } = await SupabaseDB.MAGIC_LINK_TOKENS.select()
            .single()
            .throwOnError();
        expect(row.codeDigest).toBe(
            magicLinkCodeDigestForTest("person@example.com", code)
        );
        expect(row.attemptCount).toBe(0);
        expect(JSON.stringify(row)).not.toContain(code);
    });

    it("mints the same setup session as the link for web login", async () => {
        const { code } = await issueFor("new@example.com");
        const response = await post("/auth/magic-links/verify-code")
            .send({ email: "New@Example.com ", code, client: "web" })
            .expect(StatusCodes.OK);

        expect(verifiedPayload(response.body.token)).toMatchObject({
            email: "new@example.com",
            displayName: null,
            roles: [],
            tokenType: "setup",
        });

        const { data: accounts } = await SupabaseDB.AUTH_INFO.select()
            .eq("email", "new@example.com")
            .throwOnError();
        expect(accounts).toHaveLength(1);
    });

    it("creates an account from the registration flow like the link does", async () => {
        const { code } = await issueFor(
            "reg@example.com",
            "web",
            "registration"
        );
        const response = await post("/auth/magic-links/verify-code")
            .send({ email: "reg@example.com", code, client: "web" })
            .expect(StatusCodes.OK);
        expect(verifiedPayload(response.body.token).tokenType).toBe("setup");
    });

    it("is single use and also consumes the link", async () => {
        const { token, code } = await issueFor("once@example.com");
        await post("/auth/magic-links/verify-code")
            .send({ email: "once@example.com", code, client: "web" })
            .expect(StatusCodes.OK);

        await post("/auth/magic-links/verify-code")
            .send({ email: "once@example.com", code, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);
        await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("locks the code after the attempt cap but keeps the link usable", async () => {
        const { token, code } = await issueFor("guess@example.com");
        for (let i = 0; i < Config.MAGIC_LINK_CODE_MAX_ATTEMPTS; i++) {
            await post("/auth/magic-links/verify-code")
                .send({
                    email: "guess@example.com",
                    code: wrongCodeFor(code),
                    client: "web",
                })
                .expect(StatusCodes.UNAUTHORIZED);
        }

        const { data: row } = await SupabaseDB.MAGIC_LINK_TOKENS.select()
            .single()
            .throwOnError();
        expect(row.attemptCount).toBe(Config.MAGIC_LINK_CODE_MAX_ATTEMPTS);

        // The cap is reached: even the right code is rejected now.
        await post("/auth/magic-links/verify-code")
            .send({ email: "guess@example.com", code, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);

        // The link is untouched by code guessing and still signs in.
        await post("/auth/magic-links/verify")
            .send({ token, client: "web" })
            .expect(StatusCodes.OK);
    });

    it("supersedes the old code and link when a new one is requested", async () => {
        const first = await issueFor("again@example.com");
        const second = await issueFor("again@example.com");

        await post("/auth/magic-links/verify-code")
            .send({
                email: "again@example.com",
                code: first.code,
                client: "web",
            })
            .expect(
                first.code === second.code
                    ? StatusCodes.OK
                    : StatusCodes.UNAUTHORIZED
            );
        if (first.code !== second.code) {
            await post("/auth/magic-links/verify")
                .send({ token: first.token, client: "web" })
                .expect(StatusCodes.UNAUTHORIZED);
            await post("/auth/magic-links/verify-code")
                .send({
                    email: "again@example.com",
                    code: second.code,
                    client: "web",
                })
                .expect(StatusCodes.OK);
        }
    });

    it("rejects a code presented by the wrong client", async () => {
        await SupabaseDB.STAFF.insert({
            email: "wrongclient@example.com",
            name: "Wrong Client",
            team: "DEV",
            attendances: {},
        });
        const { code } = await issueFor("wrongclient@example.com", "mobile");

        await post("/auth/magic-links/verify-code")
            .send({ email: "wrongclient@example.com", code, client: "web" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("signs rostered staff into mobile with an access token", async () => {
        await SupabaseDB.STAFF.insert({
            email: "codestaff@example.com",
            name: "Code Staff",
            team: "DEV",
            attendances: {},
        });
        const { code } = await issueFor("codestaff@example.com", "mobile");

        const response = await post("/auth/magic-links/verify-code")
            .send({ email: "codestaff@example.com", code, client: "mobile" })
            .expect(StatusCodes.OK);
        const payload = verifiedPayload(response.body.token);
        expect(payload.tokenType).toBe("access");
        expect(payload.roles).toContain(Role.Enum.STAFF);
        expect(payload.exp! - payload.iat!).toBe(10 * 24 * 60 * 60);
    });

    it("signs rostered sponsors into the resume book with CORPORATE", async () => {
        await SupabaseDB.CORPORATE.insert({
            name: "Acme Corp",
            email: "codesponsor@acme.com",
        });
        const { code } = await issueFor(
            "Codesponsor@Acme.com",
            "web",
            "resume-book"
        );

        const response = await post("/auth/magic-links/verify-code")
            .send({ email: "codesponsor@acme.com", code, client: "web" })
            .expect(StatusCodes.OK);
        const payload = verifiedPayload(response.body.token);
        expect(payload.tokenType).toBe("access");
        expect(payload.roles).toEqual([Role.Enum.CORPORATE]);
    });

    it("grants ADMIN from the whitelist through the code path", async () => {
        const adminEmail = [...Config.AUTH_ADMIN_WHITELIST][0];
        const { code } = await issueFor(adminEmail);

        const response = await post("/auth/magic-links/verify-code")
            .send({ email: adminEmail, code, client: "web" })
            .expect(StatusCodes.OK);
        expect(verifiedPayload(response.body.token).roles).toContain(
            Role.Enum.ADMIN
        );
    });

    it("rejects malformed codes without touching the attempt count", async () => {
        const { code } = await issueFor("format@example.com");

        await post("/auth/magic-links/verify-code")
            .send({ email: "format@example.com", code: "12345", client: "web" })
            .expect(StatusCodes.BAD_REQUEST);
        await post("/auth/magic-links/verify-code")
            .send({
                email: "format@example.com",
                code: "abcdef",
                client: "web",
            })
            .expect(StatusCodes.BAD_REQUEST);

        const { data: row } = await SupabaseDB.MAGIC_LINK_TOKENS.select()
            .single()
            .throwOnError();
        expect(row.attemptCount).toBe(0);

        await post("/auth/magic-links/verify-code")
            .send({ email: "format@example.com", code, client: "web" })
            .expect(StatusCodes.OK);
    });
});
