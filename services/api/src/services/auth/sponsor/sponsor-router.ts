import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { sendHTMLEmail } from "../../ses/ses-utils";
import jsonwebtoken from "jsonwebtoken";
import { Config } from "../../../config";
import { Role } from "../../auth/auth-models";
import mustache from "mustache";
import templates from "../../../templates/templates";

import { createRandomHexCode, encryptRandomHexCode } from "./sponsor-utils";
import * as bcrypt from "bcrypt";
import {
    AuthSponsorLoginValidator,
    AuthSponsorVerifyValidator,
} from "./sponsor-schema";
import { SupabaseDB } from "../../../database";

type SponsorAuthInfo = {
    userId: string;
    email: string;
    displayName: string;
};

type SponsorAuthToken = {
    tokenHash: string;
    expiresAt: string;
    usedAt: string | null;
};

const authSponsorRouter = Router();

authSponsorRouter.post("/login", async (req, res) => {
    const { email } = AuthSponsorLoginValidator.parse(req.body);
    const corporateUserResponse = await SupabaseDB.AUTH_INFO
        .select("userId, email, displayName")
        .eq("email", email)
        .eq("role", Role.Enum.CORPORATE)
        .maybeSingle()
        .throwOnError();
    const corporateUser = corporateUserResponse.data as SponsorAuthInfo | null;

    if (!corporateUser) { 
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    const randomHexCode = createRandomHexCode();
    const tokenHash = encryptRandomHexCode(randomHexCode);

    const expiresAt = new Date(
        Date.now() + Config.VERIFY_EXP_TIME_MS
    ).toISOString();

    await SupabaseDB.AUTH_TOKENS.upsert(
        {
            userId: corporateUser.userId,
            tokenHash,
            expiresAt,
            path: "sponsor-login",
            usedAt: null,
        },
        {
            onConflict: "userId,path",
        }
    ).throwOnError();

    const emailBody = mustache.render(
        templates.SPONSOR_VERIFICATION_LINK,
        {
            link: `reflectionsprojections.org/auth?token=${randomHexCode}`,
        }
    );

    await sendHTMLEmail(
        email,
        "R|P Resume Book Email Verification",
        emailBody
    );

    return res.sendStatus(StatusCodes.CREATED);
});

authSponsorRouter.post("/verify", async (req, res) => {
    const { email, randomHexCode } = AuthSponsorVerifyValidator.parse(req.body);
    const { data: sponsorUser } = await SupabaseDB.AUTH_INFO.select(
        "userId, email, displayName"
    )
        .eq("email", email)
        .eq("role", Role.Enum.CORPORATE)
        .maybeSingle()
        .throwOnError();
    const corporateUser = sponsorUser as SponsorAuthInfo | null;

    if (!corporateUser) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const { data: sponsorData } = await SupabaseDB.AUTH_TOKENS.select(
        "tokenHash, expiresAt, usedAt"
    )
        .eq("userId", corporateUser.userId)
        .eq("path", "sponsor-login")
        .is("usedAt", null)
        .maybeSingle();

    if (!sponsorData) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const match = bcrypt.compareSync(
        randomHexCode,
        (sponsorData as SponsorAuthToken).tokenHash
    );
    if (!match) {
        await SupabaseDB.AUTH_TOKENS.update({
            usedAt: new Date().toISOString(),
        })
            .eq("userId", corporateUser.userId)
            .eq("path", "sponsor-login")
            .is("usedAt", null)
            .throwOnError();
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "InvalidCode",
        });
    }

    const expTimeDate = new Date((sponsorData as SponsorAuthToken).expiresAt);
    if (Date.now() > expTimeDate.getTime()) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            error: "ExpiredCode",
        });
    }

    await SupabaseDB.AUTH_TOKENS.update({
        usedAt: new Date().toISOString(),
    })
        .eq("userId", corporateUser.userId)
        .eq("path", "sponsor-login")
        .is("usedAt", null)
        .throwOnError();

    const token = jsonwebtoken.sign(
        {
            userId: corporateUser.userId,
            displayName: corporateUser.displayName,
            email,
            roles: [Role.Enum.CORPORATE],
        },
        Config.JWT_SIGNING_SECRET,
        {
            expiresIn: Config.JWT_EXPIRATION_TIME,
        }
    );
    return res.status(StatusCodes.OK).json({ token });
});

export default authSponsorRouter;
