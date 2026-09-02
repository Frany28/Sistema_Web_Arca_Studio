import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint, Linter } from "eslint";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contexts = [
  "FunctionDeclaration",
  "MethodDefinition",
  'VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
  'VariableDeclarator[id.type="Identifier"] > FunctionExpression',
  'Property[kind="init"][method=true] > FunctionExpression',
  'Property[kind="init"] > ArrowFunctionExpression',
];

const subjects = new Map([
  ["admin assignee profile photo", "la foto de perfil del responsable administrativo"],
  ["admin assignees", "los responsables disponibles para administración"],
  ["admin dashboard metrics", "las métricas del panel administrativo"],
  ["admin dashboard overview", "el resumen del panel administrativo"],
  ["admin projects", "los proyectos gestionados desde administración"],
  ["admin user details", "el detalle de un usuario administrado"],
  ["admin user notes page", "la página de notas de un usuario administrado"],
  ["admin user note", "una nota de usuario administrado"],
  ["admin user profile photo", "la foto de perfil de un usuario administrado"],
  ["admin user status record", "el estado persistido de un usuario administrado"],
  ["admin users page", "la página de usuarios administrados"],
  ["address suggestions", "las sugerencias de dirección"],
  ["allowed headers", "los encabezados permitidos por CORS"],
  ["allowed origins", "los orígenes permitidos por CORS"],
  ["assigned architect profile photo", "la foto de perfil del arquitecto asignado"],
  ["auth cookie config", "la configuración de la cookie de autenticación"],
  ["bearer token", "el token Bearer de la solicitud"],
  ["cached user", "el usuario almacenado en caché"],
  ["comment author", "el autor público del comentario"],
  ["compatibility", "la compatibilidad de la solicitud de proyecto"],
  ["compatibility level", "el nivel de compatibilidad"],
  ["cookie", "la cookie HTTP"],
  ["cors options", "las opciones de CORS"],
  ["dashboard metrics", "las métricas del panel"],
  ["dashboard overview", "el resumen del panel"],
  ["document comment", "el comentario de documento"],
  ["document comments", "los comentarios de documento"],
  ["environment comment", "el comentario de entorno"],
  ["environment comment access", "los permisos sobre comentarios de entorno"],
  ["environment comment author profile photo", "la foto del autor del comentario de entorno"],
  ["environment comments", "los comentarios de entorno"],
  ["existing project file", "el archivo existente del proyecto"],
  ["existing project name for client", "un nombre de proyecto ya usado por el cliente"],
  ["existing project request file", "el archivo existente de la solicitud"],
  ["exposed headers", "los encabezados expuestos por CORS"],
  ["file extension", "la extensión segura del archivo"],
  ["file type", "el tipo funcional del archivo"],
  ["file upload", "los datos públicos del archivo cargado"],
  ["frontend base url", "la URL base del frontend"],
  ["frontend url", "la URL del frontend"],
  ["mail from", "el remitente configurado del correo"],
  ["pool stats", "las estadísticas del pool de PostgreSQL"],
  ["profile photo content type", "el tipo MIME permitido para la foto de perfil"],
  ["profile photo object", "el objeto almacenado de la foto de perfil"],
  ["project access condition", "la condición SQL de acceso al proyecto"],
  ["project comment", "el comentario del proyecto"],
  ["project comment author profile photo", "la foto del autor del comentario de proyecto"],
  ["project comments", "los comentarios del proyecto"],
  ["project detail", "el detalle del proyecto"],
  ["project event capacity", "la capacidad de conexiones de eventos del proyecto"],
  ["project file", "el archivo del proyecto"],
  ["project file cache headers", "los encabezados de caché del archivo de proyecto"],
  ["project file object", "el objeto almacenado del archivo de proyecto"],
  ["project read only error", "el error de proyecto de solo lectura"],
  ["project request", "la solicitud de proyecto"],
  ["project request attachment", "el adjunto de la solicitud de proyecto"],
  ["project request decision", "la decisión sobre la solicitud de proyecto"],
  ["project request draft", "el borrador de solicitud de proyecto"],
  ["project request file", "el archivo de la solicitud de proyecto"],
  ["project request file usage", "el uso de archivos de la solicitud"],
  ["project request review", "la revisión de la solicitud de proyecto"],
  ["project request review queue", "la cola de revisión de solicitudes"],
  ["project request workflow", "el flujo de revisión de solicitudes"],
  ["project requests", "las solicitudes de proyecto"],
  ["projects", "los proyectos accesibles"],
  ["public compatibility", "la evaluación pública de compatibilidad"],
  ["public project request", "la representación pública de la solicitud"],
  ["public test user", "el usuario público de pruebas"],
  ["registration email payload", "los datos del correo de registro"],
  ["registration token", "el token de registro"],
  ["request origin", "el origen declarado por la solicitud"],
  ["reset token", "el token de restablecimiento"],
  ["role permission boundaries", "las matrices de permisos por rol"],
  ["role permission boundary", "la matriz de permisos de un rol"],
  ["role permissions", "los permisos asociados con un rol"],
  ["roles", "los roles del sistema"],
  ["permissions", "los permisos del sistema"],
  ["session", "la sesión autenticada"],
  ["storage file name", "el nombre seguro para almacenamiento"],
  ["storage file url", "la URL pública del archivo almacenado"],
  ["storage object key", "la clave del objeto en almacenamiento"],
  ["supabase s3 client", "el cliente S3 compatible de Supabase"],
  ["supabase storage config", "la configuración de almacenamiento Supabase"],
  ["support request", "la solicitud de soporte"],
  ["support request attachment", "el adjunto de la solicitud de soporte"],
  ["user", "el usuario"],
  ["user session cache", "la caché de sesiones de usuario"],
]);

