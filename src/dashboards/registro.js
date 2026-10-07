// Lista de todos os dashboards que o front conhece.
// Cada dashboard tem a sua pasta em src/dashboards/<nome>/ com um config.js.

import exemplo from './exemplo/config.js'

const DASHBOARDS = [
  // O exemplo só existe no computador (npm run dev); nunca vai para hml ou prd.
  ...(import.meta.env.DEV ? [exemplo] : []),
]

export function listarDashboardsDoCodigo() {
  return DASHBOARDS
}

export function buscarDashboard(hash) {
  return DASHBOARDS.find((dashboard) => dashboard.hash === hash) ?? null
}
