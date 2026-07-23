import assert from "node:assert/strict";
import test from "node:test";

import {
  publishProjectEvent,
  subscribeToProjectEvents,
} from "../src/services/projectEvents.js";

test("project SSE events sanitize private resource links", () => {
  const chunks = [];
  const response = {
    destroyed: false,
    end() {},
    on() {},
    writableEnded: false,
    write(chunk) {
      chunks.push(chunk);
    },
  };
  const unsubscribe = subscribeToProjectEvents({
    projectId: 987654,
    response,
    userId: 987654,
  });

  try {
    publishProjectEvent({
      eventName: "project.comment.created",
      payload: {
        comment: {
          content: "Revisar plano",
          file_url: "s3://private-bucket/projects/1/file.png",
          selection: {
            src: "/api/projects/1/files/4/content",
            x: 0.5,
          },
        },
      },
      projectId: 987654,
    });
  } finally {
    unsubscribe();
  }

  const stream = chunks.join("");
  assert.match(stream, /"content":"Revisar plano"/);
  assert.match(stream, /"x":0.5/);
  assert.doesNotMatch(stream, /file_url|s3:\/\/|\/files\/4\/content|src/);
});