const wordTranslations = {
  admin: "administrativo", assignee: "responsable", assignees: "responsables",
  auth: "autenticación", cache: "caché", client: "cliente", comment: "comentario",
  comments: "comentarios", config: "configuración", content: "contenido", cookie: "cookie",
  dashboard: "panel", database: "base de datos", decision: "decisión", description: "descripción",
  document: "documento", email: "correo", environment: "entorno", error: "error",
  event: "evento", file: "archivo", files: "archivos", headers: "encabezados",
  level: "nivel", link: "enlace", list: "lista", mail: "correo", metadata: "metadatos",
  metrics: "métricas", name: "nombre", object: "objeto", origin: "origen", overview: "resumen",
  page: "página", password: "contraseña", payload: "datos", permission: "permiso",
  permissions: "permisos", photo: "foto", profile: "perfil", project: "proyecto",
  projects: "proyectos", public: "público", registration: "registro", request: "solicitud",
  requests: "solicitudes", reset: "restablecimiento", role: "rol", score: "puntuación",
  session: "sesión", status: "estado", storage: "almacenamiento", support: "soporte",
  token: "token", type: "tipo", upload: "carga", user: "usuario", users: "usuarios",
  workflow: "flujo", url: "URL", value: "valor", boundary: "matriz", record: "registro",
};

