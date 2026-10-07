// Cliente da API do UniDash: o único lugar do front que faz chamadas ao back.
// Todas as rotas do back começam com /api/v1.
//
// O cookie da sessão (HttpOnly) vai junto sozinho em cada chamada: o front e o back
// ficam no mesmo endereço (o Vite, no computador, e o nginx, no CapRover, repassam /api).

const BASE = '/api/v1'

async function chamar(metodo, caminho, corpo) {
  const resposta = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  })
  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // Erro no padrão RFC 9457: guarda status, mensagem e trace_id para a tela mostrar
    const erro = new Error(dados?.detail || dados?.title || `Erro ${resposta.status}`)
    erro.status = resposta.status
    erro.traceId = dados?.trace_id ?? resposta.headers.get('X-Trace-Id')
    erro.corpo = dados
    throw erro
  }
  return dados
}

/** GET: busca dados no back. */
export const obter = (caminho) => chamar('GET', caminho)

/** POST: envia dados ao back (criar, entrar...). */
export const enviar = (caminho, corpo) => chamar('POST', caminho, corpo)

/** PUT: troca um registro pelo que for enviado (alterar). */
export const alterar = (caminho, corpo) => chamar('PUT', caminho, corpo)
