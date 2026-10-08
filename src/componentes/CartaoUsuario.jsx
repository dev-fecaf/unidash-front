// Quem está logado, no fim do menu da área (modelo da Letícia, 08/10/2026): cartão com as iniciais,
// o nome, o perfil e uma setinha. Clicar abre, por cima do cartão, um menu branco com "Sair"
// ("Portal UniData" fica fora do menu, solto na barra, logo acima do cartão: MenuArea.jsx). Fecha ao clicar fora ou ao apertar Esc.

import { useEffect, useRef, useState } from 'react'

import Icone from './Icone.jsx'

// Nome do perfil para mostrar (o banco guarda o código). Perfil novo sem nome aqui: mostra o código arrumado.
const NOMES_PERFIL = {
  admin: 'Administrador',
  engenharia_dados: 'Engenharia de dados',
  analista_bi: 'Analista de BI',
  usuario_negocio: 'Usuário de negócio',
}

const nomeDoPerfil = (codigo) => {
  if (!codigo) return ''
  if (NOMES_PERFIL[codigo]) return NOMES_PERFIL[codigo]
  const texto = codigo.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// "Leticia Dias" -> "LD"; "Leticia" -> "L"
const iniciais = (nome = '') => {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export default function CartaoUsuario({ usuario, aoSair }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)
  const botao = useRef(null)

  // Fecha ao clicar fora ou apertar Esc (e devolve o foco ao cartão)
  useEffect(() => {
    if (!aberto) return undefined
    const clique = (e) => {
      if (!caixa.current?.contains(e.target)) setAberto(false)
    }
    const tecla = (e) => {
      if (e.key === 'Escape') {
        setAberto(false)
        botao.current?.focus()
      }
    }
    document.addEventListener('mousedown', clique)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', clique)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])

  return (
    <div className="usuario" ref={caixa}>
      {aberto && (
        <div className="usuario__menu" id="usuario-menu">
          <button type="button" className="usuario__opcao" onClick={aoSair}>
            <Icone nome="sair" tamanho={18} />
            Sair
          </button>
        </div>
      )}

      <button
        type="button"
        ref={botao}
        className={`usuario__cartao${aberto ? ' usuario__cartao--aberto' : ''}`}
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-controls="usuario-menu"
      >
        <span className="usuario__avatar" aria-hidden="true">
          {iniciais(usuario.nome)}
        </span>
        <span className="usuario__identificacao">
          <span className="usuario__nome">{usuario.nome}</span>
          <span className="usuario__perfil">{nomeDoPerfil(usuario.perfil)}</span>
        </span>
        <Icone nome="expandir" tamanho={16} />
        <span className="visualmente-oculto">: opções da conta</span>
      </button>
    </div>
  )
}
