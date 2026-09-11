# Bloco 6 · Visão Setorial

Sete telas. Persona: técnico do órgão. Preenche, confere as pendências e envia para análise.

Referência: `prototipo-lovable/src/routes/` — `index.tsx`, `programa.$id.tsx`, `iniciativas.tsx`,
`iniciativa.$id.tsx`, `entregas.tsx`, `entrega.$id.tsx`, `indicadores.tsx`.

---

## 6.1 · Programas — `/`

Tela inicial do órgão e a segunda mais densa do sistema.

### T6.1.1 · Faixa de indicadores
- [ ] **T6.1.1.1** Seis números: programas do PPA, com contribuição do órgão, iniciativas, entregas,
      previsto, % de execução
- [ ] **T6.1.1.2** Nota de rodapé explicando que os valores derivam das Ações vinculadas
- [ ] **T6.1.1.3** Deixar claro que a execução é financeira, não desempenho físico

### T6.1.2 · Tabela de Programas
- [ ] **T6.1.2.1** Código, nome e eixo
- [ ] **T6.1.2.2** Situação da contribuição do órgão em chip
- [ ] **T6.1.2.3** Iniciativas, entregas e pendências do órgão no Programa
- [ ] **T6.1.2.4** Previsto e execução
- [ ] **T6.1.2.5** Coluna de ações com botões e menu

### T6.1.3 · Busca
- [ ] **T6.1.3.1** Por código ou nome do Programa

### T6.1.4 · Filtro de situação
- [ ] **T6.1.4.1** Sete opções, de "todos" a "com Iniciativa devolvida"
- [ ] **T6.1.4.2** Incluir "marcados como sem contribuição" e "ainda não avaliados"

### T6.1.5 · Filtros de eixo e objetivo
- [ ] **T6.1.5.1** Filtro de eixo
- [ ] **T6.1.5.2** Filtro de objetivo estratégico, restrito pelo eixo escolhido
- [ ] **T6.1.5.3** Voltar o objetivo para "todos" quando o eixo muda

### T6.1.6 · Ordenação
- [ ] **T6.1.6.1** Quatro critérios: prioridade, código, nome, nº de iniciativas
- [ ] **T6.1.6.2** Prioridade como padrão

### T6.1.7 · Explicar a ordenação por prioridade ⚠
- [ ] **T6.1.7.1** A regra é implícita: devolvida acima de em preenchimento, acima de enviada
- [ ] **T6.1.7.2** Expor a regra na interface, em tooltip ou legenda

### T6.1.8 · Expansão
- [ ] **T6.1.8.1** Programa → Iniciativas do órgão, com status e pendências
- [ ] **T6.1.8.2** Iniciativa → Entregas, com situação
- [ ] **T6.1.8.3** Estado sem iniciativas, convidando a criar

### T6.1.9 · Nova Iniciativa
- [ ] **T6.1.9.1** Botão na linha do Programa
- [ ] **T6.1.9.2** Modal com nome, detalhamento e público-alvo
- [ ] **T6.1.9.3** Seleção múltipla das causas do Programa
- [ ] **T6.1.9.4** Bloquear sem nome
- [ ] **T6.1.9.5** Navegar para a ficha criada
- [ ] **T6.1.9.6** Estado de Programa sem causas cadastradas ⚠

### T6.1.10 · Sem contribuição
- [ ] **T6.1.10.1** Marcar o Programa como sem contribuição do órgão
- [ ] **T6.1.10.2** Reconsiderar participação
- [ ] **T6.1.10.3** Refletir no chip de participação e no filtro

### T6.1.11 · Justificativa da não contribuição ✚ ↯
- [ ] **T6.1.11.1** Decidir se exige texto — hoje é um clique sem registro
- [ ] **T6.1.11.2** Campo de justificativa no ato
- [ ] **T6.1.11.3** Mostrar a justificativa à área central

