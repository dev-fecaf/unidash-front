// Rotas do front: qual tela aparece em cada endereço.

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AreaDoTime from './paginas/area/AreaDoTime.jsx'
import Entrar from './paginas/Entrar.jsx'
import NaoEncontrado from './paginas/NaoEncontrado.jsx'
import Embed from './paginas/embed/Embed.jsx'
import Verificacao from './paginas/Verificacao.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Início do site: no computador, a tela de conferência; em hml e prd, a área do time
            (sem sessão, ela pede para entrar pelo portal UniData) */}
        <Route path="/" element={import.meta.env.DEV ? <Verificacao /> : <Navigate to="/area" replace />} />

        {/* Link de embed usado pelo Hub. Uma rota só (o ":codigo?" é opcional), para a página
            não recomeçar a conversa com o Hub ao trocar de página do dashboard. */}
        <Route path="/embed/:hash/:codigo?" element={<Embed />} />

        {/* Área do time de dados: entrada pelo portal UniData */}
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/area/*" element={<AreaDoTime />} />

        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </BrowserRouter>
  )
}
