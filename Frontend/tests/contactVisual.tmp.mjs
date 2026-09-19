import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9231;
const profileDirectory = await mkdtemp(join(tmpdir(), "arca-contact-visual-"));
const screenshotPath = join(process.cwd(), "contact-1440.png");
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDirectory}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--window-size=1440,831",
    "http://127.0.0.1:4173/#contact",
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
  throw new Error("Chrome no expuso una página para la validación visual.");
}

const target = await getPageTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let commandId = 0;

socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);

  if (message.method === "Fetch.requestPaused") {
    const { requestId, request } = message.params;
    const isSessionRequest = request.url.includes("/api/auth/me");
    send(
      isSessionRequest ? "Fetch.fulfillRequest" : "Fetch.continueRequest",
      isSessionRequest
        ? {
            requestId,
            responseCode: 401,
            responseHeaders: [
              { name: "content-type", value: "application/json" },
            ],
            body: btoa(JSON.stringify({ code: "UNAUTHENTICATED" })),
          }
        : { requestId },
    );
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
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(message);
}

try {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 831,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Page.reload");

  await waitFor(
    `document.querySelector('#contact') &&
      document.querySelector('[data-home-scroll-container]')?.scrollTop > 0`,
    "El Home no navegó a Contact.",
  );
  await delay(500);

  const metrics = await evaluate(`(() => {
    const rect = (selector) => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return {
        x: Number(bounds.x.toFixed(3)),
        y: Number(bounds.y.toFixed(3)),
        width: Number(bounds.width.toFixed(3)),
        height: Number(bounds.height.toFixed(3)),
      };
    };
    const card = document.querySelector('.contact-tilt-card__surface');
    const logo = document.querySelector('.contact-tilt-card__logo');
    const contact = document.querySelector('#contact');
    const cta = contact.firstElementChild;
    const footer = contact.querySelector('footer');
    return {
      viewport: { width: innerWidth, height: innerHeight },
      contact: rect('#contact'),
      cta: {
        ...rect('#contact > div:first-child'),
        gap: getComputedStyle(cta).columnGap,
        padding: getComputedStyle(cta).padding,
      },
      title: rect('#contact h2'),
      card: rect('.contact-tilt-card__surface'),
      cardRadius: getComputedStyle(card).borderRadius,
      logo: rect('.contact-tilt-card__logo'),
      footer: {
        ...rect('#contact footer'),
        gap: getComputedStyle(footer).rowGap,
      },
      background: getComputedStyle(contact).backgroundColor,
    };
  })()`);

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await send("Page.reload");
  await waitFor(
    `document.querySelector('#contact') &&
      document.querySelector('[data-home-scroll-container]')?.scrollTop > 0`,
    "El Home no regresó a Contact para validar el tilt.",
  );
  await delay(500);
  const interactiveCard = await evaluate(`(() => {
    const bounds = document.querySelector('.contact-tilt-card__surface').getBoundingClientRect();
    return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: interactiveCard.x + interactiveCard.width * 0.82,
    y: interactiveCard.y + interactiveCard.height * 0.2,
  });
  await delay(500);
  const tilted = await evaluate(`(() => ({
    transform: getComputedStyle(document.querySelector('.contact-tilt-card__surface')).transform,
    glareOpacity: Number(getComputedStyle(document.querySelector('.contact-tilt-card__glare')).opacity),
  }))()`);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: 20,
    y: 20,
  });
  await delay(600);
  const resetTransform = await evaluate(
    `getComputedStyle(document.querySelector('.contact-tilt-card__surface')).transform`,
  );

  const responsive = [];
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1024, height: 900 },
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      deviceScaleFactor: 1,
      mobile: viewport.width === 375,
    });
    await delay(250);
    responsive.push(await evaluate(`(() => {
      const card = document.querySelector('.contact-tilt-card__surface').getBoundingClientRect();
      const title = document.querySelector('#contact h2').getBoundingClientRect();
      const footer = document.querySelector('#contact footer').getBoundingClientRect();
      return {
        viewport: { width: innerWidth, height: innerHeight },
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        titleWidth: Number(title.width.toFixed(3)),
        card: {
          width: Number(card.width.toFixed(3)),
          height: Number(card.height.toFixed(3)),
        },
        footerWidth: Number(footer.width.toFixed(3)),
      };
    })()`));
  }

  console.log(
    JSON.stringify(
      { metrics, responsive, tilted, resetTransform, screenshotPath },
      null,
      2,
    ),
  );
} finally {
  socket.close();
  chrome.kill();
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    delay(2000),
  ]);
  await rm(profileDirectory, { recursive: true, force: true });
}
