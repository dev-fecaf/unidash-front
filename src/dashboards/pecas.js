// O que vem da pasta de cada dashboard (src/dashboards/<identificador>/), para o link do Hub e a
// pré-visualização desenharem o dashboard:
// - classe: "dashboard-<identificador>", que liga o tema.css da pasta (as cores do dashboard);
// - Conteudo: o componente da página aberta (paginas/<Nome>.jsx da pasta).
// Sem pasta (ou página criada depois da pasta), classe e/ou Conteudo vêm vazios e a tela mostra o padrão.

import { buscarDashboard } from './registro.js'

export function pecasDoDashboard(hash, codigo) {
  const config = buscarDashboard(hash)
  const pagina = config?.paginas.find((p) => p.codigo === codigo)
  return {
    temPasta: Boolean(config),
    classe: config?.identificador ? `dashboard-${config.identificador}` : undefined,
    Conteudo: pagina?.Conteudo ?? null,
  }
}
