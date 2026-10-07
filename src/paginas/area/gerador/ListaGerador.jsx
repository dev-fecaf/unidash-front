// Gerador: tabela de todos os dashboards cadastrados, com filtro por status, busca e um lápis em cada linha.
// "Novo dashboard" e o lápis abrem o formulário num painel que desliza da direita (PainelLateral),
// por cima da lista. O endereço acompanha: /area/gerador/novo e /area/gerador/{hash}.
// Os três endereços usam a MESMA rota (gerador/*), para a lista não recarregar ao abrir o painel.

import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { obter } from '../../../api/cliente.js'
import Icone from '../../../componentes/Icone.jsx'
import PainelLateral from '../../../componentes/PainelLateral.jsx'
import SeletorOpcoes from '../../../componentes/SeletorOpcoes.jsx'
import Selo from '../../../componentes/Selo.jsx'
import FormularioDashboard from './FormularioDashboard.jsx'
import './Gerador.css'

// Data e hora no fuso do navegador (Brasília): "07 de out. de 2026 às 15:05"
const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
const FORMATO_HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dataHora = (iso) => `${FORMATO_DATA.format(new Date(iso))} às ${FORMATO_HORA.format(new Date(iso))}`
const semAcento = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'rascunho', texto: 'Rascunho' },
  { valor: 'publicado', texto: 'Publicado' },
  { valor: 'desativado', texto: 'Desativado' },
]

// Ação do Gerador, mostrada na barra superior da tela (ao lado do título).
// Categorias: criar é dentro do formulário ("+ Nova categoria"); renomear, ordenar e desativar
// ficam num link embaixo do campo Categoria do formulário.
export function AcoesGerador() {
  return (
    <>
      <Link className="botao botao--primario botao--destaque" to="/area/gerador/novo">
        <span className="botao__circulo" aria-hidden="true">
          <Icone nome="mais" tamanho={16} />
        </span>
        Novo dashboard
      </Link>
    </>
  )
}

export default function ListaGerador() {
  // O que vem depois de /area/gerador/: '' (só a lista), 'novo' ou o hash de um dashboard
  const resto = useParams()['*'] ?? ''
  const painel = resto === 'novo' ? 'novo' : resto ? 'editar' : undefined
  const hash = painel === 'editar' ? resto : undefined
  const navegar = useNavigate()
  const local = useLocation()
  const [estado, setEstado] = useState({ situacao: 'carregando', dashboards: [] })
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const recarregar = useCallback(() => {
    obter('/gerador/dashboards')
      .then((dashboards) => setEstado({ situacao: 'ok', dashboards }))
      .catch((erro) => setEstado({ situacao: 'erro', dashboards: [], erro }))
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  const fecharPainel = useCallback(() => navegar('/area/gerador'), [navegar])

  function aoSalvar(dashboard, criado) {
    recarregar()
    // Depois de criar, o painel passa a ser a edição do dashboard criado (com o hash e o link do Hub)
    if (criado) navegar(`/area/gerador/${dashboard.hash}`, { replace: true, state: { criado: true } })
  }

  const todos = estado.dashboards
  const contagem = (status) => (status === 'todos' ? todos.length : todos.filter((d) => d.status === status).length)
  const opcoesFiltro = FILTROS.map((f) => ({ ...f, contagem: contagem(f.valor) }))

  const termo = semAcento(busca.trim())
  const filtrados = todos.filter(
    (d) =>
      (filtro === 'todos' || d.status === filtro) &&
      (!termo || semAcento(d.nome).includes(termo) || semAcento(d.categoria).includes(termo)),
  )

  return (
    <div className="gerador">
      {estado.situacao === 'carregando' && <p className="gerador__mensagem">Carregando…</p>}
      {estado.situacao === 'erro' && (
        <p className="mensagem mensagem--erro" role="alert">
          Não foi possível carregar os dashboards. {estado.erro.traceId && `Código: ${estado.erro.traceId}`}
        </p>
      )}

      {estado.situacao === 'ok' && (
        <div className="tabela-moldura">
          {/* Filtros dentro da tabela: agem sobre ela */}
          <div className="tabela__barra">
            <SeletorOpcoes nome="filtro-status" rotulo="Filtrar por status" opcoes={opcoesFiltro} valor={filtro} aoMudar={setFiltro} />
            <label className="busca busca--discreta">
              <Icone nome="busca" tamanho={16} />
              <span className="visualmente-oculto">Buscar dashboards por nome ou categoria</span>
              <input
                type="search"
                className="busca__entrada"
                placeholder="Buscar"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
          </div>
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Dashboard</th>
                <th scope="col" className="tabela__numero">Páginas</th>
                <th scope="col">Status</th>
                <th scope="col">Atualizado</th>
                <th scope="col">Responsável</th>
                <th scope="col">
                  <span className="visualmente-oculto">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((d) => (
                <tr key={d.hash}>
                  <td>
                    <span className="tabela__nome">{d.nome}</span>
                    <span className="tabela__sub">{d.categoria}</span>
                  </td>
                  <td className="tabela__numero">{d.paginas}</td>
                  <td>
                    <Selo status={d.status} />
                  </td>
                  <td className="tabela__suave tabela__data">
                    <time dateTime={d.atualizado_em}>{dataHora(d.atualizado_em)}</time>
                  </td>
                  <td className="tabela__suave tabela__responsavel">{d.responsavel_login ?? '—'}</td>
                  <td className="tabela__acoes">
                    <Link
                      className="botao-icone botao-icone--fantasma"
                      to={`/area/gerador/${d.hash}`}
                      aria-label={`Editar ${d.nome}`}
                      title="Editar dados, páginas e status"
                    >
                      <Icone nome="editar" tamanho={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {todos.length === 0 && (
            <div className="tabela__vazia">
              <p className="tabela__vazia-titulo">Nenhum dashboard cadastrado ainda</p>
              <p>Clique em “Novo dashboard” para criar o primeiro.</p>
            </div>
          )}
          {todos.length > 0 && filtrados.length === 0 && (
            <div className="tabela__vazia">
              <p className="tabela__vazia-titulo">Nada encontrado</p>
              <p>Nenhum dashboard com esse filtro{busca && ` e a busca “${busca}”`}.</p>
            </div>
          )}
        </div>
      )}

      <PainelLateral
        aberto={Boolean(painel)}
        titulo={painel === 'novo' ? 'Novo dashboard' : 'Editar dashboard'}
        subtitulo={painel === 'novo' ? 'Cadastre o dashboard e as páginas dele.' : 'Altere dados, páginas e status.'}
        aoFechar={fecharPainel}
      >
        {painel && (
          <FormularioDashboard
            key={hash ?? 'novo'} // trocar de dashboard recomeça o formulário do zero
            hash={hash}
            mensagemInicial={local.state?.criado ? 'Dashboard criado como rascunho. Copie o link abaixo para cadastrar no Hub.' : null}
            aoSalvar={aoSalvar}
            aoCancelar={fecharPainel}
          />
        )}
      </PainelLateral>
    </div>
  )
}