const actionDefinitions = [
  ["assert", "Comprueba", "y rechaza la operación cuando no se cumple"],
  ["archive", "Archiva", "y conserva su historial sin eliminarlo físicamente"],
  ["begin", "Inicia", "y actualiza el estado compartido necesario"],
  ["build", "Construye", "a partir de datos previamente validados"],
  ["cache", "Guarda", "para reutilizarlo durante solicitudes posteriores"],
  ["can", "Determina si se permite", "según las reglas de acceso vigentes"],
  ["change", "Cambia", "aplicando las reglas de negocio correspondientes"],
  ["clear", "Vacía", "para evitar reutilizar información obsoleta"],
  ["close", "Cierra", "y libera los recursos asociados"],
  ["compatibility", "Clasifica", "a partir de la puntuación calculada"],
  ["consume", "Consume", "de forma que no pueda volver a utilizarse"],
  ["create", "Crea", "con los datos validados recibidos"],
  ["decode", "Decodifica", "y valida que conserve la estructura esperada"],
  ["delete", "Elimina", "después de comprobar acceso y existencia"],
  ["enabled", "Determina si está habilitado", "según la configuración del entorno"],
  ["encode", "Codifica", "en una representación segura para transporte"],
  ["escape", "Escapa", "para impedir que se interprete como contenido HTML"],
  ["evaluate", "Evalúa", "aplicando las reglas y ponderaciones del dominio"],
  ["execute", "Ejecuta", "y registra la información operativa relevante"],
  ["find", "Busca", "y devuelve null cuando no existe un registro accesible"],
  ["frontend", "Obtiene", "desde la configuración del entorno"],
  ["get", "Obtiene", "para que el flujo llamador pueda continuar"],
  ["group", "Agrupa", "en una estructura útil para sus consumidores"],
  ["hash", "Calcula la huella de", "para compararlo sin conservar el valor original"],
  ["invalidate", "Invalida", "para impedir que se reutilicen datos desactualizados"],
  ["is", "Determina si", "cumple la condición esperada"],
  ["list", "Lista", "respetando el alcance y la paginación solicitados"],
  ["load", "Carga", "y deja el resultado disponible para el flujo actual"],
  ["map", "Transforma", "a la representación estable utilizada por la aplicación"],
  ["me", "Devuelve", "como respuesta HTTP para la sesión actual"],
  ["merge", "Combina", "eliminando valores repetidos"],
  ["normalize", "Normaliza", "para mantener un formato interno consistente"],
  ["original", "Obtiene", "desde los encabezados o valores alternativos disponibles"],
  ["page", "Construye", "incluyendo el cursor necesario para continuar la consulta"],
  ["parse", "Interpreta", "y descarta los formatos que no sean válidos"],
  ["post", "Procesa la creación de", "y construye la respuesta HTTP correspondiente"],
  ["prepare", "Prepara", "validando metadatos antes de iniciar la transferencia"],
  ["publish", "Publica", "a todas las conexiones suscritas que sigan activas"],
  ["replace", "Reemplaza", "de forma atómica con los valores solicitados"],
  ["require", "Exige", "y detiene el flujo cuando la condición no se cumple"],
  ["resend", "Reenvía", "generando credenciales temporales nuevas cuando corresponde"],
  ["reset", "Restablece", "después de validar la credencial temporal"],
  ["resolve", "Resuelve", "a partir de la solicitud y la configuración disponible"],
  ["run", "Ejecuta", "coordinando la operación y la limpieza ante fallos"],
  ["sanitize", "Sanea", "antes de exponerlo fuera del backend"],
  ["search", "Busca", "mediante el proveedor externo configurado"],
  ["send", "Envía", "y traduce los fallos externos al contrato de errores"],
  ["serialize", "Serializa", "con los atributos HTTP solicitados"],
  ["slugify", "Convierte", "en un identificador legible y seguro para URL"],
  ["start", "Inicia", "y conserva el estado necesario para completarlo después"],
  ["stream", "Transmite", "sin cargar el contenido completo en memoria"],
  ["submit", "Envía", "después de validar el estado y las reglas aplicables"],
  ["subscribe", "Suscribe", "y administra el ciclo de vida de la conexión"],
  ["to", "Transforma", "a la representación pública esperada"],
  ["ttl", "Calcula", "desde la configuración del entorno"],
  ["update", "Actualiza", "conservando las reglas de acceso e integridad"],
  ["upload", "Carga", "coordinando la persistencia y el almacenamiento"],
  ["valid", "Determina si es válida", "según las reglas del dominio"],
  ["validate", "Valida", "y genera un error cuando no cumple el contrato"],
  ["verify", "Verifica", "y rechaza valores vencidos o inconsistentes"],
];

function splitName(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
}

function describeSubject(rawSubject, fallbackName) {
  const normalized = splitName(rawSubject).trim();
  if (subjects.has(normalized)) return subjects.get(normalized);
  if (!normalized) return `la operación ${fallbackName}`;

  const translated = normalized.split(" ").map((word) => wordTranslations[word] || word).join(" ");
  return `el valor de ${translated}`;
}

function functionName(node) {
  if (node.type === "FunctionDeclaration") return node.id?.name || "función";
  if (node.type === "MethodDefinition") return node.key?.name || "método";
  const parent = node.parent;
  if (parent?.type === "VariableDeclarator") return parent.id?.name || "función";
  if (parent?.type === "Property") return parent.key?.name || parent.key?.value || "método";
  return "función";
}

