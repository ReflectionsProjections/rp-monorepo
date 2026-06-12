import mongoose from "mongoose";
import { z } from "zod";

export const SponsorAuthSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    hashedToken: { type: String, required: true },
    expTime: { type: Number, required: true },
});

export const SponsorAuthValidator = z.object({
    email: z.string().email(),
    hashedToken: z.string(),
    expTime: z.number().int(),
});

export const AuthSponsorLoginValidator = z.object({
    email: z.string().email(),
});

export const AuthSponsorVerifyValidator = z.object({
    token: z.string(),
});
