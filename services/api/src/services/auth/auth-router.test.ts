import {
    delAsAdmin,
    delAsStaff,
    get,
    getAsAdmin,
    getAsStaff,
    getAsUser,
    getAsCorporate,
    postAsAdmin,
    postAsStaff,
    putAsAdmin,
    TESTER,
    delAsSuperAdmin,
    putAsSuperAdmin,
} from "../../../testing/testingTools";
import { AuthInfo, AuthRole } from "./auth-schema";
import { Role } from "./auth-models";
import { StatusCodes } from "http-status-codes";
import { Corporate } from "./corporate-schema";
import { SupabaseDB } from "../../database";

const TESTER_USER = {
    authId: "1234-5678",
    userId: TESTER.userId,
    displayName: TESTER.displayName,
    email: TESTER.email,
} satisfies AuthInfo;

const TESTER_USER_ROLES = [
    {
        userId: TESTER.userId,
        role: Role.Enum.USER,
    },
] satisfies AuthRole[];

const OTHER_USER = {
    authId: "abcd-efgh",
    userId: "other-user-123",
    displayName: "Other User",
    email: "other@user.com",
} satisfies AuthInfo;

const OTHER_USER_ROLES = [
    {
        userId: OTHER_USER.userId,
        role: Role.Enum.USER,
    },
    {
        userId: OTHER_USER.userId,
        role: Role.Enum.STAFF,
    },
] satisfies AuthRole[];

const CORPORATE_USER = {
    email: "sponsor@big.corp",
    name: "Big Corporate Guy",
} satisfies Corporate;
const CORPORATE_OTHER_USER = {
    email: "sponsor@other-big.corp",
    name: "Ronit Smith",
} satisfies Corporate;

beforeEach(async () => {
    await SupabaseDB.AUTH_INFO.insert([TESTER_USER, OTHER_USER]);
    await SupabaseDB.AUTH_ROLES.insert(TESTER_USER_ROLES);
    await SupabaseDB.AUTH_ROLES.insert(OTHER_USER_ROLES);
    await SupabaseDB.CORPORATE.insert([CORPORATE_USER, CORPORATE_OTHER_USER]);
});

describe("DELETE /auth/", () => {
    it("should remove the requested role", async () => {
        const res = await delAsSuperAdmin("/auth/")
            .send({
                userId: OTHER_USER.userId,
                role: Role.Enum.STAFF,
            })
            .expect(StatusCodes.OK);

        expect(res.body).toMatchObject({
            userId: OTHER_USER.userId,
            role: Role.Enum.STAFF,
        });
        const { data: roleRows } = await SupabaseDB.AUTH_ROLES.select()
            .eq("userId", OTHER_USER.userId)
            .throwOnError();
        expect(roleRows.map((row: { role: Role }) => row.role)).toMatchObject([
            Role.Enum.USER,
        ]);
    });

    it("should give the not found error when the user doesn't exist", async () => {
        const res = await delAsSuperAdmin("/auth/")
            .send({
                userId: "nonexistent",
                role: Role.Enum.STAFF,
            })
            .expect(StatusCodes.NOT_FOUND);

        expect(res.body).toHaveProperty("error", "UserNotFound");
    });

    it("should require super admin permissions", async () => {
        const res = await delAsAdmin("/auth/")
            .send({
                userId: OTHER_USER.userId,
                role: Role.Enum.STAFF,
            })
            .expect(StatusCodes.FORBIDDEN);

        expect(res.body).toHaveProperty("error", "Forbidden");
    });
});

describe("PUT /auth/", () => {
    it("should add the requested role", async () => {
        const res = await putAsSuperAdmin("/auth/")
            .send({
                userId: OTHER_USER.userId,
                role: Role.Enum.ADMIN,
            })
            .expect(StatusCodes.OK);

        expect(res.body).toMatchObject({
            userId: OTHER_USER.userId,
            role: Role.Enum.ADMIN,
        });
        const { data: roleRows } = await SupabaseDB.AUTH_ROLES.select()
            .eq("userId", OTHER_USER.userId)
            .throwOnError();
        expect(roleRows.map((row: { role: Role }) => row.role)).toMatchObject([
            ...OTHER_USER_ROLES.map((row) => row.role),
            Role.Enum.ADMIN,
        ]);
    });

    it("should give the not found error if the user doesn't exist", async () => {
        const res = await putAsSuperAdmin("/auth/")
            .send({
                userId: "nonexistent",
                role: Role.Enum.ADMIN,
            })
            .expect(StatusCodes.NOT_FOUND);

        expect(res.body).toHaveProperty("error", "UserNotFound");
    });

    it("should require super admin permissions", async () => {
        const res = await putAsAdmin("/auth/")
            .send({
                userId: OTHER_USER.userId,
                role: Role.Enum.STAFF,
            })
            .expect(StatusCodes.FORBIDDEN);

        expect(res.body).toHaveProperty("error", "Forbidden");
    });
});

