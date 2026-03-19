import dotenv from "dotenv";
import path from "path";

const rootEnv =
    dotenv.config({
        path: path.resolve(__dirname, "../../../.env"),
        quiet: true,
    }).parsed ?? {};

process.env.ENV = "TESTING";

process.env.DATABASE_USERNAME =
    process.env.DATABASE_USERNAME ?? rootEnv.DATABASE_USERNAME ?? "postgres";
process.env.DATABASE_PASSWORD =
    process.env.DATABASE_PASSWORD ?? rootEnv.DATABASE_PASSWORD ?? "postgres";
process.env.DATABASE_HOST =
    process.env.DATABASE_HOST ?? rootEnv.DATABASE_HOST ?? "db";

process.env.FIREBASE_ADMIN_CERT_PATH = "testing.json";

process.env.PUZZLEBANG_API_KEY = "iampuzzlebangtrust";

process.env.IOS_OAUTH_GOOGLE_CLIENT_ID =
    "himynameistimothygonzalezandiliketoeatcoldtoastforbreakfastbecauseblahblahblahyouhavetoreadthiswholethingbecauseimyourbosshahahahahah";
process.env.ANDROID_OAUTH_GOOGLE_CLIENT_ID =
    "ronitanandanisittinginatreeC-O-D-I-N-Gllamallamallamafurryfurrryfurryryfyryy";
process.env.OAUTH_GOOGLE_CLIENT_ID = "beepbeepimasheep";
process.env.OAUTH_GOOGLE_CLIENT_SECRET = "isaidbeepbeepimasheep";

process.env.JWT_SIGNING_SECRET = "supersecretsecret";
process.env.QR_HASH_SECRET = "raidshadowlegends";

process.env.FROM_EMAIL_ADDRESS = "fake@reflectionsprojections.org";

process.env.S3_ACCESS_KEY = "2468";
process.env.S3_SECRET_KEY = "whodeweappreciate";
process.env.S3_BUCKET_NAME =
    "theduckwalkeduptothelemonadestandandhesaidtothemanrunningthestandheygotanygrapesandthenthemangotmadandshottheduck";
process.env.S3_REGION = "aok";
process.env.USERID_ENCRYPTION_KEY = "whatissecurity";

process.env.SUPABASE_URL =
    process.env.SUPABASE_URL ?? rootEnv.SUPABASE_URL ?? "http://localhost:8000";
process.env.SUPABASE_SERVICE_KEY =
    process.env.SUPABASE_SERVICE_KEY ??
    rootEnv.SUPABASE_SERVICE_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoyNTI0NjA4MDAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.hqx87nxUtsYgFHpIDf2gLYOV6L8QTQJc3JgVmn4r_28";
