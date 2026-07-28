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

test("document uploads accept modern Word and Excel formats", () => {
  const docx = prepareUpload(
    request({
      headers: {
        "content-length": "100",
        "content-type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "x-file-name": "memoria.docx",
      },
    }),
    uploadPolicies.document,
  );
  const xlsx = prepareUpload(
    request({
      headers: {
        "content-length": "100",
        "content-type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "x-file-name": "presupuesto.xlsx",
      },
    }),
    uploadPolicies.document,
  );

  assert.equal(docx.originalName, "memoria.docx");
  assert.equal(xlsx.originalName, "presupuesto.xlsx");
});

test("document uploads reject legacy Office and mismatched extensions", () => {
  assert.throws(
    () =>
      prepareUpload(
        request({
          headers: {
            "content-length": "100",
            "content-type": "application/msword",
            "x-file-name": "memoria.doc",
          },
        }),
        uploadPolicies.document,
      ),
    { code: "UNSUPPORTED_FILE_TYPE" },
  );
  assert.throws(
    () =>
      prepareUpload(
        request({
          headers: {
            "content-length": "100",
            "content-type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "x-file-name": "memoria.xlsx",
          },
        }),
        uploadPolicies.document,
      ),
    { code: "UNSUPPORTED_FILE_TYPE" },
  );
});

test("operation errors remain the primary upload error", async () => {
  const failure = new Error("database failed");
  await assert.rejects(() => runUpload({ req: request(), policy: uploadPolicies.document, operation: async () => { throw failure; } }), failure);
});