describe("GET /auth/corporate", () => {
    it("should get all corporate users", async () => {
        const res = await getAsAdmin("/auth/corporate").expect(StatusCodes.OK);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining(CORPORATE_USER),
                expect.objectContaining(CORPORATE_OTHER_USER),
            ])
        );
    });

    it("should require admin permissions", async () => {
        const res = await getAsStaff("/auth/corporate").expect(
            StatusCodes.FORBIDDEN
        );
        expect(res.body).toHaveProperty("error", "Forbidden");
    });
});

describe("POST /auth/corporate", () => {
    const NEW_CORPORATE = {
        email: "new@corp.corp",
        name: "The New Guy",
    } satisfies Corporate;

    it("should create a corporate user", async () => {
        const res = await postAsAdmin("/auth/corporate")
            .send(NEW_CORPORATE)
            .expect(StatusCodes.CREATED);
        expect(res.body).toMatchObject(NEW_CORPORATE);
        const { data } = await SupabaseDB.CORPORATE.select()
            .eq("email", NEW_CORPORATE.email)
            .single()
            .throwOnError();
        expect(data).toMatchObject(NEW_CORPORATE);
    });

    it("should not overwrite existing", async () => {
        const res = await postAsAdmin("/auth/corporate")
            .send({
                ...NEW_CORPORATE,
                email: CORPORATE_USER.email,
            })
            .expect(StatusCodes.BAD_REQUEST);
        expect(res.body).toHaveProperty("error", "AlreadyExists");

        const { data } = await SupabaseDB.CORPORATE.select()
            .eq("email", CORPORATE_USER.email)
            .single()
            .throwOnError();
        expect(data).toMatchObject(CORPORATE_USER);
    });

    it("should require admin permissions", async () => {
        const res = await postAsStaff("/auth/corporate")
            .send(NEW_CORPORATE)
            .expect(StatusCodes.FORBIDDEN);
        expect(res.body).toHaveProperty("error", "Forbidden");
        const { data } = await SupabaseDB.CORPORATE.select()
            .eq("email", NEW_CORPORATE.email)
            .throwOnError();
        expect(data.length).toBe(0);
    });
});

describe("DELETE /auth/corporate", () => {
    it("should delete a corporate user", async () => {
        await delAsAdmin("/auth/corporate")
            .send({ email: CORPORATE_USER.email })
            .expect(StatusCodes.NO_CONTENT);
        const { data } = await SupabaseDB.CORPORATE.select()
            .eq("email", CORPORATE_USER.email)
            .throwOnError();
        expect(data.length).toBe(0);
    });

    it("fails to delete a nonexistent user", async () => {
        const res = await delAsAdmin("/auth/corporate")
            .send({ email: "nonexistent@fake.com" })
            .expect(StatusCodes.BAD_REQUEST);
        expect(res.body).toHaveProperty("error", "NotFound");
    });

    it("should require admin permissions", async () => {
        const res = await delAsStaff("/auth/corporate")
            .send({ email: CORPORATE_USER.email })
            .expect(StatusCodes.FORBIDDEN);
        expect(res.body).toHaveProperty("error", "Forbidden");
        const { data } = await SupabaseDB.CORPORATE.select()
            .eq("email", CORPORATE_USER.email)
            .single()
            .throwOnError();
        expect(data).toMatchObject(CORPORATE_USER);
    });
});

describe("GET /auth/info", () => {
    it("should get user info", async () => {
        const res = await getAsUser("/auth/info").expect(StatusCodes.OK);
        expect(res.body).toEqual({
            ...TESTER_USER,
            roles: TESTER_USER_ROLES.map((row) => row.role),
        });
    });
});

