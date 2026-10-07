// Tela simples de aviso da entrada: "entrando…", "entre pelo portal", "sem acesso".

import logo from '../../assets/logo-unifecaf.png'
import { PORTAL_URL } from '../../config.js'
import './AvisoEntrada.css'

export default function AvisoEntrada({ titulo, mensagem, traceId, carregando = false }) {
  return (
    <main className="aviso-entrada">
      <div className="aviso-entrada__caixa" role={carregando ? 'status' : 'alert'}>
        <img src={logo} alt="UniFECAF" width="32" height="32" />
        <h2>{titulo}</h2>
        <p>{mensagem}</p>
        {traceId && (
          <p className="aviso-entrada__codigo">
            Código para suporte: <code>{traceId}</code>
          </p>
        )}
        {!carregando && PORTAL_URL && (
          <a className="aviso-entrada__botao" href={PORTAL_URL}>
            Voltar ao portal UniData
          </a>
        )}
      </div>
    </main>
  )
}
