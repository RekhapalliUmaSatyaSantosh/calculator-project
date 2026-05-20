# Glass Calculator

Modern dark-themed calculator with glassmorphism UI, built with Flask + vanilla JS.

## Structure
```
calculator/
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## Run
```bash
pip install flask
python app.py
```
Then open http://127.0.0.1:5000

## Features
- Basic arithmetic: + − × ÷ %
- Scientific extras: √, x^y (power)
- Clear (C) and Delete (DEL)
- Decimal support
- Live result while typing
- Full keyboard support (digits, operators, Enter=`=`, Backspace=DEL, Esc=C, `s`=√, `^`=power)
- Responsive layout (mobile + desktop)
- Glassmorphism card, animated gradient blobs, button hover/press animations
- Error handling for invalid expressions
