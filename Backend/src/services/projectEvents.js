const projectClients = new Map();

function getProjectKey(projectId) {
  return String(projectId);
}

function sendEvent(response, eventName, payload) {
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function subscribeToProjectEvents({ projectId, response }) {
  const projectKey = getProjectKey(projectId);
  const clients = projectClients.get(projectKey) || new Set();

  clients.add(response);
  projectClients.set(projectKey, clients);

  sendEvent(response, "project.connected", {
    projectId: Number(projectId),
    timestamp: new Date().toISOString(),
  });

  const heartbeat = setInterval(() => {
    response.write(": heartbeat\n\n");
  }, 25000);

  return () => {
    clearInterval(heartbeat);
    clients.delete(response);

    if (clients.size === 0) {
      projectClients.delete(projectKey);
    }
  };
}

export function publishProjectEvent({ eventName, payload, projectId }) {
  const clients = projectClients.get(getProjectKey(projectId));

  if (!clients || clients.size === 0) {
    return;
  }

  for (const response of clients) {
    sendEvent(response, eventName, payload);
  }
}
