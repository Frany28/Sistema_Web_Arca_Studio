import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9223;
const profileDirectory = await mkdtemp(join(tmpdir(), "arca-home-visual-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDirectory}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://127.0.0.1:4173/#services",
  ],
  { stdio: "ignore" },
);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function getPageTarget() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const targets = await response.json();
      const target = targets.find(
        (item) => item.type === "page" && item.url.includes("127.0.0.1:4173"),
      );
      if (target) return target;
    } catch {
      // Chrome todavía está iniciando.
    }
    await delay(100);
  }
  throw new Error("Chrome no expuso una página para la prueba visual.");
}

const target = await getPageTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let commandId = 0;

socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
};

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

function send(method, params = {}) {
  commandId += 1;
  return new Promise((resolve, reject) => {
    pending.set(commandId, { resolve, reject });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitFor(expression, message) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  const diagnostics = await evaluate(`(() => ({
    hash: location.hash,
    readyState: document.readyState,
    scopes: document.querySelectorAll('[data-content-title-scope]').length,
    scrollTop: document.querySelector('[data-home-scroll-container]')?.scrollTop ?? null,
    text: document.body.innerText.slice(0, 160),
  }))()`);
  throw new Error(`${message} ${JSON.stringify(diagnostics)}`);
}

const scopes = [
  "services",
  "featured-project-quinta-bella-vista",
  "featured-project-muelle-zulima",
  "featured-project-apto-jc",
  "process",
];

const readScope = (id) => `(() => {
  const scroller = document.querySelector('[data-home-scroll-container]');
  const scope = document.querySelector('[data-content-title-scope="${id}"]');
  const viewport = scroller.getBoundingClientRect();
  const rect = scope.getBoundingClientRect();
  const mask = [...scope.querySelectorAll('*')].find((element) => element.style.clipPath);
  return {
    clipPath: mask ? getComputedStyle(mask).clipPath : null,
    intersects: rect.bottom > viewport.top && rect.top < viewport.bottom,
    scrollTop: scroller.scrollTop,
  };
})()`;

const scrollToBottom = (id, offset) => `(() => {
  const scroller = document.querySelector('[data-home-scroll-container]');
  const scope = document.querySelector('[data-content-title-scope="${id}"]');
  const viewport = scroller.getBoundingClientRect();
  const rect = scope.getBoundingClientRect();
  const absoluteBottom = scroller.scrollTop + rect.bottom - viewport.top;
  scroller.scrollTop = absoluteBottom - ${offset};
  scroller.dispatchEvent(new Event('scroll'));
  return scroller.scrollTop;
})()`;

const isOpen = (clipPath) => clipPath && !clipPath.includes("100%");
const results = [];

try {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Page.reload");
  await waitFor(
    `document.querySelectorAll('[data-content-title-scope]').length === 5 &&
      document.querySelector('[data-home-scroll-container]').scrollTop > 0`,
    "El Home no terminó de navegar automáticamente a Servicios.",
  );
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await delay(1300);

  for (let index = 0; index < scopes.length - 1; index += 1) {
    const currentId = scopes[index];
    const nextId = scopes[index + 1];

    await evaluate(scrollToBottom(currentId, 1));
    await delay(1300);
    const lastPixel = await evaluate(readScope(currentId));
    const incoming = await evaluate(readScope(nextId));
    if (!lastPixel.intersects || !isOpen(lastPixel.clipPath)) {
      throw new Error(`${currentId} se ocultó antes de salir completamente.`);
    }
    if (!incoming.intersects || !isOpen(incoming.clipPath)) {
      throw new Error(`${nextId} no se reveló automáticamente al entrar.`);
    }

    await evaluate(scrollToBottom(currentId, 0));
    await delay(1300);
    const outside = await evaluate(readScope(currentId));
    if (outside.intersects || isOpen(outside.clipPath)) {
      throw new Error(`${currentId} no se reinició al salir completamente.`);
    }

    await evaluate(scrollToBottom(currentId, 1));
    await delay(1300);
    const returning = await evaluate(readScope(currentId));
    if (!returning.intersects || !isOpen(returning.clipPath)) {
      throw new Error(`${currentId} no se reveló al invertir la dirección.`);
    }

    results.push({ currentId, nextId, lastPixel, outside, returning });
  }

  await evaluate(`(() => {
    const scroller = document.querySelector('[data-home-scroll-container]');
    const process = document.querySelector('[data-content-title-scope="process"]');
    const viewport = scroller.getBoundingClientRect();
    const rect = process.getBoundingClientRect();
    scroller.scrollTop += rect.top - viewport.top;
    scroller.dispatchEvent(new Event('scroll'));
  })()`);
  await delay(200);
  const beforeRapidInput = await evaluate(
    `document.querySelector('[data-home-scroll-container]').scrollTop`,
  );
  for (const deltaY of [240, 240, -240, -240, 240, -240, 240]) {
    await send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY,
    });
  }
  await delay(700);
  await send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 720,
    y: 450,
    deltaX: 0,
    deltaY: 300,
  });
  await delay(700);
  const afterRapidInput = await evaluate(
    `document.querySelector('[data-home-scroll-container]').scrollTop`,
  );
  if (afterRapidInput <= beforeRapidInput) {
    throw new Error("El scroll quedó bloqueado después de wheel rápido y cambio de dirección.");
  }

  console.log(JSON.stringify({ boundaries: results, beforeRapidInput, afterRapidInput }, null, 2));
} finally {
  socket.close();
  chrome.kill();
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    delay(2000),
  ]);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await rm(profileDirectory, { recursive: true, force: true });
      break;
    } catch (error) {
      if (error.code !== "EBUSY" || attempt === 9) throw error;
      await delay(200);
    }
  }
}
