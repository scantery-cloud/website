/* =========================================================
   MATH HUB — script.js
   Shared behaviour + all calculator logic
   ========================================================= */

/* ---------- Mobile nav toggle ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  }
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === here) a.classList.add("active");
  });
});

/* ---------- HELPERS ---------- */
function toNumber(id) {
  const el = document.getElementById(id);
  return parseFloat(el.value);
}

function showResult(outputId, label, value, unit) {
  const out = document.getElementById(outputId);
  out.classList.remove("error");
  const rounded = Math.round(value * 10000) / 10000;
  out.innerHTML = `<span class="result-label">${label}</span>${rounded}${unit ? " " + unit : ""}`;
}

function showError(outputId, message) {
  const out = document.getElementById(outputId);
  out.classList.add("error");
  out.innerHTML = `<span class="result-label">Check your input</span>${message}`;
}

function validate(outputId, values) {
  for (const v of values) {
    if (isNaN(v)) { showError(outputId, "Please fill in every field with a number."); return false; }
    if (v < 0) { showError(outputId, "Measurements can't be negative."); return false; }
  }
  return true;
}

function round4(v) { return Math.round(v * 10000) / 10000; }

/* ---------- SCIENTIFIC CALCULATOR (calculator.html) ---------- */
let sciExpr = "";

function sciPress(key) {
  const exprEl = document.getElementById("sciExpr");
  if (!exprEl) return;
  if (key === "AC") sciExpr = "";
  else if (key === "DEL") sciExpr = sciExpr.slice(0, -1);
  else if (key === "=") { sciCalculate(); return; }
  else if (key === "sqrt") sciExpr += "sqrt(";
  else if (key === "%") sciExpr += "/100";
  else sciExpr += key;
  exprEl.textContent = sciExpr || "0";
}

function sciCalculate() {
  const exprEl = document.getElementById("sciExpr");
  const resultEl = document.getElementById("sciResult");
  try {
    const value = evaluateExpression(sciExpr);
    resultEl.textContent = formatSciResult(value);
    sciExpr = String(formatSciResult(value));
    exprEl.textContent = sciExpr;
  } catch (e) {
    resultEl.textContent = "Error";
  }
}

function formatSciResult(value) {
  if (!isFinite(value)) return "Error";
  return Math.round(value * 1e10) / 1e10;
}

