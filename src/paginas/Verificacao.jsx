// Tela de conferência (só para desenvolvimento): mostra se o front conversa com o back
// e os tokens do design system. Fica em "/" até existir a Visão geral (etapa 4).

import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { obter } from '../api/cliente.js'
import './Verificacao.css'

const CORES = [
  ['--cor-lateral', 'Barra lateral'],
  ['--cor-fundo', 'Fundo dos dashboards'],
  ['--cor-superficie', 'Cards'],
  ['--cor-institucional', 'Institucional'],
  ['--cor-texto', 'Texto'],
  ['--cor-texto-suave', 'Texto suave'],
  ['--cor-positivo', 'Positivo'],
  ['--cor-atencao', 'Atenção'],
  ['--cor-negativo', 'Negativo'],
]

const TAMANHOS = [
  ['--text-xs', '13px'],
  ['--text-sm', '14px'],
  ['--text-md', '15px'],
  ['--text-lg', '18px'],
  ['--text-xl', '22px'],
  ['--text-display', '32px'],
]

function StatusDoBack() {
  // "estado": a situação da chamada ao back. Quando muda, o React redesenha o componente.
  const [estado, setEstado] = useState({ situacao: 'carregando' })

  // useEffect roda depois que o componente aparece na tela: é aqui que chamamos o back.
  useEffect(() => {
    obter('/saude')
      .then((corpo) => setEstado({ situacao: 'ok', corpo }))
      .catch((erro) => setEstado({ situacao: 'erro', erro }))
  }, [])

  if (estado.situacao === 'carregando') {
    return <p className="status">Consultando o back…</p>
  }
  if (estado.situacao === 'erro') {
    const banco = estado.erro.corpo?.banco
    return (
      <p className="status status--negativo" role="alert">
        ✕ Back com problema{banco ? ` (banco: ${banco})` : ''}. Ele está ligado em localhost:8000?
      </p>
    )
  }
  return (
    <p className="status status--positivo">
      ✓ Back no ar · ambiente <strong>{estado.corpo.ambiente}</strong> · banco <strong>{estado.corpo.banco}</strong>
    </p>
  )
}

export default function Verificacao() {
  return (
    <main className="verificacao">
      <h1>UniDash</h1>
      <p className="verificacao__subtitulo">Conferência do front</p>

      {import.meta.env.DEV && (
        <section className="card">
          <h3>Layout do dashboard</h3>
          <p style={{ margin: 0 }}>
            <Link to="/embed/exemplo">Abrir o dashboard de exemplo</Link> (só no computador)
          </p>
        </section>
      )}

      <section className="card">
        <h3>Conexão com o back</h3>
        <StatusDoBack />
      </section>

      <section className="card">
        <h3>Cores</h3>
        <ul className="cores">
          {CORES.map(([token, nome]) => (
            <li key={token}>
              <span className="cores__amostra" style={{ background: `var(${token})` }} />
              <span>{nome}</span>
              <code>{token}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Montserrat · escala de tamanhos</h3>
        {TAMANHOS.map(([token, px]) => (
          <p key={token} style={{ fontSize: `var(${token})`, lineHeight: `var(${token}-lh)`, margin: 0 }}>
            Aa Amostra de texto <code>{token} · {px}</code>
          </p>
        ))}
      </section>
    </main>
  )
}
