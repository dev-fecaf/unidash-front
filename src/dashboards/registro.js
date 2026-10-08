// Lista de todos os dashboards que o front conhece.
// Cada dashboard tem a sua pasta em src/dashboards/<identificador>/ com um config.js.
// O comando novo_dashboard (unidash-back/scripts/novo_dashboard.py) cria a pasta e acrescenta o
// dashboard aqui, nas duas marcas abaixo. Não apague as marcas.

import exemplo from './exemplo/config.js'
import dashboard_teste_oficial from './teste_oficial/config.js'
// novo_dashboard: imports (o comando acrescenta aqui)

const DASHBOARDS = [
  // O exemplo só existe no computador (npm run dev); nunca vai para hml ou prd.
  ...(import.meta.env.DEV ? [exemplo] : []),
  dashboard_teste_oficial,
  // novo_dashboard: lista (o comando acrescenta aqui)
]

export function listarDashboardsDoCodigo() {
  return DASHBOARDS
}

export function buscarDashboard(hash) {
  return DASHBOARDS.find((dashboard) => dashboard.hash === hash) ?? null
}