function evaluateExpression(rawExpr) {
  if (!rawExpr) return 0;
  const cleaned = rawExpr.replace(/sqrt/g, "");
  if (!/^[0-9+\-*/^().\s]*$/.test(cleaned)) throw new Error("Invalid characters");
  let jsExpr = rawExpr.replace(/sqrt\(/g, "Math.sqrt(").replace(/\^/g, "**");
  const fn = new Function(`"use strict"; return (${jsExpr});`);
  const result = fn();
  if (typeof result !== "number" || isNaN(result)) throw new Error("Bad result");
  return result;
}

/* ---------- DIAMETER PAGE ---------- */
function calcFromRadius() {
  const r = toNumber("radiusInput");
  if (!validate("radiusOutput", [r])) return;
  const d = 2 * r, c = 2 * Math.PI * r;
  document.getElementById("radiusOutput").classList.remove("error");
  document.getElementById("radiusOutput").innerHTML =
    `<span class="result-label">Diameter (d = 2r)</span>${round4(d)}<br>` +
    `<span class="result-label">Circumference (C = 2πr)</span>${round4(c)}`;
}

function calcFromDiameter() {
  const d = toNumber("diameterInput");
  if (!validate("diameterOutput", [d])) return;
  const r = d / 2, c = Math.PI * d;
  document.getElementById("diameterOutput").classList.remove("error");
  document.getElementById("diameterOutput").innerHTML =
    `<span class="result-label">Radius (r = d/2)</span>${round4(r)}<br>` +
    `<span class="result-label">Circumference (C = πd)</span>${round4(c)}`;
}

function calcFromCircumference() {
  const c = toNumber("circumferenceInput");
  if (!validate("circumferenceOutput", [c])) return;
  const d = c / Math.PI, r = d / 2;
  document.getElementById("circumferenceOutput").classList.remove("error");
  document.getElementById("circumferenceOutput").innerHTML =
    `<span class="result-label">Diameter (d = C/π)</span>${round4(d)}<br>` +
    `<span class="result-label">Radius (r = d/2)</span>${round4(r)}`;
}

/* ---------- AREA PAGE — 6 calculators ---------- */
function areaRectangle() {
  const l = toNumber("rectL"), w = toNumber("rectW");
  if (!validate("rectOutput", [l, w])) return;
  showResult("rectOutput", "Area (A = l × w)", l * w, "sq. units");
}
function areaSquare() {
  const s = toNumber("squareS");
  if (!validate("squareOutput", [s])) return;
  showResult("squareOutput", "Area (A = s²)", s * s, "sq. units");
}
function areaTriangle() {
  const b = toNumber("triB"), h = toNumber("triH");
  if (!validate("triOutput", [b, h])) return;
  showResult("triOutput", "Area (A = ½ × b × h)", 0.5 * b * h, "sq. units");
}
function areaCircle() {
  const r = toNumber("circR");
  if (!validate("circOutput", [r])) return;
  showResult("circOutput", "Area (A = πr²)", Math.PI * r * r, "sq. units");
}
function areaParallelogram() {
  const b = toNumber("paraB"), h = toNumber("paraH");
  if (!validate("paraOutput", [b, h])) return;
  showResult("paraOutput", "Area (A = b × h)", b * h, "sq. units");
}
function areaTrapezoid() {
  const a = toNumber("trapA"), b = toNumber("trapB"), h = toNumber("trapH");
  if (!validate("trapOutput", [a, b, h])) return;
  showResult("trapOutput", "Area (A = ½(a+b) × h)", 0.5 * (a + b) * h, "sq. units");
}

/* ---------- VOLUME PAGE — 5 calculators ---------- */
function volCube() {
  const s = toNumber("cubeS");
  if (!validate("cubeOutput", [s])) return;
  showResult("cubeOutput", "Volume (V = s³)", Math.pow(s, 3), "cu. units");
}
function volCylinder() {
  const r = toNumber("cylR"), h = toNumber("cylH");
  if (!validate("cylOutput", [r, h])) return;
  showResult("cylOutput", "Volume (V = πr²h)", Math.PI * r * r * h, "cu. units");
}
function volCone() {
  const r = toNumber("coneR"), h = toNumber("coneH");
  if (!validate("coneOutput", [r, h])) return;
  showResult("coneOutput", "Volume (V = ⅓πr²h)", (1 / 3) * Math.PI * r * r * h, "cu. units");
}
function volSphere() {
  const r = toNumber("sphereR");
  if (!validate("sphereOutput", [r])) return;
  showResult("sphereOutput", "Volume (V = 4/3πr³)", (4 / 3) * Math.PI * Math.pow(r, 3), "cu. units");
}
function volPrism() {
  const l = toNumber("prismL"), w = toNumber("prismW"), h = toNumber("prismH");
  if (!validate("prismOutput", [l, w, h])) return;
  showResult("prismOutput", "Volume (V = l × w × h)", l * w * h, "cu. units");
}

/* ---------- PERIMETER PAGE — 5 calculators ---------- */
function perRectangle() {
  const l = toNumber("perRectL"), w = toNumber("perRectW");
  if (!validate("perRectOutput", [l, w])) return;
  showResult("perRectOutput", "Perimeter (P = 2(l + w))", 2 * (l + w), "units");
}
function perSquare() {
  const s = toNumber("perSquareS");
  if (!validate("perSquareOutput", [s])) return;
  showResult("perSquareOutput", "Perimeter (P = 4s)", 4 * s, "units");
}
function perTriangle() {
  const a = toNumber("perTriA"), b = toNumber("perTriB"), c = toNumber("perTriC");
  if (!validate("perTriOutput", [a, b, c])) return;
  showResult("perTriOutput", "Perimeter (P = a + b + c)", a + b + c, "units");
}
function perCircle() {
  const r = toNumber("perCircR");
  if (!validate("perCircOutput", [r])) return;
  showResult("perCircOutput", "Circumference (C = 2πr)", 2 * Math.PI * r, "units");
}
function perParallelogram() {
  const a = toNumber("perParaA"), b = toNumber("perParaB");
  if (!validate("perParaOutput", [a, b])) return;
  showResult("perParaOutput", "Perimeter (P = 2(a + b))", 2 * (a + b), "units");
}