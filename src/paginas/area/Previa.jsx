// Pré-visualização de um dashboard dentro da área do time de dados: /area/dashboards/{hash}/{codigo}.
// Mesmo visual do link do Hub, com uma faixa no topo (pasta do dashboard e status). Não grava acesso.
//
// - Dashboards cadastrados: nome e páginas vêm do banco (GET /galeria/dashboards/{hash}),
//   em qualquer status, para conferir antes de publicar.
// - Exemplo do código (só no computador): continua vindo de src/dashboards/.

import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { obter } from '../../api/cliente.js'
import Selo from '../../componentes/Selo.jsx'
import { caminhoBack, caminhoFront, rotaDados } from '../../dashboards/caminhos.js'
import { buscarDashboard } from '../../dashboards/registro.js'
import LayoutDashboard from '../../layouts/LayoutDashboard.jsx'
import PaginaDashboard from '../PaginaDashboard.jsx'
import '../PaginaDashboard.css'
import './Previa.css'

function FaixaPrevia({ slug, status }) {
  return (
    <div className="faixa-previa" role="note">
      <span className="faixa-previa__info">
        <strong>Pré-visualização</strong> · não grava acesso
        {status && <Selo status={status} />}
        {slug && (
          <span className="faixa-previa__pasta">
            Front: <code>unidash-front/{caminhoFront(slug)}</code> · Back: <code>unidash-back/{caminhoBack(slug)}</code>
          </span>
        )}
      </span>
      <Link to="/area/dashboards">← Voltar aos dashboards</Link>
    </div>
  )
}

function PreviaDoBanco({ hash, codigo }) {
  const [estado, setEstado] = useState({ situacao: 'carregando' })

  useEffect(() => {
    obter(`/galeria/dashboards/${hash}`)
      .then((dashboard) => setEstado({ situacao: 'ok', dashboard }))
      .catch((erro) => setEstado({ situacao: 'erro', erro }))
  }, [hash])

  const dashboard = estado.dashboard
  const pagina = dashboard?.paginas.find((p) => p.codigo === codigo)

  useEffect(() => {
    if (dashboard && pagina) document.title = `${pagina.nome} · ${dashboard.nome} (prévia)`
  }, [dashboard, pagina])

  if (estado.situacao === 'carregando') return <p className="previa__mensagem">Carregando a pré-visualização…</p>
  if (estado.situacao === 'erro') {
    return (
      <div className="previa__mensagem" role="alert">
        <p>
          {estado.erro.status === 404 ? 'Dashboard não encontrado.' : 'Não foi possível carregar a pré-visualização.'}
          {estado.erro.traceId && ` Código: ${estado.erro.traceId}`}
        </p>
        <Link to="/area/dashboards">← Voltar aos dashboards</Link>
      </div>
    )
  }
  if (dashboard.paginas.length === 0) {
    return (
      <div className="previa__mensagem" role="alert">
        <p>Este dashboard não tem nenhuma página ativa.</p>
        <Link to="/area/dashboards">← Voltar aos dashboards</Link>
      </div>
    )
  }

  // Sem página no endereço (ou página que não existe mais): vai para a primeira
  if (!pagina) return <Navigate to={`/area/dashboards/${hash}/${dashboard.paginas[0].codigo}`} replace />

  return (
    <LayoutDashboard
      dashboard={dashboard}
      caminhoBase="/area/dashboards"
      aviso={<FaixaPrevia slug={dashboard.slug} status={dashboard.status} />}
    >
      <header className="pagina__cabecalho">
        <p className="pagina__breadcrumb">{dashboard.nome}</p>
        <h1>{pagina.nome}</h1>
      </header>
      {/* Os gráficos entram na etapa 3, configurados na pasta do dashboard */}
      <div className="pagina__preparo">
        <p>Os gráficos desta página ainda estão em preparação. Para montar:</p>
        <ul>
          <li>
            <strong>Front</strong> (repositório <code>unidash-front</code>): gráficos, filtros e qual endpoint cada
            gráfico usa, em <code>{caminhoFront(dashboard.slug)}</code>
          </li>
          <li>
            <strong>Back</strong> (repositório <code>unidash-back</code>): os endpoints de dados (consultas no DW), em{' '}
            <code>{caminhoBack(dashboard.slug)}</code>, na rota <code>{rotaDados(dashboard.slug)}…</code>
          </li>
        </ul>
      </div>
    </LayoutDashboard>
  )
}

export default function Previa() {
  const { hash, codigo } = useParams()

  // Exemplo que só existe no código do computador (sem cadastro no banco)
  if (import.meta.env.DEV && buscarDashboard(hash)) {
    return <PaginaDashboard caminhoBase="/area/dashboards" aviso={<FaixaPrevia />} />
  }
  return <PreviaDoBanco hash={hash} codigo={codigo} />
}