function describeFunction(name, relativePath, node) {
  if (name === "constructor") {
    return [
      "Inicializa el error de aplicación con su contrato público y causa original.",
      "Conserva código, estado y campos para que el middleware construya la respuesta.",
    ];
  }
  if (name === "transform") {
    return [
      "Inspecciona los primeros bytes del flujo antes de permitir que continúe la carga.",
      "Valida la firma real del archivo y entrega cada fragmento sin acumularlo completo.",
    ];
  }
  if (name === "flush") {
    return [
      "Completa la inspección de firma cuando el flujo termina con pocos bytes.",
      "Libera el contenido retenido o informa el error de validación al pipeline.",
    ];
  }
  if (name === "origin") {
    return [
      "Decide si el origen de una solicitud puede acceder mediante CORS.",
      "Entrega la decisión al middleware sin exponer detalles internos de configuración.",
    ];
  }
  if (name === "config" && relativePath.endsWith("objectStorage.js")) {
    return [
      "Obtiene la configuración activa del adaptador de almacenamiento de objetos.",
      "Mantiene los detalles del proveedor fuera de los servicios consumidores.",
    ];
  }
  if (["put", "get", "delete"].includes(name) && relativePath.endsWith("objectStorage.js")) {
    const descriptions = {
      put: "Almacena un flujo o contenido en el proveedor S3 compatible.",
      get: "Recupera un objeto, completo o por rango, desde el proveedor configurado.",
      delete: "Elimina un objeto identificado por su clave del proveedor configurado.",
    };
    return [descriptions[name], "Encapsula los comandos del SDK para evitar acoplar al resto del backend."];
  }

  const normalizedName = splitName(name);
  const action = actionDefinitions.find(([prefix]) => normalizedName === prefix || normalizedName.startsWith(`${prefix} `));
  const [prefix, verb, detail] = action || ["", "Procesa", "para completar la responsabilidad asignada al módulo"];
  const rawSubject = prefix ? normalizedName.slice(prefix.length).trim() : normalizedName;
  const subject = describeSubject(rawSubject, name);
  const first = `${verb} ${subject} ${detail}.`.replace(/\s+/g, " ");

  const section = relativePath.split("/")[0];
  const layerDescriptions = {
    config: "Centraliza esta decisión para mantener consistente la configuración del backend.",
    controllers: "Coordina la solicitud HTTP, delega la lógica y construye la respuesta correspondiente.",
    domain: "Mantiene esta regla de dominio aislada de HTTP y de la persistencia.",
    errors: "Preserva el contrato de error que procesa el middleware global.",
    middlewares: "Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.",
    repositories: "Consulta o modifica PostgreSQL mediante parámetros y devuelve una representación estable.",
    services: "Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.",
    utils: "Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.",
    validation: "Se utiliza para normalizar entradas y construir contratos Zod reutilizables.",
  };
  return [first, layerDescriptions[section] || "Encapsula esta responsabilidad para reutilizarla de forma consistente."];
}

function documentationAnchor(node) {
  if (node.type === "FunctionDeclaration") {
    return node.parent?.type === "ExportNamedDeclaration" ? node.parent : node;
  }
  if (node.type === "MethodDefinition") return node;
  if (node.parent?.type === "Property") return node.parent;
  if (node.parent?.type === "VariableDeclarator") {
    const declaration = node.parent.parent;
    return declaration.parent?.type === "ExportNamedDeclaration" ? declaration.parent : declaration;
  }
  return node;
}

function hasAdjacentJsdoc(sourceCode, anchor) {
  const comment = sourceCode.getCommentsBefore(anchor).at(-1);
  if (!comment || comment.type !== "Block" || !comment.value.startsWith("*")) return false;
  return sourceCode.text.slice(comment.range[1], anchor.range[0]).trim() === "";
}

