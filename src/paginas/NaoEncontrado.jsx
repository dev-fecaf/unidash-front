// Mensagem neutra para endereço inexistente (dashboard ou página que não existe).

export default function NaoEncontrado() {
  return (
    <main style={{ padding: 'var(--espaco-7) var(--espaco-4)', textAlign: 'center' }}>
      <h2>Página não encontrada</h2>
      <p style={{ color: 'var(--cor-texto-suave)' }}>
        Confira o endereço ou volte pelo menu do dashboard.
      </p>
    </main>
  )
}
