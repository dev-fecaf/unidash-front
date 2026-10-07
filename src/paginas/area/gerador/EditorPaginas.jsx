// Editor das páginas de um dashboard: adicionar, renomear, mudar a ordem e remover.
// - Ordem: arrastando pelo pegador (⋮⋮) ou pelas setas ↑ ↓ (as setas funcionam pelo teclado).
// - Ao lado, uma prévia pequena da barra lateral do dashboard, na ordem atual.
// - Página removida que já existia no banco fica desativada (não é apagada) e pode ser reativada.

import { useState } from 'react'

import logo from '../../../assets/logo-unifecaf.png'

let contador = 0

/** Página nova (ainda sem código: o banco gera ao salvar). A "chave" é só para o React. */
export const novaPagina = () => ({ chave: `nova-${++contador}`, codigo: null, nome: '' })

// Prévia pequena da barra lateral do dashboard (só para ver a ordem; não é clicável)
function PreviaLateral({ nomeDashboard, paginas }) {
  const comNome = paginas.filter((p) => p.nome.trim())
  return (
    <div className="previa-lateral" aria-hidden="true">
      <div className="previa-lateral__topo">
        <img src={logo} alt="" width="12" height="12" />
        <span>{nomeDashboard.trim() || 'Nome do dashboard'}</span>
      </div>
      <p className="previa-lateral__rotulo">Páginas</p>
      {comNome.length === 0 ? (
        <p className="previa-lateral__vazia">Sem páginas</p>
      ) : (
        <ul>
          {comNome.map((p, i) => (
            <li key={p.chave} className={i === 0 ? 'previa-lateral__ativa' : undefined}>
              {p.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function EditorPaginas({ paginas, aoMudar, desativadas, aoReativar, erro, nomeDashboard = '' }) {
  const [arrastando, setArrastando] = useState(null) // índice da página sendo arrastada
  const [alvo, setAlvo] = useState(null) // índice onde ela vai cair

  const trocar = (indice, nome) => aoMudar(paginas.map((p, i) => (i === indice ? { ...p, nome } : p)))
  const remover = (indice) => aoMudar(paginas.filter((_, i) => i !== indice))
  const levar = (de, para) => {
    if (de === para || para < 0 || para >= paginas.length) return
    const nova = [...paginas]
    const [movida] = nova.splice(de, 1)
    nova.splice(para, 0, movida)
    aoMudar(nova)
  }

  // Arrastar e soltar (o navegador cuida do "arrasto"; aqui só reorganizamos a lista ao soltar)
  const terminar = () => {
    setArrastando(null)
    setAlvo(null)
  }

  return (
    <fieldset className="campo paginas">
      <legend className="visualmente-oculto">Páginas</legend>

      <div className="paginas__corpo">
        <div className="paginas__edicao">
          {paginas.length === 0 && <p className="campo__ajuda">Nenhuma página. Todo dashboard precisa de pelo menos uma.</p>}

          <ol className="paginas__lista">
            {paginas.map((p, i) => (
              <li
                key={p.chave}
                className={[
                  'paginas__item',
                  arrastando === i && 'paginas__item--arrastando',
                  alvo === i && arrastando !== i && 'paginas__item--alvo',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragOver={(e) => {
                  if (arrastando === null) return
                  e.preventDefault() // permite soltar aqui
                  setAlvo(i)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (arrastando !== null) levar(arrastando, i)
                  terminar()
                }}
              >
                <span
                  className="paginas__pegador"
                  draggable
                  onDragStart={(e) => {
                    setArrastando(i)
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', String(i))
                  }}
                  onDragEnd={terminar}
                  title="Arraste para mudar a ordem"
                  aria-hidden="true"
                >
                  ⋮⋮
                </span>
                <input
                  className="campo__entrada"
                  aria-label={`Nome da página ${i + 1}`}
                  placeholder="Nome da página"
                  maxLength={120}
                  value={p.nome}
                  onChange={(e) => trocar(i, e.target.value)}
                />
                <button
                  type="button"
                  className="botao-icone"
                  onClick={() => levar(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Subir a página ${p.nome || i + 1}`}
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="botao-icone"
                  onClick={() => levar(i, i + 1)}
                  disabled={i === paginas.length - 1}
                  aria-label={`Descer a página ${p.nome || i + 1}`}
                  title="Descer"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="botao-icone botao-icone--remover"
                  onClick={() => remover(i)}
                  disabled={paginas.length === 1} // todo dashboard precisa de pelo menos 1 página
                  aria-label={`Remover a página ${p.nome || i + 1}`}
                  title={
                    paginas.length === 1
                      ? 'Todo dashboard precisa de pelo menos 1 página'
                      : p.codigo
                        ? 'Remover (a página fica desativada)'
                        : 'Remover'
                  }
                >
                  ✕
                </button>
              </li>
            ))}
          </ol>

          <button type="button" className="botao botao--fantasma paginas__adicionar" onClick={() => aoMudar([...paginas, novaPagina()])}>
            + Adicionar página
          </button>
        </div>

        <PreviaLateral nomeDashboard={nomeDashboard} paginas={paginas} />
      </div>

      {erro && <p className="campo__erro">{erro}</p>}

      {desativadas.length > 0 && (
        <details className="paginas__desativadas">
          <summary>Páginas desativadas ({desativadas.length})</summary>
          <ul>
            {desativadas.map((p) => (
              <li key={p.codigo}>
                {p.nome}
                <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => aoReativar(p)}>
                  Reativar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </fieldset>
  )
}
