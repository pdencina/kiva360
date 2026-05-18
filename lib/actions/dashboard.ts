'use server'

export async function getDashboardStats() {
  return {
    totalAlumnos: 0,
    pctAsistenciaHoy: null,
    evalPendientes: 0,
    alertas: 0,
  }
}

export async function getAsistenciaPorCurso() {
  return []
}

export async function getActividadReciente() {
  return []
}

export async function getEvaluacionesProximas() {
  return []
}

export async function getEstadoIntegraciones() {
  return {
    sige: {
      conectado: false,
      alerta: null,
    },
    sae: {
      conectado: false,
      alerta: null,
    },
    junaeb: {
      conectado: false,
      alerta: null,
    },
  }
}