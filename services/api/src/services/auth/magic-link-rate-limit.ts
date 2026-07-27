import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { Config, EnvironmentEnum } from "../../config";
import { normalizeEmail } from "./auth-utils";

const common = {
    windowMs: 10 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => Config.ENV === EnvironmentEnum.TESTING,
    handler: (_request: Request, response: Response) =>
        response.status(429).json({ error: "TooManyRequests" }),
};

export const magicLinkIssueIpLimiter = rateLimit({
    ...common,
    max: Config.MAGIC_LINK_ISSUE_IP_LIMIT,
});

export const magicLinkIssueEmailLimiter = rateLimit({
    ...common,
    max: Config.MAGIC_LINK_ISSUE_EMAIL_LIMIT,
    keyGenerator: (request) =>
        normalizeEmail(
            typeof request.body?.email === "string"
                ? request.body.email
                : "invalid-email"
        ),
});

export const magicLinkVerifyIpLimiter = rateLimit({
    ...common,
    max: Config.MAGIC_LINK_VERIFY_IP_LIMIT,
});
