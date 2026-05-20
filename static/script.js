/* Calculator logic
 * - Builds an expression string from button clicks / keyboard input
 * - Shows a live result as the user types
 * - Uses Function() in a controlled way (only sanitized math chars allowed)
 */

const expressionEl = document.getElementById("expression");
const resultEl     = document.getElementById("result");
const keys         = document.querySelectorAll(".key");

let expression = "";   // raw JS-evaluatable expression, e.g. "12+3*Math.sqrt(9"
let display    = "";   // pretty version shown to user, e.g. "12+3×√(9"

/* Map of pretty symbols for the on-screen expression */
const PRETTY = { "*": "×", "/": "÷", "-": "−", "Math.sqrt(": "√(" };

/* Render expression + live result */
function render() {
  expressionEl.textContent = display || "0";
  const live = tryEvaluate(expression);
  if (live !== null) resultEl.textContent = formatNumber(live);
}

/* Safely evaluate the expression. Returns null if invalid / incomplete. */
function tryEvaluate(expr) {
  if (!expr) return 0;
  // Allow only digits, operators, dot, parens, %, and the literal "Math.sqrt"
  const sanitized = expr.replace(/Math\.sqrt/g, "");
  if (!/^[0-9+\-*/%.()\s]*$/.test(sanitized)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${expr})`)();
    if (typeof value !== "number" || !isFinite(value)) return null;
    return value;
  } catch {
    return null;
  }
}

/* Pretty-format numbers (trim trailing zeros, limit length) */
function formatNumber(n) {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(10)).toString();
}

/* Append a value to the expression */
function append(value) {
  expression += value;
  display    += PRETTY[value] || value;
  render();
}

/* Clear everything */
function clearAll() {
  expression = "";
  display    = "";
  resultEl.textContent = "0";
  expressionEl.textContent = "0";
}

/* Delete last char (handles "Math.sqrt(" as one unit) */
function deleteLast() {
  if (expression.endsWith("Math.sqrt(")) {
    expression = expression.slice(0, -"Math.sqrt(".length);
    display    = display.slice(0, -2); // "√("
  } else {
    expression = expression.slice(0, -1);
    display    = display.slice(0, -1);
  }
  render();
}

/* Evaluate final answer */
function equals() {
  const value = tryEvaluate(expression);
  if (value === null) {
    resultEl.textContent = "Error";
    return;
  }
  const formatted = formatNumber(value);
  expression = formatted;
  display    = formatted;
  expressionEl.textContent = formatted;
  resultEl.textContent     = formatted;
}

/* Hook up button clicks */
keys.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.remove("flash");
    void btn.offsetWidth;          // restart animation
    btn.classList.add("flash");

    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    if (action === "clear")  return clearAll();
    if (action === "delete") return deleteLast();
    if (action === "equals") return equals();
    if (value !== undefined) return append(value);
  });
});

/* Keyboard support */
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if ((k >= "0" && k <= "9") || "+-*/%.()".includes(k)) {
    append(k);
  } else if (k === "Enter" || k === "=") {
    e.preventDefault();
    equals();
  } else if (k === "Backspace") {
    deleteLast();
  } else if (k === "Escape") {
    clearAll();
  } else if (k.toLowerCase() === "s") {
    // 's' shortcut for square root
    append("Math.sqrt(");
  } else if (k === "^") {
    append("**");
  }
});

/* Initial render */
clearAll();
