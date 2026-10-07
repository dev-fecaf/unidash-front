// Tela Dashboards (a "galeria"): os dashboards cadastrados no banco, agrupados por categoria.
// Cada cartão mostra onde editar o dashboard (pasta no front, endpoints no back, schema no DW;
// convenção em src/dashboards/caminhos.js) e o botão de pré-visualização (nome e páginas do banco, em qualquer status).

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { obter } from '../../api/cliente.js'
import Selo from '../../componentes/Selo.jsx'
import { buscarDashboard, listarDashboardsDoCodigo } from '../../dashboards/registro.js'
import Icone from '../../componentes/Icone.jsx'
import { caminhoBack, caminhoFront, rotaDados, schemaDw } from '../../dashboards/caminhos.js'
import { useSessao } from '../../sessao/Sessao.jsx'
import './Galeria.css'

const formatarData = (iso) => new Intl.DateTimeFormat('pt-BR').format(new Date(iso))

// Um caminho com botão de copiar
function Copiavel({ rotulo, valor, ajuda }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="caminho">
      <dt className="caminho__rotulo">{rotulo}</dt>
      <dd className="caminho__valor">
        <code>{valor}</code>
        <button type="button" className="caminho__copiar" onClick={copiar} aria-label={`Copiar ${valor}`}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        {ajuda && <span className="caminho__ajuda">{ajuda}</span>}
        <span className="visualmente-oculto" aria-live="polite">
          {copiado ? `${rotulo} copiado` : ''}
        </span>
      </dd>
    </div>
  )
}

// Onde mexer no dashboard: front (gráficos), back (endpoints) e DW (dados)
function Caminhos({ slug }) {
  return (
    <dl className="caminhos" aria-label="Onde editar este dashboard">
      <Copiavel rotulo="Front" valor={caminhoFront(slug)} ajuda="unidash-front · gráficos, filtros e o endpoint de cada gráfico" />
      <Copiavel rotulo="Back" valor={caminhoBack(slug)} ajuda={`unidash-back · endpoints de dados (rota ${rotaDados(slug)}…)`} />
      <Copiavel rotulo="DW" valor={schemaDw(slug)} ajuda="schema com as tabelas do dashboard" />
    </dl>
  )
}

function agruparPorCategoria(dashboards) {
  const grupos = new Map()
  for (const d of dashboards) {
    if (!grupos.has(d.categoria)) grupos.set(d.categoria, [])
    grupos.get(d.categoria).push(d)
  }
  return [...grupos.entries()]
}

function CartaoDashboard({ dashboard }) {
  const temConfiguracao = Boolean(buscarDashboard(dashboard.hash))  // gráficos já configurados no código
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
      <Caminhos slug={dashboard.slug} />
      <div className="cartao__rodape">
        <Link className="cartao__acao" to={`/area/dashboards/${dashboard.hash}`}>
          <Icone nome="acessos" tamanho={16} />
          Pré-visualizar
        </Link>
        {!temConfiguracao && <span className="cartao__aviso">Sem gráficos ainda: a prévia mostra a estrutura</span>}
      </div>
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
