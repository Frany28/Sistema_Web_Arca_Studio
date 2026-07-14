import assert from "node:assert/strict";
import test from "node:test";
import { prepareUpload, runUpload, uploadPolicies } from "../src/services/fileUploadService.js";

function request(overrides = {}) {
  return { destroyed: false, headers: { "content-length": "100", "content-type": "application/pdf", "x-file-name": "documento.pdf" }, ...overrides };
}

test("upload service validates once and passes the original stream", async () => {
  const req = request();
  const result = await runUpload({ req, policy: uploadPolicies.document, operation: async (upload) => upload });
  assert.equal(result.body, req);
  assert.equal(result.size, 100);
  assert.equal(result.originalName, "documento.pdf");
});

test("upload service rejects invalid types and aborted streams", async () => {
  assert.throws(() => prepareUpload(request({ headers: { "content-length": "100", "content-type": "application/x-msdownload", "x-file-name": "bad.exe" } }), uploadPolicies.document), { code: "UNSUPPORTED_FILE_TYPE" });
  await assert.rejects(() => runUpload({ req: request({ destroyed: true }), policy: uploadPolicies.document, operation: async () => null }), { code: "UPLOAD_ABORTED" });
});

test("operation errors remain the primary upload error", async () => {
  const failure = new Error("database failed");
  await assert.rejects(() => runUpload({ req: request(), policy: uploadPolicies.document, operation: async () => { throw failure; } }), failure);
});
