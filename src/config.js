// Configurações do front lidas do .env (variáveis que começam com VITE_).
// Nada aqui é segredo: tudo o que o Vite lê vai parar no código que o navegador baixa.

// Endereço do Runrun.it para o botão "Abrir chamado". Enquanto não for definido,
// o botão aparece desabilitado.
export const LINK_CHAMADO = import.meta.env.VITE_LINK_CHAMADO || null

// Origem do Hub: a única de quem o link de embed aceita o token (postMessage).
// Ex.: https://unifecaf-hub-hml.app.unifecaf.edu.br · no computador, com o Hub simulado: http://localhost:5174
export const EMBED_HUB_ORIGIN = import.meta.env.VITE_EMBED_HUB_ORIGIN || null

// Endereço do portal UniData (link "Voltar ao portal" quando a entrada falha).
export const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || null
