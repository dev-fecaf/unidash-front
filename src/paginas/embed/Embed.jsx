// Link de embed: /embed/{hash} e /embed/{hash}/{codigo}. É o que o Hub abre dentro do iframe.
//
// Como funciona (detalhes em unidash-back/docs/integracao-hub.md):
// 1. A página abre vazia e avisa o Hub: postMessage({ type: 'embed:ready' }).
// 2. O Hub responde com o token: { type: 'hub:token', token }. Só aceitamos mensagens vindas
//    da origem do Hub (VITE_EMBED_HUB_ORIGIN).
// 3. O token vai para o back (POST /embed/entrar), que devolve a situação do dashboard e,
//    se liberado, a sessão e as páginas que a pessoa pode ver.
// 4. A sessão fica só na memória (useRef), nunca em cookie nem no navegador.
// 5. Um minuto antes de a sessão vencer, pedimos um token novo ao Hub ('embed:token-expired').
//
// Regra de 08/10/2026: dashboard SEM PASTA no front (src/dashboards/<identificador>/, criada pelo
// comando novo_dashboard e já publicada no site) não abre: mostra "em construção" e nem pede o
// token ao Hub (então também não grava acesso).
//
// Conceito novo de React: useRef guarda um valor entre um desenho e outro da tela sem
// redesenhar quando muda (bom para a sessão, que a tela não precisa mostrar).

import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { enviar } from '../../api/cliente.js'
import { EMBED_HUB_ORIGIN } from '../../config.js'
import { pecasDoDashboard } from '../../dashboards/pecas.js'
import { buscarDashboard } from '../../dashboards/registro.js'
import LayoutDashboard from '../../layouts/LayoutDashboard.jsx'
import AvisoEmbed from './AvisoEmbed.jsx'
import '../PaginaDashboard.css'

const ESPERA_MAXIMA_TOKEN = 15000 // ms sem resposta do Hub até mostrar a mensagem neutra
const INTERVALO_PEDIDO = 2000 // repete o "embed:ready" a cada 2 s (caso o Hub comece a ouvir depois)
const MENSAGEM_NEUTRA = 'Não foi possível validar o acesso a este dashboard. Recarregue a página e tente novamente.'

// Mensagens de cada situação (o back decide a situação; a tela só mostra)
const AVISOS = {
  aguardando: { titulo: 'Carregando o dashboard…', texto: '', carregando: true },
  em_construcao: { titulo: 'Este dashboard está em construção.', texto: 'Ele vai abrir aqui assim que for publicado.' },
  indisponivel: { titulo: 'Este dashboard não está mais disponível.', texto: '' },
  sem_paginas: { titulo: 'Você não tem acesso a nenhuma página deste dashboard.', texto: '' },
  fora_do_hub: { titulo: 'Este dashboard abre pelo Hub.', texto: 'Acesse o Hub e abra o dashboard por lá.' },
  erro: { titulo: MENSAGEM_NEUTRA, texto: '' },
}

// Diagnóstico no console do navegador (F12). Nunca mostra o token.
const avisar = (...partes) => console.warn('[UniDash embed]', ...partes)

// O Hub pode mandar o token logo que o iframe carrega, antes de a tela terminar de montar.
// Por isso já ouvimos desde que o código carrega e guardamos o token que chegar adiantado.
let tokenAdiantado = null
if (typeof window !== 'undefined' && EMBED_HUB_ORIGIN) {
  window.addEventListener('message', (evento) => {
    // Diagnóstico: toda mensagem vinda de fora aparece no console (só origem e tipo, nunca o token)
    if (evento.origin !== window.location.origin) {
      const tipo = evento.data && typeof evento.data === 'object' ? evento.data.type : typeof evento.data
      console.info('[UniDash embed] mensagem recebida de', evento.origin, '· type:', tipo)
    }
    if (evento.origin === EMBED_HUB_ORIGIN && evento.data?.type === 'hub:token' && typeof evento.data.token === 'string') {
      tokenAdiantado = evento.data.token
    }
  })
}

