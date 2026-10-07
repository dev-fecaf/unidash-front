// "i" de informação: ao passar o mouse (ou chegar com o Tab), mostra um balão com a explicação.
// O balão fica ligado ao botão (aria-describedby), então o leitor de tela também lê o texto.
//
// Uso: <Dica texto="Como este número é calculado..." />
//      <Dica texto="..." canto />              balão abre para baixo e alinhado à direita (canto de um cartão)
//      <Dica texto="..." posicao="abaixo" />  balão abre para baixo e alinhado à esquerda (ao lado do rótulo de um campo)

import { useId } from 'react'

import './Dica.css'

export default function Dica({ texto, rotulo = 'Mais informações', canto = false, posicao }) {
  const id = useId() // identificador único, para ligar o botão ao balão
  return (
    <span className={`dica${canto ? ' dica--canto' : ''}${posicao === 'abaixo' ? ' dica--abaixo' : ''}`}>
      <button type="button" className="dica__botao" aria-label={rotulo} aria-describedby={id}>
        i
      </button>
      <span role="tooltip" id={id} className="dica__balao">
        {texto}
      </span>
    </span>
  )
}
