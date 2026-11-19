# PROTOTESTE UX — Resultados: comparação da coluna de ações em Programas

**Data da execução:** 19/11/2026
**Protocolo:** `PROTOTESTE.md` v1.0
**Janela analisada:** **1920 × 1080**, a resolução padrão das telas do governo. **Este relatório considera somente esse cenário.**
**Natureza:** avaliação **exploratória, automatizada, em modo local**. **Não foi um teste de usabilidade com pessoas.** Nenhuma pessoa participou, e nenhum depoimento aqui é real. O feedback da seção 10.3 foi gerado por IA.

> **Leitura em 30 segundos.** As 100 rodadas terminaram com sucesso técnico (100/100) nas duas variantes, sem diferença nos tempos e nas interações automatizados. Em 1920 × 1080 as duas variantes cabem sem rolagem horizontal. As diferenças observadas são de **estrutura**: o Editar fica a **1268 px do nome** do Programa na variante A e a **394 px** na B; por teclado, o Editar da primeira linha é alcançado com **36 Tab na B e 45 na A**. Nada disso permite dizer qual variante as pessoas preferem. **Resultado inconclusivo quanto à usabilidade humana.**

---

## 10.1 Resumo executivo

| | Planejadas | Executadas | Concluídas | Falha | Bloqueadas |
|---|---:|---:|---:|---:|---:|
| **Total** | 100 | 100 | 100 | 0 | 0 |
| Variante A (ações à direita) | 50 | 50 | 50 | 0 | 0 |
| Variante B (ações à esquerda) | 50 | 50 | 50 | 0 | 0 |

- **Variantes comparadas:** **A**, coluna Ações na última posição (como o sistema é hoje), e **B**, na primeira. Mudou só a posição (e o alinhamento do texto, ver o Apêndice A). Tela testada: **Cadastros › Programa**, no perfil Administrador central.
- **Principal achado técnico:** o fluxo funciona nas duas variantes, com o mesmo resultado em todas as rodadas: o Programa é renomeado, o aviso "Programa editado com sucesso." aparece, e o novo nome persiste na lista, após recarregar a página e no estado salvo. Nas medições automatizadas, as duas variantes ficaram indistinguíveis (tabela 10.2). Em 1920 × 1080 **não há rolagem horizontal em nenhuma delas**, e o Editar fica 100% visível.
- **O que difere, e é fato medido:** (1) a **distância entre o nome do Programa e o Editar**: 1268 px (A) contra 394 px (B); (2) a **ordem de foco por teclado**: 45 Tab (A) contra 36 Tab (B) até o Editar da primeira linha.
- **Limites da inferência:** as rodadas são repetições de um script com poucas fontes de variação, e não uma amostra de pessoas. Tempos e interações são do robô. Elas medem **robustez e reprodutibilidade**, não preferência nem eficiência humana. **Só a resolução 1920 × 1080 foi avaliada**: o relatório não diz nada sobre janelas menores.
- **Recomendação provisória:** **resultado inconclusivo quanto à usabilidade**. Em 1920 × 1080, as variantes se equivalem tecnicamente em sucesso, tempos e visibilidade. As diferenças de distância e de ordem de foco merecem validação com pessoas (H01, H03 e H05). Elas **não** equivalem a dizer que uma variante é melhor.

---

## 10.2 Resultados observados

### Por variante (todas as protopersonas)

Tempos e interações: mediana (p25–p75; mínimo e máximo) das 50 execuções bem-sucedidas de cada variante. **São tempos do script, não de pessoas.**

| Variante | Sucesso técnico | Rodadas com erro registrado | Tempo até identificar a linha (ms) | Tempo até acionar Editar (ms) | Tempo total (ms) | Interações |
|---|---:|---:|---|---|---|---|
| A-direita | 50/50 | 0 | 69 (6–102; mín 1, máx 474) | 2 (1–69; mín 1, máx 111) | 2990 (2812–3215; mín 2729, máx 3794) | 10 (10–12; mín 10, máx 84) |
| B-esquerda | 50/50 | 0 | 70 (7–104; mín 1, máx 483) | 2 (1–42; mín 1, máx 100) | 3000 (2820–3170; mín 2722, máx 3584) | 10 (10–12; mín 10, máx 75) |

