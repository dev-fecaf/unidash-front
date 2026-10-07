// Onde mexer em cada dashboard: tudo sai do identificador (slug) gerado pelo Gerador.
// Usado na tela Dashboards, na pré-visualização e no Gerador, para os caminhos ficarem iguais em todo lugar.
//
// Convenção (07/10/2026; detalhes em docs/dashboards.md):
// - front: gráficos, filtros e qual endpoint cada gráfico chama;
// - back:  os endpoints de dados do dashboard (consultas no DW), na rota /api/v1/dados/<slug>/...;
// - DW:    schema próprio do dashboard.

// Caminhos a partir da raiz de cada repositório (unidash-front e unidash-back)
export const caminhoFront = (slug) => `src/dashboards/${slug}/`
export const caminhoBack = (slug) => `app/dominios/dados/${slug}/`
export const rotaDados = (slug) => `/api/v1/dados/${slug}/`
export const schemaDw = (slug) => `dash_${slug}`
