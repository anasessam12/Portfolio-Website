import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const url = process.argv[2] || "http://localhost:5173/?debugScroll=1";
const outDir = path.resolve("scripts/debug-out");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
console.log("Waiting for #work + scroll ready...");

try {
  await page.waitForSelector("#work", { timeout: 60000 });
  await page.waitForFunction(
    () =>
      document.querySelector("main")?.classList.contains("main-active") ||
      !!document.querySelector("#smooth-content"),
    { timeout: 30000 }
  );
  console.log("OK: page ready");
} catch {
  console.log("FAIL: page not ready");
  await page.screenshot({ path: path.join(outDir, "loader-stuck.png") });
  await browser.close();
  process.exit(1);
}

// Ensure ScrollSmoother is unpaused
await page.waitForTimeout(1500);
await page.evaluate(async () => {
  document.body.style.overflowY = "auto";
  try {
    const mod = await import("/src/components/Navbar.tsx");
    mod.smoother?.paused?.(false);
  } catch {}
});
await page.waitForTimeout(500);

async function snap(label) {
  const data = await page.evaluate((label) => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        top: +b.top.toFixed(1),
        bottom: +b.bottom.toFixed(1),
        h: +b.height.toFixed(1),
        z: getComputedStyle(el).zIndex,
      };
    };
    const content = document.querySelector("#smooth-content");
    let contentY = 0;
    if (content) {
      const t = getComputedStyle(content).transform;
      if (t && t !== "none") contentY = new DOMMatrixReadOnly(t).m42;
    }
    const flex = document.querySelector(".work-flex");
    let flexX = 0;
    if (flex) {
      const t = getComputedStyle(flex).transform;
      if (t && t !== "none") flexX = new DOMMatrixReadOnly(t).m41;
    }
    const pins = Array.from(document.querySelectorAll(".pin-spacer")).map(
      (el) => ({
        child: el.firstElementChild?.className,
        h: +el.getBoundingClientRect().height.toFixed(1),
        styleH: el.style.height,
        pad: el.style.paddingBottom,
      })
    );
    const work = box("#work") || box(".work-section");
    const tech = box(".techstack");
    let overlap = null;
    if (work && tech) {
      const o = Math.min(work.bottom, tech.bottom) - Math.max(work.top, tech.top);
      if (o > 2) overlap = +o.toFixed(1);
    }
    return {
      label,
      contentY: +contentY.toFixed(1),
      flexX: +flexX.toFixed(1),
      pinCount: pins.length,
      pins,
      work,
      tech,
      contact: box("#contact"),
      overlap,
      contentH: content?.scrollHeight ?? null,
    };
  }, label);
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
  await page.screenshot({ path: path.join(outDir, `${label}.png`) });
  return data;
}

async function wheel(total) {
  const step = 300;
  const n = Math.ceil(total / step);
  for (let i = 0; i < n; i++) {
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900);
}

const a = await snap("00-ready");
if (a.pinCount > 1) {
  console.log("WARNING: nested/duplicate pin-spacers detected:", a.pinCount);
}

await page.click('a[data-href="#work"]');
await page.waitForTimeout(2200);
const b = await snap("01-nav-work");

// Scroll through work pin (translate ~2180 + section)
await wheel(3500);
const c = await snap("02-work-scroll");

await wheel(2500);
const d = await snap("03-after-work");

await page.click('a[data-href="#contact"]');
await page.waitForTimeout(2500);
const e = await snap("04-nav-contact");

// Keep scrolling to absolute bottom
let prev = null;
for (let i = 0; i < 20; i++) {
  await wheel(800);
  const y = await page.evaluate(() => {
    const content = document.querySelector("#smooth-content");
    if (!content) return 0;
    const t = getComputedStyle(content).transform;
    return t && t !== "none" ? new DOMMatrixReadOnly(t).m42 : 0;
  });
  if (prev !== null && Math.abs(y - prev) < 0.5) break;
  prev = y;
}
const f = await snap("05-bottom");

const summary = {
  pinCountOk: a.pinCount === 1,
  flexMoved: Math.abs(c.flexX) > 50 || Math.abs(d.flexX) > 50,
  contactVisibleAtNav:
    e.contact && e.contact.top < 900 && e.contact.bottom > 0,
  contactReachableAtBottom:
    f.contact && f.contact.top < 900 && f.contact.bottom > 0,
  overlapDuringWork: c.overlap,
  overlapAfterWork: d.overlap,
};
console.log("\nSUMMARY", JSON.stringify(summary, null, 2));

await browser.close();
process.exit(
  summary.pinCountOk &&
    summary.flexMoved &&
    (summary.contactVisibleAtNav || summary.contactReachableAtBottom)
    ? 0
    : 2
);
