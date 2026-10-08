// Embaixo do campo Nome, em tempo real: o identificador (nome técnico do dashboard) e, numa lista
// com rótulos, onde ele é usado: schema no DW, pasta do front e pasta do back
// (convenção em src/dashboards/caminhos.js). Redesenhado em 08/10/2026: "No banco:" confundia.
//
// - Dashboard novo: o identificador é calculado na hora (mesma regra do back) e, logo depois,
//   conferido pelo back. Se ele não puder ser usado (já é de outro dashboard, é um schema reservado
//   do DW ou o schema já existe no DW), aparece o motivo em vermelho: o cadastro seria recusado.
//   Não existe mais _2, _3 (decidido em 08/10/2026).
// - Dashboard existente: o identificador é o gravado no banco, fixo (não muda ao renomear).
// O título em si aparece na prévia da barra lateral, na seção Páginas.
//
// Schema no DW (08/10/2026): o nome é o próprio identificador, e o back cria o schema vazio ao
// cadastrar (app/dominios/gerador/schema_dw.py). Na edição, mostra se ele existe e, se não
// existir (o DW falhou na hora), o botão "Criar agora".

import { useEffect, useState } from 'react'

import { enviar, obter } from '../../../api/cliente.js'
import { caminhoBack, caminhoFront, schemaDw } from '../../../dashboards/caminhos.js'
import { gerarSlug } from './identificador.js'

// O que aparece ao lado do nome do schema, conforme a situação que o back devolveu
const SITUACAO_DW = {
  existe: { texto: 'criado no DW', classe: 'ok' },
  criado: { texto: 'criado no DW agora', classe: 'ok' },
  ja_existia: { texto: 'já existia no DW; o UniDash não mexeu nele', classe: 'atencao' },
  nao_existe: { texto: 'ainda não existe no DW', classe: 'atencao', podeCriar: true },
  erro: { texto: 'não foi possível falar com o DW', classe: 'atencao', podeCriar: true },
  desligado: { texto: 'DW não configurado neste ambiente', classe: '' },
}

function SchemaDw({ hash, inicial }) {
  const [schema, setSchema] = useState(inicial)
  const [criando, setCriando] = useState(false)

  async function criarAgora() {
    setCriando(true)
    try {
      setSchema(await enviar(`/gerador/dashboards/${hash}/schema-dw`))
    } catch {
      setSchema((atual) => ({ ...atual, situacao: 'erro' }))
    } finally {
      setCriando(false)
    }
  }

  const info = SITUACAO_DW[schema.situacao]
  return (
    <>
      <span className={`identificador__nota identificador__nota--${info.classe}`}>{info.texto}</span>
      {info.podeCriar && (
        <button type="button" className="identificador__acao" onClick={criarAgora} disabled={criando}>
          {criando ? 'Criando…' : schema.situacao === 'erro' ? 'Tentar de novo' : 'Criar agora'}
        </button>
      )}
    </>
  )
}

// hash e schema (situação no DW) só existem na edição
export default function PreviaNome({ nome, slugFixo, hash, schema }) {
  const local = gerarSlug(nome)
  const [confirmado, setConfirmado] = useState(null) // { para: slug local, disponivel, motivo }

  // Pergunta ao back o identificador final, 400 ms depois que a pessoa para de digitar
  useEffect(() => {
    if (slugFixo || !local) return undefined
    const espera = setTimeout(() => {
      obter(`/gerador/identificador?nome=${encodeURIComponent(nome)}`)
        .then((r) => setConfirmado({ para: local, disponivel: r.disponivel, motivo: r.motivo }))
        .catch(() => setConfirmado(null))
    }, 400)
    return () => clearTimeout(espera)
  }, [nome, local, slugFixo])

  if (!slugFixo && !nome.trim()) return null

  const slug = slugFixo ?? local
  const recusado = !slugFixo && confirmado?.para === local && !confirmado.disponivel

  if (!slug) {
    return <p className="campo__erro">O nome precisa ter pelo menos uma letra ou um número.</p>
  }

  return (
    <div className="identificador" aria-live="polite">
      <p className="identificador__titulo">
        Identificador <code>{slug}</code>
        <span className="identificador__nota">
          {slugFixo ? 'não muda mais, mesmo se o nome mudar' : 'sai do nome; não muda depois de criado'}
        </span>
      </p>
      {recusado && <p className="campo__erro">{confirmado.motivo}</p>}
      <dl className="identificador__usos">
        <div className="identificador__uso">
          <dt>Schema no DW</dt>
          <dd>
            <code>{schemaDw(slug)}</code>
            {schema ? (
              <SchemaDw key={hash} hash={hash} inicial={schema} />
            ) : (
              !slugFixo && <span className="identificador__nota">criado vazio ao salvar</span>
            )}
          </dd>
        </div>
        <div className="identificador__uso">
          <dt>Pasta do front</dt>
          <dd>
            <code>unidash-front/{caminhoFront(slug)}</code>
          </dd>
        </div>
        <div className="identificador__uso">
          <dt>Pasta do back</dt>
          <dd>
            <code>unidash-back/{caminhoBack(slug)}</code>
          </dd>
        </div>
      </dl>
    </div>
  )
}
