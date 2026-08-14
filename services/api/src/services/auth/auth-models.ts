import { z } from "zod";

export const Role = z.enum([
    "USER",
    "STAFF",
    "ADMIN",
    "CORPORATE",
    "SUPER_ADMIN",
]);
export type Role = z.infer<typeof Role>;

export const JwtPayloadValidator = z.object({
    userId: z.string(),
    displayName: z.string().nullable(),
    email: z.string().email(),
    roles: Role.array(),
    tokenType: z.literal("access").optional().default("access"),
});

export type JwtPayloadType = z.infer<typeof JwtPayloadValidator>;

export const SetupJwtPayloadValidator = z.object({
    userId: z.string(),
    displayName: z.null(),
    email: z.string().email(),
    roles: z.array(Role).length(0),
    tokenType: z.literal("setup"),
});

export const RegistrationJwtPayloadValidator = z.union([
    JwtPayloadValidator,
    SetupJwtPayloadValidator,
]);

export type SetupJwtPayloadType = z.infer<typeof SetupJwtPayloadValidator>;
export type RegistrationJwtPayloadType = z.infer<
    typeof RegistrationJwtPayloadValidator
>;
