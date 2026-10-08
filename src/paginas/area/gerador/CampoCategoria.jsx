// Campo "Categoria" do formulário. No fim da lista:
// - "+ Nova categoria": cria a categoria no banco e já a deixa escolhida;
// - "Gerenciar categorias…": abre a tela de categorias (renomear, ordenar, desativar),
//   perguntando antes se houver algo preenchido e não salvo.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { enviar, obter } from '../../../api/cliente.js'

const NOVA = '__nova__'
const GERENCIAR = '__gerenciar__'

export default function CampoCategoria({ valor, aoMudar, erro, temAlteracoes = false }) {
  const navegar = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [criando, setCriando] = useState(false)
  const [nomeNova, setNomeNova] = useState('')
  const [erroNova, setErroNova] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    obter('/gerador/categorias').then(setCategorias).catch(() => setCategorias([]))
  }, [])

  // Só as ativas podem ser escolhidas; a atual aparece mesmo se estiver desativada
  const opcoes = categorias.filter((c) => c.ativo || String(c.id) === valor)

  // Sem a opção "Escolha uma categoria" (pedido de 08/10/2026): dashboard novo já começa com a
  // primeira categoria da lista. Assim o que aparece no campo é sempre o que vai ser salvo.
  const primeira = opcoes[0]?.id
  useEffect(() => {
    if (!valor && primeira !== undefined) aoMudar(String(primeira))
  }, [valor, primeira, aoMudar])

  function escolher(e) {
    if (e.target.value === NOVA) {
      setCriando(true)
      return
    }
    if (e.target.value === GERENCIAR) {
      // Sair do formulário perde o que foi preenchido e ainda não foi salvo
      if (!temAlteracoes || window.confirm('Sair do formulário? O que foi preenchido e não foi salvo será perdido.')) {
        navegar('/area/gerador/categorias')
      }
      return
    }
    aoMudar(e.target.value)
  }

  async function criar() {
    if (!nomeNova.trim()) {
      setErroNova('Informe o nome da categoria.')
      return
    }
    setSalvando(true)
    setErroNova(null)
    try {
      const nova = await enviar('/gerador/categorias', { nome: nomeNova })
      setCategorias((lista) => [...lista, nova])
      aoMudar(String(nova.id))
      setCriando(false)
      setNomeNova('')
    } catch (e) {
      setErroNova(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="campo">
      <label className="campo__rotulo" htmlFor="categoria">
        Categoria
      </label>

      {!criando ? (
        <select
          id="categoria"
          className="campo__entrada"
          value={valor}
          onChange={escolher}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? 'erro-categoria' : undefined}
        >
          {opcoes.length === 0 && <option value="">Nenhuma categoria ainda</option>}
          {opcoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
              {!c.ativo && ' (desativada)'}
            </option>
          ))}
          <option value={NOVA}>+ Nova categoria</option>
          <option value={GERENCIAR}>Gerenciar categorias…</option>
        </select>
      ) : (
        <div className="categoria-nova">
          <input
            id="categoria"
            className="campo__entrada"
            placeholder="Nome da nova categoria"
            maxLength={80}
            value={nomeNova}
            autoFocus
            onChange={(e) => setNomeNova(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                criar()
              }
            }}
          />
          <button type="button" className="botao botao--primario" onClick={criar} disabled={salvando}>
            {salvando ? 'Criando…' : 'Criar'}
          </button>
          <button
            type="button"
            className="botao botao--secundario"
            onClick={() => {
              setCriando(false)
              setErroNova(null)
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {erroNova && <p className="campo__erro">{erroNova}</p>}
      {erro && !criando && (
        <p id="erro-categoria" className="campo__erro">
          {erro}
        </p>
      )}
    </div>
  )
}
