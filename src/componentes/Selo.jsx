// Selo de status de um dashboard: ponto colorido + texto (nunca só a cor).

import './Selo.css'

const STATUS = {
  rascunho: { texto: 'Rascunho', classe: 'selo--atencao' },
  publicado: { texto: 'Publicado', classe: 'selo--positivo' },
  desativado: { texto: 'Desativado', classe: 'selo--neutro' },
}

export default function Selo({ status }) {
  const { texto, classe } = STATUS[status] ?? STATUS.rascunho
  return (
    <span className={`selo ${classe}`}>
      <span className="selo__ponto" aria-hidden="true" />
      {texto}
    </span>
  )
}
