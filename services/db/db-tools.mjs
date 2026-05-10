#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const dbDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dbDir, "../..");
const apiDir = path.join(rootDir, "services", "api");
const testEnvPath = path.join(apiDir, "testing", ".supabase-test.env");
const testEnvArg = path.join("services", "api", "testing", ".supabase-test.env");
const devComposeArg = path.join("services", "db", "docker-compose.yml");
const testComposeArg = path.join("services", "db", "docker-compose.test.yml");
const testComposeProject = "rp-api-test";
const command = process.argv[2] ?? "help";
let dockerGuidancePrinted = false;
const studioUrl = "http://localhost:8001/project/default/editor";

function printDockerGuidance() {
    if (dockerGuidancePrinted) {
        return;
    }

    dockerGuidancePrinted = true;
    console.error("");
    console.error("Docker must be usable from this shell as `docker compose` without this script adding sudo.");
    console.error("On macOS/Windows, start Docker Desktop. On Linux, use a Docker-enabled shell such as:");
    console.error("  sg docker -c 'cd services/db && yarn infra:status'");
    console.error("or configure your user for non-sudo Docker access.");
}

function run(executable, args, options = {}) {
    const {
        cwd = rootDir,
        stdio = "inherit",
        allowFailure = false,
        dockerCommand = false,
    } = options;

    return new Promise((resolve, reject) => {
        const child = spawn(executable, args, { cwd, stdio, shell: false });

        child.on("error", (error) => {
            if (dockerCommand) {
                printDockerGuidance();
            }
            if (allowFailure) {
                resolve(1);
                return;
            }
            reject(error);
        });

        child.on("close", (code, signal) => {
            if (code === 0) {
                resolve(0);
                return;
            }

            if (dockerCommand) {
                printDockerGuidance();
            }

            if (allowFailure) {
                resolve(code ?? 1);
                return;
            }

            reject(new Error(`${executable} ${args.join(" ")} failed with ${signal ?? `exit code ${code}`}`));
        });
    });
}

function dockerCompose(args, options = {}) {
    return run("docker", ["compose", "--env-file", ".env", "-f", devComposeArg, ...args], {
        ...options,
        dockerCommand: true,
    });
}

function devComposeWithTestEnv(args, options = {}) {
    return run("docker", ["compose", "--env-file", testEnvArg, "-f", devComposeArg, ...args], {
        ...options,
        dockerCommand: true,
    });
}

function testCompose(args, options = {}) {
    return run(
        "docker",
        ["compose", "-p", testComposeProject, "--env-file", testEnvArg, "-f", testComposeArg, ...args],
        { ...options, dockerCommand: true }
    );
}

async function generateApiTestEnv() {
    await run("node", ["generate-supabase-test-env.mjs"], { cwd: dbDir });
}

async function generateApiTestEnvIfMissing() {
    if (fs.existsSync(testEnvPath)) {
        console.log("Using existing services/api/testing/.supabase-test.env");
        return;
    }

    await generateApiTestEnv();
}

function ensureApiTestEnv() {
    if (!fs.existsSync(testEnvPath)) {
        throw new Error(
            "services/api/testing/.supabase-test.env does not exist. Run `cd services/db && yarn api:test:env` first."
        );
    }
}

function readEnvFile(filePath) {
    ensureApiTestEnv();
    return Object.fromEntries(
        fs
            .readFileSync(filePath, "utf8")
            .split(/\r?\n/)
            .filter((line) => line.trim() && !line.trimStart().startsWith("#"))
            .map((line) => {
                const separatorIndex = line.indexOf("=");
                return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
            })
    );
}

async function startApiTestDb() {
    ensureApiTestEnv();
    await testCompose(["down", "-v", "--remove-orphans"], { allowFailure: true });
    try {
        await testCompose(["up", "-d", "db", "rest", "kong"]);
    } catch (error) {
        console.error("API test database stack failed to start.");
        await dumpApiTestDbDiagnostics();
        throw error;
    }
}