function inferType(name, node, asyncFunction = false) {
  const normalized = name.replace(/^_/, "").toLowerCase();
  let type = "unknown";
  if (["req", "request"].includes(normalized)) type = "import(\"express\").Request";
  else if (["res", "response"].includes(normalized)) type = "import(\"express\").Response";
  else if (["next", "callback", "mapper", "loader", "operation"].includes(normalized)) type = "Function";
  else if (normalized === "error" || normalized === "cause") type = "Error";
  else if (/ids$|codes$|values$|roles$|permissions$|rows$|issues$/.test(normalized)) type = "Array<unknown>";
  else if (/^(is|has|can|include|allow|enabled|secure)|active$|public$|valid$/.test(normalized)) type = "boolean";
  else if (/limit|max|count|size|length|score|statuscode|windowms|timeout|bytes|latitude|longitude/.test(normalized)) type = "number";
  else if (/id$|email|password|token|name|code|content|type|url|key|range|cursor|origin|header|text|slug|subject|description|role/.test(normalized)) type = "string";
  else if (node?.type === "ObjectPattern") type = "object";
  else if (node?.type === "ArrayPattern") type = "Array<unknown>";
  return asyncFunction ? `Promise<${type}>` : type;
}

function parameterDescription(name) {
  const descriptions = {
    req: "Solicitud HTTP con los datos previamente validados.",
    _req: "Solicitud HTTP que este controlador no necesita inspeccionar.",
    res: "Respuesta HTTP utilizada para devolver el resultado.",
    response: "Respuesta o conexión sobre la que se escribe el resultado.",
    next: "Función que entrega errores o continúa la cadena de middlewares.",
    user: "Usuario autenticado que ejecuta la operación.",
    payload: "Datos validados necesarios para completar la operación.",
    query: "Criterios de consulta y paginación solicitados.",
    row: "Fila obtenida desde PostgreSQL.",
    rows: "Filas obtenidas desde PostgreSQL.",
    error: "Error que debe evaluarse o traducirse.",
    context: "Contexto utilizado durante la validación.",
    options: "Opciones agrupadas necesarias para ejecutar la operación.",
    callback: "Función que recibe el resultado de la operación asíncrona.",
    operation: "Operación de persistencia o almacenamiento que debe ejecutarse.",
  };
  return descriptions[name] || `Valor de \`${name}\` requerido por esta operación.`;
}

function collectPatternEntries(pattern, rootName, entries, optional = false) {
  if (pattern.type === "Identifier") {
    entries.push({ name: rootName || pattern.name, node: pattern, optional });
    return;
  }
  if (pattern.type === "AssignmentPattern") {
    collectPatternEntries(pattern.left, rootName, entries, true);
    return;
  }
  if (pattern.type === "RestElement") {
    const restName = pattern.argument.name || rootName || "values";
    entries.push({ name: `...${restName}`, node: pattern.argument, optional });
    return;
  }
  if (pattern.type === "ObjectPattern") {
    entries.push({ name: rootName, node: pattern, optional });
    for (const property of pattern.properties) {
      if (property.type === "RestElement") continue;
      const key = property.key.name || property.key.value;
      const value = property.value.type === "AssignmentPattern" ? property.value.left : property.value;
      entries.push({ name: `${rootName}.${key}`, node: value, optional: property.value.type === "AssignmentPattern" });
    }
    return;
  }
  if (pattern.type === "ArrayPattern") entries.push({ name: rootName, node: pattern, optional });
}

function parameterEntries(node) {
  const entries = [];
  let objectIndex = 0;
  for (const parameter of node.value?.params || node.params || []) {
    if (parameter.type === "ObjectPattern" || (parameter.type === "AssignmentPattern" && parameter.left.type === "ObjectPattern")) {
      objectIndex += 1;
      collectPatternEntries(parameter, objectIndex === 1 ? "options" : `options${objectIndex}`, entries);
    } else if (parameter.type === "ArrayPattern") {
      objectIndex += 1;
      collectPatternEntries(parameter, `values${objectIndex}`, entries);
    } else {
      collectPatternEntries(parameter, null, entries);
    }
  }
  return entries;
}

function walk(node, visitor, skipRoot = false) {
  if (!node || typeof node !== "object") return;
  if (!skipRoot && /Function(?:Declaration|Expression)$|ArrowFunctionExpression/.test(node.type)) return;
  visitor(node);
  for (const [key, value] of Object.entries(node)) {
    if (["parent", "range", "loc"].includes(key)) continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, visitor));
    else walk(value, visitor);
  }
}

