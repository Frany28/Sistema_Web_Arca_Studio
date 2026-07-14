const projectClients = new Map();
const userConnectionCounts = new Map();
let eventSequence = 0;

function getProjectKey(projectId) {
  return String(projectId);
}

function sendEvent(response, eventName, payload) {
  eventSequence += 1;
  response.write(`id: ${Date.now()}-${eventSequence}\n`);
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function subscribeToProjectEvents({ projectId, response, userId }) {
  const projectKey = getProjectKey(projectId);
  const clients = projectClients.get(projectKey) || new Set();
  const userKey = String(userId);
  const perUserLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_USER || 5);
  const perProjectLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_PROJECT || 100);

  if ((userConnectionCounts.get(userKey) || 0) >= perUserLimit || clients.size >= perProjectLimit) {
    const error = new Error("SSE connection limit reached");
    error.code = "SSE_CONNECTION_LIMIT";
    throw error;
  }

  clients.add(response);
  projectClients.set(projectKey, clients);
  userConnectionCounts.set(userKey, (userConnectionCounts.get(userKey) || 0) + 1);

  sendEvent(response, "project.connected", {
    projectId: Number(projectId),
    timestamp: new Date().toISOString(),
  });

  const heartbeat = setInterval(() => {
    response.write(": heartbeat\n\n");
  }, 25000);

  let closed = false;
  const unsubscribe = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    clients.delete(response);
    const remaining = Math.max(0, (userConnectionCounts.get(userKey) || 1) - 1);
    if (remaining) userConnectionCounts.set(userKey, remaining);
    else userConnectionCounts.delete(userKey);

    if (clients.size === 0) {
      projectClients.delete(projectKey);
    }
  };
  response.on("error", unsubscribe);
  return unsubscribe;
}

export function assertProjectEventCapacity({ projectId, userId }) {
  const clients = projectClients.get(getProjectKey(projectId)) || new Set();
  const perUserLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_USER || 5);
  const perProjectLimit = Number(process.env.SSE_MAX_CONNECTIONS_PER_PROJECT || 100);
  if ((userConnectionCounts.get(String(userId)) || 0) >= perUserLimit || clients.size >= perProjectLimit) {
    const error = new Error("SSE connection limit reached");
    error.code = "SSE_CONNECTION_LIMIT";
    throw error;
  }
}

export function publishProjectEvent({ eventName, payload, projectId }) {
  const clients = projectClients.get(getProjectKey(projectId));

  if (!clients || clients.size === 0) {
    return;
  }

  for (const response of clients) {
    if (!response.destroyed && !response.writableEnded) sendEvent(response, eventName, payload);
  }
}

export function closeAllProjectEventConnections() {
  for (const clients of projectClients.values()) {
    for (const response of clients) response.end();
  }
  projectClients.clear();
  userConnectionCounts.clear();
}

export const projectEventBus = {
  close: closeAllProjectEventConnections,
  publish: publishProjectEvent,
  subscribe: subscribeToProjectEvents,
};
