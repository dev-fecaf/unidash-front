// Embaixo do campo Nome, em tempo real: "No banco: <identificador>" e, numa segunda linha,
// a pasta do dashboard no front e o schema no DW (que usam o mesmo identificador).
//
// - Dashboard novo: o identificador é calculado na hora (mesma regra do back) e, logo depois,
//   confirmado pelo back, que acrescenta _2, _3... se já existir um igual.
// - Dashboard existente: o identificador é o gravado no banco, fixo (não muda ao renomear).
// O título em si aparece na prévia da barra lateral, na seção Páginas.

import { useEffect, useState } from 'react'

import { obter } from '../../../api/cliente.js'
import { gerarSlug } from './identificador.js'

export default function PreviaNome({ nome, slugFixo }) {
  const local = gerarSlug(nome)
  const [confirmado, setConfirmado] = useState(null) // { para: slug local, slug: slug final }

  // Pergunta ao back o identificador final, 400 ms depois que a pessoa para de digitar
  useEffect(() => {
    if (slugFixo || !local) return undefined
    const espera = setTimeout(() => {
      obter(`/gerador/identificador?nome=${encodeURIComponent(nome)}`)
        .then((r) => setConfirmado({ para: local, slug: r.slug }))
        .catch(() => setConfirmado(null))
    }, 400)
    return () => clearTimeout(espera)
  }, [nome, local, slugFixo])

  if (!slugFixo && !nome.trim()) return null

  const slug = slugFixo ?? (confirmado?.para === local ? confirmado.slug : local)
  const ganhouSufixo = !slugFixo && confirmado?.para === local && confirmado.slug !== local

  if (!slug) {
    return <p className="campo__erro">O nome precisa ter pelo menos uma letra ou um número.</p>
  }

  return (
    <div className="identificador" aria-live="polite">
      <p className="identificador__linha">
        <span>No banco:</span> <code>{slug}</code>
        {slugFixo && <span className="identificador__nota">fixo desde a criação</span>}
        {ganhouSufixo && <span className="identificador__nota">já existia um igual, por isso o final {slug.slice(local.length)}</span>}
      </p>
      <p className="identificador__linha">
        <span>Pasta:</span> <code>src/dashboards/{slug}/</code>
        <span className="identificador__separador" aria-hidden="true">·</span>
        <span>Schema no DW:</span> <code>dash_{slug}</code>
      </p>
    </div>
  )
}
