// Dashboard de exemplo, só para desenvolver o layout no computador.
// Não tem dados: os gráficos e filtros entram na etapa 3.
// Nos dashboards reais, o hash e os códigos das páginas vêm do banco (gerados pelo Gerador).

export default {
  hash: 'exemplo',
  soNoComputador: true, // sem cadastro no banco: a pré-visualização usa esta configuração direto
  nome: 'Dashboard de exemplo',
  paginas: [
    { codigo: 'visao-geral', nome: 'Visão geral' },
    { codigo: 'matriculas', nome: 'Matrículas' },
    { codigo: 'financeiro', nome: 'Financeiro' },
  ],
}
