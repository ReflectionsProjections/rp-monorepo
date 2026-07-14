import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import Config from "../../config";
import RoleChecker from "../../middleware/role-checker";
import { Role } from "../auth/auth-models";
import {
    AuthInfo,
    AuthMagicLinkLoginValidator,
    AuthMagicLinkVerifyValidator,
    AuthRoleChangeRequest,
} from "./auth-schema";
import authSponsorRouter from "./sponsor/sponsor-router";
import { CorporateDeleteRequest, CorporateValidator } from "./corporate-schema";
import { generateJWT } from "./auth-utils";
import { SupabaseDB } from "../../database";
import { sendHTMLEmail } from "../ses/ses-utils";
import mustache from "mustache";
import templates from "../../templates/templates";
import {
    createMagicLinkToken,
    hashMagicLinkToken,
} from "./sponsor/sponsor-utils";
import * as bcrypt from "bcrypt";

const authRouter = Router();

authRouter.use("/sponsor", authSponsorRouter);

authRouter.post("/login", async (req, res) => {
    const { email } = AuthMagicLinkLoginValidator.parse(req.body);

    const { data: existing } = await SupabaseDB.AUTH_INFO.select("userId")
        .eq("email", email)
        .maybeSingle()
        .throwOnError();

    if (!existing) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    const { magicLinkToken, unhashedRandom } = createMagicLinkToken(email);
    const expTime = new Date(
        Date.now() + Config.VERIFY_EXP_TIME_MS
    ).toISOString();
    const hashedToken = hashMagicLinkToken(unhashedRandom);

    await SupabaseDB.AUTH_TOKENS.upsert(
        {
            email,
            hashedToken,
            expTime,
        },
        {
            onConflict: "email",
        }
    ).throwOnError();

    const magicLink = `${Config.WEB_BASE}/auth?token=${magicLinkToken}`;
    const emailBody = mustache.render(templates.AUTH_VERIFICATION, {
        link: magicLink,
    });

    await sendHTMLEmail(email, "R|P Resume Book Email Verification", emailBody);
    return res.sendStatus(StatusCodes.CREATED);
});

authRouter.post("/verify", async (req, res) => {
    const { token: magicLinkToken } = AuthMagicLinkVerifyValidator.parse(
        req.body
    );

    let email = "";
    let unhashedRandom = "";
    try {
        const decoded = Buffer.from(magicLinkToken, "base64url").toString(
            "utf8"
        );
        const parts = decoded.split("|");
        if (parts.length !== 2) {
            throw new Error();
        }
        email = parts[0];
        unhashedRandom = parts[1];
    } catch {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const { data: authToken } = await SupabaseDB.AUTH_TOKENS.delete()
        .eq("email", email)
        .select()
        .maybeSingle()
        .throwOnError();

    const { data: authInfo } = await SupabaseDB.AUTH_INFO.select(
        "userId, displayName, email"
    )
        .eq("email", email)
        .maybeSingle()
        .throwOnError();

    if (!authToken || !authInfo) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const match = bcrypt.compareSync(unhashedRandom, authToken.hashedToken);
    if (!match) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const expTimeDate = new Date(authToken.expTime);
    if (Date.now() > expTimeDate.getTime()) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "ExpiredCode",
        });
    }

    const token = await generateJWT(authInfo.userId);
    return res.status(StatusCodes.OK).json({ token });
});

// Remove role from userId (super admin only endpoint)
authRouter.delete(
    "/",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        // Validate request body using Zod schema
        const { userId, role } = AuthRoleChangeRequest.parse(req.body);

        const { data } = await SupabaseDB.AUTH_INFO.select("userId")
            .eq("userId", userId)
            .maybeSingle()
            .throwOnError();

        if (!data) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: "UserNotFound",
            });
        }

        const { data: deleted } = await SupabaseDB.AUTH_ROLES.delete()
            .eq("userId", userId)
            .eq("role", role)
            .select()
            .single()
            .throwOnError();

        return res.status(StatusCodes.OK).json(deleted);
    }
);

