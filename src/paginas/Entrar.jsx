// /entrar#ingresso=...  —  porta de entrada vinda do card Dashboards do portal UniData.
//
// 1. Lê o ingresso do endereço e o APAGA da barra de endereço na hora (não fica no histórico).
// 2. Entrega o ingresso ao back, que confere e abre a sessão (cookie).
// 3. Leva a pessoa para a área do time de dados.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { enviar } from '../api/cliente.js'
import AvisoEntrada from './area/AvisoEntrada.jsx'

function lerIngresso() {
  const parametros = new URLSearchParams(window.location.hash.slice(1))
  return parametros.get('ingresso')
}

export default function Entrar() {
  const navegar = useNavigate()
  const [erro, setErro] = useState(null)
  // O React, no modo de desenvolvimento, roda os efeitos duas vezes de propósito.
  // O ingresso só pode ser usado uma vez, então esta "trava" garante um único envio.
  const jaEnviou = useRef(false)

  useEffect(() => {
    if (jaEnviou.current) return
    jaEnviou.current = true

    const ingresso = lerIngresso()
    window.history.replaceState(null, '', window.location.pathname) // apaga o #ingresso=...

    if (!ingresso) {
      setErro({ mensagem: 'Nenhum ingresso recebido. Entre pelo card Dashboards do portal UniData.' })
      return
    }
    enviar('/portal/entrar', { ingresso })
      .then(() => navegar('/area', { replace: true }))
      .catch((e) => setErro({ mensagem: e.message, traceId: e.traceId }))
  }, [navegar])

  if (erro) {
    return <AvisoEntrada titulo="Não foi possível entrar" mensagem={erro.mensagem} traceId={erro.traceId} />
  }
  return <AvisoEntrada titulo="Entrando no UniDash…" mensagem="Conferindo o seu acesso." carregando />
}
