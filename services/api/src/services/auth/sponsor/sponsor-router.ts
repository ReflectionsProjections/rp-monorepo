import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { sendTemplateEmail } from "../../ses/ses-utils";
import { Templates } from "../../../config";
import { Config } from "../../../config";
import { Role } from "../../auth/auth-models";
import mustache from "mustache";
import templates from "../../../templates/templates";

import { createSixDigitCode, encryptSixDigitCodeAsync } from "./sponsor-utils";
import * as bcrypt from "bcrypt";
import {
    AuthSponsorLoginValidator,
    AuthSponsorVerifyValidator,
} from "./sponsor-schema";
import { SupabaseDB, supabase } from "../../../database";
import { generateJWT, normalizeEmail } from "../auth-utils";

const authSponsorRouter = Router();

/**
 * @swagger
 * /auth/sponsor/login:
 *   post:
 *     summary: Request a sponsor verification code
 *     description: |
 *       Sends a 6-digit email verification code only when the account has the
 *       CORPORATE role. The response does not disclose account eligibility.
 *
 *       **Required roles: none**
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthSponsorLoginValidator'
 *     responses:
 *       202:
 *         description: Request accepted
 *     security: []
 */
authSponsorRouter.post("/login", async (req, res) => {
    const request = AuthSponsorLoginValidator.parse(req.body);
    const email = normalizeEmail(request.email);
    const { data: account } = await SupabaseDB.AUTH_INFO.select("userId")
        .eq("email", email)
        .maybeSingle()
        .throwOnError();

    const { data: corporateRole } = account
        ? await SupabaseDB.AUTH_ROLES.select("role")
              .eq("userId", account.userId)
              .eq("role", Role.Enum.CORPORATE)
              .maybeSingle()
              .throwOnError()
        : { data: null };

    if (account && corporateRole) {
        try {
            const sixDigitCode = createSixDigitCode();
            const hashedVerificationCode =
                await encryptSixDigitCodeAsync(sixDigitCode);
            await SupabaseDB.AUTH_CODES.upsert(
                {
                    email,
                    hashedVerificationCode,
                    expTime: new Date(
                        Date.now() + Config.VERIFY_EXP_TIME_MS
                    ).toISOString(),
                },
                {
                    onConflict: "email",
                }
            ).throwOnError();

            try {
                await sendTemplateEmail(email, Templates.RP_EMAILS, {
                    subject: "R|P Resume Book Email Verification",
                    body: mustache.render(templates.SPONSOR_VERIFICATION, {
                        code: sixDigitCode,
                    }),
                });
            } catch (error) {
                await SupabaseDB.AUTH_CODES.delete()
                    .eq("email", email)
                    .eq("hashedVerificationCode", hashedVerificationCode)
                    .throwOnError();
                throw error;
            }
        } catch (error) {
            console.error("Failed to issue a legacy sponsor code", error);
        }
    }
    return res.sendStatus(StatusCodes.ACCEPTED);
});

/**
 * @swagger
 * /auth/sponsor/verify:
 *   post:
 *     summary: Verify a sponsor code and receive a JWT
 *     description: |
 *       Verifies the 6-digit code and revalidates the account's CORPORATE role.
 *       Returns the standard account JWT. This route never grants a role.
 *
 *       **Required roles: none**
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthSponsorVerifyValidator'
 *     responses:
 *       200:
 *         description: A standard account JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthJwtResponse'
 *       401:
 *         description: Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "InvalidCode"
 *     security: []
 */
authSponsorRouter.post("/verify", async (req, res) => {
    const request = AuthSponsorVerifyValidator.parse(req.body);
    const email = normalizeEmail(request.email);
    const { sixDigitCode } = request;
    const { data: sponsorData } = await SupabaseDB.AUTH_CODES.select()
        .eq("email", email)
        .maybeSingle()
        .throwOnError();
    const { data: account } = await SupabaseDB.AUTH_INFO.select("userId")
        .eq("email", email)
        .maybeSingle()
        .throwOnError();
    const { data: corporateRole } = account
        ? await SupabaseDB.AUTH_ROLES.select("role")
              .eq("userId", account.userId)
              .eq("role", Role.Enum.CORPORATE)
              .maybeSingle()
              .throwOnError()
        : { data: null };

    if (!sponsorData || !account || !corporateRole) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const match = await bcrypt.compare(
        sixDigitCode,
        sponsorData.hashedVerificationCode
    );
    if (!match) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const { data: consumed, error } = await supabase.rpc("consume_auth_code", {
        p_email: email,
        p_stored_hash: sponsorData.hashedVerificationCode,
    });
    if (error) {
        throw error;
    }
    if (!consumed) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const { data: currentRole } = await SupabaseDB.AUTH_ROLES.select("role")
        .eq("userId", account.userId)
        .eq("role", Role.Enum.CORPORATE)
        .maybeSingle()
        .throwOnError();
    if (!currentRole) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const token = await generateJWT(account.userId);
    return res.status(StatusCodes.OK).json({ token });
});

export default authSponsorRouter;
