// Gerador: formulário para criar ou editar um dashboard. Aparece dentro do painel lateral da lista
// do Gerador (/area/gerador/novo e /area/gerador/{hash}).
//
// Props: hash (vazio = dashboard novo), mensagemInicial, aoSalvar(dashboard, criado), aoCancelar()
//
// Regras (as mesmas do back, que é quem garante de verdade):
// - páginas removidas ficam desativadas (podem ser reativadas aqui);
// - todo dashboard precisa de pelo menos 1 página (o link de embed abre a primeira);
// - ao criar, o dashboard nasce como rascunho (o status só aparece na edição);
// - publicar sem configuração no front gera um AVISO (não bloqueia);
// - dashboard não se exclui: para tirar de uso, status "Desativado".

import { useEffect, useState } from 'react'

import { alterar, enviar, obter } from '../../../api/cliente.js'
import Dica from '../../../componentes/Dica.jsx'
import SeletorOpcoes from '../../../componentes/SeletorOpcoes.jsx'
import { buscarDashboard } from '../../../dashboards/registro.js'
import CampoCategoria from './CampoCategoria.jsx'
import EditorPaginas, { novaPagina } from './EditorPaginas.jsx'
import ParaOHub, { Copiavel } from './ParaOHub.jsx'
import PreviaNome from './PreviaNome.jsx'
import './Gerador.css'

// Na ordem do "ciclo de vida": nasce rascunho, é publicado e, um dia, desativado
const STATUS = [
  { valor: 'rascunho', texto: 'Rascunho' },
  { valor: 'publicado', texto: 'Publicado' },
  { valor: 'desativado', texto: 'Desativado' },
]

const EXPLICACAO_STATUS = {
  rascunho: 'em construção. O link já pode estar cadastrado no Hub, mas só abre para os colaboradores quando for publicado.',
  publicado: 'no ar. Abre para os colaboradores pelo Hub.',
  desativado: 'fora de uso. Não abre mais pelo Hub; não é excluído, e o histórico de acessos continua guardado.',
}

const FORMULARIO_VAZIO = { nome: '', descricao: '', categoria_id: '', status: 'rascunho', paginas: [novaPagina()] }

// Converte o dashboard que veio do back para o formato do formulário
function paraFormulario(d) {
  return {
    nome: d.nome,
    descricao: d.descricao ?? '',
    categoria_id: String(d.categoria_id),
    status: d.status,
    paginas: d.paginas.filter((p) => p.ativo).map((p) => ({ chave: p.codigo, codigo: p.codigo, nome: p.nome })),
  }
}

// Confere o básico antes de mandar ao back (o back confere de novo)
function conferir(form) {
  const erros = {}
  if (!form.nome.trim()) erros.nome = 'Informe o nome do dashboard.'
  if (!form.categoria_id) erros.categoria = 'Escolha uma categoria.'
  if (form.paginas.some((p) => !p.nome.trim())) erros.paginas = 'Toda página precisa de um nome (ou remova a página vazia).'
  const nomes = form.paginas.map((p) => p.nome.trim().toLowerCase()).filter(Boolean)
  if (new Set(nomes).size !== nomes.length) erros.paginas = 'Duas páginas não podem ter o mesmo nome.'
  if (form.paginas.length === 0) erros.paginas = 'O dashboard precisa de pelo menos 1 página. Clique em “+ Adicionar página”.'
  return erros
}

