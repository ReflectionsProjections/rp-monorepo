#!/usr/bin/env node
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dbDir = path.join(rootDir, "services", "db");
const apiDir = path.join(rootDir, "services", "api");
const webDir = path.join(rootDir, "apps", "web");
const mobileDir = path.join(rootDir, "apps", "mobile");
const command = process.argv[2] ?? "help";
let activeChild;
let apiTestCleanupPromise;

function run(executable, args, options = {}) {
    const { cwd = rootDir, env = process.env, stdio = "inherit", allowFailure = false } = options;

    return new Promise((resolve, reject) => {
        const child = spawn(executable, args, { cwd, env, stdio, shell: false });
        activeChild = child;

        child.on("error", (error) => {
            if (activeChild === child) {
                activeChild = undefined;
            }

            if (allowFailure) {
                resolve(1);
                return;
            }

            reject(error);
        });

        child.on("close", (code, signal) => {
            if (activeChild === child) {
                activeChild = undefined;
            }

            if (code === 0) {
                resolve(0);
                return;
            }

            if (allowFailure) {
                resolve(code ?? 1);
                return;
            }

            reject(new Error(`${executable} ${args.join(" ")} failed with ${signal ?? `exit code ${code}`}`));
        });
    });
}

function runDbScript(script, options = {}) {
    return run("yarn", [script], { cwd: dbDir, ...options });
}

function signalExitCode(signal) {
    switch (signal) {
        case "SIGINT":
            return 130;
        case "SIGTERM":
            return 143;
        case "SIGHUP":
            return 129;
        default:
            return 1;
    }
}

function killProcess(child, signal = "SIGTERM") {
    try {
        child.kill(signal);
    } catch {
        // The child may already have exited.
    }
}

async function stopApiTestDbOnce(reason) {
    if (!apiTestCleanupPromise) {
        if (reason) {
            console.error(reason);
        }
        apiTestCleanupPromise = runDbScript("api:test:db:stop", { allowFailure: true });
    }

    await apiTestCleanupPromise;
}

function installApiTestSignalHandlers() {
    const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
    const handlers = new Map();

    for (const signal of signals) {
        const handler = () => {
            console.error(`Received ${signal}; stopping API test database stack.`);
            if (activeChild && !activeChild.killed) {
                killProcess(activeChild, signal);
            }

            stopApiTestDbOnce()
                .catch((error) => {
                    console.error(error.message);
                })
                .finally(() => {
                    process.exit(signalExitCode(signal));
                });
        };

        handlers.set(signal, handler);
        process.once(signal, handler);
    }

    return () => {
        for (const [signal, handler] of handlers) {
            process.off(signal, handler);
        }
    };
}

async function runApiTests() {
    let testExitCode = 0;
    apiTestCleanupPromise = undefined;
    const removeSignalHandlers = installApiTestSignalHandlers();

    try {
        await runDbScript("api:test:env");
        await runDbScript("api:test:db:start");
        await runDbScript("api:test:db:wait");
        testExitCode = await run("yarn", ["test"], { cwd: apiDir, allowFailure: true });
    } finally {
        removeSignalHandlers();
        await stopApiTestDbOnce();
    }

    process.exitCode = testExitCode;
}

function installProcessGroupSignalHandlers(children) {
    const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
    const handlers = new Map();

    for (const signal of signals) {
        const handler = () => {
            console.error(`Received ${signal}; stopping child processes.`);
            for (const child of children) {
                if (!child.killed) {
                    killProcess(child, signal);
                }
            }
            process.exit(signalExitCode(signal));
        };

        handlers.set(signal, handler);
        process.once(signal, handler);
    }

    return () => {
        for (const [signal, handler] of handlers) {
            process.off(signal, handler);
        }
    };
}

async function runProcessGroup(processes, options = {}) {
    const { startInfra = true } = options;

    if (startInfra) {
        await runDbScript("infra:start:detached");
    }

    const children = processes.map(({ name, executable, args, cwd, env }) => {
        console.log(`Starting ${name}: ${executable} ${args.join(" ")}`);
        return spawn(executable, args, {
            cwd,
            env: env ?? process.env,
            stdio: "inherit",
            shell: false,
        });
    });

    const removeSignalHandlers = installProcessGroupSignalHandlers(children);

    await new Promise((resolve) => {
        let settled = false;

        for (const child of children) {
            child.on("error", (error) => {
                if (settled) {
                    return;
                }

                settled = true;
                console.error(error.message);
                for (const otherChild of children) {
                    if (otherChild !== child && !otherChild.killed) {
                        killProcess(otherChild);
                    }
                }
                process.exitCode = 1;
                resolve();
            });

            child.on("close", (code, signal) => {
                if (settled) {
                    return;
                }

                settled = true;
                for (const otherChild of children) {
                    if (otherChild !== child && !otherChild.killed) {
                        killProcess(otherChild);
                    }
                }
                process.exitCode = code ?? signalExitCode(signal);
                resolve();
            });
        }
    });

    removeSignalHandlers();
}

const appProcesses = {
    api: {
        name: "API",
        executable: "yarn",
        args: ["dev"],
        cwd: apiDir,
    },
    web: {
        name: "Web",
        executable: "yarn",
        args: ["dev"],
        cwd: webDir,
    },
    mobile: {
        name: "Mobile",
        executable: "yarn",
        args: ["start"],
        cwd: mobileDir,
    },
};

function webEnv(overrides) {
    return {
        ...process.env,
        ...overrides,
    };
}

const productionWebEnv = webEnv({
    ENV: "PRODUCTION",
    VITE_ENV: "PRODUCTION",
    VITE_API_BASE_URL: "https://api.reflectionsprojections.org",
    VITE_WS_BASE_URL: "wss://api.reflectionsprojections.org",
});

const localWebEnv = webEnv({
    ENV: "DEVELOPMENT",
    VITE_ENV: "DEVELOPMENT",
    VITE_API_BASE_URL: "http://localhost:3000",
    VITE_WS_BASE_URL: "ws://localhost:3000",
});

const webWithProductionApi = {
    ...appProcesses.web,
    name: "Web (production API)",
    env: productionWebEnv,
};

const webWithLocalApi = {
    ...appProcesses.web,
    name: "Web (local API)",
    env: localWebEnv,
};

function printHelp() {
    console.log(`Usage from repo root: yarn <script>

Cross-service workflows:
  yarn api:test
  yarn dev:web
  yarn dev:api
  yarn dev:api:web
  yarn dev:api:mobile
  yarn dev:all

Database-only commands live in services/db:
  cd services/db && yarn infra:status
  cd services/db && yarn infra:dashboard
  cd services/db && yarn api:test:db:start
`);
}

async function main() {
    switch (command) {
        case "api:test":
            await runApiTests();
            break;
        case "dev:web":
            await runProcessGroup([webWithProductionApi], { startInfra: false });
            break;
        case "dev:api":
            await runProcessGroup([appProcesses.api]);
            break;
        case "dev:api:web":
            await runProcessGroup([appProcesses.api, webWithLocalApi]);
            break;
        case "dev:api:mobile":
            await runProcessGroup([appProcesses.api, appProcesses.mobile]);
            break;
        case "dev:all":
            await runProcessGroup([appProcesses.api, webWithLocalApi, appProcesses.mobile]);
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
