# Kiva360 Prioridad 2 — Dashboard Real

## Reemplazar estos archivos

- `lib/actions/dashboard.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/QuickActions.tsx`

## Qué mejora

- Dashboard conectado a datos reales de Supabase
- Métricas reales:
  - alumnos activos
  - cursos activos
  - asistencia de hoy
  - ausentes/alertas
  - evaluaciones próximas
  - integraciones
- Estados vacíos elegantes
- Accesos rápidos a:
  - Cursos
  - Alumnos
  - Asistencia
  - Evaluaciones

## Después de copiar

```bash
git add .
git commit -m "connect real dashboard data"
git push origin main
```

## Nota importante

Este pack asume que ya aplicaste la Prioridad 1 y tienes estas rutas:
- `/cursos`
- `/alumnos`
- `/asistencia`
- `/evaluaciones`

También asume el tenant demo:
`00000000-0000-0000-0000-000000000001`
