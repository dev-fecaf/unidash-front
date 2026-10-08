// Barra lateral esquerda de todo dashboard: nome do dashboard, páginas e "Abrir chamado".
// Recebe tudo por props, então serve para qualquer dashboard.
// Recolhida, mostra só o botão de expandir e o "Abrir chamado"; as páginas voltam ao expandir.

import { NavLink } from 'react-router-dom'

import logo from '../assets/logo1.png'
import Icone from './Icone.jsx'
import './BarraLateral.css'

export default function BarraLateral({ dashboard, recolhida, aoAlternar, linkChamado, caminhoBase = '/embed' }) {
  return (
    <aside className={`lateral${recolhida ? ' lateral--recolhida' : ''}`}>
      <div className="lateral__topo">
        <div className="lateral__marca">
          <img className="lateral__logo" src={logo} alt="UniFECAF" width="26" height="26" />
          {!recolhida && (
            <p className="lateral__titulo" title={dashboard.nome}>
              {dashboard.nome}
            </p>
          )}
        </div>
        <button
          type="button"
          className="lateral__alternar"
          onClick={aoAlternar}
          aria-expanded={!recolhida}
          aria-controls="lateral-paginas"
          aria-label={recolhida ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          title={recolhida ? 'Expandir' : 'Recolher'}
        >
          <Icone nome={recolhida ? 'expandir' : 'recolher'} />
        </button>
      </div>

      <nav
        id="lateral-paginas"
        className="lateral__paginas"
        aria-label="Páginas do dashboard"
        hidden={recolhida}
      >
        <p className="lateral__rotulo">Páginas</p>
        <ul>
          {dashboard.paginas.map((pagina) => (
            <li key={pagina.codigo}>
              {/* NavLink marca sozinho a página aberta (classe ativa e aria-current="page") */}
              <NavLink
                to={`${caminhoBase}/${dashboard.hash}/${pagina.codigo}`}
                className={({ isActive }) => `lateral__pagina${isActive ? ' lateral__pagina--ativa' : ''}`}
              >
                {pagina.nome}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lateral__rodape">
        {linkChamado ? (
          <a className="lateral__chamado" href={linkChamado} target="_blank" rel="noopener noreferrer">
            <Icone nome="chamado" />
            <span className={recolhida ? 'visualmente-oculto' : undefined}>Abrir chamado</span>
            <span className="visualmente-oculto"> (abre em nova aba)</span>
          </a>
        ) : (
          <button
            type="button"
            className="lateral__chamado"
            disabled
            title="Endereço do Runrun.it ainda não configurado (VITE_LINK_CHAMADO)"
          >
            <Icone nome="chamado" />
            <span className={recolhida ? 'visualmente-oculto' : undefined}>Abrir chamado</span>
          </button>
        )}
      </div>
    </aside>
  )
}
