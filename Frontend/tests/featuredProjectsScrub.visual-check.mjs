import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9224;
const profileDirectory = await mkdtemp(join(tmpdir(), "arca-featured-scrub-"));
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
    "http://127.0.0.1:4173/#featured-projects",
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
  if (message.method === "Fetch.requestPaused") {
    void send("Fetch.fulfillRequest", {
      requestId: message.params.requestId,
      responseCode: 401,
      responseHeaders: [
        { name: "Content-Type", value: "application/json" },
      ],
      body: Buffer.from(JSON.stringify({
        code: "UNAUTHENTICATED",
        message: "Sesión no iniciada",
      })).toString("base64"),
    });
    return;
  }
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, message) {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    if (await evaluate(expression)) return;
    await delay(50);
  }
  const diagnostics = await evaluate(`(() => ({
    hash: location.hash,
    panels: document.querySelectorAll('[data-featured-project-panel]').length,
    readyState: document.readyState,
    scrollTop: document.querySelector('[data-home-scroll-container]')?.scrollTop ?? null,
    text: document.body.innerText.slice(0, 160),
  }))()`);
  throw new Error(`${message} ${JSON.stringify(diagnostics)}`);
}

async function wheel(deltaY) {
  const point = await evaluate(`({ x: innerWidth / 2, y: innerHeight / 2 })`);
  await send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: point.x,
    y: point.y,
    deltaX: 0,
    deltaY,
  });
}

const moveToPanelEnd = (index) => `(() => {
  const scroller = document.querySelector('[data-home-scroll-container]');
  const panel = document.querySelectorAll('[data-featured-project-panel]')[${index}];
  const viewport = scroller.getBoundingClientRect();
  const rect = panel.getBoundingClientRect();
  const panelTop = scroller.scrollTop + rect.top - viewport.top;
  scroller.scrollTop = panelTop + panel.offsetHeight - scroller.clientHeight;
  scroller.dispatchEvent(new Event('scroll'));
  return scroller.scrollTop;
})()`;

const readGallery = `(() => {
  const scroller = document.querySelector('[data-home-scroll-container]');
  const panel = document.querySelectorAll('[data-featured-project-panel]')[0];
  const primary = panel.querySelector('[data-featured-gallery-primary]');
  const overlay = document.querySelector('[data-featured-gallery-overlay]');
  const secondary = panel.querySelector('[data-featured-image-gallery] > div > div > div:not([data-featured-gallery-primary])');
  const stageSecondary = document.querySelector('[data-featured-gallery-stage-card]:not([data-featured-gallery-overlay])');
  const primaryRect = primary.getBoundingClientRect();
  const overlayRect = overlay.getBoundingClientRect();
  const secondaryRect = secondary.getBoundingClientRect();
  const stageSecondaryRect = stageSecondary.getBoundingClientRect();
  return {
    activeProject: [...document.querySelectorAll('[data-featured-project-panel]')]
      .findIndex((item) => item.getAttribute('aria-hidden') === 'false'),
    buttonCount: panel.querySelectorAll('[data-featured-image-gallery] button').length,
    dialogCount: document.querySelectorAll('[role="dialog"]').length,
    overlay: {
      height: overlayRect.height,
      left: overlayRect.left,
      top: overlayRect.top,
      visibility: getComputedStyle(overlay).visibility,
      width: overlayRect.width,
    },
    primary: {
      height: primaryRect.height,
      visibility: getComputedStyle(primary).visibility,
      width: primaryRect.width,
    },
    scrollTop: scroller.scrollTop,
    secondaryDistance: Math.hypot(
      stageSecondaryRect.left - secondaryRect.left,
      stageSecondaryRect.top - secondaryRect.top,
    ),
    viewport: { height: innerHeight, width: innerWidth },
  };
})()`;

const results = {};