Os intervalos se sobrepõem por inteiro. **Não há diferença que se possa interpretar** entre as variantes nessas medições, e nenhuma significância estatística foi calculada.

### Por protopersona e variante

| Persona | Variante | Execuções | Sucesso técnico | Erros | Identificar linha, mediana (ms) | Acionar Editar, mediana (ms) | Total, mediana (ms) | Interações, mediana | Evidências |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| P1 · Operador experiente | A | 10 | 10/10 | 0 | 465 | 1 | 3297 | 12 | [lista](resultados_1920x1080/evidencias/P1-A-01_lista.png) · [depois](resultados_1920x1080/evidencias/P1-A-01_depois.png) |
| P1 · Operador experiente | B | 10 | 10/10 | 0 | 463 | 1 | 3276 | 12 | [lista](resultados_1920x1080/evidencias/P1-B-01_lista.png) · [depois](resultados_1920x1080/evidencias/P1-B-01_depois.png) |
| P2 · Gestor ocasional | A | 10 | 10/10 | 0 | 1 | 2 | 2798 | 10 | [lista](resultados_1920x1080/evidencias/P2-A-01_lista.png) · [depois](resultados_1920x1080/evidencias/P2-A-01_depois.png) |
| P2 · Gestor ocasional | B | 10 | 10/10 | 0 | 1 | 2 | 2799 | 10 | [lista](resultados_1920x1080/evidencias/P2-B-01_lista.png) · [depois](resultados_1920x1080/evidencias/P2-B-01_depois.png) |
| P3 · Usuário iniciante | A | 10 | 10/10 | 0 | 69 | 1 | 2877 | 10 | [lista](resultados_1920x1080/evidencias/P3-A-01_lista.png) · [depois](resultados_1920x1080/evidencias/P3-A-01_depois.png) |
| P3 · Usuário iniciante | B | 10 | 10/10 | 0 | 70 | 1 | 2875 | 10 | [lista](resultados_1920x1080/evidencias/P3-B-01_lista.png) · [depois](resultados_1920x1080/evidencias/P3-B-01_depois.png) |
| P4 · Analista cuidadoso | A | 10 | 10/10 | 0 | 7 | 2 | 2826 | 10 | [lista](resultados_1920x1080/evidencias/P4-A-01_lista.png) · [depois](resultados_1920x1080/evidencias/P4-A-01_depois.png) |
| P4 · Analista cuidadoso | B | 10 | 10/10 | 0 | 8 | 1 | 2879 | 10 | [lista](resultados_1920x1080/evidencias/P4-B-01_lista.png) · [depois](resultados_1920x1080/evidencias/P4-B-01_depois.png) |
| P5 · Teclado | A | 10 | 10/10 | 0 | 98 | 75 | 3103 | 83 | [lista](resultados_1920x1080/evidencias/P5-A-01_lista.png) · [depois](resultados_1920x1080/evidencias/P5-A-01_depois.png) |
| P5 · Teclado | B | 10 | 10/10 | 0 | 96 | 52 | 3075 | 74 | [lista](resultados_1920x1080/evidencias/P5-B-01_lista.png) · [depois](resultados_1920x1080/evidencias/P5-B-01_depois.png) |

Como ler os tempos sem se enganar:

- **P1 tem ~460 ms para identificar a linha** porque o script **espera 400 ms de propósito** pelo redesenho do filtro. É uma espera do script, não uma característica do sistema.
- **P5 mede teclas, não cliques.** O "tempo até acionar Editar" é o tempo de apertar Tab dezenas de vezes (75 ms na A e 52 ms na B); o que vale ali são as **contagens de Tab** abaixo, e não os milissegundos.
- Os tempos de "identificar" de P2 e P4 são de 1 a 8 ms porque são só leituras do HTML; não dizem nada sobre leitura humana.
- A evidência visual (captura de tela) foi guardada só para a **rodada 01 de cada combinação** (20 imagens), e não para as 100.

### Ordem das rodadas (só diagnóstico)

| Sequência | Execuções | Sucesso técnico | Tempo total, mediana (ms) |
|---|---:|---:|---:|
| A→B | 50 | 50/50 | 3018 |
| B→A | 50 | 50/50 | 2972 |

Não apareceu efeito de ordem. Isso era esperado, já que cada rodada começa num navegador novo.

