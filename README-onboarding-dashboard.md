# Kiva360 — Onboarding + Dashboard

## Flujo completo

```
/login  →  /onboarding  →  /dashboard
```

## Onboarding (4 pasos)

| Paso | Ruta del componente | Server Action |
|------|--------------------|----|
| 1 — Datos del colegio  | `components/onboarding/StepColegio.tsx`      | `guardarColegio()` |
| 2 — Rol del usuario    | `components/onboarding/StepRol.tsx`          | `guardarRol()` |
| 3 — Integraciones      | `components/onboarding/StepIntegraciones.tsx`| `guardarIntegraciones()` |
| 4 — Éxito              | `components/onboarding/StepExito.tsx`        | `completarOnboarding()` |

El estado del paso actual se persiste en `user.user_metadata.onboarding_step` para
que si el usuario cierra el navegador, pueda retomar desde donde dejó.

## Dashboard

El dashboard usa **Server Components** con datos reales desde Supabase.
Los datos se cachean con `revalidate = 300` (5 minutos).

### Funciones de datos (`lib/actions/dashboard.ts`)

| Función | Qué trae |
|---------|---------|
| `getDashboardStats()` | Total alumnos, % asistencia hoy, evaluaciones pendientes |
| `getAsistenciaPorCurso()` | Lista de cursos con % de asistencia del día |
| `getEvaluacionesProximas()` | Próximas 5 evaluaciones |
| `getEstadoIntegraciones()` | Estado SIGE/SAE/JUNAEB del colegio |

### Componentes del dashboard

Todos están en `components/dashboard/StatCard.tsx` (un solo archivo con múltiples exports):

- `<StatCard>` — tarjeta de métrica con acento de color
- `<AsistenciaBar>` — fila de curso con barra de progreso
- `<EvalItem>` — ítem de evaluación próxima
- `<IntegStatus>` — estado de las 3 integraciones
- `<QuickActions>` — 4 acciones rápidas en grid

## Agregar al proyecto existente

```bash
# Copiar archivos al proyecto kiva360/
cp -r components/onboarding  ../kiva360/components/
cp -r components/dashboard   ../kiva360/components/
cp -r components/shared      ../kiva360/components/
cp -r app/onboarding         ../kiva360/app/
cp -r app/(dashboard)        ../kiva360/app/
cp    lib/actions/onboarding.ts  ../kiva360/lib/actions/
cp    lib/actions/dashboard.ts   ../kiva360/lib/actions/
```

## Variables de entorno requeridas

Las mismas del `.env.local.example` del proyecto base:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Middleware de protección

El `middleware.ts` ya protege `/dashboard` y redirige a `/login` si no hay sesión.
Además redirige a `/onboarding` si `onboarding_complete !== true`:

```typescript
// Agregar al middleware.ts existente:
if (user && !user.user_metadata?.onboarding_complete &&
    !request.nextUrl.pathname.startsWith('/onboarding')) {
  return NextResponse.redirect(new URL('/onboarding', request.url))
}
```
