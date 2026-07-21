# Finances API + PWA

API REST para administrar ingresos, gastos, cuentas, deudas y proyecciones personales. Incluye un cliente PWA en React dentro de [`frontend/`](frontend/).

## Inicio rápido

### API

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

La API queda disponible en `http://127.0.0.1:5000`.

### PWA

```bash
cd frontend
pnpm install
pnpm dev
```

Por defecto el PWA se conecta a la API desplegada en PythonAnywhere: `https://tazcito.pythonanywhere.com`. Para trabajar contra la API local cree `frontend/.env.local` con:

```env
VITE_API_URL=http://127.0.0.1:5000
```

Use `frontend/.env.example` como base. En producción, `VITE_API_URL` ya apunta a la API pública actual.

Consulte [docs/API.md](docs/API.md) para los endpoints, cuerpos y respuestas.
