import { StatusCodes } from "http-status-codes";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { post } from "../../../testing/testingTools";
import { Config } from "../../config";
import { SupabaseDB } from "../../database";
import * as sesUtils from "../ses/ses-utils";
import { Role } from "./auth-models";
import { magicLinkTokenDigestForTest } from "./magic-link-service";

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
