import http from "k6/http";
import { check, sleep } from "k6";
import { required, stages, thresholds, users } from "./config.js";

const baseUrl = required("BASE_URL");
const accounts = users();

export const options = { stages: stages(__ENV.PROFILE), thresholds };

function jsonHeaders(token) { return { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Origin: __ENV.FRONTEND_ORIGIN || baseUrl }; }
function ok(response, name) { check(response, { [`${name}: status esperado`]: (r) => r.status >= 200 && r.status < 400 }); }

export function setup() {
  const sessions = accounts.map((account) => {
    const response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({ email: account.email, password: account.password }), { headers: jsonHeaders("") , tags: { kind: "write", endpoint: "login" } });
    if (response.status !== 200) throw new Error(`Login failed for ${account.email}: ${response.status}`);
    return { ...account, token: response.json("token") };
  });
  return { sessions };
}

export default function (data) {
  const session = data.sessions[(__VU - 1) % data.sessions.length];
  const headers = jsonHeaders(session.token);
  const roll = Math.random() * 100;

  if (roll < 15) {
    ok(http.get(`${baseUrl}/api/auth/me`, { headers, tags: { kind: "json", endpoint: "session" } }), "sesion");
  } else if (roll < 50) {
    const list = http.get(`${baseUrl}/api/projects`, { headers, tags: { kind: "json", endpoint: "projects-list" } }); ok(list, "lista proyectos");
    ok(http.get(`${baseUrl}/api/projects/${session.projectId}`, { headers, tags: { kind: "json", endpoint: "project-detail" } }), "detalle proyecto");
  } else if (roll < 65) {
    if (Math.random() < 0.5) ok(http.get(`${baseUrl}/api/projects/${session.projectId}/comments`, { headers, tags: { kind: "json", endpoint: "comments-list" } }), "comentarios");
    else ok(http.post(`${baseUrl}/api/projects/${session.projectId}/comments`, JSON.stringify({ content: `Carga ${__VU}-${__ITER}-${Date.now()}`, commentType: "general" }), { headers, tags: { kind: "write", endpoint: "comment-create" } }), "crear comentario");
  } else if (roll < 75) {
    // SSE is measured by sse-probe.mjs in parallel because k6 waits for HTTP bodies to close.
    ok(http.get(`${baseUrl}/api/projects/${session.projectId}/comments`, { headers, tags: { kind: "json", endpoint: "comments-during-sse" } }), "actividad durante SSE");
  } else if (roll < 85) {
    const body = { projectName: `Carga-${__VU}-${__ITER}-${Date.now()}`, selectedProjectTypeId: "residencial", projectLocation: "Avenida Principal 123, Caracas", description: "Solicitud generada exclusivamente durante prueba de carga.", hasBlueprints: "No", prepare: true };
    ok(http.post(`${baseUrl}/api/project-requests`, JSON.stringify(body), { headers, tags: { kind: "write", endpoint: "request-create" } }), "crear solicitud");
  } else if (roll < 95) {
    ok(http.get(`${baseUrl}/api/projects/${session.projectId}/files/${session.fileId}/content`, { headers: { ...headers, Range: "bytes=0-1048575" }, tags: { kind: "file", endpoint: "file-download" } }), "descargar archivo");
  } else {
    const bytes = new Uint8Array(Number(__ENV.SMALL_UPLOAD_BYTES || 262144));
    ok(http.post(`${baseUrl}/api/projects/${session.projectId}/files`, bytes.buffer, { headers: { ...headers, "Content-Type": "application/pdf", "X-File-Name": `load-${__VU}-${__ITER}-${Date.now()}.pdf` }, tags: { kind: "file", endpoint: "file-upload" }, timeout: "60s" }), "subir archivo");
  }
  sleep(Math.random() * 2 + 0.5);
}