### P5 · Navegação por teclado (contagens de Tab, mediana; p25–p75; mín, máx)

| Variante | Rodadas | Tab até o foco entrar na linha-alvo | Tab até o botão Editar | Foco visível no Editar | Tab até o campo Nome | Shift+Tab de volta até Salvar |
|---|---:|---|---|---:|---|---|
| A-direita | 10 | 35 (34–35; mín 34, máx 36) | **45** (44–45; mín 44, máx 46) | 10/10 | 26 (26–26) | 1 (1–1) |
| B-esquerda | 10 | 35 (34–35; mín 34, máx 36) | **36** (35–36; mín 35, máx 37) | 10/10 | 26 (26–26) | 1 (1–1) |

- O primeiro controle focado **dentro da linha** é, na **A**, um selo de marcador ("Marcador Saúde"), e na **B**, o botão "Adicionar marcadores a Saúde Integral".
- No formulário, o botão **Salvar** fica **antes** dos campos na ordem de Tab (nas duas variantes): depois de digitar o nome, só se chega a ele **voltando 1 Shift+Tab**. É uma característica da tela de edição, **independente da posição da coluna**.
- Dos 35 Tab até a primeira linha, a maior parte é o que vem **antes da tabela**: menu lateral, barra superior e filtros. É igual nas duas variantes.

### Fatos de layout e acessibilidade (1920 × 1080)

| Variante | Posição da coluna Ações | Rolagem horizontal da tabela | Editar visível sem rolar | Linhas com o nome exato / que contêm o texto |
|---|---|---|---:|---|
| A-direita | 7 de 8 (última) | **não** | 100% | 1 / 1 |
| B-esquerda | 0 de 8 (primeira) | **não** | 100% | 1 / 1 |

Em 1920 × 1080 as 10 linhas da página aparecem inteiras na primeira tela nas duas variantes. Veja [`P3-A-01_lista.png`](resultados_1920x1080/evidencias/P3-A-01_lista.png) (Ações na borda direita) e [`P3-B-01_lista.png`](resultados_1920x1080/evidencias/P3-B-01_lista.png) (Ações no começo da linha).

**Distância entre o nome do Programa e o botão Editar** (medida na linha "Saúde Integral", em [`resultados_1920x1080/medicao_complementar.json`](resultados_1920x1080/medicao_complementar.json); script [`medir-layout.cjs`](medir-layout.cjs), uma medição determinística fora das 100 rodadas):

| Variante | Posição do nome (x) | Posição do Editar (x) | Distância horizontal | Colunas entre os dois |
|---|---:|---:|---:|---:|
| A-direita | 560 px | 1828 px | **1268 px** | 4 |
| B-esquerda | 704 px | 310 px | **394 px** | 2 |

Outros fatos observados:

- Controles da coluna Ações da linha: um botão só com ícone, **"Adicionar marcadores a Saúde Integral"** (o nome acessível inclui o Programa), e um link **"Editar"** (o nome acessível é só **"Editar"**, sem o nome do Programa).
- Foco do Editar: `:focus-visible` verdadeiro nas 20 rodadas de teclado, com contorno removido e **sombra** como indicador. O contraste da sombra **não foi medido**.
- Aviso ao salvar: **"Programa editado com sucesso."** apareceu em **100/100** rodadas.
- Estado restaurado e confirmado ao fim da rodada: **100/100**. Mensagens de erro de console: **0**.

---

## 10.3 Feedback sintético por protopersona

> **Atenção: tudo nesta seção foi gerado por IA a partir de fatos medidos e de princípios gerais de usabilidade. Não é fala, opinião nem comportamento de usuários reais.** As protopersonas são perfis analíticos. As estratégias de cada uma eram scripts definidos antes da execução. Como em 1920 × 1080 as duas variantes cabem na tela, **a visibilidade não diferencia A de B**; sobram a convenção de posição, a ordem de leitura, a distância até o nome e a ordem de foco.