// Add role to userId (super admin only endpoint)
authRouter.put("/", RoleChecker([Role.Enum.SUPER_ADMIN]), async (req, res) => {
    const { userId, role } = AuthRoleChangeRequest.parse(req.body);

    const { data } = await SupabaseDB.AUTH_INFO.select("userId")
        .eq("userId", userId)
        .maybeSingle()
        .throwOnError();

    if (!data) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "UserNotFound",
        });
    }

    const { data: updated } = await SupabaseDB.AUTH_ROLES.upsert({
        userId,
        role,
    })
        .select()
        .single()
        .throwOnError();

    return res.status(StatusCodes.OK).json(updated);
});

authRouter.get(
    "/corporate",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { data } = await SupabaseDB.CORPORATE.select().throwOnError();

        return res.status(StatusCodes.OK).json(data);
    }
);

authRouter.post(
    "/corporate",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const data = CorporateValidator.parse(req.body);
        const { data: existing } = await SupabaseDB.CORPORATE.select()
            .eq("email", data.email)
            .throwOnError();
        if (existing.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                error: "AlreadyExists",
            });
        }
        const { data: corporate } = await SupabaseDB.CORPORATE.insert(data)
            .select()
            .single()
            .throwOnError();

        return res.status(StatusCodes.CREATED).json(corporate);
    }
);

authRouter.delete(
    "/corporate",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { email } = CorporateDeleteRequest.parse(req.body);
        const { data } = await SupabaseDB.CORPORATE.delete()
            .eq("email", email)
            .select()
            .throwOnError();

        if (data.length == 0) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send({ error: "NotFound" });
        }

        return res.sendStatus(StatusCodes.NO_CONTENT);
    }
);

authRouter.get("/info", RoleChecker([]), async (req, res) => {
    const userId = res.locals.payload.userId;
    const { data: info } = await SupabaseDB.AUTH_INFO.select()
        .eq("userId", userId)
        .single()
        .throwOnError();
    const { data: roleRows } = await SupabaseDB.AUTH_ROLES.select()
        .eq("userId", userId)
        .throwOnError();
    const user = {
        ...info,
        roles: roleRows.map((row: { role: Role }) => row.role),
    };
    return res.status(StatusCodes.OK).json(user);
});

// Get team members (users with STAFF or ADMIN roles)
authRouter.get("/team", RoleChecker([Role.Enum.ADMIN]), async (req, res) => {
    try {
        // Get all users first
        const { data: users } =
            await SupabaseDB.AUTH_INFO.select("*").throwOnError();

        // Get all roles
        const { data: roles } =
            await SupabaseDB.AUTH_ROLES.select("*").throwOnError();

        // Create a map of userId to roles
        const userRolesMap = new Map<string, Role[]>();
        roles?.forEach((roleRow: { userId: string; role: Role }) => {
            if (!userRolesMap.has(roleRow.userId)) {
                userRolesMap.set(roleRow.userId, []);
            }
            userRolesMap.get(roleRow.userId)!.push(roleRow.role);
        });

        // Filter to only users with STAFF or ADMIN roles
        const teamMembers =
            users
                ?.filter((user: AuthInfo) => {
                    const userRoles = userRolesMap.get(user.userId) || [];
                    return userRoles.some(
                        (role: Role) =>
                            role === Role.Enum.STAFF || role === Role.Enum.ADMIN
                    );
                })
                .map((user: AuthInfo) => ({
                    ...user,
                    roles: userRolesMap.get(user.userId) || [],
                })) || [];

        return res.status(StatusCodes.OK).json(teamMembers);
    } catch (error) {
        console.error("Error fetching team members:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Failed to fetch team members",
        });
    }
});

// Get staff user ids for resume book
authRouter.get(
    "/staff",
    RoleChecker([Role.Enum.CORPORATE, Role.Enum.STAFF]),
    async (req, res) => {
        const { data } = await SupabaseDB.AUTH_ROLES.select("userId")
            .eq("role", Role.Enum.STAFF)
            .throwOnError();
        const userIds = data.map((row: { userId: string }) => row.userId);
        return res.status(StatusCodes.OK).json(userIds);
    }
);

// Get a list of user ids by role (staff only endpoint)
authRouter.get("/:ROLE", RoleChecker([Role.Enum.STAFF]), async (req, res) => {
    // Validate the role using Zod schema
    const role = Role.parse(req.params.ROLE);

    const { data } = await SupabaseDB.AUTH_ROLES.select("userId")
        .eq("role", role)
        .throwOnError();
    const userIds = data.map((row: { userId: string }) => row.userId);
    return res.status(StatusCodes.OK).json(userIds);
});

export default authRouter;
