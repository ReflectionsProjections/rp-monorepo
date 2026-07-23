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
const SPONSOR_ACCOUNT = {
    authId: null,
    userId: "sponsor-user-id",
    displayName: CORPORATE_USER.name,
    email: CORPORATE_USER.email,
};
const VALID_CODE = "AAABBB";

beforeEach(async () => {
    await SupabaseDB.CORPORATE.insert(CORPORATE_USER);
    await SupabaseDB.AUTH_INFO.insert(SPONSOR_ACCOUNT);
    await SupabaseDB.AUTH_ROLES.insert({
        userId: SPONSOR_ACCOUNT.userId,
        role: Role.Enum.CORPORATE,
    });
    await SupabaseDB.AUTH_CODES.insert({
        hashedVerificationCode: sponsorUtils.encryptSixDigitCode(VALID_CODE),
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
    const mockCreateSixDigitCode = jest.spyOn(
        sponsorUtils,
        "createSixDigitCode"
    );

    beforeEach(async () => {
        mockSendTemplateEmail.mockClear();
        mockCreateSixDigitCode.mockClear();
    });

    it("should send a login code", async () => {
        await post("/auth/sponsor/login")
            .send({
                email: CORPORATE_USER.email,
            })
            .expect(StatusCodes.ACCEPTED);
        expect(mockCreateSixDigitCode).toHaveBeenCalled();
        const sixDigitCode = `${mockCreateSixDigitCode.mock.results.at(-1)?.value}`;
        expect(mockSendTemplateEmail).toHaveBeenCalledWith(
            CORPORATE_USER.email,
            expect.anything(),
            expect.objectContaining({
                subject: expect.stringContaining("Email Verification"),
            })
        );

        const { data } = await SupabaseDB.AUTH_CODES.select()
            .eq("email", CORPORATE_USER.email)
            .single()
            .throwOnError();
        expect(data).toHaveProperty("hashedVerificationCode");
        expect(
            compareSync(sixDigitCode, `${data.hashedVerificationCode}`)
        ).toBe(true);
    });

    it("returns the generic response without sending for invalid emails", async () => {
        const email = "badGuy@evil.com";
        await post("/auth/sponsor/login")
            .send({
                email,
            })
            .expect(StatusCodes.ACCEPTED);
        expect(mockCreateSixDigitCode).not.toHaveBeenCalled();
        expect(mockSendTemplateEmail).not.toHaveBeenCalled();

        const { data } = await SupabaseDB.AUTH_CODES.select()
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
                email: CORPORATE_USER.email,
                sixDigitCode: VALID_CODE,
            })
            .expect(StatusCodes.OK);

        expect(response.body).toHaveProperty("token");
        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload).toMatchObject({
            userId: SPONSOR_ACCOUNT.userId,
            displayName: CORPORATE_USER.name,
            email: CORPORATE_USER.email,
            roles: [Role.Enum.CORPORATE],
        });
        expect(payload.iat).toBeGreaterThanOrEqual(start);
    });

    it("keeps the valid code after an invalid attempt", async () => {
        const badResponse = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                sixDigitCode: "BADCOD",
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(badResponse.body).toHaveProperty("error", "InvalidCode");

        const validResponse = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                sixDigitCode: VALID_CODE,
            })
            .expect(StatusCodes.OK);
        expect(validResponse.body).toHaveProperty("token");
    });

    it("fails for expired codes", async () => {
        await SupabaseDB.AUTH_CODES.update({
            email: CORPORATE_USER.email,
            expTime: new Date(Date.now() - 30 * 1000).toISOString(),
        })
            .eq("email", CORPORATE_USER.email)
            .throwOnError();
        const response = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                sixDigitCode: VALID_CODE,
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });

    it("fails for invalid codes", async () => {
        const response = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                sixDigitCode: "BADCOD",
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });

    it("fails for invalid emails", async () => {
        const response = await post("/auth/sponsor/verify")
            .send({
                email: "invalid@nonexistent.com",
                sixDigitCode: VALID_CODE,
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });
});
