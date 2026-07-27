import { writeFile } from "node:fs/promises";

const [widthArg, heightArg, outputPath] = process.argv.slice(2);
const width = Number(widthArg);
const height = Number(heightArg);

if (!width || !height || !outputPath) {
  throw new Error("Usage: node scripts/capture-mobile-qa.mjs <width> <height> <output>");
}

const targets = await fetch("http://127.0.0.1:9222/json/list").then((response) =>
  response.json(),
);
const target = targets.find((item) => item.type === "page");

if (!target?.webSocketDebuggerUrl) {
  throw new Error("No Chrome page target found.");
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const consoleErrors = [];
let id = 0;

const opened = new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }

  if (
    message.method === "Runtime.exceptionThrown" ||
    (message.method === "Log.entryAdded" &&
      message.params.entry.level === "error") ||
    (message.method === "Runtime.consoleAPICalled" &&
      message.params.type === "error")
  ) {
    consoleErrors.push(message);
  }
});

await opened;

function send(method, params = {}) {
  id += 1;
  const messageId = id;
  return new Promise((resolve, reject) => {
    pending.set(messageId, { resolve, reject });
    socket.send(JSON.stringify({ id: messageId, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result.value;
}

await Promise.all([
  send("Page.enable"),
  send("Runtime.enable"),
  send("Log.enable"),
]);
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 1024,
  screenWidth: width,
  screenHeight: height,
});
await send("Page.navigate", { url: "http://127.0.0.1:4173/" });
await new Promise((resolve) => setTimeout(resolve, 2500));
await evaluate("document.fonts.ready.then(() => true)");

const screenshot = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: false,
});
await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));

const metrics = await evaluate(`(() => {
  const cards = [...document.querySelectorAll(".mobile-hero-action")].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      href: element.getAttribute("href"),
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.right,
    };
  });
  const menu = document.querySelector(".masthead-mobile-toggle")?.getBoundingClientRect();
  return {
    viewport: { width: innerWidth, height: innerHeight },
    body: { clientWidth: document.body.clientWidth, scrollWidth: document.body.scrollWidth },
    cards,
    menu: menu && { x: menu.x, y: menu.y, width: menu.width, right: menu.right },
  };
})()`);

const menuOpened = await evaluate(`(async () => {
  const button = document.querySelector(".masthead-mobile-toggle");
  button?.click();
  await new Promise((resolve) => setTimeout(resolve, 350));
  return {
    expanded: button?.getAttribute("aria-expanded"),
    drawerVisible: Boolean(document.querySelector(".mobile-drawer")),
  };
})()`);

const routeStatuses = {};
for (const path of ["/inquiry", "/inquiry/money", "/chat"]) {
  const response = await fetch(`http://127.0.0.1:4173${path}`);
  routeStatuses[path] = response.status;
}

textOutput({
  metrics,
  menuOpened,
  routeStatuses,
  consoleErrorCount: consoleErrors.length,
  consoleErrors: consoleErrors.map((message) => ({
    method: message.method,
    url: message.params?.entry?.url,
    text:
      message.params?.entry?.text ??
      message.params?.exceptionDetails?.text ??
      message.params?.args?.map((item) => item.value ?? item.description).join(" "),
  })),
});

socket.close();

function textOutput(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