**P1 · Operador experiente**
- *Pontos positivos:* nas duas variantes, a ação direta (busca + Editar) funcionou em todas as rodadas. Na B, o controle fica sempre na mesma posição, perto do começo da linha, o que pode encurtar o deslocamento do olhar e do cursor. A A segue a convenção comum de "ações no fim da linha", o que favorece a familiaridade.
- *Dificuldades hipotéticas:* na A, o cursor percorre cerca de 1268 px entre o nome e o Editar; na B, cerca de 394 px. Se isso pesa para quem edita muito, é hipótese (H02).
- *Trade-off A/B:* familiaridade (A) contra proximidade da ação ao nome (B).
- *Fundamento:* distâncias medidas e raciocínio heurístico. **Os tempos do script não sustentam nenhuma conclusão sobre P1.**

**P2 · Gestor ocasional**
- *Pontos positivos:* na A, a leitura da esquerda para a direita passa pelo código e nome do Programa **antes** de chegar ao Editar, o que favorece conferir "qual é este registro".
- *Dificuldades hipotéticas:* na B, o Editar vem antes do nome na leitura, e a pessoa pode acioná-lo antes de ler o registro. Na A, a ação fica longe do nome (4 colunas entre eles), o que pode dificultar associar a ação à linha certa.
- *Trade-off:* identidade primeiro (A) contra ação perto do nome (B).
- *Fundamento:* ordem de leitura das colunas e distâncias medidas (heurística). **Não há dado observado sobre erro de seleção de linha.**

**P3 · Usuário iniciante**
- *Pontos positivos:* nas duas variantes o botão de edição tem **rótulo escrito ("Editar")**, o que não depende de decifrar ícone; o botão de marcadores tem só ícone, mas com nome acessível e dica.
- *Dificuldades hipotéticas:* na B, a ação aparece antes do nome e dos dados; um iniciante pode clicar sem confirmar o contexto (H01). Na A, a ação fica no fim da linha, onde muitos sistemas a colocam.
- *Trade-off:* convenção (A) contra ação visível logo ao primeiro olhar (B).
- *Fundamento:* rótulo textual observado e ordem das colunas. A percepção real de iniciantes **não foi testada**.

**P4 · Analista cuidadoso**
- *Pontos positivos:* nas duas variantes, abrir o formulário mostra o nome do Programa no campo e no título da página, e o script confirmou o registro correto antes e depois de salvar, sem alterar nenhum outro nome.
- *Dificuldades hipotéticas:* o nome acessível do Editar é só "Editar", igual em todas as linhas; a conferência depende da posição na linha. Na B, o Editar fica mais perto do nome (394 px, 2 colunas); na A, mais longe (1268 px, 4 colunas), o que pode favorecer ou atrapalhar a conferência conforme a pessoa.
- *Trade-off:* proximidade entre a ação e o nome (B) contra ação separada do nome por mais dados (A).
- *Fundamento:* distâncias medidas e contagem de nomes alterados (1 em cada rodada de P4, como esperado). **Nenhum registro errado foi aberto nas 100 rodadas, mas um script não erra por distração.**

**P5 · Navegação por teclado**
- *Pontos positivos:* o foco é visível no Editar (10/10 em cada variante), e o botão de marcadores tem nome acessível completo.
- *Dificuldades hipotéticas:* (1) são ~35 Tab até a primeira linha, em ambas as variantes, por causa do que vem antes da tabela (a existência de um atalho para pular ao conteúdo não foi verificada); (2) o link "Editar" lido por leitor de tela é só "Editar", repetido em cada linha, sem o Programa; (3) o Salvar vem antes dos campos, exigindo voltar com Shift+Tab; (4) selos de marcador recebem foco e alongam o caminho na A.
- *Trade-off:* na primeira linha, o Editar fica 9 Tab mais perto na B (36 contra 45). A diferença vem da posição dos controles na ordem de foco e muda com a linha e com a quantidade de selos de marcador.
- *Fundamento:* contagens de Tab das rodadas P5 e leitura da estrutura (H05). **Não foi usado leitor de tela real.**

---

## 10.4 Suposições e hipóteses pendentes

Todas com o **status: não validada com usuários reais**.

