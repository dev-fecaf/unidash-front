// Mensagem do link de embed (carregando, em construção, sem acesso...). Fundo claro, porque
// aparece dentro do Hub. Sem botão de portal: quem chega aqui é colaborador, não o time de dados.

import logo from '../../assets/logo1.png'
import './AvisoEmbed.css'

export default function AvisoEmbed({ titulo, texto, carregando = false }) {
  return (
    <main className="aviso-embed">
      <div className="aviso-embed__caixa" role={carregando ? 'status' : 'alert'}>
        {/* O símbolo tem partes brancas: fica sobre um quadrado escuro (cor da barra lateral) para aparecer no fundo claro */}
        <span className="aviso-embed__marca">
          <img src={logo} alt="UniFECAF" width="28" height="28" />
        </span>
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
      </div>
    </main>
  )
}
