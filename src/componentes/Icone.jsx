// Ícones simples em SVG. Decorativos: o texto ou o aria-label de quem usa é que descreve a ação.

const DESENHOS = {
  recolher: <path d="M15 6l-6 6 6 6" />,
  expandir: <path d="M9 6l6 6-6 6" />,
  inicio: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  galeria: (
    <>
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v7h-7z" />
      <path d="M4 13h7v7H4z" />
      <path d="M13 13h7v7h-7z" />
    </>
  ),
  gerador: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  uso: (
    <>
      <path d="M5 20V11" />
      <path d="M12 20V4" />
      <path d="M19 20v-6" />
    </>
  ),
  documentacao: (
    <>
      <path d="M5 4h9l5 5v11H5z" />
      <path d="M14 4v5h5" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </>
  ),
  acessos: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
    </>
  ),
  pessoas: (
    <>
      <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 6.5" />
      <path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  publicado: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  semAcesso: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  destaque: <path d="M4 18l5-6 4 3 7-9" />,
  queda: <path d="M4 6l5 6 4-3 7 9" />,
  info: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  usuario: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  busca: (
    <>
      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
      <path d="M20 20l-4-4" />
    </>
  ),
  editar: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  mais: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  portal: <path d="M14 6l-6 6 6 6" />,
  'seta-cima': (
    <>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  'seta-baixo': (
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  sair: (
    <>
      <path d="M14 4h5v16h-5" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </>
  ),
  chamado: (
    <>
      <path d="M4 5h16v11H8l-4 4z" />
      <path d="M12 8.5v3" />
      <path d="M12 13.5h.01" />
    </>
  ),
}

export default function Icone({ nome, tamanho = 20 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {DESENHOS[nome]}
    </svg>
  )
}
