import { SendEmailCommandOutput } from "@aws-sdk/client-ses";
import * as sesUtils from "../../ses/ses-utils";
import * as sponsorUtils from "./sponsor-utils";
import { post } from "../../../../testing/testingTools";
import { StatusCodes } from "http-status-codes";
import { compareSync } from "bcrypt";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import Config from "../../../config";
import { Role } from "../auth-models";
import { SupabaseDB } from "../../../database";

const CORPORATE_USER = {
    email: "sponsor@big-man.corp",
    displayName: "Big Corporate Man",
};
const CORPORATE_AUTH_USER = {
    userId: CORPORATE_USER.email,
    email: CORPORATE_USER.email,
    displayName: CORPORATE_USER.displayName,
    role: Role.Enum.CORPORATE,
};
const VALID_CODE = "AAABBB";

beforeEach(async () => {
    await SupabaseDB.AUTH_INFO.insert(CORPORATE_AUTH_USER as never);
    await SupabaseDB.AUTH_TOKENS.insert({
        userId: CORPORATE_USER.email,
        tokenHash: sponsorUtils.encryptRandomHexCode(VALID_CODE),
        expiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
        path: "sponsor-login",
        usedAt: null,
    } as never);
});

describe("POST /auth/sponsor/login", () => {
    const mockSendHTMLEmail = jest
        .spyOn(sesUtils, "sendHTMLEmail")
        .mockImplementation((_emailId, _subject, _emailHTML) =>
            Promise.resolve({} as unknown as SendEmailCommandOutput)
        );
    const mockCreateRandomHexCode = jest.spyOn(
        sponsorUtils,
        "createRandomHexCode"
    );

    beforeEach(async () => {
        mockSendHTMLEmail.mockClear();
        mockCreateRandomHexCode.mockClear();
    });

    it("should send a login code", async () => {
        await post("/auth/sponsor/login")
            .send({
                email: CORPORATE_USER.email,
            })
            .expect(StatusCodes.CREATED);
        expect(mockCreateRandomHexCode).toHaveBeenCalled();
        const randomHexCode = `${mockCreateRandomHexCode.mock.results.at(-1)?.value}`;
        expect(mockSendHTMLEmail).toHaveBeenCalledWith(
            CORPORATE_USER.email,
            expect.stringContaining("Email Verification"),
            expect.stringContaining(randomHexCode)
        );

        const { data } = await SupabaseDB.AUTH_TOKENS.select()
            .eq("userId", CORPORATE_USER.email)
            .eq("path", "sponsor-login")
            .single()
            .throwOnError();
        expect(data).toHaveProperty("tokenHash");
        expect(
            compareSync(randomHexCode, `${data.tokenHash}`)
        ).toBe(true);
    });

    it("fails to send a code for invalid emails", async () => {
        const email = "badGuy@evil.com";
        await post("/auth/sponsor/login")
            .send({
                email,
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(mockCreateRandomHexCode).not.toHaveBeenCalled();
        expect(mockSendHTMLEmail).not.toHaveBeenCalled();

        const { data } = await SupabaseDB.AUTH_TOKENS.select()
            .eq("userId", email)
            .eq("path", "sponsor-login")
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
                randomHexCode: VALID_CODE,
            })
            .expect(StatusCodes.OK);

        expect(response.body).toHaveProperty("token");
        const payload = jsonwebtoken.verify(
            response.body.token,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload).toMatchObject({
            userId: CORPORATE_USER.email,
            displayName: CORPORATE_USER.displayName,
            email: CORPORATE_USER.email,
            roles: [Role.Enum.CORPORATE],
        });
        expect(payload.iat).toBeGreaterThanOrEqual(start);
    });

    it("fails for valid code after invalid code used", async () => {
        const badResponse = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                randomHexCode: "BADCOD",
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(badResponse.body).toHaveProperty("error", "InvalidCode");

        const validResponse = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                randomHexCode: VALID_CODE,
            })
            .expect(StatusCodes.UNAUTHORIZED);
        expect(validResponse.body).toHaveProperty("error", "InvalidCode");
    });

    it("fails for expired codes", async () => {
        await SupabaseDB.AUTH_TOKENS.update({
            expiresAt: new Date(Date.now() - 30 * 1000).toISOString(),
        })
            .eq("userId", CORPORATE_USER.email)
            .eq("path", "sponsor-login")
            .throwOnError();
        const response = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                randomHexCode: VALID_CODE,
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "ExpiredCode");
    });

    it("fails for invalid codes", async () => {
        const response = await post("/auth/sponsor/verify")
            .send({
                email: CORPORATE_USER.email,
                randomHexCode: "BADCOD",
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });

    it("fails for invalid emails", async () => {
        const response = await post("/auth/sponsor/verify")
            .send({
                email: "invalid@nonexistent.com",
                randomHexCode: VALID_CODE,
            })
            .expect(StatusCodes.UNAUTHORIZED);

        expect(response.body).toHaveProperty("error", "InvalidCode");
    });
});
