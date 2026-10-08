// Gerador: tabela de todos os dashboards cadastrados, com filtro por status, filtro por categoria, busca,
// ordenação pelo título das colunas, paginação (só aparece acima de POR_PAGINA linhas) e um lápis em cada linha.
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

const POR_PAGINA = 25
const ORDEM_STATUS = { rascunho: 0, publicado: 1, desativado: 2 }
const comparaTexto = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true }).compare

// Colunas que dá para ordenar: como comparar e para que lado começa ao clicar (textos A→Z; números e datas, maior primeiro)
const COLUNAS = {
  nome: { texto: 'Dashboard', inicio: 'asc', comparar: (a, b) => comparaTexto(a.nome, b.nome) },
  paginas: { texto: 'Páginas', inicio: 'desc', numero: true, comparar: (a, b) => a.paginas - b.paginas },
  status: { texto: 'Status', inicio: 'asc', comparar: (a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] },
  atualizado: { texto: 'Atualizado', inicio: 'desc', comparar: (a, b) => Date.parse(a.atualizado_em) - Date.parse(b.atualizado_em) },
  responsavel: { texto: 'Responsável', inicio: 'asc', comparar: (a, b) => comparaTexto(a.responsavel_login ?? '', b.responsavel_login ?? '') },
}
const ORDEM_INICIAL = { coluna: 'atualizado', direcao: 'desc' } // o que mudou por último aparece primeiro

function ordenar(lista, { coluna, direcao }) {
  const sinal = direcao === 'asc' ? 1 : -1
  // Empate: desempata pelo nome, sempre de A a Z
  return [...lista].sort((a, b) => sinal * COLUNAS[coluna].comparar(a, b) || comparaTexto(a.nome, b.nome))
}