function returnInfo(node, name) {
  if (node.type === "MethodDefinition" && node.kind === "constructor") return null;
  const fn = node.type === "MethodDefinition" ? node.value : node;
  let returnNode = null;
  walk(fn.body, (candidate) => {
    if (candidate.type === "ReturnStatement" && candidate.argument && !returnNode) returnNode = candidate.argument;
  }, true);

  let type = "void";
  if (returnNode) {
    if (/^(is|has|can|valid|different|enabled)/.test(name)) type = "boolean";
    else if (returnNode.type === "ObjectExpression") type = "object";
    else if (returnNode.type === "ArrayExpression") type = "Array<unknown>";
    else if (["TemplateLiteral"].includes(returnNode.type)) type = "string";
    else if (returnNode.type === "Literal") type = typeof returnNode.value;
    else type = "unknown";
  }
  if (fn.async) type = `Promise<${type}>`;
  const description = type.includes("void") ? "Finalización de la operación." : "Resultado producido por la operación.";
  return { type, description };
}

function throwsError(node) {
  const fn = node.type === "MethodDefinition" ? node.value : node;
  let found = false;
  walk(fn.body, (candidate) => { if (candidate.type === "ThrowStatement") found = true; }, true);
  return found;
}

function buildJsdoc(node, relativePath, sourceCode, anchor) {
  const name = functionName(node);
  const descriptions = describeFunction(name, relativePath, node);
  const lineStart = sourceCode.text.lastIndexOf("\n", anchor.range[0] - 1) + 1;
  const indent = sourceCode.text.slice(lineStart, anchor.range[0]).match(/^\s*/)?.[0] || "";
  const lines = ["/**", ...descriptions.map((line) => ` * ${line}`)];
  const params = parameterEntries(node.type === "MethodDefinition" ? node.value : node);
  const returns = returnInfo(node, name);
  const hasTags = params.length > 0 || returns || throwsError(node);
  if (hasTags) lines.push(" *");

  for (const entry of params) {
    const cleanName = entry.name.replace(/^\.\.\./, "");
    const displayedName = entry.optional ? `[${entry.name}]` : entry.name;
    lines.push(` * @param {${inferType(cleanName, entry.node)}} ${displayedName} - ${parameterDescription(cleanName)}`);
  }
  if (returns) lines.push(` * @returns {${returns.type}} ${returns.description}`);
  if (throwsError(node)) lines.push(" * @throws {Error} Cuando una validación o dependencia impide completar la operación.");
  lines.push(" */");
  return `${lines.map((line) => `${indent}${line}`).join("\n")}\n`;
}

const eslint = new ESLint({ cwd: backendRoot });
const files = await eslint.lintFiles(["src/**/*.js"]);
const filePaths = files.map((result) => result.filePath).sort();

for (const filePath of filePaths) {
  const source = await readFile(filePath, "utf8");
  const targets = [];
  const linter = new Linter();
  const collectPlugin = {
    rules: {
      targets: {
        create(context) {
          return Object.fromEntries(contexts.map((selector) => [selector, (node) => targets.push({ node, sourceCode: context.sourceCode })]));
        },
      },
    },
  };
  linter.verify(source, [{
    languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { range: true } },
    plugins: { collect: collectPlugin },
    rules: { "collect/targets": "error" },
  }], { filename: filePath });

  const edits = [];
  const relativePath = path.relative(path.join(backendRoot, "src"), filePath).replaceAll("\\", "/");
  for (const { node, sourceCode } of targets) {
    const anchor = documentationAnchor(node);
    if (hasAdjacentJsdoc(sourceCode, anchor)) continue;
    edits.push({ start: anchor.range[0], text: buildJsdoc(node, relativePath, sourceCode, anchor) });
  }

  if (!edits.length) continue;
  edits.sort((a, b) => b.start - a.start);
  let output = source;
  for (const edit of edits) output = output.slice(0, edit.start) + edit.text + output.slice(edit.start);
  await writeFile(filePath, output, "utf8");
}
