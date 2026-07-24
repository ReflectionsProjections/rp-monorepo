import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RegistrationJwtPayloadValidator } from "../services/auth/auth-models";
import { verifyJwtPayload } from "./jwt-verifier";

// Accepts a setup token or an access token, so a verified roleless account
// can save a draft and complete registration.
export default function RegistrationAuthChecker(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const jwt = req.headers.authorization;
    if (!jwt) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "NoJWT" });
    }

    const result = verifyJwtPayload(jwt, RegistrationJwtPayloadValidator);
    if (!result.success) {
        return res.status(result.status).json({ error: result.error });
    }

    res.locals.payload = result.payload;
    return next();
}
