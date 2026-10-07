// Início da área do time de dados: indicadores de acesso aos dashboards (só acessos do Hub).
// Os números vêm do banco (unidash.acesso). Enquanto não houver acessos, tudo aparece zerado,
// com a explicação — nunca números de exemplo.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { obter } from '../../api/cliente.js'
import Dica from '../../componentes/Dica.jsx'
import Icone from '../../componentes/Icone.jsx'
import SeletorOpcoes from '../../componentes/SeletorOpcoes.jsx'
import { buscarDashboard } from '../../dashboards/registro.js'
import './Inicio.css'

const PERIODOS = [7, 30, 90].map((dias) => ({ valor: dias, texto: `${dias} dias` }))
const numero = new Intl.NumberFormat('pt-BR')
const REGRA_CONTAGEM =
  'Contagem: 1 acesso por pessoa, por dashboard, a cada 30 minutos. Só contam os acessos pelo Hub; a pré-visualização do time de dados não entra.'

function Variacao({ atual, anterior }) {
  if (anterior === 0) return <p className="indicador__nota">Ainda sem período anterior para comparar</p>
  const variacao = (atual - anterior) / anterior
  const subiu = variacao >= 0
  const texto = `${subiu ? '▲' : '▼'} ${Math.abs(variacao * 100).toFixed(0)}% em relação ao período anterior`
  return <p className={`indicador__nota ${subiu ? 'indicador__nota--positivo' : 'indicador__nota--negativo'}`}>{texto}</p>
}

function Indicador({ icone, rotulo, dica, valor, children }) {
  return (
    <li className="indicador">
      <span className="indicador__icone" aria-hidden="true">
        <Icone nome={icone} tamanho={18} />
      </span>
      {dica && (
        <span className="indicador__dica">
          <Dica texto={dica} rotulo={`Como o número de ${rotulo.toLowerCase()} é calculado`} canto />
        </span>
      )}
      <span className="indicador__rotulo">{rotulo}</span>
      <span className="indicador__valor">{numero.format(valor)}</span>
      {children}
    </li>
  )
}

