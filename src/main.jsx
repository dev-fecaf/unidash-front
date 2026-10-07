// Ponto de partida do front: carrega a fonte e os estilos e desenha o App
// dentro da <div id="root"> do index.html.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import './styles/tokens.css'
import './styles/base.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