**H01 — Mostrar nome e informações antes de Editar ajuda iniciantes a confirmar o registro.**
- *Suposição:* iniciantes erram menos o registro quando leem nome e dados antes de chegar à ação.
- *Motivação:* princípio de reconhecimento antes da ação; na A o nome vem antes do Editar na leitura.
- *Variante potencialmente favorecida:* A.
- *Confiança exploratória:* baixa. Não há dado observado, só a ordem das colunas.
- *Risco se falsa:* o argumento a favor de A perde força.
- *Como validar:* tarefa moderada com iniciantes (n ≥ 20 por variante, ordem contrabalançada); medir quantos abrem o registro errado e quanto tempo levam até confirmar a identidade.

**H02 — Ações na primeira coluna podem favorecer operadores frequentes.**
- *Suposição:* quem edita muitas linhas por dia ganha velocidade com o controle perto do nome e numa posição fixa à esquerda.
- *Motivação:* distância menor entre o nome e a ação (394 px contra 1268 px, medidos).
- *Variante potencialmente favorecida:* B.
- *Confiança exploratória:* baixa. Os tempos do robô não informam nada sobre humanos.
- *Risco se falsa:* trocar a posição sem ganho e quebrar a convenção.
- *Como validar:* operadores frequentes fazendo 10 edições em sequência; medir tempo por edição e movimento do cursor.

**H03 — A posição das ações pode influenciar erros de seleção de linha.**
- *Suposição:* a distância entre o nome e a ação aumenta o risco de clicar na linha vizinha.
- *Motivação:* na A a ação fica a 1268 px do nome, na outra ponta da linha; na B, a 394 px.
- *Variante potencialmente favorecida:* indeterminada (distância curta ajuda a associar; ordem "nome antes da ação" também ajuda).
- *Confiança exploratória:* baixa. Nenhum erro de seleção ocorreu nas 100 rodadas, e um script não erra por distração.
- *Risco se falsa:* investimento em reposicionar sem efeito.
- *Como validar:* teste com tabelas de linhas semelhantes e medição de erros de linha por variante.

**H04 — Em tabelas com rolagem horizontal, fixar a coluna de ações pode importar mais que seu lado.**
- *Suposição:* quando a tabela é mais larga que a janela, o problema real é a ação sair da tela.
- *Motivação:* hipótese do protocolo. **Não pôde ser observada neste cenário:** em 1920 × 1080 não há rolagem horizontal em nenhuma variante.
- *Variante potencialmente favorecida:* indeterminada.
- *Confiança exploratória:* baixa, sem evidência neste cenário.
- *Risco se falsa:* nenhum direto na resolução de 1920 × 1080.
- *Como validar:* só tem sentido se usuários reais trabalham em janelas menores; neste caso, testar com a tabela em larguras menores e uma coluna fixa.

**H05 — A ordem de foco e o nome acessível dos botões podem pesar mais que a posição visual para teclado.**
- *Suposição:* para teclado e leitor de tela, o que vale é a ordem de foco e o nome do controle.
- *Motivação:* o Editar tem nome "Editar" em todas as linhas; ~35 Tab antes da tabela; Salvar antes dos campos; selos de marcador focáveis.
- *Variante potencialmente favorecida:* indeterminada (B ficou 9 Tab mais perto na primeira linha, mas isso pode se inverter em outras linhas).
- *Confiança exploratória:* média, pelas contagens medidas e pela estrutura; sem leitor de tela real.
- *Risco se falsa:* trabalho de acessibilidade com pouco ganho, ou perda de usuários que dependem dele.
- *Como validar:* sessão com usuários de teclado e de leitor de tela, medindo teclas até concluir, dúvidas faladas e erros.

**H06 — O nome acessível "Editar" repetido, sem o nome do Programa, dificulta leitor de tela.**
- *Suposição:* leitor de tela lendo uma lista de "Editar, Editar, Editar" não dá contexto suficiente.
- *Motivação:* o botão de marcadores já inclui o nome do Programa; o Editar não.
- *Variante potencialmente favorecida:* independe da posição.
- *Confiança exploratória:* média, por princípio de acessibilidade; não testado com leitor de tela.
- *Risco se falsa:* mudança pequena de texto, baixo custo.
- *Como validar:* teste com leitor de tela e comparação de "Editar" contra "Editar Saúde Integral".

---

## 10.5 Conclusão

