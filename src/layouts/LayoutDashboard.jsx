// Layout padrão de todo dashboard: barra lateral à esquerda e o conteúdo da página à direita.
// O conteúdo (children) é o que vem entre <LayoutDashboard> e </LayoutDashboard>.
// `classe` (opcional): "dashboard-<identificador>", que liga as cores do tema.css da pasta do dashboard.

import { useState } from 'react'

import BarraLateral from '../componentes/BarraLateral.jsx'
import { LINK_CHAMADO } from '../config.js'
import './LayoutDashboard.css'

// Em telas estreitas, a barra lateral já começa recolhida
const comecaRecolhida = () => window.matchMedia('(max-width: 768px)').matches

export default function LayoutDashboard({ dashboard, caminhoBase, aviso, classe, children }) {
  const [recolhida, setRecolhida] = useState(comecaRecolhida)

  return (
    <div className={classe ? `layout-dashboard ${classe}` : 'layout-dashboard'}>
      <BarraLateral
        dashboard={dashboard}
        recolhida={recolhida}
        aoAlternar={() => setRecolhida((atual) => !atual)}
        linkChamado={LINK_CHAMADO}
        caminhoBase={caminhoBase}
      />
      <main className="layout-dashboard__conteudo">
        {aviso}
        {children}
      </main>
    </div>
  )
}
