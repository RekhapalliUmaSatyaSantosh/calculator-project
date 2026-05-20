"""
Flask backend for the Modern Calculator app.
Serves the single-page calculator UI. All math runs in the browser (JS),
but we also expose an optional /calculate API endpoint that safely evaluates
expressions on the server using a restricted AST evaluator.
"""

from flask import Flask, render_template, request, jsonify
import ast
import operator as op

app = Flask(__name__)

# Allowed operators for the safe evaluator
_ALLOWED_BIN_OPS = {
    ast.Add: op.add,
    ast.Sub: op.sub,
    ast.Mult: op.mul,
    ast.Div: op.truediv,
    ast.Mod: op.mod,
    ast.Pow: op.pow,
}
_ALLOWED_UNARY_OPS = {ast.UAdd: op.pos, ast.USub: op.neg}


def safe_eval(expr: str):
    """Safely evaluate a math expression without using eval()."""
    tree = ast.parse(expr, mode="eval")

    def _eval(node):
        # Numbers
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        # Binary ops: a + b, a * b, ...
        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BIN_OPS:
            return _ALLOWED_BIN_OPS[type(node.op)](_eval(node.left), _eval(node.right))
        # Unary ops: -a, +a
        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARY_OPS:
            return _ALLOWED_UNARY_OPS[type(node.op)](_eval(node.operand))
        # Expression wrapper
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        raise ValueError("Unsupported expression")

    return _eval(tree)


@app.route("/")
def index():
    """Render the calculator UI."""
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    """Optional server-side math endpoint."""
    data = request.get_json(silent=True) or {}
    expression = (data.get("expression") or "").strip()
    if not expression:
        return jsonify({"ok": False, "error": "Empty expression"}), 400
    try:
        result = safe_eval(expression)
        return jsonify({"ok": True, "result": result})
    except Exception:
        return jsonify({"ok": False, "error": "Invalid expression"}), 400


if __name__ == "__main__":
    # Run on http://127.0.0.1:5000
    app.run(debug=True)
