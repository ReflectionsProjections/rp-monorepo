import mongoose from "mongoose";
import { z } from "zod";
import { registry } from "../../middleware/openapi-registry";

export type IncomingSubscription = z.infer<typeof SubscriptionValidator>;

// Zod schema for incoming user subscriptions
const SubscriptionValidator = registry.register(
    "SubscriptionValidator",
    z
        .object({
            userId: z.string(),
            mailingList: z.string().min(1),
        })
        .openapi("SubscriptionValidator", {
            example: { userId: "user_abc123", mailingList: "rp_interest" },
        })
);

// Zod schema for validating subscription lists
const SubscriptionSchemaValidator = z.object({
    userId: z.string(),
    mailingList: z.string().min(1),
});

export const SendEmailValidator = registry.register(
    "SendEmailValidator",
    z
        .object({
            mailingList: z.string(),
            subject: z.string(),
            htmlBody: z.string(),
        })
        .openapi("SendEmailValidator", {
            example: {
                mailingList: "rp_interest",
                subject: "R|P 2025 is here!",
                htmlBody: "<h1>Welcome to R|P 2025</h1>",
            },
        })
);

export const SendEmailSingleValidator = registry.register(
    "SendEmailSingleValidator",
    z
        .object({
            email: z.string().email(),
            subject: z.string(),
            htmlBody: z.string(),
        })
        .openapi("SendEmailSingleValidator", {
            example: {
                email: "hacker@example.com",
                subject: "Your R|P registration",
                htmlBody: "<p>Thanks for registering!</p>",
            },
        })
);

export const UnsubscribeValidator = registry.register(
    "UnsubscribeValidator",
    z
        .object({
            userId: z.string(),
            mailingList: z.string(),
        })
        .openapi("UnsubscribeValidator", {
            example: { userId: "user_abc123", mailingList: "rp_interest" },
        })
);

export const SendEmailBulkValidator = registry.register(
    "SendEmailBulkValidator",
    z
        .object({
            emails: z.array(z.string().email()).min(1),
            subject: z.string(),
            htmlBody: z.string(),
        })
        .openapi("SendEmailBulkValidator", {
            example: {
                emails: ["a@example.com", "b@example.com"],
                subject: "R|P Update",
                htmlBody: "<p>Hello!</p>",
            },
        })
);

export const CreateMailingListValidator = registry.register(
    "CreateMailingListValidator",
    z
        .object({
            listName: z.string().min(1),
            emails: z.array(z.string().email()).min(1),
        })
        .openapi("CreateMailingListValidator", {
            example: {
                listName: "sponsors_2025",
                emails: ["sponsor@company.com", "another@corp.io"],
            },
        })
);

export const SubscriptionSuccessResponse = registry.register(
    "SubscriptionSuccessResponse",
    z
        .object({ status: z.string(), message: z.string() })
        .openapi("SubscriptionSuccessResponse", {
            example: {
                status: "success",
                message: "Operation completed successfully",
            },
        })
);

export const BulkSendResultResponse = registry.register(
    "BulkSendResultResponse",
    z
        .object({
            success: z.boolean(),
            successCount: z.number(),
            failedCount: z.number(),
            errors: z.array(z.string()),
        })
        .openapi("BulkSendResultResponse", {
            example: {
                success: true,
                successCount: 42,
                failedCount: 0,
                errors: [],
            },
        })
);

// Mongoose schema for subscription
const SubscriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    mailingList: { type: String, required: true },
});

export {
    SubscriptionValidator,
    SubscriptionSchemaValidator,
    SubscriptionSchema,
};
