# SIPLAM — PPA 2028–2031 · Estado de Goiás

Sistema de elaboração do Plano Plurianual. Front-end sobre o template **Inspinia 5** (Bootstrap 5).

## Como trabalhar neste repositório

**Modelo lean: uma entrega por vez.** Cada entrega termina em commit e a sessão encerra.
A sessão seguinte lê só o necessário para a entrega da vez — não releia o repositório inteiro.

Ordem de leitura ao iniciar uma entrega:

1. Este arquivo.
2. `docs/ENTREGAS.md` — o que já foi feito e qual é a próxima entrega.
3. Só os arquivos que a entrega da vez toca.

Não leia `prototipo-lovable/` inteiro nem `inspinia/` inteiro. São referências para consulta pontual:

| Preciso de… | Leia só |
|---|---|
| regra de negócio, cálculo, validação | `prototipo-lovable/src/lib/ppa/regras.ts`, `financeiro.ts` |
| modelo de dados | `prototipo-lovable/src/lib/ppa/types.ts` |
| como uma tela era no protótipo | a rota equivalente em `prototipo-lovable/src/routes/` |
| markup de um componente Inspinia | a página de exemplo correspondente em `inspinia/` |
| tokens e temas do template | `inspinia/src/assets/scss/_variables.scss` e `config/` |

## Estrutura

- `src/` — o SIPLAM (ainda vazio; começa na segunda entrega)
- `inspinia/` — template Inspinia 5, referência de markup e componentes
- `prototipo-lovable/` — protótipo React/TanStack que define o comportamento a reproduzir
- `docs/` — backlog, mapa do sistema e registro de entregas

## Decisões já tomadas

- Bootstrap 5 + Inspinia 5; ícones Tabler (`ti ti-*`); DataTables; ApexCharts/ECharts; Choices.js; SweetAlert2.
- Sem GitHub Pages por enquanto.
- Escopo atual é **front-end e design**: sem API, sem banco, sem autenticação.
- O estado do protótipo vive em `localStorage`; nada de servidor nesta fase.

## Vocabulário do domínio — não confundir

- **Programa** → **Iniciativa** (contribuição de um órgão) → **Entrega** (produto concreto, com metas 2028–2031).
- A **Ação Orçamentária** da LOA financia **no máximo uma** Entrega. O valor financeiro do PPA é **sempre derivado** dela — nunca digitado.
- O **Projeto GOMAP** descreve *como* a Entrega é produzida. Seu valor global **nunca** é o valor da Entrega.
- **Entrega** é resultado para a sociedade, não obra. "Construção de X" é nome de Projeto, não de Entrega.

## Duas visões, dois menus

- **Setorial** (órgão): Programas · Iniciativas · Entregas · Indicadores.
- **Área Central** (analista): Visão Geral · Entregas · Órgãos · Análises (Causas, Financeira, Projetos, IPOFs) · Administração de Programas.

## Convenções

- Idioma da interface e dos nomes de arquivo: português.
- Commits em português, no imperativo.
- Densidade: base 13px, rótulos 11px em caixa alta — mais denso que o padrão do Inspinia.
