import { NextFunction, Request, Response } from "express";
import jsonwebtoken, { TokenExpiredError } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Config } from "../config";
import { RegistrationJwtPayloadValidator } from "../services/auth/auth-models";

export default function RegistrationAuthChecker(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const jwt = req.headers.authorization;
    if (!jwt) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "NoJWT" });
    }

    let payloadData: unknown;
    try {
        payloadData = jsonwebtoken.verify(jwt, Config.JWT_SIGNING_SECRET);
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ error: "ExpiredJWT" });
        }
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: "InvalidJWT" });
    }

    const payloadResult =
        RegistrationJwtPayloadValidator.safeParse(payloadData);
    if (!payloadResult.success) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: "InvalidJWT" });
    }

    res.locals.payload = payloadResult.data;
    return next();
}
