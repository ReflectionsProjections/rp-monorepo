import mongoose from "mongoose";
import { z } from "zod";
import { registry } from "../../../middleware/openapi-registry";

export const SponsorAuthSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    hashedVerificationCode: { type: String, required: true },
    expTime: { type: Number, required: true },
});

export const SponsorAuthValidator = z.object({
    email: z.string().email(),
    hashedVerificationCode: z.string(),
    expTime: z.number().int(),
});

export const AuthSponsorLoginValidator = registry.register(
    "AuthSponsorLoginValidator",
    z
        .object({
            email: z.string().email(),
        })
        .openapi("AuthSponsorLoginValidator", {
            example: { email: "sponsor@acme.com" },
        })
);

export const AuthSponsorVerifyValidator = z.object({
    email: z.string().email(),
    randomHexCode: z.string().length(6),
});
