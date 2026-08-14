import { generateJWT, getJwtPayloadFromDatabase } from "./auth-utils";
import { AuthInfo, AuthRole } from "./auth-schema";
import { Role } from "./auth-models";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import Config from "../../config";
import { SupabaseDB } from "../../database";

const AUTH_USER = {
    displayName: "The Tester",
    email: "test@test.com",
    userId: "abcd-efgh",
    authId: "12345678",
} satisfies AuthInfo;
const AUTH_USER_ROLES = [
    {
        userId: AUTH_USER.userId,
        role: Role.Enum.USER,
    },
] satisfies AuthRole[];

beforeEach(async () => {
    await SupabaseDB.AUTH_INFO.insert([AUTH_USER]).throwOnError();
    await SupabaseDB.AUTH_ROLES.insert(AUTH_USER_ROLES);
});

describe("getJwtPayloadFromDatabase", () => {
    it("should get a payload", async () => {
        const payload = await getJwtPayloadFromDatabase(AUTH_USER.userId);
        expect(payload).toEqual({
            displayName: AUTH_USER.displayName,
            userId: AUTH_USER.userId,
            email: AUTH_USER.email,
            roles: AUTH_USER_ROLES.map((entry) => entry.role),
            tokenType: "access",
        });
    });

    it("fails to get a nonexistent payload", async () => {
        expect(getJwtPayloadFromDatabase("nonexistent")).rejects.toThrow(
            "NoUserFound"
        );
    });
});

describe("generateJWT", () => {
    it("should generate a valid jwt", async () => {
        const start = Math.floor(Date.now() / 1000);
        const jwt = await generateJWT(AUTH_USER.userId);
        const payload = jsonwebtoken.verify(
            jwt,
            Config.JWT_SIGNING_SECRET
        ) as JwtPayload;
        expect(payload).toMatchObject({
            userId: AUTH_USER.userId,
            email: AUTH_USER.email,
            displayName: AUTH_USER.displayName,
        });
        expect(payload.iat).toBeGreaterThanOrEqual(start);
        // ms is what jsonwebtoken uses to parse expiration times, so we use it here as well
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ms = require("ms");
        const time = Math.floor(
            (ms(Config.JWT_EXPIRATION_TIME) as number) / 1000
        );
        expect(payload.exp).toBeGreaterThanOrEqual(start + time);
        expect(payload.exp).toBeLessThan(start + time + 30);
    });
});
