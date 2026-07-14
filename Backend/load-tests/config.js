export function required(name) {
  const value = __ENV[name];
  if (!value) throw new Error(`${name} is required`);
  return value.replace(/\/$/, "");
}

export function users() {
  const parsed = JSON.parse(open(__ENV.LOAD_USERS_FILE || "./fixtures/users.example.json"));
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("LOAD_USERS_FILE must contain a non-empty JSON array");
  return parsed;
}

export const thresholds = {
  http_req_failed: ["rate<0.01"],
  "http_req_duration{kind:json}": ["p(95)<800", "p(99)<1500"],
  "http_req_duration{kind:write}": ["p(95)<1500"],
  checks: ["rate>0.99"],
};

export function stages(profile) {
  if (profile === "smoke") return [{ duration: "30s", target: 2 }, { duration: "30s", target: 0 }];
  return [
    { duration: "1m", target: 10 }, { duration: "10m", target: 10 },
    { duration: "1m", target: 25 }, { duration: "10m", target: 25 },
    { duration: "1m", target: 50 }, { duration: "10m", target: 50 },
    { duration: "1m", target: 75 }, { duration: "10m", target: 75 },
    { duration: "1m", target: 100 }, { duration: "10m", target: 100 },
    { duration: "30s", target: 150 }, { duration: "2m", target: 150 },
    { duration: "2m", target: 0 },
  ];
}
