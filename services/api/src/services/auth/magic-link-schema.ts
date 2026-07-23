import { z } from "zod";
import { registry } from "../../middleware/openapi-registry";

export const MagicLinkClient = z.enum(["web", "mobile"]);
export const MagicLinkIntent = z.enum(["registration", "login", "resume-book"]);

export type MagicLinkClient = z.infer<typeof MagicLinkClient>;
export type MagicLinkIntent = z.infer<typeof MagicLinkIntent>;

const allowedMagicLinkRequests = new Set([
    "web:registration",
    "web:login",
    "mobile:login",
    "web:resume-book",
]);

export const MagicLinkIssueValidator = registry.register(
    "MagicLinkIssueValidator",
    z
        .object({
            email: z.string().trim().email().max(256),
            client: MagicLinkClient,
            intent: MagicLinkIntent,
        })
        .strict()
        .refine(
            ({ client, intent }) =>
                allowedMagicLinkRequests.has(`${client}:${intent}`),
            { message: "Unsupported client and intent combination" }
        )
        .openapi("MagicLinkIssueValidator", {
            example: {
                email: "user@example.com",
                client: "web",
                intent: "login",
            },
        })
);

export const MagicLinkVerifyValidator = registry.register(
    "MagicLinkVerifyValidator",
    z
        .object({
            token: z.string().min(20).max(512),
            client: MagicLinkClient,
        })
        .strict()
        .openapi("MagicLinkVerifyValidator", {
            example: {
                token: "opaque-base64url-token",
                client: "web",
            },
        })
);

export const MagicLinkTokenResponse = registry.register(
    "MagicLinkTokenResponse",
    z.object({ token: z.string() }).openapi("MagicLinkTokenResponse", {
        example: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
    })
);

export type MagicLinkIssueRequest = z.infer<typeof MagicLinkIssueValidator>;
