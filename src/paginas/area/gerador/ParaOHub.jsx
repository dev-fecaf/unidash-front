// Cartão "Cadastro no Hub": "Link para o Hub" (embed do dashboard), "Código (hash)" e, fechado,
// o link de cada página (opcional, para atalhos). Cada um com botão Copiar.

import { useState } from 'react'

function Copiavel({ rotulo, valor }) {
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
  const base = `${window.location.origin}/embed/${hash}`
  const ativas = paginas.filter((p) => p.ativo)
  return (
    <div className="para-hub">
      <p className="campo__ajuda">Cadastre no Hub o link e o código.</p>
      <Copiavel rotulo="Link para o Hub" valor={base} />
      <Copiavel rotulo="Código (hash)" valor={hash} />
      <p className="campo__ajuda">O link abre o dashboard na primeira página. O código nunca muda.</p>

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
