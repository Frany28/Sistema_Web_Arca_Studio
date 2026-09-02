import jsdoc from "eslint-plugin-jsdoc";

const documentedFunctionContexts = [
  "FunctionDeclaration",
  "MethodDefinition",
  'VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
  'VariableDeclarator[id.type="Identifier"] > FunctionExpression',
  'Property[kind="init"][method=true] > FunctionExpression',
  'Property[kind="init"] > ArrowFunctionExpression',
];

/**
 * Localiza el bloque JSDoc asociado directamente con una función o método.
 * Evita aceptar comentarios separados de la declaración por código ejecutable.
 *
 * @param {import("eslint").Rule.RuleContext} context - Contexto entregado por ESLint.
 * @param {import("estree").Node} node - Nodo de la función que se está validando.
 * @returns {import("estree").Comment | undefined} Comentario JSDoc contiguo, si existe.
 */
function getAdjacentJsdoc(context, node) {
  const sourceCode = context.sourceCode;
  const comment = sourceCode.getCommentsBefore(node).at(-1);
  if (!comment || comment.type !== "Block" || !comment.value.startsWith("*")) return undefined;

  const between = sourceCode.text.slice(comment.range[1], node.range[0]);
  return between.trim() === "" ? comment : undefined;
}

/**
 * Cuenta las líneas descriptivas ubicadas antes de las etiquetas del JSDoc.
 * Ignora delimitadores, asteriscos decorativos y líneas vacías del bloque.
 *
 * @param {import("estree").Comment} comment - Comentario JSDoc que se desea inspeccionar.
 * @returns {number} Cantidad de líneas que forman la explicación inicial.
 */
function countDescriptionLines(comment) {
  const lines = comment.value.slice(1).split(/\r?\n/);
  let count = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/^\s*\*?\s?/, "").trim();
    if (line.startsWith("@")) break;
    if (line) count += 1;
  }

  return count;
}

const localDocumentationPlugin = {
  rules: {
    "description-lines": {
      meta: {
        type: "suggestion",
        docs: { description: "Exige descripciones JSDoc breves de dos o tres líneas." },
        schema: [],
        messages: {
          invalidLength: "La descripción JSDoc debe contener dos o tres líneas explicativas.",
        },
      },
      create(context) {
        /**
         * Comprueba la extensión de la descripción asociada con una declaración.
         * Delega en require-jsdoc el reporte cuando el bloque todavía no existe.
         *
         * @param {import("estree").Node} node - Función o método visitado por ESLint.
         * @returns {void}
         */
        function validateDescriptionLength(node) {
          const comment = getAdjacentJsdoc(context, node);
          if (!comment) return;

          const lines = countDescriptionLines(comment);
          if (lines < 2 || lines > 3) {
            context.report({ node, messageId: "invalidLength" });
          }
        }

        return Object.fromEntries(
          documentedFunctionContexts.map((selector) => [selector, validateDescriptionLength]),
        );
      },
    },
  },
};

export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { range: true },
    },
    plugins: {
      jsdoc,
      "arca-docs": localDocumentationPlugin,
    },
    rules: {
      "arca-docs/description-lines": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/require-description": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-returns-type": "error",
      "jsdoc/require-jsdoc": [
        "error",
        {
          contexts: documentedFunctionContexts,
          enableFixer: false,
          exemptEmptyFunctions: false,
          publicOnly: false,
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: false,
            ClassExpression: false,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
          },
        },
      ],
      "jsdoc/valid-types": "error",
    },
  },
];
