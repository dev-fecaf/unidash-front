// Página "Visão geral" do dashboard "Teste oficial". Criada pelo comando novo_dashboard em 08/10/2026.
// Código da página no banco: 245cf2a4c39b415cbcef8cc6f9f703ac (não mude: o link do Hub usa).
//
// Começa com o padrão do UniDash: cabeçalho, faixa de filtros e a grade com 3 indicadores e 2 gráficos.
// Troque os espaços reservados pelos componentes de verdade (etapa 3). As cores vêm do tema.css da pasta.
// O nome que aparece no título vem do banco (pagina.nome), então renomear no Gerador já muda aqui.

export default function VisaoGeral({ dashboard, pagina }) {
  return (
    <>
      <header className="pagina__cabecalho">
        <p className="pagina__breadcrumb">{dashboard.nome}</p>
        <h1>{pagina.nome}</h1>
      </header>

      <section className="pagina__filtros" aria-label="Filtros da página">
        <span className="espaco-reservado">Filtros desta página · etapa 3</span>
      </section>

      {/* Grade de 12 colunas: indicador ocupa 4, gráfico ocupa 6 (PaginaDashboard.css). Sem números inventados. */}
      <div className="pagina__grade">
        <div className="espaco-reservado espaco-reservado--kpi">Indicador · etapa 3</div>
        <div className="espaco-reservado espaco-reservado--kpi">Indicador · etapa 3</div>
        <div className="espaco-reservado espaco-reservado--kpi">Indicador · etapa 3</div>
        <div className="espaco-reservado espaco-reservado--grafico">Gráfico · etapa 3</div>
        <div className="espaco-reservado espaco-reservado--grafico">Gráfico · etapa 3</div>
      </div>
    </>
  )
}