### T6.1.12 · Excluir Iniciativa ⚠ ↯
- [ ] **T6.1.12.1** Trocar o `confirm()` do navegador pelo diálogo padrão
- [ ] **T6.1.12.2** Definir em quais status a exclusão é permitida
- [ ] **T6.1.12.3** Registrar a exclusão no histórico
- [ ] **T6.1.12.4** Avisar que as Entregas e vínculos vão junto

---

## 6.2 · Ficha do Programa — `/programa/$id`

Leitura pura: o órgão consome o diagnóstico que a área central definiu.

### T6.2.1 · Problema central
- [ ] **T6.2.1.1** Texto do problema
- [ ] **T6.2.1.2** Lista de evidências

### T6.2.2 · Objetivos
- [ ] **T6.2.2.1** Objetivo do Programa
- [ ] **T6.2.2.2** Resultado esperado
- [ ] **T6.2.2.3** População afetada

### T6.2.3 · Causas e subcausas
- [ ] **T6.2.3.1** Árvore com subcausas aninhadas
- [ ] **T6.2.3.2** Indicar quais o órgão já enfrenta em alguma Iniciativa ✚

### T6.2.4 · Consequências
- [ ] **T6.2.4.1** Lista de consequências

### T6.2.5 · Indicadores de resultado
- [ ] **T6.2.5.1** Nome, unidade, linha de base e meta
- [ ] **T6.2.5.2** Estado sem indicadores cadastrados

### T6.2.6 · Iniciativas do órgão
- [ ] **T6.2.6.1** Lista das Iniciativas do órgão no Programa
- [ ] **T6.2.6.2** Botão de criar nova
- [ ] **T6.2.6.3** Estado vazio

### T6.2.7 · Ler do estado ⚠
- [ ] **T6.2.7.1** Trocar a leitura do seed pelo store
- [ ] **T6.2.7.2** Conferir que reflete edições feitas na Administração

---

## 6.3 · Iniciativas — `/iniciativas`

### T6.3.1 · Faixa de indicadores
- [ ] **T6.3.1.1** Contagens por status e financeiro do órgão

### T6.3.2 · Lista
- [ ] **T6.3.2.1** Colunas: iniciativa, programa, status, entregas, pendências, previsto
- [ ] **T6.3.2.2** Link para a ficha
- [ ] **T6.3.2.3** Estado vazio

### T6.3.3 · Busca e filtros
- [ ] **T6.3.3.1** Busca por nome
- [ ] **T6.3.3.2** Filtros de eixo e objetivo, encadeados
- [ ] **T6.3.3.3** Filtro por status, com as cinco opções

### T6.3.4 · Criar a partir desta tela ✚ ↯
- [ ] **T6.3.4.1** Decidir se cabe — hoje a Iniciativa só nasce dentro de um Programa
- [ ] **T6.3.4.2** Se couber, escolher o Programa no próprio modal

---

## 6.4 · Ficha da Iniciativa — `/iniciativa/$id`

Tela de trabalho principal do órgão.

### T6.4.1 · Cabeçalho
- [ ] **T6.4.1.1** Nome, status, versão e analista
- [ ] **T6.4.1.2** Datas de atualização e envio
- [ ] **T6.4.1.3** Trilha de contexto
- [ ] **T6.4.1.4** Ações conforme o status

### T6.4.2 · Dados da Iniciativa
- [ ] **T6.4.2.1** Nome
- [ ] **T6.4.2.2** Detalhamento
- [ ] **T6.4.2.3** Público-alvo
- [ ] **T6.4.2.4** Unidade responsável
- [ ] **T6.4.2.5** Resultado esperado

### T6.4.3 · Causas enfrentadas
- [ ] **T6.4.3.1** Seleção múltipla entre as causas do Programa
- [ ] **T6.4.3.2** Subcausas aninhadas
- [ ] **T6.4.3.3** Aviso quando nenhuma está marcada (pendência impeditiva)

### T6.4.4 · Lista de Entregas
- [ ] **T6.4.4.1** Nome, unidade, metas por ano e situação
- [ ] **T6.4.4.2** Chip de situação por Entrega
- [ ] **T6.4.4.3** Link para a ficha da Entrega
- [ ] **T6.4.4.4** Estado sem entregas (pendência impeditiva)