export default function FormularioDashboard({ hash, mensagemInicial = null, aoSalvar, aoCancelar }) {
  const editando = Boolean(hash)

  const [form, setForm] = useState(FORMULARIO_VAZIO)
  const [desativadas, setDesativadas] = useState([])
  const [salvo, setSalvo] = useState(null) // dashboard como está no banco
  const [situacao, setSituacao] = useState(editando ? 'carregando' : 'ok')
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [avisoPublicar, setAvisoPublicar] = useState(false)
  const [mensagem, setMensagem] = useState(mensagemInicial)

  function carregar(d) {
    setSalvo(d)
    setForm(paraFormulario(d))
    setDesativadas(d.paginas.filter((p) => !p.ativo))
  }

  useEffect(() => {
    if (!editando) return
    obter(`/gerador/dashboards/${hash}`)
      .then((d) => {
        carregar(d)
        setSituacao('ok')
      })
      .catch((erro) => {
        setErroGeral(erro)
        setSituacao(erro.status === 404 ? 'nao_encontrado' : 'erro')
      })
  }, [editando, hash])

  const mudar = (campo) => (valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setMensagem(null)
  }

  const semConfiguracao = !editando || !buscarDashboard(hash)

  // Há algo preenchido que ainda não foi salvo? (usado para perguntar antes de sair do formulário)
  const referencia = salvo ? paraFormulario(salvo) : FORMULARIO_VAZIO
  const temAlteracoes =
    form.nome !== referencia.nome ||
    form.descricao !== referencia.descricao ||
    form.categoria_id !== referencia.categoria_id ||
    form.status !== referencia.status ||
    JSON.stringify(form.paginas.map((p) => [p.codigo, p.nome])) !==
      JSON.stringify(referencia.paginas.map((p) => [p.codigo, p.nome]))

  async function salvar(evento) {
    evento.preventDefault()
    const encontrados = conferir(form)
    setErros(encontrados)
    setErroGeral(null)
    if (Object.keys(encontrados).length) return

    // Publicar sem configuração no front: avisa uma vez antes de seguir
    const vaiPublicar = form.status === 'publicado' && salvo?.status !== 'publicado'
    if (vaiPublicar && semConfiguracao && !avisoPublicar) {
      setAvisoPublicar(true)
      return
    }

    const corpo = {
      nome: form.nome,
      descricao: form.descricao.trim() || null,
      categoria_id: Number(form.categoria_id),
      status: form.status,
      paginas: form.paginas.map(({ codigo, nome }) => ({ codigo, nome })),
    }
    setSalvando(true)
    try {
      if (editando) {
        const alterado = await alterar(`/gerador/dashboards/${hash}`, corpo)
        carregar(alterado)
        aoSalvar(alterado, false) // a lista fecha o painel e mostra "Alterações salvas"
      } else {
        aoSalvar(await enviar('/gerador/dashboards', corpo), true) // a lista abre a edição do criado
      }
      setAvisoPublicar(false)
    } catch (erro) {
      setErroGeral(erro)
    } finally {
      setSalvando(false)
    }
  }

  if (situacao === 'carregando') return <p className="gerador__mensagem">Carregando…</p>
  if (situacao === 'nao_encontrado') {
    return (
      <p className="mensagem mensagem--erro" role="alert">
        Dashboard não encontrado.
      </p>
    )
  }

  return (
    <div className="gerador gerador--painel">
      {mensagem && (
        <p className="mensagem mensagem--sucesso" role="status">
          {mensagem}
        </p>
      )}

      <form className="formulario" onSubmit={salvar} noValidate>
        <section className="formulario__secao" aria-labelledby="secao-identificacao">
          <header className="formulario__secao-cabecalho">
            <span className="formulario__passo" aria-hidden="true">1</span>
            <h3 id="secao-identificacao">Identificação</h3>
          </header>

          <div className="campo">
            <span className="campo__rotulo-linha">
              <label className="campo__rotulo" htmlFor="nome">
                Nome
              </label>
              <Dica
                posicao="abaixo"
                rotulo="Sobre o nome"
                texto="Título que aparece para quem usa o dashboard. Dele sai o identificador, que vira o nome do schema no DW (criado vazio ao salvar) e da pasta do front e do back. Não muda depois de criado."
              />
            </span>
            <input
              id="nome"
              className="campo__entrada"
              maxLength={120}
              placeholder="Ex.: Executivo"
              value={form.nome}
              onChange={(e) => mudar('nome')(e.target.value)}
              aria-invalid={Boolean(erros.nome)}
              aria-describedby={erros.nome ? 'erro-nome' : undefined}
            />
            <PreviaNome nome={form.nome} slugFixo={salvo?.slug} hash={salvo?.hash} schema={salvo?.schema_dw} />
            {salvo && (
              // As pastas do front e do back são código (vão para o GitHub): o comando cria no computador
              <div className="comando-pastas">
                <p className="campo__ajuda">
                  Para criar as pastas do front e do back, rode na pasta <code>UniDash</code>, com o Docker ligado:
                </p>
                <Copiavel rotulo="Comando" valor={`docker compose exec backend python -m scripts.novo_dashboard ${salvo.slug}`} />
              </div>
            )}
            {erros.nome && <p id="erro-nome" className="campo__erro">{erros.nome}</p>}
          </div>

          <CampoCategoria
            valor={form.categoria_id}
            aoMudar={mudar('categoria_id')}
            erro={erros.categoria}
            temAlteracoes={temAlteracoes}
          />

          <div className="campo">
            <label className="campo__rotulo" htmlFor="descricao">
              Descrição <span className="campo__opcional">opcional</span>
            </label>
            <textarea
              id="descricao"
              className="campo__entrada campo__entrada--texto"
              rows={2}
              placeholder="Para que serve e para quem"
              value={form.descricao}
              onChange={(e) => mudar('descricao')(e.target.value)}
            />
          </div>
        </section>

        <section className="formulario__secao" aria-labelledby="secao-paginas">
          <header className="formulario__secao-cabecalho">
            <span className="formulario__passo" aria-hidden="true">2</span>
            <h3 id="secao-paginas">Páginas</h3>
            <p>Na ordem da barra lateral. Arraste pelo ⋮⋮ para reordenar.</p>
          </header>
          <EditorPaginas
            nomeDashboard={form.nome}
            paginas={form.paginas}
            aoMudar={mudar('paginas')}
            desativadas={desativadas}
            aoReativar={(p) => {
              setDesativadas((lista) => lista.filter((x) => x.codigo !== p.codigo))
              mudar('paginas')([...form.paginas, { chave: p.codigo, codigo: p.codigo, nome: p.nome }])
            }}
            erro={erros.paginas}
          />
        </section>

        {/* Ao criar, só Identificação e Páginas: o dashboard nasce como rascunho e, logo depois,
            o painel mostra o link para o Hub. Hub e Publicação aparecem só na edição. */}
        {editando && salvo && (
          <section className="formulario__secao" aria-labelledby="secao-hub">
            <header className="formulario__secao-cabecalho">
              <span className="formulario__passo" aria-hidden="true">3</span>
              <h3 id="secao-hub">Cadastro no Hub</h3>
              <p>Copie o link e cadastre no Hub. Ele só abre para os colaboradores quando o dashboard for publicado.</p>
            </header>
            <ParaOHub hash={salvo.hash} paginas={salvo.paginas} />
          </section>
        )}

        {editando && (
          <section className="formulario__secao" aria-labelledby="secao-publicacao">
            <header className="formulario__secao-cabecalho">
              <span className="formulario__passo" aria-hidden="true">4</span>
              <h3 id="secao-publicacao">Publicação</h3>
            </header>
            <div className="publicacao">
              <SeletorOpcoes nome="status" rotulo="Status" opcoes={STATUS} valor={form.status} aoMudar={mudar('status')} />
              {/* A explicação vem embaixo do seletor e começa pelo nome do status escolhido */}
              <p className="publicacao__explicacao" aria-live="polite">
                <strong>{STATUS.find((s) => s.valor === form.status).texto}:</strong> {EXPLICACAO_STATUS[form.status]}
              </p>
            </div>

            {avisoPublicar && (
              <div className="mensagem mensagem--atencao" role="alert">
                <p>
                  <strong>Este dashboard ainda não tem configuração no front.</strong> Publicado, ele passa a abrir
                  para os colaboradores pelo Hub, mas sem gráficos. Rode o <code>novo-dashboard</code> antes, ou publique
                  assim mesmo.
                </p>
              </div>
            )}
          </section>
        )}

        {erroGeral && (
          <p className="mensagem mensagem--erro" role="alert">
            {erroGeral.message}
            {erroGeral.traceId && <span className="mensagem__codigo"> Código: {erroGeral.traceId}</span>}
          </p>
        )}

        {/* Rodapé fixo no fim do painel: os botões ficam sempre visíveis */}
        <div className="formulario__rodape">
          {avisoPublicar ? (
            <>
              <button type="button" className="botao botao--fantasma" onClick={() => setAvisoPublicar(false)}>
                Voltar
              </button>
              <button type="submit" className="botao botao--primario" disabled={salvando}>
                Publicar mesmo assim
              </button>
            </>
          ) : (
            <>
              <button type="button" className="botao botao--fantasma" onClick={aoCancelar}>
                {editando ? 'Fechar' : 'Cancelar'}
              </button>
              <button type="submit" className="botao botao--primario" disabled={salvando}>
                {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Criar dashboard'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