**(a) Fatos observados**
- 100 de 100 rodadas planejadas foram executadas e concluídas (50 por variante), sem falhas, sem bloqueios e sem erros de console.
- Em todas, o Programa foi renomeado, o aviso apareceu e o nome persistiu (lista, recarga e estado salvo). O estado foi restaurado em 100/100.
- Os tempos e as interações automatizados não distinguem as variantes (intervalos sobrepostos).
- Em 1920 × 1080, nenhuma das duas variantes tem rolagem horizontal, e o Editar fica 100% visível nas duas.
- O Editar fica a 1268 px do nome do Programa na A (4 colunas entre eles) e a 394 px na B (2 colunas).
- Por teclado, o Editar da primeira linha é alcançado com 36 Tab na B e 45 na A; o Salvar fica antes dos campos nas duas.
- O nome acessível do Editar é "Editar" (sem o Programa); o do botão de marcadores inclui o Programa.

**(b) Interpretação heurística**
- Em 1920 × 1080, a escolha entre A e B tem **pouco efeito técnico mensurável**. O que as separa é a **proximidade entre a ação e o nome** (menor na B) e a **ordem de leitura "nome antes da ação"** (própria da A).
- A vantagem observada da B em teclado vale para a primeira linha e pode mudar com outras linhas.
- Os achados de acessibilidade (nome "Editar" repetido, Salvar antes dos campos, ~35 Tab até a tabela) **não dependem do lado** da coluna e valem para o sistema em geral.

**(c) Suposições ainda não validadas**
- Que pessoas reais cometam menos erros, ou prefiram uma ou outra variante, **não foi avaliado** (H01 a H06).

**Conclusão geral: inconclusivo sobre qual variante é melhor para pessoas.** Este relatório **não** afirma que 100 pessoas foram testadas: foram 100 repetições de um script.

---

## 10.6 Próxima etapa (fora do escopo deste Prototeste)

Recomendação para um **teste moderado, ou não moderado, com participantes reais**, que **não foi executado aqui**:

- **Participantes:** pessoas que usam o módulo (operadores, gestores ocasionais, iniciantes, analistas) e ao menos algumas que usam só teclado ou leitor de tela.
- **Delineamento:** comparação **entre sujeitos ou intra-sujeito com ordem A/B contrabalançada**, em monitores de **1920 × 1080**, o padrão do governo.
- **Tarefa:** a mesma do protocolo (localizar "Saúde Integral", editar para "Saúde Integral 1", salvar, confirmar).
- **Medidas:** sucesso da tarefa, **erros de seleção de linha**, tempo até a primeira ação correta, **facilidade percebida** (escala curta, como SEQ) e comentários falados.
- **Cuidados:** não revelar a hipótese; usar dados fictícios; registrar o ambiente; analisar o efeito de ordem.

---

## Apêndice A — Método, ambiente e desvios do protocolo

**Ambiente.** Edge 157 (modo headless, via `puppeteer-core`), Node 24, Windows. Janela **1920 × 1080**, zoom 100%, sem latência simulada. Base: commit `23e2692` **com 16 arquivos modificados e não commitados** na árvore de trabalho; hashes parciais em [`resultados_1920x1080/ambiente.json`](resultados_1920x1080/ambiente.json). Login de **demonstração** do protótipo (usuário `teste.prototeste`, fictício, sem autenticação real). Dados 100% fictícios.

**Como as rodadas foram feitas.** Cada rodada abriu um **contexto de navegador novo** (storage limpo), fez o acesso completo (login, termos, permissões, perfil Administrador central e plano 2028–2031), foi a **Cadastros › Programa**, aplicou a estratégia da protopersona, renomeou, salvou, verificou a persistência na lista, após recarregar e no estado salvo, e **restaurou o nome original**. Foram 10 pares por persona (pares 1 a 5 em A→B e 6 a 10 em B→A). Os scripts não usam sorteio: são determinísticos. Duração total: 317 s.

**Definição das métricas.** *Identificar a linha*: da lista pronta até a estratégia achar a linha (P5: até o foco entrar na linha). *Acionar Editar*: da linha identificada até o clique (P5: até o Editar receber o foco). *Total*: da abertura da tela de login até a confirmação da persistência. *Interações*: cliques, digitações, Tab e teclas.

**Escopo deste relatório.** Considera **somente a bateria de 1920 × 1080**. Uma bateria anterior, de 100 rodadas em **1440 × 900**, foi executada antes e permanece em `resultados/` (com a medição de layout em 1280, 1440 e 1920 px), mas **não é considerada** aqui.

