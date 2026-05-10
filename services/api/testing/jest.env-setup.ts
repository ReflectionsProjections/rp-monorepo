import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(__dirname, ".supabase-test.env"),
    quiet: true,
});

process.env.ENV = "TESTING";

process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? "http://localhost:8100";

if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error(
        "SUPABASE_SERVICE_KEY is required for API tests. Run `node testing/generate-supabase-test-env.mjs` from services/api before starting the test stack."
    );
}
