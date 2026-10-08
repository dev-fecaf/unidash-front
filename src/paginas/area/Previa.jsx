// Pré-visualização de um dashboard dentro da área do time de dados: /area/dashboards/{hash}/{codigo}.
// Mesmo visual do link do Hub, com uma faixa no topo (status, "Onde editar" e voltar). Não grava acesso.
// "Onde editar" (08/10/2026, veio dos cartões da galeria): abre um painel com a pasta do front, a do
// back, o schema no DW (e se ele existe) e o comando que cria as pastas, cada um com Copiar.
// Sem pasta no front, o dashboard NÃO abre (regra de 08/10/2026, igual ao link do Hub): a tela mostra
// só o aviso e o comando que cria as pastas.
//
// - Dashboards cadastrados: nome e páginas vêm do banco (GET /galeria/dashboards/{hash}),
//   em qualquer status, para conferir antes de publicar.
// - Exemplo do código (só no computador): continua vindo de src/dashboards/.

import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { obter } from '../../api/cliente.js'
import Icone from '../../componentes/Icone.jsx'
import Selo from '../../componentes/Selo.jsx'
import { caminhoBack, caminhoFront, rotaDados } from '../../dashboards/caminhos.js'
import { pecasDoDashboard } from '../../dashboards/pecas.js'
import { buscarDashboard } from '../../dashboards/registro.js'
import LayoutDashboard from '../../layouts/LayoutDashboard.jsx'
import PaginaDashboard from '../PaginaDashboard.jsx'
import '../PaginaDashboard.css'
import './Previa.css'

// Situação do schema no DW, em palavras (mesmos casos do Gerador)
const SITUACAO_DW = {
  existe: 'criado no DW',
  criado: 'criado no DW',
  ja_existia: 'criado no DW',
  nao_existe: 'ainda não existe no DW (crie pelo Gerador)',
  erro: 'não foi possível falar com o DW',
  desligado: 'DW não configurado neste ambiente',
}

// Um valor com botão de copiar
function Copiavel({ rotulo, valor, nota }) {
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
    <div className="onde-editar__linha">
      <dt>{rotulo}</dt>
      <dd>
        <code>{valor}</code>
        <button type="button" className="onde-editar__copiar" onClick={copiar} aria-label={`Copiar ${rotulo}`}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        {nota && <span className="onde-editar__nota">{nota}</span>}
        <span className="visualmente-oculto" aria-live="polite">
          {copiado ? `${rotulo} copiado` : ''}
        </span>
      </dd>
    </div>
  )
}

function FaixaPrevia({ dashboard }) {
  const [aberto, setAberto] = useState(false)
  const slug = dashboard?.slug
  return (
    <div className="faixa-previa" role="note">
      <div className="faixa-previa__linha">
        <span className="faixa-previa__info">
          <strong>Pré-visualização</strong> · não grava acesso
          {dashboard?.status && <Selo status={dashboard.status} />}
        </span>
        <span className="faixa-previa__acoes">
          {slug && (
            <button
              type="button"
              className="faixa-previa__botao"
              onClick={() => setAberto((a) => !a)}
              aria-expanded={aberto}
              aria-controls="onde-editar"
            >
              Onde editar
              <span className={`faixa-previa__seta${aberto ? ' faixa-previa__seta--aberta' : ''}`} aria-hidden="true">
                <Icone nome="expandir" tamanho={14} />
              </span>
            </button>
          )}
          <Link to="/area/dashboards">← Voltar aos dashboards</Link>
        </span>
      </div>

      {slug && aberto && (
        <dl className="onde-editar" id="onde-editar">
          <Copiavel rotulo="Pasta do front" valor={`unidash-front/${caminhoFront(slug)}`} nota="gráficos, filtros e o endpoint de cada gráfico" />
          <Copiavel rotulo="Pasta do back" valor={`unidash-back/${caminhoBack(slug)}`} nota={`endpoints de dados, rota ${rotaDados(slug)}…`} />
          {dashboard.schema_dw && (
            <Copiavel rotulo="Schema no DW" valor={dashboard.schema_dw.nome} nota={SITUACAO_DW[dashboard.schema_dw.situacao]} />
          )}
          <Copiavel
            rotulo="Criar as pastas"
            valor={`docker compose exec backend python -m scripts.novo_dashboard ${slug}`}
            nota="rode na pasta UniDash, com o Docker ligado; não sobrescreve o que já existe"
          />
        </dl>
      )}
    </div>
  )
}

// Dashboard sem pasta no front: não abre; mostra o porquê e o comando que resolve
function SemPasta({ dashboard }) {
  const comando = `docker compose exec backend python -m scripts.novo_dashboard ${dashboard.slug}`
  return (
    <div className="sem-pasta">
      <div className="sem-pasta__caixa" role="alert">
        <Selo status={dashboard.status} />
        <h1 className="sem-pasta__titulo">{dashboard.nome} ainda não abre</h1>
        <p>
          A pasta do front deste dashboard ainda não foi criada. Sem ela o dashboard não abre, nem aqui nem pelo
          Hub. Rode o comando abaixo na pasta <code>UniDash</code>, com o Docker ligado: ele cria as pastas do front e
          do back, já com o layout padrão e o tema de cores.
        </p>
        <dl className="onde-editar">
          <Copiavel rotulo="Criar as pastas" valor={comando} nota="não sobrescreve o que já existe" />
        </dl>
        <p className="sem-pasta__nota">
          Em hml e produção, a pasta só vale depois do commit, do push e do deploy do front.
        </p>
        <Link to="/area/dashboards">← Voltar aos dashboards</Link>
      </div>
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

  // Sem pasta no front: não abre
  if (!buscarDashboard(hash)) return <SemPasta dashboard={dashboard} />

  // Sem página no endereço (ou página que não existe mais): vai para a primeira
  if (!pagina) return <Navigate to={`/area/dashboards/${hash}/${dashboard.paginas[0].codigo}`} replace />

  // Igual ao link do Hub: cores e conteúdo vêm da pasta do dashboard
  const { classe, Conteudo } = pecasDoDashboard(hash, pagina.codigo)

  return (
    <LayoutDashboard
      dashboard={dashboard}
      caminhoBase="/area/dashboards"
      classe={classe}
      aviso={<FaixaPrevia dashboard={dashboard} />}
    >
      {Conteudo ? (
        <Conteudo dashboard={dashboard} pagina={pagina} />
      ) : (
        <>
          <header className="pagina__cabecalho">
            <p className="pagina__breadcrumb">{dashboard.nome}</p>
            <h1>{pagina.nome}</h1>
          </header>
          <div className="pagina__preparo">
            <p>
              Esta página ainda não tem arquivo na pasta do dashboard (foi criada no Gerador depois da pasta). Crie o
              arquivo em <code>{caminhoFront(dashboard.slug)}paginas/</code> e acrescente no <code>config.js</code>.
            </p>
          </div>
        </>
      )}
    </LayoutDashboard>
  )
}

export default function Previa() {
  const { hash, codigo } = useParams()

  // Exemplo que só existe no código do computador (sem cadastro no banco)
  if (import.meta.env.DEV && buscarDashboard(hash)?.soNoComputador) {
    return <PaginaDashboard caminhoBase="/area/dashboards" aviso={<FaixaPrevia />} />
  }
  return <PreviaDoBanco hash={hash} codigo={codigo} />
}
