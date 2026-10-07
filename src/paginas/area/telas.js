// Telas da área do time de dados e a permissão do UniData que libera cada uma.
// O menu mostra só as telas que a pessoa pode ver. Quem protege de verdade é o back.

export const TELAS = [
  { caminho: 'inicio', nome: 'Início', icone: 'inicio', permissao: 'dashboards.visao-geral.visualizar' },
  { caminho: 'gerador', nome: 'Gerador', icone: 'gerador', permissao: 'dashboards.gerador.visualizar' },
  { caminho: 'dashboards', nome: 'Dashboards', icone: 'galeria', permissao: 'dashboards.galeria.visualizar' },
  { caminho: 'analises', nome: 'Análises', icone: 'uso', permissao: 'dashboards.uso.visualizar' },
  { caminho: 'documentacao', nome: 'Documentação', icone: 'documentacao', permissao: 'documentacao.dashboards.visualizar' },
]

export const tela = (caminho) => TELAS.find((t) => t.caminho === caminho)
