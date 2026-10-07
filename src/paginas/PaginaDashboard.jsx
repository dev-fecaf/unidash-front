// Página de um dashboard na pré-visualização do time de dados (o link do Hub usa paginas/embed/Embed.jsx):
// - pré-visualização do time de dados: /area/dashboards/{hash}/{codigo} (com a faixa de aviso)
// Lê o hash e o código da página no endereço, busca a configuração e desenha o layout.
//
// Por enquanto, sem gráficos (etapa 3): só a estrutura.

import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { buscarDashboard } from '../dashboards/registro.js'
import LayoutDashboard from '../layouts/LayoutDashboard.jsx'
import NaoEncontrado from './NaoEncontrado.jsx'
import './PaginaDashboard.css'

export default function PaginaDashboard({ caminhoBase = '/embed', aviso = null }) {
  const { hash, codigo } = useParams()
  const dashboard = buscarDashboard(hash)
  const pagina = dashboard?.paginas.find((p) => p.codigo === codigo)

  // Nome da aba do navegador
  useEffect(() => {
    if (dashboard && pagina) document.title = `${pagina.nome} · ${dashboard.nome}`
  }, [dashboard, pagina])

  if (!dashboard) return <NaoEncontrado />

  // Sem página no endereço: vai para a primeira página
  if (!codigo) return <Navigate to={`${caminhoBase}/${hash}/${dashboard.paginas[0].codigo}`} replace />

  if (!pagina) return <NaoEncontrado />

  return (
    <LayoutDashboard dashboard={dashboard} caminhoBase={caminhoBase} aviso={aviso}>
      <header className="pagina__cabecalho">
        <p className="pagina__breadcrumb">{dashboard.nome}</p>
        <h1>{pagina.nome}</h1>
      </header>

      <section className="pagina__filtros" aria-label="Filtros da página">
        <span className="espaco-reservado">Filtros desta página · etapa 3</span>
      </section>

      {/* Espaços reservados para os componentes de gráfico (etapa 3). Sem números inventados. */}
      <div className="pagina__grade">
        {['Indicador', 'Indicador', 'Indicador'].map((tipo, i) => (
          <div key={i} className="espaco-reservado espaco-reservado--kpi">
            {tipo} · etapa 3
          </div>
        ))}
        <div className="espaco-reservado espaco-reservado--grafico">Gráfico · etapa 3</div>
        <div className="espaco-reservado espaco-reservado--grafico">Gráfico · etapa 3</div>
      </div>
    </LayoutDashboard>
  )
}
