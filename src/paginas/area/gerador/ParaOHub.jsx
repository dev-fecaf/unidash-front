// Cartão "Cadastro no Hub": "Link para o Hub" (embed do dashboard), "Código (hash)" e, fechado,
// o link de cada página (opcional, para atalhos). Cada um com botão Copiar.

import { useState } from 'react'

import { HUB_URL } from '../../../config.js'

// Também usado no formulário (comando que cria as pastas do dashboard)
export function Copiavel({ rotulo, valor }) {
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
    <div className="copiavel">
      <span className="copiavel__rotulo">{rotulo}</span>
      <code className="copiavel__valor">{valor}</code>
      <button type="button" className="botao botao--secundario botao--pequeno" onClick={copiar}>
        {copiado ? 'Copiado ✓' : 'Copiar'}
      </button>
      <span className="visualmente-oculto" aria-live="polite">
        {copiado ? `${rotulo} copiado` : ''}
      </span>
    </div>
  )
}

export default function ParaOHub({ hash, paginas = [] }) {
  // O Hub tem dois campos: o link, com o texto {hash} no lugar do código (o próprio Hub troca),
  // e o código (hash) logo abaixo. Por isso o link vai com "{hash}" literal, não com o código.
  const base = `${window.location.origin}/embed/{hash}`
  const ativas = paginas.filter((p) => p.ativo)
  return (
    <div className="para-hub">
      <div className="para-hub__topo">
        <p className="campo__ajuda">No Hub: o link no campo de cima e o código no de baixo.</p>
        {HUB_URL && (
          // Abre o Hub numa aba nova, para copiar daqui e colar lá sem perder o formulário
          <a className="botao botao--secundario botao--pequeno" href={HUB_URL} target="_blank" rel="noopener noreferrer">
            Abrir o Hub
            <span className="visualmente-oculto"> (abre em outra aba)</span>
          </a>
        )}
      </div>
      <Copiavel rotulo="Link para o Hub" valor={base} />
      <Copiavel rotulo="Código (hash)" valor={hash} />
      <p className="campo__ajuda">O link é o mesmo para todo dashboard: o Hub troca o {'{hash}'} pelo código. Abre na primeira página. O código nunca muda.</p>

      {ativas.length > 0 && (
        <details className="para-hub__paginas">
          <summary>Link de cada página ({ativas.length})</summary>
          <p className="campo__ajuda">
            Para um atalho no Hub direto numa página, ou para liberar só algumas páginas a um time: o código da
            página é o final do link.
          </p>
          {ativas.map((p) => (
            <Copiavel key={p.codigo} rotulo={p.nome} valor={`${base}/${p.codigo}`} />
          ))}
        </details>
      )}

      <p className="campo__ajuda">Os links usam o endereço deste ambiente ({window.location.origin}).</p>
    </div>
  )
}