### T6.4.5 · Adicionar Entrega
- [ ] **T6.4.5.1** Campo de nome com botão adicionar
- [ ] **T6.4.5.2** Navegar direto para a ficha da nova Entrega
- [ ] **T6.4.5.3** Bloquear nome vazio

### T6.4.6 · Excluir Entrega
- [ ] **T6.4.6.1** Diálogo destrutivo nomeando a Entrega
- [ ] **T6.4.6.2** Avisar que os vínculos de Projeto e Ação vão junto

### T6.4.7 · Previsão financeira
- [ ] **T6.4.7.1** Quadro plurianual por fonte
- [ ] **T6.4.7.2** Detalhe por IPOF
- [ ] **T6.4.7.3** Estado sem recursos apropriados

### T6.4.8 · Pendências
- [ ] **T6.4.8.1** Lista em 3 níveis, agregando as das Entregas
- [ ] **T6.4.8.2** Link para a Entrega de origem

### T6.4.9 · Apontamentos recebidos
- [ ] **T6.4.9.1** Lista com campo apontado, texto, autor e data
- [ ] **T6.4.9.2** Destacar na ficha o campo apontado
- [ ] **T6.4.9.3** Estado sem apontamentos

### T6.4.10 · Histórico
- [ ] **T6.4.10.1** Linha do tempo dos eventos, com autor e versão

### T6.4.11 · Enviar para análise
- [ ] **T6.4.11.1** Modal com checklist das pendências
- [ ] **T6.4.11.2** Bloquear o envio com pendência impeditiva
- [ ] **T6.4.11.3** Listar os alertas sem bloquear
- [ ] **T6.4.11.4** Link de cada pendência para o ponto de correção
- [ ] **T6.4.11.5** Incrementar a versão no reenvio de devolvida
- [ ] **T6.4.11.6** Registrar o evento

### T6.4.12 · Gerar PDF
- [ ] **T6.4.12.1** Documento com dados, causas, entregas, metas e financeiro
- [ ] **T6.4.12.2** Usar o gerador do bloco 4

### T6.4.13 · Modo somente-leitura
- [ ] **T6.4.13.1** Edição só em "em preenchimento" e "devolvida"
- [ ] **T6.4.13.2** Campos desabilitados desenhados, não escondidos
- [ ] **T6.4.13.3** Explicar por que está bloqueado
- [ ] **T6.4.13.4** Valer também na ficha da Entrega

### T6.4.14 · Indicadores da Iniciativa ⚠ ↯
- [ ] **T6.4.14.1** Existem no modelo e não há tela em nenhuma visão
- [ ] **T6.4.14.2** Criar, editar e excluir indicador
- [ ] **T6.4.14.3** Campos: nome, descrição, unidade, fórmula, fonte, periodicidade
- [ ] **T6.4.14.4** Valor e ano de referência, polaridade
- [ ] **T6.4.14.5** Metas por ano de 2028 a 2031

### T6.4.15 · Responder apontamento ⚠ ↯
- [ ] **T6.4.15.1** Definir se o órgão responde ou apenas corrige o campo
- [ ] **T6.4.15.2** Ação de marcar como resolvido, se couber ao órgão
- [ ] **T6.4.15.3** Campo de resposta ao apontamento ✚

### T6.4.16 · Salvamento ↯
- [ ] **T6.4.16.1** Hoje grava a cada tecla, sem botão salvar
- [ ] **T6.4.16.2** Decidir se peça de planejamento formal aceita isso
- [ ] **T6.4.16.3** Se não, desenhar rascunho e confirmação
- [ ] **T6.4.16.4** Indicar visualmente que foi salvo ✚

### T6.4.17 · Cancelar envio ✚ ↯
- [ ] **T6.4.17.1** Definir se cabe enquanto a análise não começou
- [ ] **T6.4.17.2** Ação de retornar para "em preenchimento"
- [ ] **T6.4.17.3** Registrar o evento