// Título de coluna clicável. aria-sort avisa o leitor de tela qual coluna ordena a tabela e em que sentido.
function TituloOrdenavel({ coluna, ordem, aoOrdenar }) {
  const { texto, numero } = COLUNAS[coluna]
  const ativa = ordem.coluna === coluna
  const sentido = ordem.direcao === 'asc' ? 'ascending' : 'descending'
  return (
    <th scope="col" className={numero ? 'tabela__numero' : undefined} aria-sort={ativa ? sentido : 'none'}>
      <button
        type="button"
        className={`tabela__ordenar${ativa ? ' tabela__ordenar--ativa' : ''}`}
        onClick={() => aoOrdenar(coluna)}
      >
        {texto}
        <Icone nome={ativa && ordem.direcao === 'asc' ? 'seta-cima' : 'seta-baixo'} tamanho={12} />
      </button>
    </th>
  )
}

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
  const [categoria, setCategoria] = useState('') // '' = todas
  const [ordem, setOrdem] = useState(ORDEM_INICIAL)
  const [pagina, setPagina] = useState(1)

  // Mudou filtro, busca, categoria ou ordem: volta para a primeira página
  useEffect(() => {
    setPagina(1)
  }, [filtro, busca, categoria, ordem])

  // Clicar na mesma coluna inverte o sentido; numa coluna nova, começa pelo sentido natural dela
  function aoOrdenar(coluna) {
    setOrdem((atual) =>
      atual.coluna === coluna
        ? { coluna, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' }
        : { coluna, direcao: COLUNAS[coluna].inicio },
    )
  }

  const recarregar = useCallback(() => {
    obter('/gerador/dashboards')
      .then((dashboards) => setEstado({ situacao: 'ok', dashboards }))
      .catch((erro) => setEstado({ situacao: 'erro', dashboards: [], erro }))
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  const fecharPainel = useCallback(() => navegar('/area/gerador'), [navegar])

  // Aviso "Alterações salvas" em cima da tabela, depois que o painel fecha (some sozinho)
  const [aviso, setAviso] = useState(null)
  useEffect(() => {
    if (!aviso) return undefined
    const tempo = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(tempo)
  }, [aviso])

  function aoSalvar(dashboard, criado) {
    recarregar()
    if (criado) {
      // Depois de criar, o painel continua aberto, na edição do dashboard criado (comando das pastas e link do Hub)
      navegar(`/area/gerador/${dashboard.hash}`, { replace: true, state: { criado: true } })
    } else {
      // Depois de salvar alterações, o painel fecha e a lista avisa
      setAviso(`Alterações salvas em “${dashboard.nome}”.`)
      fecharPainel()
    }
  }

  const todos = estado.dashboards
  const categorias = [...new Set(todos.map((d) => d.categoria))].sort(comparaTexto)

  // Categoria e busca valem para tudo; a contagem de cada status já considera as duas
  const termo = semAcento(busca.trim())
  const naBuscaECategoria = todos.filter(
    (d) =>
      (!categoria || d.categoria === categoria) &&
      (!termo || semAcento(d.nome).includes(termo) || semAcento(d.categoria).includes(termo)),
  )
  const contagem = (status) =>
    status === 'todos' ? naBuscaECategoria.length : naBuscaECategoria.filter((d) => d.status === status).length
  const opcoesFiltro = FILTROS.map((f) => ({ ...f, contagem: contagem(f.valor) }))

  const filtrados = ordenar(
    naBuscaECategoria.filter((d) => filtro === 'todos' || d.status === filtro),
    ordem,
  )
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * POR_PAGINA
  const visiveis = filtrados.slice(inicio, inicio + POR_PAGINA)

  return (
    <div className="gerador">
      {estado.situacao === 'carregando' && <p className="gerador__mensagem">Carregando…</p>}
      {estado.situacao === 'erro' && (
        <p className="mensagem mensagem--erro" role="alert">
          Não foi possível carregar os dashboards. {estado.erro.traceId && `Código: ${estado.erro.traceId}`}
        </p>
      )}

      {aviso && (
        <p className="mensagem mensagem--sucesso" role="status">
          {aviso}
        </p>
      )}

      {estado.situacao === 'ok' && (
        <div className="tabela-moldura">
          {/* Filtros dentro da tabela: agem sobre ela */}
          <div className="tabela__barra">
            <SeletorOpcoes nome="filtro-status" rotulo="Filtrar por status" opcoes={opcoesFiltro} valor={filtro} aoMudar={setFiltro} />
            <div className="tabela__barra-direita">
              <label className="filtro-categoria">
                <span className="visualmente-oculto">Filtrar por categoria</span>
                <select className="filtro-categoria__entrada" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="">Todas as categorias</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
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
          </div>
          {/* A tabela rola dentro da moldura, com o cabeçalho fixo no topo */}
          <div className="tabela__rolagem">
          <table className="tabela">
            <thead>
              <tr>
                {Object.keys(COLUNAS).map((coluna) => (
                  <TituloOrdenavel key={coluna} coluna={coluna} ordem={ordem} aoOrdenar={aoOrdenar} />
                ))}
                <th scope="col">
                  <span className="visualmente-oculto">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((d) => (
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
          </div>

          {totalPaginas > 1 && (
            <nav className="tabela__paginacao" aria-label="Páginas da tabela">
              <span className="tabela__paginacao-texto" aria-live="polite">
                {inicio + 1}–{inicio + visiveis.length} de {filtrados.length}
              </span>
              <button
                type="button"
                className="botao botao--secundario botao--pequeno"
                onClick={() => setPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="botao botao--secundario botao--pequeno"
                onClick={() => setPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
              </button>
            </nav>
          )}

          {todos.length === 0 && (
            <div className="tabela__vazia">
              <p className="tabela__vazia-titulo">Nenhum dashboard cadastrado ainda</p>
              <p>Clique em “Novo dashboard” para criar o primeiro.</p>
            </div>
          )}
          {todos.length > 0 && filtrados.length === 0 && (
            <div className="tabela__vazia">
              <p className="tabela__vazia-titulo">Nada encontrado</p>
              <p>
                Nenhum dashboard com esse filtro{categoria && ` na categoria “${categoria}”`}
                {busca && ` e a busca “${busca}”`}.
              </p>
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
            mensagemInicial={local.state?.criado ? 'Dashboard criado como rascunho. Rode o comando abaixo do nome para criar as pastas e copie o link para cadastrar no Hub.' : null}
            aoSalvar={aoSalvar}
            aoCancelar={fecharPainel}
          />
        )}
      </PainelLateral>
    </div>
  )
}
