// "Memória" da sessão da área do time de dados: quem está logado e o que pode ver.
//
// Conceito novo de React: Context. É um jeito de deixar uma informação disponível para
// todos os componentes de dentro, sem precisar passar por props de um em um.
// O <ProvedorSessao> busca quem está logado; qualquer componente de dentro usa
// useSessao() para saber o nome da pessoa ou se ela tem uma permissão.

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { enviar, obter } from '../api/cliente.js'

const ContextoSessao = createContext(null)

export function ProvedorSessao({ children }) {
  // situacao: 'carregando' | 'ok' | 'sem_sessao' | 'sem_acesso' | 'erro'
  const [estado, setEstado] = useState({ situacao: 'carregando', usuario: null })

  const recarregar = useCallback(async () => {
    try {
      const usuario = await obter('/portal/eu')
      setEstado({ situacao: 'ok', usuario })
    } catch (erro) {
      const situacao = erro.status === 401 ? 'sem_sessao' : erro.status === 403 ? 'sem_acesso' : 'erro'
      setEstado({ situacao, usuario: null, erro })
    }
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  const sair = useCallback(async () => {
    await enviar('/portal/sair').catch(() => null)
    setEstado({ situacao: 'sem_sessao', usuario: null })
  }, [])

  const tem = useCallback(
    (permissao) => Boolean(estado.usuario?.permissoes.includes(permissao)),
    [estado.usuario],
  )

  return (
    <ContextoSessao.Provider value={{ ...estado, recarregar, sair, tem }}>
      {children}
    </ContextoSessao.Provider>
  )
}

export function useSessao() {
  const sessao = useContext(ContextoSessao)
  if (!sessao) throw new Error('useSessao precisa estar dentro de <ProvedorSessao>')
  return sessao
}
