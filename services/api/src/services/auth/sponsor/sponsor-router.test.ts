import * as sesUtils from "../../ses/ses-utils";
import * as sponsorUtils from "./sponsor-utils";
import { post } from "../../../../testing/testingTools";
import { StatusCodes } from "http-status-codes";
import { Corporate } from "../corporate-schema";
import { compareSync } from "bcrypt";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import Config from "../../../config";
import { Role } from "../auth-models";
import { SupabaseDB } from "../../../database";

const CORPORATE_USER = {
    email: "sponsor@big-man.corp",
    name: "Big Corporate Man",
} satisfies Corporate;
const VALID_UNHASHED_RANDOM = "AAABBB123456";
const VALID_TOKEN = Buffer.from(
    `${CORPORATE_USER.email}|${VALID_UNHASHED_RANDOM}`
).toString("base64url");

beforeEach(async () => {
    await SupabaseDB.CORPORATE.insert(CORPORATE_USER);
    await SupabaseDB.AUTH_TOKENS.insert({
        hashedToken: sponsorUtils.hashMagicLinkToken(VALID_UNHASHED_RANDOM),
        expTime: new Date(Date.now() + 60 * 1000).toISOString(),
        email: CORPORATE_USER.email,
    });
});

describe("POST /auth/sponsor/login", () => {
    const mockSendTemplateEmail = jest
        .spyOn(sesUtils, "sendTemplateEmail")
        .mockImplementation((_emailId, _templateId, _templateData) =>
            Promise.resolve()
        );
    const mockCreateMagicLinkToken = jest.spyOn(
        sponsorUtils,
        "createMagicLinkToken"
    );

    beforeEach(async () => {
        mockSendHTMLEmail.mockClear();
        mockCreateMagicLinkToken.mockClear();
    });

    it("should send a login code", async () => {
        await post("/auth/sponsor/login")
            .send({
                email: CORPORATE_USER.email,
            })
            .expect(StatusCodes.CREATED);
        expect(mockCreateMagicLinkToken).toHaveBeenCalled();
        const results = mockCreateMagicLinkToken.mock.results.at(-1)?.value as {
            magicLinkToken: string;
            unhashedRandom: string;
        };
        expect(mockSendHTMLEmail).toHaveBeenCalledWith(
            CORPORATE_USER.email,
            expect.stringContaining("Email Verification"),
            expect.stringContaining(results.magicLinkToken)
        );

        const { data } = await SupabaseDB.AUTH_TOKENS.select()
            .eq("email", CORPORATE_USER.email)
            .single()
            .throwOnError();
        expect(data).toHaveProperty("hashedToken");
        expect(compareSync(results.unhashedRandom, `${data.hashedToken}`)).toBe(
            true
        );
    });

    it("fails to send a code for invalid emails", async () => {
        const email = "badGuy@evil.com";
        await post("/auth/sponsor/login")
            .send({
                email,
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(mockCreateMagicLinkToken).not.toHaveBeenCalled();
        expect(mockSendHTMLEmail).not.toHaveBeenCalled();

        const { data } = await SupabaseDB.AUTH_TOKENS.select()
            .eq("email", email)
            .throwOnError();
        expect(data.length).toBe(0);
    });
});

describe("POST /auth/sponsor/verify", () => {
    it("should login for valid codes", async () => {
        const start = Math.floor(Date.now() / 1000);
        const response = await post("/auth/sponsor/verify")
            .send({
                token: VALID_TOKEN,
            })
            .expect(StatusCodes.OK);

        expect(response.body).toHaveProperty("token");
        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload).toMatchObject({
            userId: CORPORATE_USER.email,
            displayName: CORPORATE_USER.name,
            email: CORPORATE_USER.email,
            roles: [Role.Enum.CORPORATE],
        });
        expect(payload.iat).toBeGreaterThanOrEqual(start);
    });

    it("fails for valid code after invalid code used", async () => {
        const badResponse = await post("/auth/sponsor/verify")
            .send({
                token: "BAD_TOKEN",
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(badResponse.body).toHaveProperty("error", "InvalidCode");

        const validResponse = await post("/auth/sponsor/verify")
            .send({
                token: VALID_TOKEN,
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(validResponse.body).toHaveProperty("error", "InvalidCode");
    });

    it("fails for expired codes", async () => {
        await SupabaseDB.AUTH_TOKENS.update({
            email: CORPORATE_USER.email,
            expTime: new Date(Date.now() - 30 * 1000).toISOString(),
        })
            .eq("email", CORPORATE_USER.email)
            .throwOnError();
        const response = await post("/auth/sponsor/verify")
            .send({
                token: VALID_TOKEN,
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "ExpiredCode");
    });

    it("fails for invalid codes", async () => {
        const response = await post("/auth/sponsor/verify")
            .send({
                token: "BAD_TOKEN",
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });

    it("fails for invalid emails", async () => {
        const response = await post("/auth/sponsor/verify")
            .send({
                token: VALID_TOKEN,
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });
});
