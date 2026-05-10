import * as yup from "yup";

const envSchema = yup.object({
  VITE_ENV: yup
    .string()
    .oneOf(["PRODUCTION", "DEVELOPMENT", "TESTING", "GITHUB_CI"])
    .optional(),
  VITE_GOOGLE_OAUTH_CLIENT_ID: yup.string().required(),
  VITE_API_BASE_URL: yup.string().url().optional(),
  VITE_WS_BASE_URL: yup.string().optional()
});

const viteEnv = import.meta.env as Record<string, string | undefined>;

const env = envSchema.validateSync(
  {
    VITE_ENV: viteEnv.VITE_ENV,
    VITE_GOOGLE_OAUTH_CLIENT_ID: viteEnv.VITE_GOOGLE_OAUTH_CLIENT_ID,
    VITE_API_BASE_URL: viteEnv.VITE_API_BASE_URL,
    VITE_WS_BASE_URL: viteEnv.VITE_WS_BASE_URL
  },
  { abortEarly: false }
);

const isDefined = env.VITE_ENV !== undefined;

const isProduction = env.VITE_ENV === "PRODUCTION";

const IS_DEV = isDefined && !isProduction;

const API_BASE_URL =
  env.VITE_API_BASE_URL ??
  (IS_DEV ? "http://localhost:3000" : "https://api.reflectionsprojections.org");

const WS_BASE_URL =
  env.VITE_WS_BASE_URL ??
  (IS_DEV ? "ws://localhost:3000" : "wss://api.reflectionsprojections.org");

const Config = {
  ENV: env.VITE_ENV,
  API_BASE_URL,
  WS_BASE_URL,
  EVENT_TYPES: [
    "SPEAKER",
    "CORPORATE",
    "SPECIAL",
    "PARTNERS",
    "MEALS",
    "CHECKIN"
  ] as const,
  GOOGLE_OAUTH_CLIENT_ID: env.VITE_GOOGLE_OAUTH_CLIENT_ID
};

export default Config;