async function waitForApiTestDb() {
    const env = readEnvFile(testEnvPath);
    const url = `${env.SUPABASE_URL}/rest/v1/authInfo?select=userId&limit=1`;
    const timeoutMs = 90_000;
    const startedAt = Date.now();

    console.log(`Waiting for API test Kong gateway at ${url}`);

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const response = await fetch(url, {
                headers: {
                    apikey: env.SUPABASE_SERVICE_KEY,
                    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
                },
                signal: AbortSignal.timeout(5_000),
            });

            if (response.ok) {
                console.log("API test Kong gateway is ready.");
                return;
            }
        } catch {
            // Keep polling until the timeout; diagnostics are printed below.
        }

        await new Promise((resolve) => setTimeout(resolve, 2_000));
    }

    console.error(`API test database stack did not become ready within ${timeoutMs / 1000}s.`);
    console.error(`Readiness URL: ${url}`);
    await dumpApiTestDbDiagnostics();
    throw new Error("API test database stack did not become ready.");
}

async function stopApiTestDb() {
    if (!fs.existsSync(testEnvPath)) {
        console.log("services/api/testing/.supabase-test.env does not exist; nothing to stop.");
        return;
    }

    await testCompose(["down", "-v", "--remove-orphans"], { allowFailure: true });
}

async function dumpApiTestDbDiagnostics() {
    if (!fs.existsSync(testEnvPath)) {
        console.error("services/api/testing/.supabase-test.env is missing; cannot inspect the test stack.");
        return;
    }

    console.error("");
    console.error("API test database stack status:");
    await testCompose(["ps"], { allowFailure: true });
    console.error("");
    console.error("API test database stack logs:");
    await testCompose(["logs", "--no-color", "--tail", "200", "db", "rest", "kong"], { allowFailure: true });
}

function printDashboardUrl() {
    console.log(`Supabase Studio table editor: ${studioUrl}`);
    console.log("Start it with `cd services/db && yarn infra:start:detached` if it is not already running.");
}

async function verifyDatabaseConfigs() {
    await generateApiTestEnvIfMissing();
    console.log("Validating development database Compose config...");
    await devComposeWithTestEnv(["config", "--quiet"]);
    console.log("Validating API test database Compose config...");
    await testCompose(["config", "--quiet"]);
    console.log("Database Compose configs are valid.");
}

function printHelp() {
    console.log(`Usage from services/db: yarn <script>

Verification:
  yarn verify

Local infrastructure:
  yarn infra:start
  yarn infra:start:verbose
  yarn infra:start:detached
  yarn infra:status
  yarn infra:stop
  yarn infra:clean
  yarn infra:logs
  yarn infra:logs:infra
  yarn infra:dashboard
  yarn infra:db

API test database:
  yarn api:test:env
  yarn api:test:db:start
  yarn api:test:db:wait
  yarn api:test:db:stop
`);
}

async function main() {
    switch (command) {
        case "verify":
            await verifyDatabaseConfigs();
            break;
        case "infra:start":
            await dockerCompose(["up", "--build", "--attach", "db", "--attach", "studio", "--attach", "kong", "--attach", "rest", "--attach", "meta"]);
            break;
        case "infra:start:verbose":
            await dockerCompose(["up", "--build"]);
            break;
        case "infra:start:detached":
            await dockerCompose(["up", "--build", "-d"]);
            break;
        case "infra:status":
            await dockerCompose(["ps"]);
            break;
        case "infra:stop":
            await dockerCompose(["down"]);
            break;
        case "infra:clean":
            await dockerCompose(["down", "-v"]);
            break;
        case "infra:logs":
            await dockerCompose(["logs", "-f"]);
            break;
        case "infra:logs:infra":
            await dockerCompose(["logs", "-f", "db", "studio", "kong", "rest", "meta"]);
            break;
        case "infra:dashboard":
            printDashboardUrl();
            break;
        case "infra:db":
            await dockerCompose(["exec", "db", "psql", "-U", "postgres"]);
            break;
        case "api:test:env":
            await generateApiTestEnv();
            break;
        case "api:test:db:start":
            await startApiTestDb();
            break;
        case "api:test:db:wait":
            await waitForApiTestDb();
            break;
        case "api:test:db:stop":
            await stopApiTestDb();
            break;
        case "help":
        case "--help":
        case "-h":
            printHelp();
            break;
        default:
            console.error(`Unknown command: ${command}`);
            printHelp();
            process.exitCode = 1;
            break;
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
