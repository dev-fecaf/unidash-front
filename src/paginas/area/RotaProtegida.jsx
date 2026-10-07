// Porteiro das telas da área do time de dados.
// Só mostra o conteúdo (children) para quem tem sessão e acesso; senão, mostra o aviso certo.
// Atenção: isto só organiza a TELA. Quem protege de verdade os dados é o back, em cada rota.

import { useSessao } from '../../sessao/Sessao.jsx'
import AvisoEntrada from './AvisoEntrada.jsx'

export default function RotaProtegida({ permissao, children }) {
  const { situacao, tem, erro } = useSessao()

  if (situacao === 'carregando') {
    return <AvisoEntrada titulo="Carregando…" mensagem="Conferindo o seu acesso." carregando />
  }
  if (situacao === 'sem_sessao') {
    return (
      <AvisoEntrada
        titulo="Entre pelo portal UniData"
        mensagem="Para usar o UniDash, abra o portal UniData e clique no card Dashboards."
      />
    )
  }
  if (situacao === 'sem_acesso' || (permissao && !tem(permissao))) {
    return (
      <AvisoEntrada
        titulo="Sem acesso"
        mensagem="Você não tem permissão para esta tela. Se precisar, peça ao administrador do UniData."
      />
    )
  }
  if (situacao === 'erro') {
    return <AvisoEntrada titulo="Algo deu errado" mensagem={erro?.message} traceId={erro?.traceId} />
  }
  return children
}