export default function Embed() {
  const { hash, codigo } = useParams()
  const [estado, setEstado] = useState({ fase: 'aguardando' })
  const sessao = useRef(null) // usada pelos endpoints de dados (etapa 3)
  const temPasta = Boolean(buscarDashboard(hash))

  useEffect(() => {
    // Sem pasta no front: o dashboard ainda não foi construído. Não fala com o Hub nem com o back.
    if (!temPasta) {
      avisar('dashboard sem pasta no front (src/dashboards/): mostrando "em construção"')
      setEstado({ fase: 'em_construcao' })
      return undefined
    }
    // Aberto fora de um iframe (direto no navegador): não há Hub para mandar o token
    if (window.parent === window) {
      setEstado({ fase: 'fora_do_hub' })
      return undefined
    }
    if (!EMBED_HUB_ORIGIN) {
      console.error('VITE_EMBED_HUB_ORIGIN não configurado')
      setEstado({ fase: 'erro' })
      return undefined
    }

    let renovacao = null
    const pedirToken = (tipo) => window.parent.postMessage({ type: tipo }, EMBED_HUB_ORIGIN)

    async function aoReceber(evento) {
      if (evento.origin === window.location.origin) return // mensagens da própria página (ferramentas do navegador)
      if (evento.origin !== EMBED_HUB_ORIGIN) {
        avisar('mensagem ignorada: veio de', evento.origin, 'e o Hub configurado é', EMBED_HUB_ORIGIN)
        return // só o Hub fala com a gente
      }
      if (evento.data?.type !== 'hub:token' || typeof evento.data.token !== 'string') {
        const tipo = typeof evento.data === 'object' && evento.data ? `campos: ${Object.keys(evento.data).join(', ')}; type: ${evento.data.type}` : typeof evento.data
        avisar('mensagem do Hub fora do formato { type: "hub:token", token: "..." } →', tipo)
        return
      }
      tokenAdiantado = null
      clearTimeout(limite)
      clearInterval(repeticao)
      try {
        const resposta = await enviar('/embed/entrar', { hash, token: evento.data.token })
        if (resposta.situacao !== 'liberado') {
          sessao.current = null
          setEstado({ fase: resposta.situacao })
          return
        }
        sessao.current = resposta.sessao
        setEstado({ fase: 'liberado', dashboard: resposta.dashboard })
        // Pede um token novo 1 minuto antes de a sessão vencer
        clearTimeout(renovacao)
        const segundos = Math.max(resposta.expira_em_segundos - 60, 30)
        renovacao = setTimeout(() => pedirToken('embed:token-expired'), segundos * 1000)
      } catch (erro) {
        console.error('Embed recusado', erro.status, erro.traceId)
        sessao.current = null
        setEstado({ fase: 'erro' })
      }
    }

    window.addEventListener('message', aoReceber)
    const limite = setTimeout(() => {
      clearInterval(repeticao)
      avisar('nenhum token do Hub em', ESPERA_MAXIMA_TOKEN / 1000, 's (o Hub respondeu ao "embed:ready"?)')
      setEstado((atual) => (atual.fase === 'aguardando' ? { fase: 'erro' } : atual))
    }, ESPERA_MAXIMA_TOKEN)
    let repeticao = null
    if (tokenAdiantado) {
      aoReceber({ origin: EMBED_HUB_ORIGIN, data: { type: 'hub:token', token: tokenAdiantado } })
    } else {
      pedirToken('embed:ready')
      console.info('[UniDash embed] "embed:ready" enviado para', EMBED_HUB_ORIGIN)
      // Se o Hub ainda não estava ouvindo, o pedido se perde: repete até o token chegar (ou o limite)
      repeticao = setInterval(() => pedirToken('embed:ready'), INTERVALO_PEDIDO)
    }

    // Limpeza: ao sair da página, para de ouvir o Hub e cancela os relógios
    return () => {
      window.removeEventListener('message', aoReceber)
      clearTimeout(renovacao)
      clearTimeout(limite)
      clearInterval(repeticao)
    }
  }, [hash, temPasta])

  const dashboard = estado.dashboard
  const pagina = dashboard?.paginas.find((p) => p.codigo === codigo)

  useEffect(() => {
    if (dashboard && pagina) document.title = `${pagina.nome} · ${dashboard.nome}`
  }, [dashboard, pagina])

  if (estado.fase !== 'liberado') {
    const aviso = AVISOS[estado.fase] ?? AVISOS.erro
    return <AvisoEmbed {...aviso} />
  }

  // Sem página no endereço, ou página não liberada: vai para a primeira liberada
  if (!pagina) return <Navigate to={`/embed/${hash}/${dashboard.paginas[0].codigo}`} replace />

  // Cores e conteúdo da página vêm da pasta do dashboard (src/dashboards/<identificador>/), se existir
  const { classe, Conteudo } = pecasDoDashboard(hash, pagina.codigo)

  return (
    <LayoutDashboard dashboard={dashboard} caminhoBase="/embed" classe={classe}>
      {Conteudo ? (
        <Conteudo dashboard={dashboard} pagina={pagina} />
      ) : (
        <>
          <header className="pagina__cabecalho">
            <p className="pagina__breadcrumb">{dashboard.nome}</p>
            <h1>{pagina.nome}</h1>
          </header>
          <p className="pagina__preparo">Os gráficos desta página ainda estão em preparação.</p>
        </>
      )}
    </LayoutDashboard>
  )
}