// Lista com barras: o número fica sempre escrito ao lado (a barra é só apoio visual)
function Ranking({ id, icone, titulo, subtitulo, itens, maximo, vazio }) {
  return (
    <section className="ranking" aria-labelledby={id}>
      <header className="ranking__cabecalho">
        <span className="ranking__icone" aria-hidden="true">
          <Icone nome={icone} tamanho={16} />
        </span>
        <div>
          <h2 id={id} className="ranking__titulo">
            {titulo}
          </h2>
          <p className="ranking__subtitulo">{subtitulo}</p>
        </div>
      </header>

      {itens.length === 0 ? (
        <div className="ranking__vazio">
          <Icone nome="info" tamanho={20} />
          <p>{vazio}</p>
        </div>
      ) : (
        <ol className="ranking__lista">
          {itens.map((d) => {
            const largura = maximo > 0 ? Math.max((d.acessos / maximo) * 100, d.acessos > 0 ? 2 : 0) : 0
            const nome = buscarDashboard(d.hash) ? (
              <Link to={`/area/dashboards/${d.hash}`}>{d.nome}</Link>
            ) : (
              d.nome
            )
            return (
              <li key={d.hash} className="ranking__item">
                <span className="ranking__nome">
                  {nome}
                  <span className="ranking__categoria">{d.categoria}</span>
                </span>
                <span className="ranking__barra" aria-hidden="true">
                  <span className="ranking__preenchimento" style={{ width: `${largura}%` }} />
                </span>
                <span className="ranking__valor">
                  {numero.format(d.acessos)} <span className="visualmente-oculto">acessos</span>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export default function Inicio() {
  const [dias, setDias] = useState(30)
  const [estado, setEstado] = useState({ situacao: 'carregando', resumo: null })

  useEffect(() => {
    setEstado((atual) => ({ ...atual, situacao: 'carregando' }))
    obter(`/inicio/resumo?dias=${dias}`)
      .then((resumo) => setEstado({ situacao: 'ok', resumo }))
      .catch((erro) => setEstado({ situacao: 'erro', resumo: null, erro }))
  }, [dias])

  const r = estado.resumo
  // A escala das barras é a mesma nas duas listas, para os tamanhos serem comparáveis
  const maximo = r ? Math.max(0, ...r.mais_acessados.map((d) => d.acessos), ...r.menos_acessados.map((d) => d.acessos)) : 0

  return (
    <div className="inicio">
      <header className="inicio__boas-vindas">
        <SeletorOpcoes nome="periodo" rotulo="Período" opcoes={PERIODOS} valor={dias} aoMudar={setDias} />
      </header>

      {estado.situacao === 'erro' && (
        <p className="inicio__aviso inicio__aviso--erro" role="alert">
          Não foi possível carregar os indicadores. {estado.erro.traceId && `Código: ${estado.erro.traceId}`}
        </p>
      )}

      {r && (
        <>
          {/* Dois avisos diferentes: antes do primeiro acesso, ou só um período sem acessos */}
          {!r.ja_houve_acesso && (
            <div className="inicio__aviso" role="note">
              <Icone nome="info" tamanho={20} />
              <p>
                <strong>Os números aparecem aqui assim que os dashboards forem abertos pelo Hub.</strong>
                <br />
                Só contam os acessos dos colaboradores pelo Hub; a pré-visualização do time de dados não entra na conta.
              </p>
            </div>
          )}
          {r.ja_houve_acesso && r.acessos === 0 && (
            <div className="inicio__aviso" role="note">
              <Icone nome="info" tamanho={20} />
              <p>
                <strong>Nenhum acesso pelo Hub nos últimos {r.periodo_dias} dias.</strong>
                {r.periodo_dias < 90 && (
                  <>
                    <br />
                    Tente um período maior para ver os acessos anteriores.
                  </>
                )}
              </p>
            </div>
          )}

          <ul className="inicio__indicadores" aria-busy={estado.situacao === 'carregando'}>
            <Indicador icone="acessos" rotulo="Acessos" dica={REGRA_CONTAGEM} valor={r.acessos}>
              <Variacao atual={r.acessos} anterior={r.acessos_periodo_anterior} />
            </Indicador>
            <Indicador icone="pessoas" rotulo="Pessoas" valor={r.pessoas}>
              <p className="indicador__nota">que abriram algum dashboard</p>
            </Indicador>
            <Indicador icone="publicado" rotulo="Dashboards publicados" valor={r.publicados}>
              <p className="indicador__nota">disponíveis no Hub</p>
            </Indicador>
            <Indicador icone="semAcesso" rotulo="Publicados sem acesso" valor={r.publicados_sem_acesso}>
              <p className="indicador__nota">vale conferir se ainda são usados</p>
            </Indicador>
          </ul>

          <div className="inicio__rankings">
            <Ranking
              id="ranking-mais"
              icone="destaque"
              titulo="Mais acessados"
              subtitulo="Os 5 dashboards mais abertos no período"
              itens={r.mais_acessados}
              maximo={maximo}
              vazio="Quando houver acessos, os dashboards mais abertos aparecem aqui."
            />
            <Ranking
              id="ranking-menos"
              icone="queda"
              titulo="Menos acessados"
              subtitulo="Publicados com menos aberturas, inclusive sem nenhuma"
              itens={r.menos_acessados}
              maximo={maximo}
              vazio={
                r.publicados === 0
                  ? 'Quando houver dashboards publicados, os menos abertos aparecem aqui.'
                  : 'Todos os publicados já aparecem entre os mais acessados.'
              }
            />
          </div>
        </>
      )}

      {!r && estado.situacao === 'carregando' && <p className="inicio__carregando">Carregando indicadores…</p>}
    </div>
  )
}
