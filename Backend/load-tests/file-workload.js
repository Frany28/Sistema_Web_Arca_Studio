import http from "k6/http";
import { check, sleep } from "k6";
import { required, users } from "./config.js";

const baseUrl = required("BASE_URL");
const accounts = users();
const size = Number(__ENV.FILE_SIZE_BYTES || 5242880);
const payload = new Uint8Array(size).buffer;
export const options = { stages: [{ duration: "1m", target: 10 }, { duration: "5m", target: 10 }, { duration: "1m", target: 25 }, { duration: "5m", target: 25 }, { duration: "1m", target: 0 }], thresholds: { http_req_failed: ["rate<0.01"] } };

export function setup() {
  return accounts.map((a) => {
    const r = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({ email: a.email, password: a.password }), { headers: { "Content-Type": "application/json", Origin: __ENV.FRONTEND_ORIGIN || baseUrl } });
    if (r.status !== 200) throw new Error(`Login failed: ${r.status}`);
    return { ...a, token: r.json("token") };
  });
}

export default function (sessions) {
  const s = sessions[(__VU - 1) % sessions.length];
  const headers = { Authorization: `Bearer ${s.token}`, Origin: __ENV.FRONTEND_ORIGIN || baseUrl };
  if (Math.random() < 0.5) {
    const r = http.post(`${baseUrl}/api/projects/${s.projectId}/files`, payload, { headers: { ...headers, "Content-Type": "application/pdf", "X-File-Name": `file-stress-${__VU}-${__ITER}-${Date.now()}.pdf` }, timeout: "120s", tags: { endpoint: "file-upload" } });
    check(r, { "upload exitoso": (x) => x.status === 201 });
  } else {
    const r = http.get(`${baseUrl}/api/projects/${s.projectId}/files/${s.fileId}/content`, { headers, timeout: "120s", tags: { endpoint: "file-download" } });
    check(r, { "download exitoso": (x) => [200, 206].includes(x.status) });
  }
  sleep(1);
}
