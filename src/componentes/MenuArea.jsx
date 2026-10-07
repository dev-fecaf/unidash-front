// Barra lateral da área do time de dados: "UniDash" e o selo "Administração" no topo,
// o menu de telas com ícones e, no final, "Portal UniData", "Sair" e, por último, quem está logado.
// Sempre aberta (não recolhe).
// Usa o mesmo visual da barra do dashboard (BarraLateral.css).

import { NavLink } from 'react-router-dom'

import logo from '../assets/logo-unifecaf.png'
import { TELAS } from '../paginas/area/telas.js'
import { useSessao } from '../sessao/Sessao.jsx'
import Icone from './Icone.jsx'
import './BarraLateral.css'
import './MenuArea.css'

export default function MenuArea() {
  const { tem, usuario, sair } = useSessao()
  const liberadas = TELAS.filter((t) => tem(t.permissao))

  return (
    <aside className="lateral menu-area">
      <div className="lateral__topo">
        <div className="lateral__marca">
          <img className="lateral__logo" src={logo} alt="UniFECAF" width="20" height="20" />
          <div className="menu-area__produto">
            <p className="lateral__titulo">UniDash</p>
            <p className="menu-area__selo">
              <span className="menu-area__bolinha" aria-hidden="true" />
              Administração
            </p>
          </div>
        </div>
      </div>

      <nav id="menu-area-telas" className="lateral__paginas" aria-label="Telas do UniDash">
        <ul>
          {liberadas.map((t) => (
            <li key={t.caminho}>
              <NavLink
                to={`/area/${t.caminho}`}
                className={({ isActive }) => `lateral__pagina menu-area__item${isActive ? ' lateral__pagina--ativa' : ''}`}
              >
                <Icone nome={t.icone} tamanho={18} />
                <span>{t.nome}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lateral__rodape menu-area__rodape">
        {usuario.portal_url && (
          <a className="lateral__chamado" href={usuario.portal_url}>
            <Icone nome="portal" tamanho={18} />
            <span>Portal UniData</span>
          </a>
        )}
        <button type="button" className="lateral__chamado" onClick={sair}>
          <Icone nome="sair" tamanho={18} />
          <span>Sair</span>
        </button>

        {/* Quem está logado: mesma "coluna" de ícone e texto das opções acima, para alinhar */}
        <div className="menu-area__usuario">
          <Icone nome="usuario" tamanho={18} />
          <span className="menu-area__identificacao">
            <span className="menu-area__nome">{usuario.nome}</span>
            <span className="menu-area__perfil">{usuario.perfil}</span>
          </span>
        </div>
      </div>
    </aside>
  )
}
