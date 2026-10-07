// Tela Análises: três abas (Atenção, Uso, Desempenho).
// A aba escolhida fica no endereço (?aba=uso), para dar para mandar o link de uma aba específica.

import { useSearchParams } from 'react-router-dom'

import SeletorOpcoes from '../../../componentes/SeletorOpcoes.jsx'
import AbaAtencao from './AbaAtencao.jsx'
import AguardandoDados from './AguardandoDados.jsx'
import './Analises.css'

const ABAS = [
  { valor: 'atencao', texto: 'Atenção' },
  { valor: 'uso', texto: 'Uso' },
  { valor: 'desempenho', texto: 'Desempenho' },
]

export default function Analises() {
  // Conceito novo: useSearchParams lê e muda a parte "?aba=..." do endereço
  const [parametros, setParametros] = useSearchParams()
  const aba = ABAS.some((a) => a.valor === parametros.get('aba')) ? parametros.get('aba') : 'atencao'

  return (
    <div className="analises">
      <div className="analises__abas">
        <SeletorOpcoes
          nome="aba-analises"
          rotulo="Abas de análises"
          opcoes={ABAS}
          valor={aba}
          aoMudar={(nova) => setParametros({ aba: nova })}
        />
      </div>

      {aba === 'atencao' && <AbaAtencao />}

      {aba === 'uso' && (
        <AguardandoDados
          titulo="Uso dos dashboards"
          itens={[
            'Acessos por dia (gráfico de linha)',
            'Quando os dashboards são usados (dia da semana × hora)',
            'Quem acessou: pessoa, dashboard e data',
            'Acessos por área (aguarda leitura do banco do Hub)',
          ]}
          quando="Entra no próximo passo; os números aparecem quando os dashboards forem abertos pelo Hub."
        />
      )}

      {aba === 'desempenho' && (
        <AguardandoDados
          titulo="Desempenho"
          itens={[
            'Tempo médio de resposta e endpoints mais lentos',
            'Respostas pelo cache (Redis)',
            'Custo do BigQuery no período',
            'Dados desatualizados (aguarda view do Jhonny com as execuções dos runners)',
          ]}
          quando="Entra depois da aba Uso; os números aparecem quando os endpoints de dados existirem."
        />
      )}
    </div>
  )
}
