// Rotas da área do time de dados (/area/...). Tudo aqui exige sessão (entrada pelo portal);
// cada tela exige ainda a permissão dela no UniData.

import { Navigate, Route, Routes } from 'react-router-dom'

import LayoutArea from '../../layouts/LayoutArea.jsx'
import { ProvedorSessao, useSessao } from '../../sessao/Sessao.jsx'
import NaoEncontrado from '../NaoEncontrado.jsx'
import Analises from './analises/Analises.jsx'
import AvisoEntrada from './AvisoEntrada.jsx'
import EmConstrucao from './EmConstrucao.jsx'
import Galeria from './Galeria.jsx'
import Categorias from './gerador/Categorias.jsx'
import ListaGerador, { AcoesGerador } from './gerador/ListaGerador.jsx'
import Inicio from './Inicio.jsx'
import Previa from './Previa.jsx'
import RotaProtegida from './RotaProtegida.jsx'
import { TELAS, tela } from './telas.js'

// Uma tela da área: confere a permissão e desenha dentro do layout com o título certo
// (o título pode ser trocado, ex.: "Gerador › Novo dashboard")
function Tela({ caminho, titulo, acoes, children }) {
  const { nome, permissao } = tela(caminho)
  return (
    <RotaProtegida permissao={permissao}>
      <LayoutArea titulo={titulo ?? nome} acoes={acoes}>
        {children}
      </LayoutArea>
    </RotaProtegida>
  )
}

// /area sozinho: vai para a primeira tela que a pessoa pode ver
function PrimeiraTela() {
  const { tem } = useSessao()
  const primeira = TELAS.find((t) => tem(t.permissao))
  if (!primeira) {
    return <AvisoEntrada titulo="Sem telas liberadas" mensagem="Peça acesso ao administrador do UniData." />
  }
  return <Navigate to={`/area/${primeira.caminho}`} replace />
}

export default function AreaDoTime() {
  return (
    <ProvedorSessao>
      <RotaProtegida>
        <Routes>
          <Route index element={<PrimeiraTela />} />
          <Route
            path="inicio"
            element={
              <Tela caminho="inicio">
                <Inicio />
              </Tela>
            }
          />
          <Route
            path="dashboards"
            element={
              <Tela caminho="dashboards">
                <Galeria />
              </Tela>
            }
          />
          <Route
            path="dashboards/:hash/:codigo?"
            element={
              <RotaProtegida permissao={tela('dashboards').permissao}>
                <Previa />
              </RotaProtegida>
            }
          />
          <Route
            path="documentacao"
            element={
              <Tela caminho="documentacao">
                <EmConstrucao
                  descricao="Estrutura de pastas, cores, design system, gráficos e como criar um dashboard."
                  passo="4c"
                />
              </Tela>
            }
          />
          {/* Lista do Gerador; /novo e /{hash} abrem o painel lateral por cima da mesma lista */}
          <Route
            path="gerador/*"
            element={
              <Tela caminho="gerador" acoes={<AcoesGerador />}>
                <ListaGerador />
              </Tela>
            }
          />
          <Route
            path="gerador/categorias"
            element={
              <Tela caminho="gerador" titulo="Gerador › Categorias">
                <Categorias />
              </Tela>
            }
          />
          <Route
            path="analises"
            element={
              <Tela caminho="analises">
                <Analises />
              </Tela>
            }
          />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </RotaProtegida>
    </ProvedorSessao>
  )
}