### T6.4.18 · Versões anteriores ✚ ↯
- [ ] **T6.4.18.1** A versão incrementa no reenvio e não há como consultá-la
- [ ] **T6.4.18.2** Definir se o histórico guarda o conteúdo de cada versão
- [ ] **T6.4.18.3** Comparar versões ↯

---

## 6.5 · Entregas — `/entregas`

### T6.5.1 · Faixa de indicadores
- [ ] **T6.5.1.1** Entregas, metas informadas, pendências e previsto do órgão

### T6.5.2 · Lista
- [ ] **T6.5.2.1** Colunas: entrega, iniciativa, unidade, metas por ano, situação, previsto
- [ ] **T6.5.2.2** Link para a ficha
- [ ] **T6.5.2.3** Estado vazio

### T6.5.3 · Busca e filtros
- [ ] **T6.5.3.1** Busca por nome
- [ ] **T6.5.3.2** Filtros de eixo, objetivo e programa
- [ ] **T6.5.3.3** Filtro por situação da Entrega ✚

---

## 6.6 · Ficha da Entrega — `/entrega/$id`

Onde o órgão declara o que vai entregar à sociedade.

### T6.6.1 · Cabeçalho
- [ ] **T6.6.1.1** Nome da Entrega, com estado de "Nova Entrega"
- [ ] **T6.6.1.2** Trilha Programa › Iniciativa › Entrega
- [ ] **T6.6.1.3** Situação da Entrega em chip

### T6.6.2 · Informações
- [ ] **T6.6.2.1** Nome e descrição
- [ ] **T6.6.2.2** Unidade de medida, em lista fechada de 7 opções
- [ ] **T6.6.2.3** Método de comprovação
- [ ] **T6.6.2.4** Ajuda explicando que Entrega é resultado, não obra

### T6.6.3 · Metas
- [ ] **T6.6.3.1** Um campo por ano, de 2028 a 2031
- [ ] **T6.6.3.2** Aceitar apenas número, com formatação pt-BR
- [ ] **T6.6.3.3** Total ou acumulado conforme o comportamento
- [ ] **T6.6.3.4** Destacar os anos sem meta

### T6.6.4 · Comportamento da meta
- [ ] **T6.6.4.1** Cinco opções: acumulativa, fluxo anual, estoque, percentual, marco
- [ ] **T6.6.4.2** Texto de ajuda de cada uma
- [ ] **T6.6.4.3** Exibir a sugestão do sistema

### T6.6.5 · Validar o comportamento sugerido
- [ ] **T6.6.5.1** Confirmação explícita do órgão
- [ ] **T6.6.5.2** Alerta enquanto não validado
- [ ] **T6.6.5.3** Revalidar quando o comportamento muda

### T6.6.6 · Territorialização
- [ ] **T6.6.6.1** Três tipos: estadual, territorializável, não territorializável
- [ ] **T6.6.6.2** Seleção das 7 regiões quando territorializável
- [ ] **T6.6.6.3** Limpar as regiões ao trocar de tipo
- [ ] **T6.6.6.4** Pendência quando é territorializável sem região

### T6.6.7 · Projetos GOMAP
- [ ] **T6.6.7.1** Seletor dos Projetos do órgão
- [ ] **T6.6.7.2** Aviso de que o Projeto diz *como* se produz, não quanto custa
- [ ] **T6.6.7.3** Lista dos vinculados, com fase e execução
- [ ] **T6.6.7.4** Comparação entre valor global e o refletido nesta Entrega
- [ ] **T6.6.7.5** Desvincular Projeto

### T6.6.8 · Ações Orçamentárias
- [ ] **T6.6.8.1** Catálogo das Ações do órgão, com valor no SIAFIC
- [ ] **T6.6.8.2** Indicar qual Entrega já consome cada Ação
- [ ] **T6.6.8.3** Vincular e desvincular
- [ ] **T6.6.8.4** Bloqueio visual das já vinculadas a outra Entrega
- [ ] **T6.6.8.5** Alerta quando a Entrega não tem nenhuma Ação

