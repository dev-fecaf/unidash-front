// Aba Atenção: o que o time precisa resolver e o que mudou por último no cadastro.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { obter } from '../../../api/cliente.js'
import Icone from '../../../componentes/Icone.jsx'
import Selo from '../../../componentes/Selo.jsx'
import { buscarDashboard } from '../../../dashboards/registro.js'

const data = (iso) => new Intl.DateTimeFormat('pt-BR').format(new Date(iso))

// Nome do dashboard: vira link para a pré-visualização quando há configuração no front
function NomeDashboard({ hash, nome }) {
  return buscarDashboard(hash) ? <Link to={`/area/dashboards/${hash}`}>{nome}</Link> : nome
}

// Um grupo da lista "Precisa de atenção": título, quantidade, critério e os itens
function GrupoAtencao({ titulo, criterio, itens, vazio, renderizar }) {
  return (
    <div className="atencao__grupo">
      <h3 className="atencao__grupo-titulo">
        {titulo}
        <span className={`atencao__contagem${itens.length ? ' atencao__contagem--alerta' : ''}`}>{itens.length}</span>
      </h3>
      <p className="atencao__criterio">{criterio}</p>
      {itens.length === 0 ? (
        <p className="atencao__ok">
          <Icone nome="publicado" tamanho={16} />
          {vazio}
        </p>
      ) : (
        <ul className="atencao__itens">{itens.map(renderizar)}</ul>
      )}
    </div>
  )
}

export default function AbaAtencao() {
  const [estado, setEstado] = useState({ situacao: 'carregando', dados: null })

  useEffect(() => {
    obter('/analises/atencao')
      .then((dados) => setEstado({ situacao: 'ok', dados }))
      .catch((erro) => setEstado({ situacao: 'erro', dados: null, erro }))
  }, [])

  if (estado.situacao === 'carregando') return <p className="analises__mensagem">Carregando…</p>
  if (estado.situacao === 'erro') {
    return (
      <p className="analises__mensagem analises__mensagem--erro" role="alert">
        Não foi possível carregar as análises. {estado.erro.traceId && `Código: ${estado.erro.traceId}`}
      </p>
    )
  }

  const d = estado.dados
  // Cadastrados no banco que ainda não têm a pasta de configuração no front
  const semConfiguracao = d.cadastrados.filter((c) => !buscarDashboard(c.hash))

  return (
    <div className="atencao">
      <section className="cartao-analise" aria-labelledby="titulo-atencao">
        <header className="cartao-analise__cabecalho">
          <span className="cartao-analise__icone" aria-hidden="true">
            <Icone nome="info" tamanho={16} />
          </span>
          <h2 id="titulo-atencao" className="cartao-analise__titulo">
            Precisa de atenção
          </h2>
        </header>

        <div className="atencao__grupos">
          <GrupoAtencao
            titulo="Rascunhos parados"
            criterio={`Sem nenhuma alteração há ${d.dias_rascunho_parado} dias ou mais.`}
            itens={d.rascunhos_parados}
            vazio="Nenhum rascunho parado."
            renderizar={(r) => (
              <li key={r.hash}>
                <NomeDashboard hash={r.hash} nome={r.nome} />
                <span className="atencao__detalhe">
                  {r.categoria} · parado há {r.dias_parado} dias{r.responsavel_login && ` · ${r.responsavel_login}`}
                </span>
              </li>
            )}
          />
          <GrupoAtencao
            titulo="Publicados sem acesso"
            criterio={`Nenhum acesso pelo Hub há ${d.dias_sem_acesso} dias ou mais. Vale conferir se ainda são usados.`}
            itens={d.publicados_sem_acesso}
            vazio="Todos os publicados tiveram acesso recente."
            renderizar={(p) => (
              <li key={p.hash}>
                <NomeDashboard hash={p.hash} nome={p.nome} />
                <span className="atencao__detalhe">
                  {p.categoria} · {p.ultimo_acesso ? `último acesso em ${data(p.ultimo_acesso)}` : 'nunca acessado pelo Hub'}
                </span>
              </li>
            )}
          />
          <GrupoAtencao
            titulo="Sem configuração no front"
            criterio="Cadastrados no Gerador, mas ainda sem a pasta de configuração (rode o novo-dashboard)."
            itens={semConfiguracao}
            vazio="Todos os cadastrados têm configuração."
            renderizar={(c) => (
              <li key={c.hash}>
                {c.nome}
                <span className="atencao__detalhe">
                  {c.categoria} · <Selo status={c.status} />
                </span>
              </li>
            )}
          />
        </div>
      </section>

      <section className="cartao-analise" aria-labelledby="titulo-recentes">
        <header className="cartao-analise__cabecalho">
          <span className="cartao-analise__icone" aria-hidden="true">
            <Icone nome="gerador" tamanho={16} />
          </span>
          <h2 id="titulo-recentes" className="cartao-analise__titulo">
            Alterados recentemente
          </h2>
        </header>
        {d.recentes.length === 0 ? (
          <p className="atencao__vazio">Quando houver dashboards cadastrados, as últimas criações e alterações aparecem aqui.</p>
        ) : (
          <ul className="recentes">
            {d.recentes.map((r) => (
              <li key={r.hash} className="recentes__item">
                <span className="recentes__nome">
                  <NomeDashboard hash={r.hash} nome={r.nome} />
                  <span className="atencao__detalhe">{r.categoria}</span>
                </span>
                <Selo status={r.status} />
                <span className="recentes__quando">
                  {r.criado_em === r.atualizado_em ? 'criado' : 'alterado'} em {data(r.atualizado_em)}
                  {r.responsavel_login && <> · {r.responsavel_login}</>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
