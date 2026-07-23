import { StatusCodes } from "http-status-codes";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { post } from "../../../testing/testingTools";
import { Config } from "../../config";
import { SupabaseDB } from "../../database";
import * as sesUtils from "../ses/ses-utils";
import { Role } from "./auth-models";
import { magicLinkTokenDigestForTest } from "./magic-link-service";

const sendHtmlEmail = jest.spyOn(sesUtils, "sendHTMLEmail").mockResolvedValue();

function lastMagicLinkToken(): string {
    const html = sendHtmlEmail.mock.calls.at(-1)?.[2];
    const match = html?.match(/[?&]token=([^"]+)/);
    if (!match?.[1]) {
        throw new Error("Magic-link token was not found in the email");
    }
    return decodeURIComponent(match[1]);
}

beforeEach(() => {
    sendHtmlEmail.mockClear();
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
        expect(sendHtmlEmail).toHaveBeenCalledTimes(1);

        await post("/auth/magic-links")
            .send({
                email: "unknown@example.com",
                client: "mobile",
                intent: "login",
            })
            .expect(StatusCodes.ACCEPTED);
        expect(sendHtmlEmail).toHaveBeenCalledTimes(1);
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
        expect(sendHtmlEmail).not.toHaveBeenCalled();

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

    it("requires a manually assigned CORPORATE role at verification", async () => {
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
});