try {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Fetch.enable", {
    patterns: [{ urlPattern: "*auth/me*", requestStage: "Request" }],
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await send("Page.reload");
  await waitFor(
    `document.querySelectorAll('[data-featured-project-panel]').length === 3 &&
      document.querySelector('[data-home-scroll-container]').scrollTop > 0`,
    "El Home no navegó a Proyectos destacados.",
  );
  await delay(1300);
  await evaluate(moveToPanelEnd(0));

  const initial = await evaluate(readGallery);
  if (initial.buttonCount !== 0 || initial.dialogCount !== 0) {
    throw new Error("La galería de imágenes conserva controles o modal por clic.");
  }

  await wheel(320);
  await waitFor(
    `getComputedStyle(document.querySelector('[data-featured-gallery-overlay]')).visibility === 'visible'`,
    "La imagen central no comenzó el scrub.",
  );
  const expanded = await evaluate(readGallery);
  if (
    expanded.overlay.width <= expanded.primary.width ||
    expanded.overlay.width >= expanded.viewport.width ||
    expanded.activeProject !== 0 ||
    Math.abs(expanded.scrollTop - initial.scrollTop) > 1 ||
    expanded.secondaryDistance <= 10
  ) {
    throw new Error(`Estado intermedio inválido: ${JSON.stringify(expanded)}`);
  }

  await wheel(-160);
  const reversed = await evaluate(readGallery);
  if (
    reversed.overlay.width >= expanded.overlay.width ||
    reversed.activeProject !== 0 ||
    Math.abs(reversed.scrollTop - initial.scrollTop) > 1
  ) {
    throw new Error("La inversión parcial no contrajo la imagen central.");
  }

  await wheel(1000);
  const fullscreen = await evaluate(readGallery);
  const fullscreenTolerance = 1;
  if (
    Math.abs(fullscreen.overlay.left) > fullscreenTolerance ||
    Math.abs(fullscreen.overlay.top) > fullscreenTolerance ||
    Math.abs(fullscreen.overlay.width - fullscreen.viewport.width) > fullscreenTolerance ||
    Math.abs(fullscreen.overlay.height - fullscreen.viewport.height) > fullscreenTolerance ||
    fullscreen.activeProject !== 0
  ) {
    throw new Error(`Fullscreen inválido: ${JSON.stringify(fullscreen)}`);
  }

  for (let index = 0; index < 4; index += 1) await wheel(8);
  await waitFor(
    `document.querySelectorAll('[data-featured-project-panel]')[1].getAttribute('aria-hidden') === 'false'`,
    "No se completó la transición al segundo proyecto.",
  );

  for (let index = 0; index < 4; index += 1) await wheel(-8);
  await waitFor(
    `document.querySelectorAll('[data-featured-project-panel]')[0].getAttribute('aria-hidden') === 'false'`,
    "No se restauró el proyecto anterior al subir.",
  );
  await waitFor(
    `(() => {
      const scroller = document.querySelector('[data-home-scroll-container]');
      const panel = document.querySelectorAll('[data-featured-project-panel]')[0];
      const viewport = scroller.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();
      const panelTop = scroller.scrollTop + rect.top - viewport.top;
      const panelEnd = panelTop + panel.offsetHeight - scroller.clientHeight;
      return Math.abs(scroller.scrollTop - panelEnd) <= 1;
    })()`,
    "La transición de regreso no terminó en el borde de la galería.",
  );
  await wheel(-760);
  await waitFor(
    `getComputedStyle(document.querySelector('[data-featured-gallery-overlay]')).visibility === 'hidden'`,
    "La imagen no regresó a su card original.",
  );
  const restored = await evaluate(readGallery);
  if (restored.primary.visibility === "hidden" || restored.activeProject !== 0) {
    throw new Error(`Card restaurada inválida: ${JSON.stringify(restored)}`);
  }

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await waitFor(
    `innerWidth === 390 && innerHeight === 844`,
    "El viewport móvil no terminó de aplicarse.",
  );
  await delay(200);
  await evaluate(moveToPanelEnd(0));
  await delay(100);
  await wheel(1000);
  await waitFor(
    `getComputedStyle(document.querySelector('[data-featured-gallery-overlay]')).visibility === 'visible'`,
    "La expansión móvil no comenzó.",
  );
  const mobile = await evaluate(readGallery);
  if (
    Math.abs(mobile.overlay.left) > fullscreenTolerance ||
    Math.abs(mobile.overlay.top) > fullscreenTolerance ||
    Math.abs(mobile.overlay.width - 390) > fullscreenTolerance ||
    Math.abs(mobile.overlay.height - 844) > fullscreenTolerance
  ) {
    throw new Error(`Fullscreen móvil inválido: ${JSON.stringify(mobile)}`);
  }

  await evaluate(`location.hash = '#process'`);
  await waitFor(
    `document.querySelector('[data-home-scroll-container]').scrollTop >=
      document.querySelector('#process').offsetTop - 1`,
    "La navegación directa a Procesos no terminó.",
  );
  await evaluate(`document.querySelector('[aria-label^="Abrir video:"]').click()`);
  await waitFor(
    `Boolean(document.body.querySelector('div.fixed.inset-0 video[autoplay]'))`,
    "El modal de video dejó de abrir por clic.",
  );

  results.initial = initial;
  results.expanded = expanded;
  results.reversed = reversed;
  results.fullscreen = fullscreen;
  results.restored = restored;
  results.mobile = mobile;
  results.videoModal = true;
  console.log(JSON.stringify(results, null, 2));
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
