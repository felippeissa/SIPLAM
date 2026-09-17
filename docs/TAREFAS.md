# Tarefas — recriar o protótipo no Inspinia

O que precisa ser construído para o SIPLAM reproduzir o protótipo que está em `prototipo-lovable/`.
Escopo de **front-end e design**: sem API, sem banco, sem autenticação real.

**189 tarefas em 694 subtarefas**, divididas em nove blocos. Cada bloco é um arquivo — abra só o da
entrega da vez, como pede o modelo lean do `CLAUDE.md`.

---

## Blocos

| Bloco | Arquivo | Tarefas | Subtarefas | Feitas |
|---|---|---:|---:|---:|
| 0 · Acesso | [0-acesso.md](tarefas/0-acesso.md) | 9 | 43 | 33 |
| 1 · Camada de dados e regras | [1-dados.md](tarefas/1-dados.md) | 8 | 53 | 0 |
| 2 · Fundação visual | [2-fundacao.md](tarefas/2-fundacao.md) | 6 | 28 | 0 |
| 3 · Shell e navegação | [3-shell.md](tarefas/3-shell.md) | 8 | 36 | 0 |
| 4 · Componentes compartilhados | [4-componentes.md](tarefas/4-componentes.md) | 14 | 66 | 0 |
| 5 · Visão Área Central — 9 telas | [5-area-central.md](tarefas/5-area-central.md) | 66 | 196 | 0 |
| 6 · Visão Setorial — 7 telas | [6-setorial.md](tarefas/6-setorial.md) | 64 | 199 | 0 |
| 7 · Atena | [7-atena.md](tarefas/7-atena.md) | 6 | 31 | 0 |
| 8 · Qualidade e entrega | [8-qualidade.md](tarefas/8-qualidade.md) | 8 | 42 | 0 |
| **Total** | | **189** | **694** | **33** |

Os blocos 1 a 4 são **pré-requisito de tudo**: nenhuma tela com conteúdo existe antes da camada de
dados e dos componentes compartilhados. Os blocos 5 e 6 são as 16 telas do protótipo, controle a
controle.

---

## Como usar

- Marque a caixa quando a subtarefa estiver no `main`.
- Cada tarefa tem código (`T5.8.6`) e cada subtarefa também (`T5.8.6.2`), para os commits
  referenciarem.
- `escopo-ux.md` diz o que falta construir e em que ordem.

Marcadores ao fim da linha:

| Marcador | Significa |
|---|---|
| `↯` | Depende de decisão dos stakeholders — pode mudar ou sumir |
| `⚠` | Corrige um problema herdado do protótipo |
| `✚` | Não existe no protótipo; é acréscimo |

São **18 correções**, **19 acréscimos** e **29 tarefas travadas por decisão**.

---

## Decisões pendentes, por quanto destravam

As perguntas completas estão em [mapa-sistema.html](mapa-sistema.html), nos nós roxos.

1. **Quem cadastra indicador, e o PPA registra apuração ou só meta?**
   Trava a tela de Indicadores inteira — T6.7.4, T6.7.5 e T6.4.14.
2. **Onde o diagnóstico do Programa é montado, se o formulário não edita causas?**
   Sem causas, a Iniciativa do órgão trava numa pendência impeditiva sem saída — T5.8.6, T5.8.7,
   T5.1.13.
3. **Existem perfis distintos, e o que cada um pode fazer?**
   T8.8, T3.3, T5.9.11, T5.8.9 — e a tela inicial de cada perfil.
4. **Quem resolve um apontamento: o órgão ao corrigir ou o analista ao conferir?**
   Existe no modelo e não tem tela em lugar nenhum — T5.9.9, T6.4.15.
5. **Exportar (CSV/Excel) é requisito?**
   Não existe em nenhuma tela hoje — T5.5.8, e provavelmente todas as listagens.
6. **Os fontes SCSS do Inspinia entram no projeto?**
   Muda toda a fundação visual — T2.1, T2.2.
7. **A barra de acessibilidade do goias.gov.br faz parte do padrão?** — T0.8.
8. **Excluir Programa: impedimento legal do PPA ou só não construído?** — T5.8.8.
9. **Salvamento automático serve a uma peça formal, ou precisa de rascunho e confirmação?** —
   T6.4.16.

---

## Onde estão os pontos caros

- **T1.2 a T1.6** — portar o modelo, o seed de 1.240 linhas, as regras e o financeiro do
  TypeScript para JavaScript. Não estava no backlog original e é pré-requisito de 130 tarefas.
- **T4.6** — quadro financeiro plurianual expansível, com 9 dimensões de agrupamento.
- **T3.6** — busca global com `Ctrl+K`: o `cmdk` some na migração e não há equivalente no Inspinia.
- **T4.9 / T5.1** — expansão de três níveis na Visão Geral; o exemplo do DataTables cobre um.
- **T1.1** — a escolha entre HTML à mão e templates Handlebars muda o volume dos blocos 5 e 6.