**Desvios e decisões que o leitor precisa conhecer:**

1. **Tela escolhida.** "Programas" com botão Editar existe só em **Cadastros › Programa** (perfil Administrador central). A tela "Programas" do setorial não tem Editar.
2. **Como as variantes foram feitas.** Alterei `central-programas.js`: `?acoes=esquerda` (guardado na sessão) leva a coluna para a primeira posição; sem ele, nada muda. **Além da posição, na B o texto da coluna fica alinhado à esquerda** (`text-start`, em vez de `text-end`); largura (9 rem), botões e conteúdo são idênticos. Essa alteração **está no repositório, não commitada**.
3. **Servidor.** Uma primeira tentativa com o servidor de desenvolvimento do projeto (`servidor.py`) teve uma falha de rede do sistema operacional (`net::ERR_NO_BUFFER_SPACE`), porque ele fecha a conexão a cada arquivo. Para as execuções oficiais usei um servidor estático mínimo, com os **mesmos arquivos** ([`servir.cjs`](servir.cjs)).
4. **Pilotos descartados.** Foram três execuções de teste do executor (10 a 20 rodadas, em 1440 × 900), **não contadas** nos resultados. Corrigiram: o seletor do menu e a instrumentação de rede. Em P5, o script passou a voltar com **Shift+Tab** até o Salvar, já que o Salvar vem antes dos campos; isso foi corrigido por ser uma impossibilidade mecânica da tarefa, e o achado está registrado.
5. **A variante é configurada, não escolhida pela "pessoa".** O script grava a variante na sessão logo depois do login.
6. **Feedback sintético por rodada.** Nos logs fica `"nao_avaliada"`; o feedback está só na seção 10.3, por protopersona.
7. **Evidências.** Capturas só da rodada 01 de cada combinação (20 imagens). O log de todas as rodadas está completo em `execucoes.jsonl`.
8. **Instrumentação.** Um atributo (`data-proto-alvo`) marca a linha-alvo; não tem efeito visual.
9. **Medições de layout.** A distância entre nome e Editar e a visibilidade do botão vêm de uma medição determinística, **fora das 100 rodadas**, no mesmo ambiente.

**Arquivos (todos em `prototeste/`):**

| Arquivo | Conteúdo |
|---|---|
| [`resultados_1920x1080/execucoes.jsonl`](resultados_1920x1080/execucoes.jsonl) | 1 registro por rodada, no modelo da seção 9 do protocolo |
| [`resultados_1920x1080/resumo.json`](resultados_1920x1080/resumo.json) · [`tabelas.md`](resultados_1920x1080/tabelas.md) | Agregados gerados direto dos logs |
| [`resultados_1920x1080/ambiente.json`](resultados_1920x1080/ambiente.json) | Ambiente, commit e hashes |
| [`resultados_1920x1080/medicao_complementar.json`](resultados_1920x1080/medicao_complementar.json) | Medição de layout em 1920 × 1080 |
| [`resultados_1920x1080/evidencias/`](resultados_1920x1080/evidencias) | 20 capturas de tela |
| [`resultados_1920x1080/console.log`](resultados_1920x1080/console.log) | Saída da execução |
| [`executar.cjs`](executar.cjs) · [`analisar.cjs`](analisar.cjs) · [`medir-layout.cjs`](medir-layout.cjs) · [`servir.cjs`](servir.cjs) | Código para reproduzir |

**Para reproduzir:**

```bash
node prototeste/servir.cjs 8898

PROTO_LARGURA=1920 PROTO_ALTURA=1080 PROTO_SAIDA=prototeste/resultados_1920x1080 \
  PROTO_NODE_MODULES=<pasta com puppeteer-core> PROTO_BASE=http://127.0.0.1:8898 node prototeste/executar.cjs
PROTO_SAIDA=prototeste/resultados_1920x1080 node prototeste/analisar.cjs

PROTO_LARGURAS=1920 PROTO_ALTURA=1080 PROTO_SAIDA=prototeste/resultados_1920x1080 \
  PROTO_NODE_MODULES=<pasta com puppeteer-core> PROTO_BASE=http://127.0.0.1:8898 node prototeste/medir-layout.cjs
```
