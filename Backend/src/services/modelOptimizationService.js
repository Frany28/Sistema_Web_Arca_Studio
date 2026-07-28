import { createRequire } from "node:module";
import { open, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import { AppError } from "../errors/appError.js";

const require = createRequire(import.meta.url);
const MAX_OUTPUT_BYTES = Number(
  process.env.MODEL_OUTPUT_MAX_BYTES || 50 * 1024 * 1024,
);
const COMMAND_TIMEOUT_MS = Number(
  process.env.MODEL_OPTIMIZATION_TIMEOUT_MS || 180000,
);
const JSON_CHUNK_TYPE = 0x4e4f534a;
const GLB_MAGIC = "glTF";
const SUPPORTED_REQUIRED_EXTENSIONS = new Set([
  "EXT_mesh_gpu_instancing",
  "EXT_meshopt_compression",
  "EXT_texture_webp",
  "KHR_draco_mesh_compression",
  "KHR_materials_clearcoat",
  "KHR_materials_emissive_strength",
  "KHR_materials_ior",
  "KHR_materials_iridescence",
  "KHR_materials_pbrSpecularGlossiness",
  "KHR_materials_sheen",
  "KHR_materials_specular",
  "KHR_materials_transmission",
  "KHR_materials_unlit",
  "KHR_materials_variants",
  "KHR_materials_volume",
  "KHR_mesh_quantization",
  "KHR_texture_basisu",
  "KHR_texture_transform",
]);

export class ModelProcessingError extends AppError {
  constructor(code, message, { permanent = true, cause } = {}) {
    super({ code, message, status: 422, cause });
    this.permanent = permanent;
  }
}

function getCliPath() {
  const entryPath = require.resolve("@gltf-transform/cli");
  return path.join(path.dirname(path.dirname(entryPath)), "bin", "cli.js");
}

function collectOutput(target, chunk) {
  if (target.length >= 20) return;
  target.push(String(chunk).slice(0, 2000));
}

export function runGltfTransform(args, { timeoutMs = COMMAND_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    const output = [];
    const child = spawn(process.execPath, [getCliPath(), ...args], {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    const timeout = setTimeout(() => {
      child.kill();
      reject(
        new ModelProcessingError(
          "MODEL_OPTIMIZATION_TIMEOUT",
          "La optimización del modelo agotó el tiempo disponible.",
          { permanent: false },
        ),
      );
    }, timeoutMs);

    child.stdout.on("data", (chunk) => collectOutput(output, chunk));
    child.stderr.on("data", (chunk) => collectOutput(output, chunk));
    child.once("error", (cause) => {
      clearTimeout(timeout);
      reject(
        new ModelProcessingError(
          "MODEL_OPTIMIZER_UNAVAILABLE",
          "El optimizador de modelos no está disponible.",
          { cause, permanent: false },
        ),
      );
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);

      if (code === 0) {
        resolve(output.join(""));
        return;
      }

      reject(
        new ModelProcessingError(
          "MODEL_OPTIMIZATION_FAILED",
          "No se pudo optimizar el modelo 3D.",
          { permanent: false },
        ),
      );
    });
  });
}

async function readGlbJson(fileHandle) {
  const chunkHeader = Buffer.alloc(8);
  const headerRead = await fileHandle.read(chunkHeader, 0, 8, 12);

  if (headerRead.bytesRead !== 8) {
    throw new ModelProcessingError(
      "INVALID_GLB",
      "El archivo no contiene una estructura GLB válida.",
    );
  }

  const chunkLength = chunkHeader.readUInt32LE(0);
  const chunkType = chunkHeader.readUInt32LE(4);

  if (chunkType !== JSON_CHUNK_TYPE || chunkLength <= 0) {
    throw new ModelProcessingError(
      "INVALID_GLB",
      "El archivo no contiene el bloque JSON requerido.",
    );
  }

  const jsonBuffer = Buffer.alloc(chunkLength);
  const jsonRead = await fileHandle.read(jsonBuffer, 0, chunkLength, 20);

  if (jsonRead.bytesRead !== chunkLength) {
    throw new ModelProcessingError(
      "INVALID_GLB",
      "El bloque JSON del modelo está incompleto.",
    );
  }

  try {
    return JSON.parse(jsonBuffer.toString("utf8").replace(/\0+$/u, "").trim());
  } catch (cause) {
    throw new ModelProcessingError(
      "INVALID_GLB",
      "El bloque JSON del modelo no es válido.",
      { cause },
    );
  }
}

export async function validateGlbContainer(
  filePath,
  { enforceSizeLimit = false } = {},
) {
  const fileStats = await stat(filePath);

  if (
    fileStats.size <= 0 ||
    (enforceSizeLimit && fileStats.size > MAX_OUTPUT_BYTES)
  ) {
    throw new ModelProcessingError(
      fileStats.size <= 0 ? "INVALID_GLB" : "MODEL_OUTPUT_TOO_LARGE",
      fileStats.size <= 0
        ? "El archivo GLB está vacío."
        : "El modelo optimizado supera el límite de 50 MB.",
    );
  }

  const fileHandle = await open(filePath, "r");

  try {
    const header = Buffer.alloc(12);
    const headerRead = await fileHandle.read(header, 0, 12, 0);

    if (
      headerRead.bytesRead !== 12 ||
      header.toString("ascii", 0, 4) !== GLB_MAGIC ||
      header.readUInt32LE(4) !== 2 ||
      header.readUInt32LE(8) !== fileStats.size
    ) {
      throw new ModelProcessingError(
        "INVALID_GLB",
        "El archivo no es un contenedor GLB versión 2 válido.",
      );
    }

    const json = await readGlbJson(fileHandle);
    const unsupported = (json.extensionsRequired || []).filter(
      (extension) => !SUPPORTED_REQUIRED_EXTENSIONS.has(extension),
    );

    if (unsupported.length > 0) {
      throw new ModelProcessingError(
        "UNSUPPORTED_GLB_EXTENSION",
        "El modelo requiere extensiones que el visor web no admite.",
      );
    }

    return {
      extensionsRequired: json.extensionsRequired || [],
      size: fileStats.size,
    };
  } finally {
    await fileHandle.close();
  }
}

export function getModelOptimizationStages({
  inputPath,
  workDirectory,
}) {
  return [
    {
      commands: [
        [
          "optimize",
          inputPath,
          path.join(workDirectory, "stage-1.glb"),
          "--compress",
          "meshopt",
          "--meshopt-level",
          "high",
          "--simplify",
          "true",
          "--simplify-error",
          "0.0001",
          "--texture-compress",
          "auto",
          "--texture-size",
          "2048",
        ],
      ],
      outputPath: path.join(workDirectory, "stage-1.glb"),
    },
    {
      commands: [
        [
          "webp",
          path.join(workDirectory, "stage-1.glb"),
          path.join(workDirectory, "stage-2.glb"),
          "--quality",
          "85",
          "--effort",
          "80",
        ],
      ],
      outputPath: path.join(workDirectory, "stage-2.glb"),
    },
    {
      commands: [
        [
          "optimize",
          inputPath,
          path.join(workDirectory, "stage-3-geometry.glb"),
          "--compress",
          "meshopt",
          "--meshopt-level",
          "high",
          "--simplify",
          "true",
          "--simplify-error",
          "0.001",
          "--texture-compress",
          "false",
        ],
        [
          "resize",
          path.join(workDirectory, "stage-3-geometry.glb"),
          path.join(workDirectory, "stage-3-resized.glb"),
          "--width",
          "1024",
          "--height",
          "1024",
        ],
        [
          "webp",
          path.join(workDirectory, "stage-3-resized.glb"),
          path.join(workDirectory, "stage-3.glb"),
          "--quality",
          "82",
          "--effort",
          "80",
        ],
      ],
      outputPath: path.join(workDirectory, "stage-3.glb"),
    },
  ];
}

export async function optimizeModelFile({
  inputPath,
  runCommand = runGltfTransform,
  workDirectory,
}) {
  await validateGlbContainer(inputPath);

  for (const stage of getModelOptimizationStages({
    inputPath,
    workDirectory,
  })) {
    for (const command of stage.commands) {
      await runCommand(command);
    }

    const result = await validateGlbContainer(stage.outputPath);

    if (result.size <= MAX_OUTPUT_BYTES) {
      await runCommand(["validate", stage.outputPath, "--limit", "100"]);
      await validateGlbContainer(stage.outputPath, {
        enforceSizeLimit: true,
      });

      return {
        outputPath: stage.outputPath,
        outputSize: result.size,
      };
    }
  }

  throw new ModelProcessingError(
    "MODEL_OUTPUT_TOO_LARGE",
    "El modelo no pudo reducirse al límite de 50 MB sin superar el piso de calidad.",
  );
}
