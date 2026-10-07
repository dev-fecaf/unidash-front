// Painel que desliza da direita por cima da tela, sem ocupar a tela toda (o resto fica escurecido).
// Fecha pelo X, pela tecla Esc ou clicando na área escurecida.
//
// Acessibilidade: é uma "caixa de diálogo" (role="dialog"); ao abrir, o foco vai para dentro dele;
// o Tab fica preso dentro do painel; ao fechar, o foco volta para o botão que o abriu.
//
// Uso:
//   <PainelLateral aberto={aberto} titulo="Novo dashboard" subtitulo="(opcional)" aoFechar={() => setAberto(false)}>
//     ...conteúdo...
//   </PainelLateral>

import { useEffect, useId, useRef } from 'react'

import './PainelLateral.css'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

export default function PainelLateral({ aberto, titulo, subtitulo, aoFechar, children }) {
  const idTitulo = useId()
  const painel = useRef(null)
  const quemAbriu = useRef(null)
  // Guarda a função de fechar numa "caixinha" (useRef): assim o efeito abaixo só roda ao abrir/fechar,
  // e não a cada letra digitada (o que devolveria o foco para o primeiro campo)
  const fechar = useRef(aoFechar)
  fechar.current = aoFechar

  useEffect(() => {
    if (!aberto) return undefined
    quemAbriu.current = document.activeElement
    // Foco no primeiro campo do painel (ou no próprio painel)
    const primeiro = painel.current?.querySelector('input, select, textarea') ?? painel.current
    primeiro?.focus()
    document.body.style.overflow = 'hidden' // a página de trás não rola

    function teclado(evento) {
      if (evento.key === 'Escape') {
        fechar.current()
        return
      }
      if (evento.key !== 'Tab' || !painel.current) return
      // Prende o Tab dentro do painel
      const itens = [...painel.current.querySelectorAll(FOCAVEIS)]
      if (itens.length === 0) return
      const [inicio, fim] = [itens[0], itens[itens.length - 1]]
      if (evento.shiftKey && document.activeElement === inicio) {
        evento.preventDefault()
        fim.focus()
      } else if (!evento.shiftKey && document.activeElement === fim) {
        evento.preventDefault()
        inicio.focus()
      }
    }

    document.addEventListener('keydown', teclado)
    return () => {
      document.removeEventListener('keydown', teclado)
      document.body.style.overflow = ''
      quemAbriu.current?.focus?.()
    }
  }, [aberto])

  if (!aberto) return null

  return (
    <div className="painel-lateral">
      <div className="painel-lateral__fundo" onClick={aoFechar} aria-hidden="true" />
      <section
        ref={painel}
        className="painel-lateral__caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        <header className="painel-lateral__cabecalho">
          <div>
            <h2 id={idTitulo} className="painel-lateral__titulo">
              {titulo}
            </h2>
            {subtitulo && <p className="painel-lateral__subtitulo">{subtitulo}</p>}
          </div>
          <button type="button" className="painel-lateral__fechar" onClick={aoFechar} aria-label="Fechar painel" title="Fechar (Esc)">
            ✕
          </button>
        </header>
        <div className="painel-lateral__conteudo">{children}</div>
      </section>
    </div>
  )
}
