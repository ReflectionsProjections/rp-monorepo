import dotenv from 'dotenv';
import path from 'path';

import { z } from 'zod';

import { SESv2Client } from '@aws-sdk/client-sesv2';

dotenv.config({ quiet: true });

export enum Templates {
    REGISTRATION_CONFIRMATION = 'rp_registration_confirmation',
    REGISTRATION_UPDATE_CONFIRMATION = 'rp_registration_update_confirmation',
    SPONSOR_VERIFICATION = 'rp_sponsor_verification',
    RP_EMAILS = 'rp_emails',
}

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
    quiet: true,
    override: false,
});

export enum EnvironmentEnum {
    PRODUCTION = 'PRODUCTION',
    DEVELOPMENT = 'DEVELOPMENT',
    TESTING = 'TESTING',
    GITHUB_CI = 'GITHUB_CI',
}

export const Environment = z.nativeEnum(EnvironmentEnum);

export const MailingLists = {
    RP_INTEREST: 'rp_interest',
    RP_STAFF: 'rp_staff',
    ATTENDEES_2025: '2025_Attendees',
    ATTENDEES_2026: '2026_Attendees',
    STAFF_2026: '2026_Staff',
} as const;

export const MailingListName = z.enum(['rp_interest', 'rp_staff']);
const env = Environment.parse(getEnv('ENV'));

function getEnv(key: string): string {
    const val = process.env[key];
    if (val === undefined) {
        if (env == EnvironmentEnum.PRODUCTION) {
            console.warn(`env value ${key} not found, defaulting to empty string`);
            return '';
        }

        throw new Error(`env value ${key} not found, exiting...`);
    }
    return val;
}

// Overridable so staging/preview deployments can mint magic links that point
// back at their own host instead of production.
const WEB_BASE =
    process.env.WEB_BASE_URL ||
    (env === EnvironmentEnum.PRODUCTION
        ? 'https://reflectionsprojections.org'
        : 'http://localhost:3001');

export const Config = {
    ENV: env,
    DEFAULT_APP_PORT: 3000,
    ALLOWED_CORS_ORIGIN_PATTERNS: [
        new RegExp('(.*).reflectionsprojections.org(.*)'),
        new RegExp('deploy-preview-[0-9]*(--rp2024.netlify.app)(.*)'),
        new RegExp('(.*)localhost(.*)'),
        new RegExp('(.*)127.0.0.1(.*)'),
    ],

    DATABASE_USERNAME: getEnv('DATABASE_USERNAME'),
    DATABASE_PASSWORD: getEnv('DATABASE_PASSWORD'),
    DATABASE_HOST: getEnv('DATABASE_HOST'),

    FIREBASE_ADMIN_CERT_PATH: getEnv('FIREBASE_ADMIN_CERT_PATH'),

    PUZZLEBANG_API_KEY: getEnv('PUZZLEBANG_API_KEY'),
    PUZZLEBANG_POINTS: [
        {
            idRegex: /.*/,
            points: 2,
        },
        {
            idRegex: /^M.*/,
            points: 4,
        },
    ],

    // prettier-ignore
    AUTH_ADMIN_WHITELIST: new Set([
        // Dev Chairs/Code-Owners (reach out to these people for questions)
        "akul@reflectionsprojections.org",    // Akul Sharma
        "dev.patel@reflectionsprojections.org",    // Dev Patel
        "jacob.edley@reflectionsprojections.org",    // Jacob Edley
    ]),

    // For sending emails
    FROM_EMAIL_ADDRESS: process.env.FROM_EMAIL_ADDRESS,

    // Development admin email - allows developer email to be admin in development
    DEV_ADMIN_EMAIL: process.env.DEV_ADMIN_EMAIL,

    // Event date override for testing - allows overriding the hardcoded event start date
    EVENT_START_DATE_OVERRIDE: process.env.EVENT_START_DATE_OVERRIDE,

    JWT_SIGNING_SECRET: getEnv('JWT_SIGNING_SECRET'),
    JWT_EXPIRATION_TIME: '1 day' as const,
    MOBILE_JWT_EXPIRATION_TIME: '10 days' as const,
    MAGIC_LINK_REGISTRATION_CALLBACK: `${WEB_BASE}/auth/registration`,
    MAGIC_LINK_WEB_LOGIN_CALLBACK: `${WEB_BASE}/auth/login`,
    MAGIC_LINK_MOBILE_LOGIN_CALLBACK: `${WEB_BASE}/auth/mobile/login`,
    MAGIC_LINK_RESUME_BOOK_CALLBACK: `${WEB_BASE}/sponsor/auth/magic-link`,
    MAGIC_LINK_ISSUE_IP_LIMIT: 50,
    MAGIC_LINK_ISSUE_EMAIL_LIMIT: 3,
    MAGIC_LINK_VERIFY_IP_LIMIT: 30,
    MAGIC_LINK_VERIFY_EMAIL_LIMIT: 10,
    MAGIC_LINK_CODE_MAX_ATTEMPTS: 5,
    STAFF_MEETING_CHECK_IN_WINDOW_SECONDS: 6 * 60 * 60,

    S3_ACCESS_KEY: getEnv('S3_ACCESS_KEY'),
    S3_SECRET_KEY: getEnv('S3_SECRET_KEY'),
    S3_BUCKET_NAME: getEnv('S3_BUCKET_NAME'),
    S3_REGION: getEnv('S3_REGION'),
    MAX_RESUME_SIZE_BYTES: 6 * 1024 * 1024,
    RESUME_URL_EXPIRY_SECONDS: 60,

    HASH_SALT_ROUNDS: 10,
    VERIFY_EXP_TIME_MS: 10 * 60 * 1000,
    SPONSOR_ENTIRES_PER_PAGE: 60,

    DASHBOARD_PING_EVERY_MS: 5 * 1000,
    DASHBOARD_TIMEOUT_MS: 15 * 1000,

    // QR Scanning
    QR_HASH_ITERATIONS: 10000,
    QR_HASH_SECRET: getEnv('QR_HASH_SECRET'),
    WEB_REGISTER_ROUTE: `${WEB_BASE}/register`,
    WEB_RESUME_ROUTE: `${WEB_BASE}/resume`,
    EMAIL_HEADER_HREF: `${WEB_BASE}/email_header.png`,
    OUTGOING_EMAIL_ADDRESSES: z.enum(['no-reply@reflectionsprojections.org']),

    // SES retry/backoff
    MAX_MAIL_SEND_RETRIES: 10,
    MIN_MAIL_BACKOFF_MS: 10,
    MAX_MAIL_BACKOFF_MS: 5000,
    SES_BULK_BATCH_SIZE: 50,

    LOG_DIR: env === EnvironmentEnum.PRODUCTION ? '/home/ubuntu/logs' : './logs',
};

export const ses = new SESv2Client({
    region: Config.S3_REGION,

    credentials: {
        accessKeyId: Config.S3_ACCESS_KEY,
        secretAccessKey: Config.S3_SECRET_KEY,
    },
});

export default Config;
