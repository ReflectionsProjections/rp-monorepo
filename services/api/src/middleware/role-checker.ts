import { NextFunction, Request, Response } from "express";
import { JwtPayloadValidator, Role } from "../services/auth/auth-models";
import { StatusCodes } from "http-status-codes";
import { verifyJwtPayload } from "./jwt-verifier";

export default function RoleChecker(
    requiredRoles: Role[],
    weakVerification: boolean = false
) {
    return function (req: Request, res: Response, next: NextFunction) {
        const jwt = req.headers.authorization;

        if (jwt == undefined) {
            if (weakVerification) {
                return next();
            }

            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ error: "NoJWT" });
        }

        const result = verifyJwtPayload(jwt, JwtPayloadValidator);
        if (!result.success) {
            return res.status(result.status).json({ error: result.error });
        }
        const payload = result.payload;
        res.locals.payload = payload;

        const userRoles = payload.roles;

        if (weakVerification) {
            return next();
        }

        if (requiredRoles.length == 0) {
            return next();
        }

        const matchingRoles = userRoles.filter((role) =>
            requiredRoles.includes(role)
        );
        if (matchingRoles.length == 0) {
            return res.status(StatusCodes.FORBIDDEN).send({
                error: "Forbidden",
                message: `You require one of the following roles to do that: ${requiredRoles.join(", ")}`,
            });
        }

        return next();
    };
}
