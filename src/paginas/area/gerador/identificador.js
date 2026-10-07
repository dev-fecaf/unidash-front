// Identificador (slug) do dashboard, gerado a partir do nome — para a prévia em tempo real.
// É a MESMA regra do back (unidash-back/app/dominios/gerador/identificador.py); se mudar lá, mude aqui.
// O identificador final (com _2, _3... se já existir) é confirmado pelo back (GET /gerador/identificador).
//
// Exemplo: "Executivo Financeiro – 2026" → "executivo_financeiro_2026"

const TAMANHO_MAXIMO = 50

export function gerarSlug(nome) {
  let texto = nome
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // tira os acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // tudo que não for letra ou número vira _
    .replace(/^_+|_+$/g, '') // tira _ das pontas
  if (!texto) return ''
  if (!/^[a-z]/.test(texto)) texto = `d_${texto}` // schema não pode começar com número
  return texto.slice(0, TAMANHO_MAXIMO).replace(/_+$/, '')
}
