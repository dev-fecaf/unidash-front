// Seletor de opções (escolha única) com uma "pílula" que desliza até a opção escolhida.
// Baseado no modelo do Uiverse (Pradeepsaranbishnoi), adaptado: a pílula mede cada opção
// (as opções têm larguras diferentes), as cores vêm dos tokens e os rádios continuam
// funcionando com o teclado (Tab para entrar, setas para trocar) e com leitor de tela.
//
// Uso:
//   <SeletorOpcoes
//     nome="periodo"                       // identifica o grupo (único na página)
//     rotulo="Período"                     // lido pelo leitor de tela
//     opcoes={[{ valor: 7, texto: '7 dias' }, { valor: 'rascunho', texto: 'Rascunho', contagem: 3 }]}
//     valor={dias}
//     aoMudar={setDias}
//   />
// `contagem` (opcional) aparece numa bolinha ao lado do texto.

import { useLayoutEffect, useRef, useState } from 'react'

import './SeletorOpcoes.css'

export default function SeletorOpcoes({ nome, rotulo, opcoes, valor, aoMudar }) {
  const grupo = useRef(null)
  const [pilula, setPilula] = useState(null) // posição e largura da pílula

  // "Assinatura" das opções: muda só quando um texto ou uma contagem muda de verdade.
  // (Quem usa o seletor costuma recriar a lista a cada atualização; sem isso, ele se mediria sem parar.)
  const assinatura = opcoes.map((o) => `${o.valor}:${o.texto}:${o.contagem ?? ''}`).join('|')

  // Mede a opção escolhida e leva a pílula até ela (de novo se o tamanho da tela ou o texto mudar)
  useLayoutEffect(() => {
    const medir = () => {
      const escolhida = grupo.current?.querySelector('.seletor-opcoes__opcao--escolhida')
      if (!escolhida) return
      const nova = { esquerda: escolhida.offsetLeft, largura: escolhida.offsetWidth }
      // Só atualiza se mudou (evita redesenhar à toa)
      setPilula((atual) => (atual && atual.esquerda === nova.esquerda && atual.largura === nova.largura ? atual : nova))
    }
    medir()
    const observador = new ResizeObserver(medir)
    if (grupo.current) observador.observe(grupo.current)
    return () => observador.disconnect()
  }, [valor, assinatura])

  return (
    <div className="seletor-opcoes" role="radiogroup" aria-label={rotulo} ref={grupo}>
      {opcoes.map((opcao) => {
        const escolhida = valor === opcao.valor
        return (
          <label key={opcao.valor} className={`seletor-opcoes__opcao${escolhida ? ' seletor-opcoes__opcao--escolhida' : ''}`}>
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              checked={escolhida}
              onChange={() => aoMudar(opcao.valor)}
            />
            <span className="seletor-opcoes__texto">
              {opcao.texto}
              {opcao.contagem !== undefined && (
                <span className="seletor-opcoes__contagem">
                  {opcao.contagem}
                  <span className="visualmente-oculto"> {opcao.contagem === 1 ? 'item' : 'itens'}</span>
                </span>
              )}
            </span>
          </label>
        )
      })}
      {pilula && (
        <span
          className="seletor-opcoes__pilula"
          aria-hidden="true"
          style={{ width: pilula.largura, transform: `translateX(${pilula.esquerda}px)` }}
        />
      )}
    </div>
  )
}
