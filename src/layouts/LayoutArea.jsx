// Layout da área do time de dados: menu à esquerda, barra superior branca e o conteúdo.
// A barra superior é o que diferencia esta área do dashboard (que não tem barra superior).
// Quem está logado, "Portal UniData" e "Sair" ficam no final da barra lateral (MenuArea).

import { useEffect } from 'react'

import MenuArea from '../componentes/MenuArea.jsx'
import './LayoutArea.css'

export default function LayoutArea({ titulo, acoes, children }) {
  useEffect(() => {
    document.title = `${titulo} · UniDash`
  }, [titulo])

  return (
    <div className="layout-area">
      <MenuArea />

      <div className="layout-area__principal">
        <header className="topo">
          <h1 className="topo__titulo">{titulo}</h1>
          {/* Ações da tela (ex.: "Novo dashboard" no Gerador) */}
          {acoes && <div className="topo__acoes">{acoes}</div>}
        </header>

        <main className="layout-area__conteudo">{children}</main>
      </div>
    </div>
  )
}
