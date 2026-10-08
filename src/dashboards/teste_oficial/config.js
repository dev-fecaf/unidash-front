// Dashboard "Teste oficial". Criado pelo comando novo_dashboard em 08/10/2026.
//
// O hash e os códigos das páginas vieram do banco (Gerador): NÃO mude, o Hub e os links dependem deles.
// O nome e a ordem das páginas que aparecem na tela vêm do banco (mude no Gerador).
//
// Nesta pasta:
// - tema.css: as cores deste dashboard (barra lateral, fundo, cartões, gráficos);
// - paginas/: um arquivo por página, com o conteúdo dela (filtros, indicadores e gráficos: etapa 3).
// Os dados vêm dos endpoints do back: unidash-back/app/dominios/dados/teste_oficial/
// Página criada no Gerador depois desta pasta: crie o arquivo em paginas/ e acrescente aqui embaixo.

import './tema.css'
import VisaoGeral from './paginas/VisaoGeral.jsx'

export default {
  hash: '45c1b9d3f2ab43a5843605fd4549493c',
  identificador: 'teste_oficial',
  nome: "Teste oficial",
  paginas: [
    { codigo: '245cf2a4c39b415cbcef8cc6f9f703ac', nome: "Visão geral", Conteudo: VisaoGeral },
  ],
}
