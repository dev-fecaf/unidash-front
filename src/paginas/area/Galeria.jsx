// Tela Dashboards (a "galeria"): os dashboards cadastrados no banco, agrupados por categoria, com pré-visualização.
// A pré-visualização só existe para quem já tem configuração no front (src/dashboards/<nome>/).

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { obter } from '../../api/cliente.js'
import Selo from '../../componentes/Selo.jsx'
import { buscarDashboard, listarDashboardsDoCodigo } from '../../dashboards/registro.js'
import { useSessao } from '../../sessao/Sessao.jsx'
import './Galeria.css'

const formatarData = (iso) => new Intl.DateTimeFormat('pt-BR').format(new Date(iso))

function agruparPorCategoria(dashboards) {
  const grupos = new Map()
  for (const d of dashboards) {
    if (!grupos.has(d.categoria)) grupos.set(d.categoria, [])
    grupos.get(d.categoria).push(d)
  }
  return [...grupos.entries()]
}

function CartaoDashboard({ dashboard }) {
  const temConfiguracao = Boolean(buscarDashboard(dashboard.hash))
  return (
    <li className="cartao">
      <div className="cartao__cabecalho">
        <h3 className="cartao__nome">{dashboard.nome}</h3>
        <Selo status={dashboard.status} />
      </div>
      <p className="cartao__descricao">{dashboard.descricao || 'Sem descrição.'}</p>
      <p className="cartao__meta">
        {dashboard.paginas} {dashboard.paginas === 1 ? 'página' : 'páginas'} · atualizado em{' '}
        {formatarData(dashboard.atualizado_em)}
      </p>
      {temConfiguracao ? (
        <Link className="cartao__acao" to={`/area/dashboards/${dashboard.hash}`}>
          Pré-visualizar
        </Link>
      ) : (
        <span className="cartao__aviso">Ainda sem configuração no front</span>
      )}
    </li>
  )
}

export default function Galeria() {
  const { tem } = useSessao()
  const [estado, setEstado] = useState({ situacao: 'carregando', dashboards: [] })

  useEffect(() => {
    obter('/galeria/dashboards')
      .then((dashboards) => setEstado({ situacao: 'ok', dashboards }))
      .catch((erro) => setEstado({ situacao: 'erro', dashboards: [], erro }))
  }, [])

  // Exemplos que só existem no código do computador (npm run dev), para testar a pré-visualização
  const exemplos = listarDashboardsDoCodigo().filter(
    (d) => !estado.dashboards.some((cadastrado) => cadastrado.hash === d.hash),
  )

  return (
    <div className="galeria">
      {estado.situacao === 'carregando' && <p className="galeria__mensagem">Carregando dashboards…</p>}

      {estado.situacao === 'erro' && (
        <p className="galeria__mensagem galeria__mensagem--erro" role="alert">
          Não foi possível carregar os dashboards. {estado.erro.traceId && `Código: ${estado.erro.traceId}`}
        </p>
      )}

      {estado.situacao === 'ok' && estado.dashboards.length === 0 && (
        <div className="galeria__vazia">
          <h2>Nenhum dashboard cadastrado ainda</h2>
          <p>Os dashboards aparecem aqui depois de cadastrados no Gerador.</p>
          {tem('dashboards.gerador.visualizar') && (
            <Link className="cartao__acao" to="/area/gerador">
              Ir para o Gerador
            </Link>
          )}
        </div>
      )}

      {agruparPorCategoria(estado.dashboards).map(([categoria, dashboards]) => (
        <section key={categoria} className="galeria__grupo" aria-labelledby={`cat-${categoria}`}>
          <h2 id={`cat-${categoria}`} className="galeria__categoria">
            {categoria}
          </h2>
          <ul className="galeria__lista">
            {dashboards.map((d) => (
              <CartaoDashboard key={d.hash} dashboard={d} />
            ))}
          </ul>
        </section>
      ))}

      {import.meta.env.DEV && exemplos.length > 0 && (
        <section className="galeria__grupo" aria-labelledby="cat-exemplos">
          <h2 id="cat-exemplos" className="galeria__categoria">
            Exemplos · só no computador
          </h2>
          <ul className="galeria__lista">
            {exemplos.map((d) => (
              <li key={d.hash} className="cartao cartao--exemplo">
                <h3 className="cartao__nome">{d.nome}</h3>
                <p className="cartao__descricao">Configuração de exemplo, sem cadastro no banco.</p>
                <Link className="cartao__acao" to={`/area/dashboards/${d.hash}`}>
                  Pré-visualizar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
