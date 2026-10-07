
Aloca as partições de front-end do app unidash-front. 

## Como rodar no computador

Comandos para o PowerShell, dentro da pasta `unidash-front`.

1. Instale as bibliotecas (só na primeira vez ou quando o `package.json` mudar):

   ```powershell
   npm install
   ```

2. Ligue o back em outro terminal (ver README do `unidash-back`).
3. Ligue o front:

   ```powershell
   npm run dev
   ```

4. Abra `http://localhost:5173`. O front repassa as chamadas `/api` para o back em
   `http://localhost:8000` (configurado em `vite.config.js`).

## Design system

- Tokens (cores, fonte, tamanhos, espaçamentos) em `src/styles/tokens.css`. Os componentes
  usam sempre o nome do token, nunca o valor direto.
- Fonte Montserrat (400, 500, 600, 700) instalada pelo pacote `@fontsource/montserrat`,
  servida pelo próprio UniDash (sem depender do Google Fonts).
- Só tema claro. Contrastes conferidos para WCAG 2.1 AA.

## Estrutura

```
src/
  main.jsx            ponto de partida (fonte, estilos, React)
  App.jsx             rotas: qual tela aparece em cada endereço
  config.js           configurações lidas do .env (VITE_*; nunca segredos)
  api/cliente.js      único lugar que chama o back
  styles/             tokens.css (design system) e base.css
  componentes/        peças reutilizáveis (BarraLateral, Icone)
  layouts/            LayoutDashboard: barra lateral + conteúdo
  paginas/            telas (PaginaDashboard, Verificacao, NaoEncontrado)
  dashboards/         um config.js por dashboard + registro.js
```

Rotas: `/embed/{hash}` (abre a primeira página) e `/embed/{hash}/{codigo}`.
O dashboard `exemplo` (`/embed/exemplo`) só existe no computador, para desenvolver o layout.

## Área do time de dados (entrada pelo portal)

- `/entrar#ingresso=...`: recebe o ingresso do portal UniData, apaga-o da barra de endereço,
  entrega ao back e leva para `/area`. Para testar no computador, gere um ingresso no back
  (`python -m scripts.gerar_ingresso_dev <email>`, ver README do back) e abra o endereço impresso.
- `/area/...`: telas do time de dados, dentro de `ProvedorSessao` (`src/sessao/Sessao.jsx`) e
  `RotaProtegida`. A proteção de verdade é do back; o front só mostra o aviso certo
  (entre pelo portal, sem acesso, erro).
- `VITE_PORTAL_URL` no `.env`: endereço do portal para o botão "Voltar ao portal UniData".

## Documentação

Tudo sobre o front está em [`docs/`](docs/README.md): estrutura, design system, componentes,
área do time de dados, dashboards e os conceitos de React usados no projeto.
