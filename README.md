# 🎓 Kiva360 — Plataforma Educativa Chile

> La plataforma de gestión escolar integrada con SIGE, SAE y JUNAEB que los colegios chilenos estaban esperando.

[![CI](https://github.com/TU_USUARIO/kiva360/actions/workflows/ci.yml/badge.svg)](https://github.com/TU_USUARIO/kiva360/actions)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://kiva360.cl)

---

## ✨ ¿Qué es Kiva360?

Kiva360 es una plataforma SaaS de gestión escolar para colegios chilenos que centraliza en una sola interfaz:

- 📒 **Libro de Clases Digital** — asistencia, notas y hoja de vida conforme MINEDUC
- 📝 **Evaluaciones** — digitales o en papel, alineadas al currículum
- 🗓️ **Planificación curricular** — OA MINEDUC 2025 integrados
- 💬 **Comunicación** — chat en tiempo real con apoderados y equipo docente
- 🔗 **SIGE** — sincronización completa, validador de errores pre-envío
- 🎓 **SAE** — vacantes, nóminas de asignados, gestión de matrícula
- 🍽️ **JUNAEB** — PAE diario, IVE-SINAE, encuesta vulnerabilidad, alumnos SEP

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (chat) |
| Deploy | Vercel |
| CI/CD | GitHub Actions |
| Email | Resend |
| SMS | Twilio |
| Pagos | Transbank WebPay |

---

## 🚀 Arrancar en local

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/kiva360.git
cd kiva360
npm install

# 2. Variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus claves de Supabase

# 3. Base de datos
npx supabase start
npx supabase db push

# 4. Tipos TypeScript
npm run db:types

# 5. Dev
npm run dev
# → http://localhost:3000
```

---

## 📁 Estructura

```
kiva360/
├── app/
│   ├── (auth)/login/           # Login + registro + recuperar contraseña
│   ├── onboarding/             # Registro colegio en 4 pasos
│   ├── (dashboard)/            # Todas las páginas autenticadas
│   │   ├── dashboard/
│   │   ├── libro/
│   │   ├── evaluaciones/
│   │   ├── planificacion/
│   │   ├── comunicacion/
│   │   └── integraciones/sige|sae|junaeb
│   └── api/
├── components/
│   ├── onboarding/             # StepColegio, StepRol, StepIntegraciones, StepExito
│   ├── dashboard/              # StatCard, AsistenciaBar, EvalItem, IntegStatus
│   └── shared/                 # Sidebar, Topbar
├── lib/
│   ├── supabase/client.ts      # Browser
│   ├── supabase/server.ts      # Server Components
│   ├── actions/onboarding.ts   # Server Actions onboarding
│   ├── actions/dashboard.ts    # Queries del dashboard
│   └── utils/index.ts          # formatRut, formatNota, etc.
└── supabase/
    └── migrations/             # 001_schema · 002_rls · 003_seed
```

---

## 🌿 Ramas

| Rama | URL |
|------|-----|
| `main` | kiva360.cl |
| `develop` | dev.kiva360.cl |
| `feature/xxx` | Preview Vercel automático |

---

## 💰 Planes

| Plan | Precio | Alumnos |
|------|--------|---------|
| Básico | $49.990/mes | hasta 300 |
| Completo | $89.990/mes | hasta 800 |
| Enterprise | A convenir | +800 |

---

## 👥 Equipo fundador

- **Pablo** — Co-fundador
- **Carlos** — Co-fundador

---

*© 2025 Kiva360 · kiva360.cl · Hecho en Chile 🇨🇱*
