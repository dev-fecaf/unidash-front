// Gerador › Categorias: criar, renomear, mudar a ordem e ativar/desativar categorias.
// Categoria não se exclui; desativada, ela não recebe dashboards novos.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { alterar, enviar, obter } from '../../../api/cliente.js'
import './Gerador.css'

function LinhaCategoria({ categoria, primeira, ultima, aoMover, aoSalvar }) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(categoria.nome)
  const [erro, setErro] = useState(null)

  async function salvar(dados) {
    setErro(null)
    try {
      await aoSalvar(categoria, dados)
      setEditando(false)
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <li className="categorias__item">
      <div className="categorias__ordem">
        <button type="button" className="botao-icone" onClick={() => aoMover(-1)} disabled={primeira} aria-label={`Subir ${categoria.nome}`} title="Subir">
          ↑
        </button>
        <button type="button" className="botao-icone" onClick={() => aoMover(1)} disabled={ultima} aria-label={`Descer ${categoria.nome}`} title="Descer">
          ↓
        </button>
      </div>

      <div className="categorias__conteudo">
        {editando ? (
          <div className="categoria-nova">
            <input
              className="campo__entrada"
              aria-label="Novo nome da categoria"
              maxLength={80}
              value={nome}
              autoFocus
              onChange={(e) => setNome(e.target.value)}
            />
            <button type="button" className="botao botao--primario botao--pequeno" onClick={() => salvar({ nome })}>
              Salvar
            </button>
            <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => { setEditando(false); setNome(categoria.nome) }}>
              Cancelar
            </button>
          </div>
        ) : (
          <span className={`categorias__nome${categoria.ativo ? '' : ' categorias__nome--inativa'}`}>
            {categoria.nome}
            {!categoria.ativo && ' (desativada)'}
          </span>
        )}
        <span className="lista-dashboards__detalhe">
          {categoria.dashboards} {categoria.dashboards === 1 ? 'dashboard' : 'dashboards'}
        </span>
        {erro && <p className="campo__erro">{erro}</p>}
      </div>

      {!editando && (
        <div className="categorias__acoes">
          <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => setEditando(true)}>
            Renomear
          </button>
          <button
            type="button"
            className="botao botao--secundario botao--pequeno"
            onClick={() => salvar({ ativo: !categoria.ativo })}
          >
            {categoria.ativo ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      )}
    </li>
  )
}

export default function Categorias() {
  const [categorias, setCategorias] = useState(null)
  const [erroGeral, setErroGeral] = useState(null)
  const [nomeNova, setNomeNova] = useState('')
  const [erroNova, setErroNova] = useState(null)

  useEffect(() => {
    obter('/gerador/categorias').then(setCategorias).catch(setErroGeral)
  }, [])

  async function criar(evento) {
    evento.preventDefault()
    if (!nomeNova.trim()) {
      setErroNova('Informe o nome da categoria.')
      return
    }
    setErroNova(null)
    try {
      const nova = await enviar('/gerador/categorias', { nome: nomeNova })
      setCategorias((lista) => [...lista, nova])
      setNomeNova('')
    } catch (e) {
      setErroNova(e.message)
    }
  }

  async function salvarCategoria(categoria, mudancas) {
    const atualizada = await alterar(`/gerador/categorias/${categoria.id}`, {
      nome: categoria.nome,
      descricao: categoria.descricao,
      ativo: categoria.ativo,
      ...mudancas,
    })
    setCategorias((lista) => lista.map((c) => (c.id === atualizada.id ? atualizada : c)))
  }

  async function mover(indice, direcao) {
    const nova = [...categorias]
    ;[nova[indice], nova[indice + direcao]] = [nova[indice + direcao], nova[indice]]
    setCategorias(nova) // mostra na hora; o back confirma em seguida
    try {
      setCategorias(await alterar('/gerador/categorias-ordem', { ids: nova.map((c) => c.id) }))
    } catch (e) {
      setErroGeral(e)
      setCategorias(await obter('/gerador/categorias'))
    }
  }

  return (
    <div className="gerador">
      <Link className="gerador__voltar" to="/area/gerador">
        ← Voltar ao Gerador
      </Link>

      <form className="cartao-gerador categoria-nova categoria-nova--topo" onSubmit={criar}>
        <label className="visualmente-oculto" htmlFor="nova-categoria">
          Nome da nova categoria
        </label>
        <input
          id="nova-categoria"
          className="campo__entrada"
          placeholder="Nome da nova categoria"
          maxLength={80}
          value={nomeNova}
          onChange={(e) => setNomeNova(e.target.value)}
        />
        <button type="submit" className="botao botao--primario">
          Criar categoria
        </button>
        {erroNova && <p className="campo__erro categoria-nova__erro">{erroNova}</p>}
      </form>

      {erroGeral && (
        <p className="mensagem mensagem--erro" role="alert">
          {erroGeral.message} {erroGeral.traceId && `Código: ${erroGeral.traceId}`}
        </p>
      )}

      {categorias && (
        <section className="cartao-gerador">
          {categorias.length === 0 ? (
            <p className="gerador__mensagem">Nenhuma categoria ainda. Crie a primeira acima.</p>
          ) : (
            <ol className="categorias">
              {categorias.map((c, i) => (
                <LinhaCategoria
                  key={c.id}
                  categoria={c}
                  primeira={i === 0}
                  ultima={i === categorias.length - 1}
                  aoMover={(direcao) => mover(i, direcao)}
                  aoSalvar={salvarCategoria}
                />
              ))}
            </ol>
          )}
          <p className="campo__ajuda">
            A ordem aqui é a ordem das categorias na tela Dashboards. Categorias não são excluídas: desativada, ela não
            recebe dashboards novos.
          </p>
        </section>
      )}
    </div>
  )
}
