import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const { addEnvironmentComment } = await import(
  "../src/services/environmentCommentService.js"
);

test("environment observations are created without requiring a project", async () => {
  const expectedComment = {
    content: "Comentario general del entorno",
    id: 41,
    parentCommentId: null,
    projectId: null,
    scope: "environment",
  };
  let receivedInput;

  const result = await addEnvironmentComment(
    {
      content: expectedComment.content,
      parentCommentId: null,
      user: { id: 7, role: { code: "client" } },
    },
    {
      createComment: async (input) => {
        receivedInput = input;
        return expectedComment;
      },
    },
  );

  assert.deepEqual(receivedInput, {
    content: expectedComment.content,
    parentCommentId: null,
    user: { id: 7, role: { code: "client" } },
  });
  assert.equal(result, expectedComment);
});

test("environment replies preserve the selected parent conversation", async () => {
  let receivedInput;

  await addEnvironmentComment(
    {
      content: "Respuesta",
      parentCommentId: 23,
      user: { id: 8, role: { code: "architect" } },
    },
    {
      createComment: async (input) => {
        receivedInput = input;
        return { id: 24, parentCommentId: 23 };
      },
    },
  );

  assert.equal(receivedInput.parentCommentId, 23);
});

test("an unavailable parent produces the domain not-found error", async () => {
  await assert.rejects(
    addEnvironmentComment(
      {
        content: "Respuesta",
        parentCommentId: 999,
        user: { id: 8, role: { code: "architect" } },
      },
      { createComment: async () => null },
    ),
    {
      code: "ENVIRONMENT_COMMENT_NOT_FOUND",
      status: 404,
    },
  );
});
