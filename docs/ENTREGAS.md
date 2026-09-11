# Registro de entregas

Modelo lean: uma entrega por vez, cada uma fechada em commit. A sessão seguinte lê este arquivo
primeiro e trabalha apenas na entrega da vez.

**Ao concluir uma entrega:** mova-a para "Entregue", escreva em uma linha o que ficou pronto e
deixe registrado o que a próxima precisa saber. Nada além disso — este arquivo é um índice, não
um diário.

---

## Entregue

### 1 · Início do projeto — `2026-09-03`

Insumos no repositório: template Inspinia 5, protótipo Lovable como referência de comportamento,
backlog de front-end (92 histórias) e mapa do sistema (20 telas, 12 lacunas, 20 problemas,
43 perguntas em aberto). Nenhuma tela construída.

### 2 · Tela de acesso publicada — `2026-09-03`

`index.html` na raiz, a partir da página `auth-split-sign-in` do Inspinia, sem alteração de estilo:
apenas textos em português e caminhos apontando para `inspinia/assets/`. Publicada no GitHub Pages
a partir da raiz de `main`.

### 3 · Camada de dados e primeira tela — `2026-09-11`

Regras do protótipo portadas de TypeScript para JavaScript com esbuild (`seed`, `regras`,
`financeiro`, `atena`), store sobre `localStorage`, shell com os dois menus, componentes
compartilhados (chip, faixa de indicadores, trilha) e a **Visão Geral da Área Central** completa:
filtros, três níveis de expansão e cobertura causal. Corrige três problemas do protótipo —
T5.1.10, T5.1.11 e T5.1.12.

### 4 · As 16 telas do sistema — `2026-09-11`

Visão Área Central completa (Visão Geral, Entregas, Órgãos, Causas, Financeira, Projetos, IPOFs,
Administração de Programas e Iniciativa em análise) e Visão Setorial completa (Programas, ficha do
Programa, Iniciativas, ficha da Iniciativa, Entregas, ficha da Entrega e Indicadores). Todas
testadas no navegador, sem erro de console.

Problemas do protótipo corrigidos nesta leva: T5.2.3, T5.3.5, T5.4.5, T5.5.6, T5.8.6, T5.8.9,
T5.9.9, T6.1.7, T6.2.7, T6.4.16, T6.6.9, T6.6.13 e T6.7.4.

### 5 · Revisão de layout, shell e busca global — `2026-09-11`

Hierarquia visual das tabelas aninhadas (fundo, traço lateral e recuo por nível), quadro
financeiro movido para fora da coluna estreita, filtros que não esticam mais, busca global com
`Ctrl+K` funcionando, e a escolha de perfil levando à tela inicial do perfil em vez da tela de
espera, que foi removida.

Pente fino no shell: topbar e sidenav reescritas fiéis ao markup do Inspinia. O `.topbar-menu` é
`justify-content: space-between` e espera dois filhos — havia três, com `ms-auto`. A sidenav
exigia `.button-on-hover`, `.button-close-offcanvas` e o wrapper `.scrollbar[data-simplebar]`,
todos ausentes, o que quebrava o modo offcanvas. Conferido nos três tamanhos.

Modelo de perfis corrigido: Visão Setorial e Visão Área Central **são perfis**, não um comutador.
Os cinco perfis que eu havia proposto deram lugar aos dois reais — Analista Setorial e Analista da
Área Central — e a visão passou a decorrer do perfil escolhido no acesso.

Header ganha Notificações e Atena como ícones, ambos ligados aos dados. Na Visão Geral, as linhas
filhas passaram a usar as colunas da tabela-mãe: com sub-tabela própria, o número de Iniciativas de
um órgão caía sob "Em preenchimento" do Programa.

---

## Próxima entrega

### 6 · Atena e documentos

**Objetivo:** o esqueleto que todas as telas vão usar, navegável nas duas visões.

- Tema SIPLAM no SCSS: `_theme-siplam.scss` ao lado dos temas do Inspinia, com a paleta
  convertida do protótipo (primária, ok, alerta, impeditivo, info + os tons suaves dos chips).
- Densidade: base 13px, rótulos 11px em caixa alta, variante densa de tabela.
- Topbar: marca, comutador Visão Setorial ⇄ Área Central, persona, busca.
- Sidenav com os dois conjuntos de menu, trocando conforme a visão.
- Uma página vazia por visão, só para provar a navegação.

**O que ler antes de começar:** este arquivo, `CLAUDE.md`, `inspinia/src/assets/scss/_variables.scss`,
`inspinia/src/partials/` (topbar e sidenav) e, do protótipo, `src/styles.css` e
`src/components/ppa/shell.tsx`.

**Não é escopo desta entrega:** tabelas com dados, filtros, modais, Atena.

---

## Depois (ordem prevista, sujeita a revisão)

4. Componentes compartilhados — chip, seção, campo, faixa de indicadores, tabela densa.
5. Visão Geral da Área Central — a tela mais densa; valida a fundação.
6. Administração de Programas — o único CRUD completo do sistema.
7. Ficha da Iniciativa em análise — apontamentos, devolver e validar.
8. Demais telas da Área Central.
9. Visão Setorial.

O detalhamento de cada uma está em `docs/backlog-frontend.html`. As decisões ainda em aberto
estão em `docs/mapa-sistema.html`, nos nós roxos.

---

## Perguntas travando decisão

Nenhuma bloqueia a entrega 2. As que precisam de resposta antes da entrega 5 estão marcadas no
mapa, no nó **Administração de Programas** — em especial: por que não existe excluir Programa, e
onde o diagnóstico (causas e subcausas) é montado, já que o formulário atual não o edita.