describe("GET /auth/team", () => {
    it("should get team members (users with STAFF or ADMIN roles)", async () => {
        const res = await getAsAdmin("/auth/team").expect(StatusCodes.OK);

        // Should return users with STAFF or ADMIN roles
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    userId: OTHER_USER.userId,
                    email: OTHER_USER.email,
                    displayName: OTHER_USER.displayName,
                    roles: expect.arrayContaining([Role.Enum.STAFF]),
                }),
            ])
        );

        // Should not include users with only USER role
        const userOnlyEmails = res.body.map((user: AuthInfo) => user.email);
        expect(userOnlyEmails).not.toContain(TESTER_USER.email);
    });

    it("should require admin permissions", async () => {
        const res = await getAsStaff("/auth/team").expect(
            StatusCodes.FORBIDDEN
        );
        expect(res.body).toHaveProperty("error", "Forbidden");
    });

    it("should return empty array when no team members exist", async () => {
        // Remove all roles to test empty case
        await SupabaseDB.AUTH_ROLES.delete();

        const res = await getAsAdmin("/auth/team").expect(StatusCodes.OK);
        expect(res.body).toEqual([]);
    });

    it("should handle users with multiple roles correctly", async () => {
        // Add ADMIN role to OTHER_USER to test multiple roles
        await SupabaseDB.AUTH_ROLES.insert({
            userId: OTHER_USER.userId,
            role: Role.Enum.ADMIN,
        });

        const res = await getAsAdmin("/auth/team").expect(StatusCodes.OK);

        const otherUser = res.body.find(
            (user: AuthInfo) => user.userId === OTHER_USER.userId
        );
        expect(otherUser).toBeDefined();
        expect(otherUser.roles).toEqual(
            expect.arrayContaining([Role.Enum.STAFF, Role.Enum.ADMIN])
        );
    });
});

describe("GET /auth/:ROLE", () => {
    it("should get users with user role", async () => {
        const res = await getAsStaff("/auth/USER").expect(StatusCodes.OK);
        expect(res.body).toEqual(
            expect.arrayContaining([TESTER_USER.userId, OTHER_USER.userId])
        );
    });

    it("should get users with staff role", async () => {
        const res = await getAsStaff("/auth/USER").expect(StatusCodes.OK);
        expect(res.body).toEqual(expect.arrayContaining([OTHER_USER.userId]));
    });

    it("should require staff permissions", async () => {
        const res = await getAsUser("/auth/STAFF").expect(
            StatusCodes.FORBIDDEN
        );
        expect(res.body).toHaveProperty("error", "Forbidden");
    });
});

describe("GET /auth/staff", () => {
    it("should get all staff userIds for CORPORATE role", async () => {
        const res = await getAsCorporate("/auth/staff").expect(StatusCodes.OK);
        expect(res.body).toEqual([OTHER_USER.userId]);
    });

    it("should get all staff userIds for STAFF role", async () => {
        const res = await getAsStaff("/auth/staff").expect(StatusCodes.OK);
        expect(res.body).toEqual([OTHER_USER.userId]);
    });

    it("should return empty array when no staff users exist", async () => {
        await SupabaseDB.AUTH_ROLES.delete()
            .eq("role", Role.Enum.STAFF)
            .throwOnError();

        const res = await getAsCorporate("/auth/staff").expect(StatusCodes.OK);
        expect(res.body).toEqual([]);
    });

    it("should return multiple staff userIds when multiple staff exist", async () => {
        const anotherStaffUser = {
            authId: "ijkl-mnop",
            userId: "another-staff-123",
            displayName: "Another Staff",
            email: "another@staff.com",
        } satisfies AuthInfo;

        await SupabaseDB.AUTH_INFO.insert(anotherStaffUser);
        await SupabaseDB.AUTH_ROLES.insert({
            userId: anotherStaffUser.userId,
            role: Role.Enum.STAFF,
        });

        const res = await getAsCorporate("/auth/staff").expect(StatusCodes.OK);
        expect(res.body).toEqual(
            expect.arrayContaining([OTHER_USER.userId, anotherStaffUser.userId])
        );
        expect(res.body).toHaveLength(2);
    });

    it("should require CORPORATE role", async () => {
        const res = await getAsUser("/auth/staff").expect(
            StatusCodes.FORBIDDEN
        );
        expect(res.body).toHaveProperty("error", "Forbidden");
    });

    it("should require user to be authenticated", async () => {
        const res = await get("/auth/staff").expect(StatusCodes.UNAUTHORIZED);
        expect(res.body).toHaveProperty("error", "NoJWT");
    });
});
