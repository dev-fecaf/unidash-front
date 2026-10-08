// Tela Dashboards (a "galeria"): para navegar e ver como cada dashboard está (cadastrar e editar é no Gerador).
// Redesenho de 08/10/2026, pensado para muitos dashboards:
// - no topo, os mesmos filtros do Gerador: status (com contagem), categoria e busca;
// - cartões curtos (status, nome, descrição em 2 linhas, páginas e data), agrupados por categoria;
// - o cartão inteiro abre a pré-visualização. Onde editar (pastas, schema no DW, comando) fica lá,
//   no painel "Onde editar" (Previa.jsx).

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { obter } from '../../api/cliente.js'
import Icone from '../../componentes/Icone.jsx'
import SeletorOpcoes from '../../componentes/SeletorOpcoes.jsx'
import Selo from '../../componentes/Selo.jsx'
import { buscarDashboard, listarDashboardsDoCodigo } from '../../dashboards/registro.js'
import { useSessao } from '../../sessao/Sessao.jsx'
import './gerador/Gerador.css' // filtros (seletor, categoria e busca) iguais aos do Gerador
import './Galeria.css'

const formatarData = (iso) => new Intl.DateTimeFormat('pt-BR').format(new Date(iso))
const semAcento = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const comparaTexto = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true }).compare

const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'publicado', texto: 'Publicado' },
  { valor: 'rascunho', texto: 'Rascunho' },
  { valor: 'desativado', texto: 'Desativado' },
]

// O back já manda na ordem das categorias (a do Gerador) e, dentro delas, por nome
function agruparPorCategoria(dashboards) {
  const grupos = new Map()
  for (const d of dashboards) {
    if (!grupos.has(d.categoria)) grupos.set(d.categoria, [])
    grupos.get(d.categoria).push(d)
  }
  return [...grupos.entries()]
}

function CartaoDashboard({ dashboard }) {
  const temPasta = Boolean(buscarDashboard(dashboard.hash)) // pasta criada pelo comando novo_dashboard
  return (
    <li>
      <Link className="cartao" to={`/area/dashboards/${dashboard.hash}`}>
        <span className="cartao__topo">
          <Selo status={dashboard.status} />
          {!temPasta && <span className="cartao__etiqueta">Pasta ainda não criada</span>}
        </span>
        <span className="cartao__nome">{dashboard.nome}</span>
        <span className="cartao__descricao">{dashboard.descricao || 'Sem descrição.'}</span>
        <span className="cartao__rodape">
          <span>
            {dashboard.paginas} {dashboard.paginas === 1 ? 'página' : 'páginas'} · atualizado em{' '}
            {formatarData(dashboard.atualizado_em)}
          </span>
          <span className="cartao__abrir" aria-hidden="true">
            <Icone nome="expandir" tamanho={16} />
          </span>
        </span>
      </Link>
    </li>
  )
}

export default function Galeria() {
  const { tem } = useSessao()
  const [estado, setEstado] = useState({ situacao: 'carregando', dashboards: [] })
  const [filtro, setFiltro] = useState('todos')
  const [categoria, setCategoria] = useState('') // '' = todas
  const [busca, setBusca] = useState('')

  useEffect(() => {
    obter('/galeria/dashboards')
      .then((dashboards) => setEstado({ situacao: 'ok', dashboards }))
      .catch((erro) => setEstado({ situacao: 'erro', dashboards: [], erro }))
  }, [])

  const todos = estado.dashboards
  const categorias = [...new Set(todos.map((d) => d.categoria))].sort(comparaTexto)

  // Mesma lógica do Gerador: categoria e busca valem para tudo; a contagem de cada status já considera as duas
  const termo = semAcento(busca.trim())
  const naBuscaECategoria = todos.filter(
    (d) =>
      (!categoria || d.categoria === categoria) &&
      (!termo || semAcento(d.nome).includes(termo) || semAcento(d.descricao ?? '').includes(termo)),
  )
  const contagem = (status) =>
    status === 'todos' ? naBuscaECategoria.length : naBuscaECategoria.filter((d) => d.status === status).length
  const opcoesFiltro = FILTROS.map((f) => ({ ...f, contagem: contagem(f.valor) }))
  const filtrados = naBuscaECategoria.filter((d) => filtro === 'todos' || d.status === filtro)

  // Exemplos que só existem no código do computador (npm run dev), para testar a pré-visualização
  const exemplos = listarDashboardsDoCodigo().filter((d) => !todos.some((cadastrado) => cadastrado.hash === d.hash))

  return (
    <div className="galeria">
      {estado.situacao === 'carregando' && <p className="galeria__mensagem">Carregando dashboards…</p>}

      {estado.situacao === 'erro' && (
        <p className="galeria__mensagem galeria__mensagem--erro" role="alert">
          Não foi possível carregar os dashboards. {estado.erro.traceId && `Código: ${estado.erro.traceId}`}
        </p>
      )}

      {estado.situacao === 'ok' && todos.length === 0 && (
        <div className="galeria__vazia">
          <h2>Nenhum dashboard cadastrado ainda</h2>
          <p>Os dashboards aparecem aqui depois de cadastrados no Gerador.</p>
          {tem('dashboards.gerador.visualizar') && (
            <Link className="botao botao--secundario" to="/area/gerador">
              Ir para o Gerador
            </Link>
          )}
        </div>
      )}

      {estado.situacao === 'ok' && todos.length > 0 && (
        <>
          <div className="galeria__barra tabela__barra">
            <SeletorOpcoes nome="galeria-status" rotulo="Filtrar por status" opcoes={opcoesFiltro} valor={filtro} aoMudar={setFiltro} />
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
                <span className="visualmente-oculto">Buscar dashboards por nome ou descrição</span>
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

          {filtrados.length === 0 && (
            <div className="galeria__vazia galeria__vazia--filtro">
              <p className="galeria__vazia-titulo">Nada encontrado</p>
              <p>
                Nenhum dashboard com esse filtro{categoria && ` na categoria “${categoria}”`}
                {busca && ` e a busca “${busca}”`}.
              </p>
            </div>
          )}

          {agruparPorCategoria(filtrados).map(([nomeCategoria, dashboards]) => (
            <section key={nomeCategoria} className="galeria__grupo" aria-labelledby={`cat-${nomeCategoria}`}>
              <h2 id={`cat-${nomeCategoria}`} className="galeria__categoria">
                {nomeCategoria}
                <span className="galeria__quantidade">{dashboards.length}</span>
              </h2>
              <ul className="galeria__lista">
                {dashboards.map((d) => (
                  <CartaoDashboard key={d.hash} dashboard={d} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {import.meta.env.DEV && exemplos.length > 0 && (
        <section className="galeria__grupo" aria-labelledby="cat-exemplos">
          <h2 id="cat-exemplos" className="galeria__categoria">
            Exemplos · só no computador
          </h2>
          <ul className="galeria__lista">
            {exemplos.map((d) => (
              <li key={d.hash}>
                <Link className="cartao cartao--exemplo" to={`/area/dashboards/${d.hash}`}>
                  <span className="cartao__nome">{d.nome}</span>
                  <span className="cartao__descricao">Configuração de exemplo, sem cadastro no banco.</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
