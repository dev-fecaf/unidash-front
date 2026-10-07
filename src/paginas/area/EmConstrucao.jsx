// Tela ainda não construída: diz o que vai ter e em qual passo entra.

export default function EmConstrucao({ descricao, passo }) {
  return (
    <div
      style={{
        padding: 'var(--espaco-6)',
        border: '1px dashed var(--cor-borda)',
        borderRadius: 'var(--raio-md)',
        background: 'var(--cor-superficie)',
      }}
    >
      <h2>Em construção</h2>
      <p style={{ margin: 'var(--espaco-2) 0 0', color: 'var(--cor-texto-suave)' }}>
        {descricao} Entra no passo {passo}.
      </p>
    </div>
  )
}
