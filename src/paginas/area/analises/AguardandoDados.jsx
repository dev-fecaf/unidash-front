// Cartão de uma parte das análises que ainda não tem dados: diz o que vai ter e quando.

import Icone from '../../../componentes/Icone.jsx'

export default function AguardandoDados({ titulo, itens, quando }) {
  return (
    <section className="cartao-analise">
      <header className="cartao-analise__cabecalho">
        <span className="cartao-analise__icone" aria-hidden="true">
          <Icone nome="info" tamanho={16} />
        </span>
        <h2 className="cartao-analise__titulo">{titulo}</h2>
      </header>
      <ul className="aguardando__lista">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="aguardando__quando">{quando}</p>
    </section>
  )
}