### T6.6.9 · Explicar a recusa do vínculo ⚠
- [ ] **T6.6.9.1** Hoje o clique falha em silêncio quando a Ação já financia outra Entrega
- [ ] **T6.6.9.2** Mensagem nomeando a Entrega que já a consome
- [ ] **T6.6.9.3** Link para essa Entrega

### T6.6.10 · IPOFs e descompasso
- [ ] **T6.6.10.1** IPOFs alcançados pelas Ações vinculadas
- [ ] **T6.6.10.2** Valor por IPOF
- [ ] **T6.6.10.3** Descompasso do Projeto, quando houver

### T6.6.11 · Quadro financeiro
- [ ] **T6.6.11.1** Quadro plurianual por fonte, com detalhe por IPOF
- [ ] **T6.6.11.2** Aviso de que nenhum valor é digitado
- [ ] **T6.6.11.3** Estado sem Ação vinculada

### T6.6.12 · Pendências da Entrega
- [ ] **T6.6.12.1** Lista em 3 níveis
- [ ] **T6.6.12.2** Âncora para o campo pendente

### T6.6.13 · Resposta GOMAP ⚠
- [ ] **T6.6.13.1** O campo existe no modelo (sim/não/depois), é exibido na análise e nunca é
      preenchido
- [ ] **T6.6.13.2** Perguntar ao órgão se a Entrega é viabilizada por Projeto
- [ ] **T6.6.13.3** Permitir adiar a resposta
- [ ] **T6.6.13.4** Refletir a resposta na ficha de análise

### T6.6.14 · Explicar a sugestão de comportamento ↯
- [ ] **T6.6.14.1** Descobrir em que regra o sistema se baseia
- [ ] **T6.6.14.2** Explicar na interface
- [ ] **T6.6.14.3** Definir quem responde se a sugestão estiver errada

### T6.6.15 · Meta por região ✚ ↯
- [ ] **T6.6.15.1** Hoje há meta total, sem distribuição territorial quantificada
- [ ] **T6.6.15.2** Definir se a distribuição precisa de número
- [ ] **T6.6.15.3** Conferir que a soma das regiões bate com a meta total

---

## 6.7 · Indicadores — `/indicadores`

### T6.7.1 · Lista consolidada
- [ ] **T6.7.1.1** Indicadores de Programa e de Iniciativa na mesma visão
- [ ] **T6.7.1.2** Coluna indicando o nível
- [ ] **T6.7.1.3** Link para o Programa ou a Iniciativa de origem

### T6.7.2 · Dados do indicador
- [ ] **T6.7.2.1** Metas por ano, de 2028 a 2031
- [ ] **T6.7.2.2** Polaridade (maior melhor / menor melhor)
- [ ] **T6.7.2.3** Fonte e periodicidade
- [ ] **T6.7.2.4** Valor e ano de referência

### T6.7.3 · Filtros
- [ ] **T6.7.3.1** Por nível: Programa ou Iniciativa
- [ ] **T6.7.3.2** Por eixo e objetivo, encadeados
- [ ] **T6.7.3.3** Busca por nome

### T6.7.4 · CRUD de indicador ⚠ ↯

O maior buraco do protótipo: a tela é uma vitrine de dados do seed que ninguém pode manter.

- [ ] **T6.7.4.1** Definir quem cadastra indicador de Programa e de Iniciativa
- [ ] **T6.7.4.2** Formulário de indicador com todos os campos
- [ ] **T6.7.4.3** Criar, editar e excluir
- [ ] **T6.7.4.4** Validar a série de metas
- [ ] **T6.7.4.5** Decidir em qual visão cada nível é mantido

### T6.7.5 · Apuração ✚ ↯
- [ ] **T6.7.5.1** Definir se o PPA registra realizado, ou apenas meta
- [ ] **T6.7.5.2** Se registrar, campo de valor por período
- [ ] **T6.7.5.3** Comparação meta × realizado
- [ ] **T6.7.5.4** Série histórica ↯
