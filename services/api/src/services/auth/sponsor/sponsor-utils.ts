import * as bcrypt from "bcrypt";
import crypto from "crypto";
import { Config } from "../../../config";

export function createMagicLinkToken(email: string): {
    magicLinkToken: string;
    unhashedRandom: string;
} {
    const unhashedRandom = crypto.randomBytes(32).toString("hex");
    const magicLinkToken = Buffer.from(`${email}|${unhashedRandom}`).toString(
        "base64url"
    );
    return { magicLinkToken, unhashedRandom };
}

export function hashMagicLinkToken(unhashedRandom: string): string {
    const hash = bcrypt.hashSync(unhashedRandom, Config.HASH_SALT_ROUNDS);
    return hash;
}
