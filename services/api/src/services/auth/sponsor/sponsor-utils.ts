import * as bcrypt from "bcrypt";
import { Config } from "../../../config";
import crypto from "crypto";

export function encryptRandomHexCode(randomHexCode: string): string {
    const hash = bcrypt.hashSync(randomHexCode, Config.HASH_SALT_ROUNDS);
    return hash;
}

export function createRandomHexCode() {
    return crypto.randomBytes(32).toString("base64url");
}
