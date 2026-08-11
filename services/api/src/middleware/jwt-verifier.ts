import jsonwebtoken, { TokenExpiredError } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { Config } from "../config";

export type JwtVerificationResult<Validator extends z.ZodTypeAny> =
    | { success: true; payload: z.infer<Validator> }
    | { success: false; status: StatusCodes; error: string };

// Verifies a JWT's signature and validates its payload against the given
// schema. The schema decides which token types a route accepts (for example,
// JwtPayloadValidator rejects setup tokens).
export function verifyJwtPayload<Validator extends z.ZodTypeAny>(
    jwt: string,
    validator: Validator
): JwtVerificationResult<Validator> {
    let payloadData: unknown;
    try {
        payloadData = jsonwebtoken.verify(jwt, Config.JWT_SIGNING_SECRET);
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return {
                success: false,
                status: StatusCodes.FORBIDDEN,
                error: "ExpiredJWT",
            };
        }
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED,
            error: "InvalidJWT",
        };
    }

    const payloadResult = validator.safeParse(payloadData);
    if (!payloadResult.success) {
        return {
            success: false,
            status: StatusCodes.UNAUTHORIZED,
            error: "InvalidJWT",
        };
    }

    return { success: true, payload: payloadResult.data };
}
