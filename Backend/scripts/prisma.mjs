import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const prismaDirectory = path.dirname(require.resolve("prisma/package.json"));
let engineBinary = process.env.PRISMA_SCHEMA_ENGINE_BINARY;

if (!engineBinary) {
  try {
    const enginesPackage = require.resolve("@prisma/engines/package.json", {
      paths: [prismaDirectory],
    });
    const enginesDirectory = path.dirname(enginesPackage);
    const engineName = readdirSync(enginesDirectory).find((name) =>
      /^schema-engine.*(?:\.exe)?$/.test(name),
    );
    if (engineName) engineBinary = path.join(enginesDirectory, engineName);
  } catch {
    // Prisma will use its normal engine resolution and download behavior.
  }
}

const prismaCli = require.resolve("prisma/build/index.js");
const child = spawn(process.execPath, [prismaCli, ...process.argv.slice(2)], {
  env: {
    ...process.env,
    ...(engineBinary ? { PRISMA_SCHEMA_ENGINE_BINARY: engineBinary } : {}),
  },
  shell: false,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`No se pudo iniciar Prisma: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
