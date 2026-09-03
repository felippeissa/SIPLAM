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

---

## Próxima entrega

### 3 · Fundação visual e shell navegável

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
