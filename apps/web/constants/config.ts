import * as yup from 'yup';

// Validation using zup

const envSchema = yup.object({
    VITE_ENV: yup.string().oneOf(['PRODUCTION', 'DEVELOPMENT', 'TESTING']).optional(),
});

const env = envSchema.validateSync(import.meta.env, { abortEarly: false });

const isDefined = env.VITE_ENV !== undefined;

const isProduction = env.VITE_ENV === 'PRODUCTION';

const IS_DEV = isDefined && !isProduction;

const API_BASE_URL = IS_DEV ? 'http://localhost:3000' : 'https://api.reflectionsprojections.org';

const WS_BASE_URL = IS_DEV ? 'ws://localhost:3000' : 'wss://api.reflectionsprojections.org';

const Config = {
    ENV: env.VITE_ENV,
    API_BASE_URL,
    WS_BASE_URL,
    EVENT_TYPES: ['SPEAKER', 'CORPORATE', 'SPECIAL', 'PARTNERS', 'MEALS', 'CHECKIN'] as const,
};

export default Config;
