// Pré-visualização de um dashboard dentro da área do time de dados.
// Mesmo visual do embed do Hub, com uma faixa no topo. Não grava acesso.

import { Link } from 'react-router-dom'

import PaginaDashboard from '../PaginaDashboard.jsx'
import './Previa.css'

function FaixaPrevia() {
  return (
    <div className="faixa-previa" role="note">
      <span>
        <strong>Pré-visualização</strong> · não grava acesso
      </span>
      <Link to="/area/dashboards">← Voltar aos dashboards</Link>
    </div>
  )
}

export default function Previa() {
  return <PaginaDashboard caminhoBase="/area/dashboards" aviso={<FaixaPrevia />} />
}
