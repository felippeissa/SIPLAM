# Bloco 5 · Visão Área Central

Nove telas. Persona: analista da área central. Não preenche — analisa, aponta, devolve, valida e
administra os Programas.

Referência: `prototipo-lovable/src/routes/central*.tsx`.

---

## 5.1 · Visão Geral — `/central`

A tela mais densa do sistema. Valida a fundação inteira.

### T5.1.1 · Tabela de Programas
- [ ] **T5.1.1.1** Colunas: código, nome + eixo, órgãos, iniciativas, em análise, devolvidas,
      validadas
- [ ] **T5.1.1.2** Código em fonte monoespaçada, contadores alinhados à direita
- [ ] **T5.1.1.3** Coluna de ações com o menu da linha
- [ ] **T5.1.1.4** Rolagem horizontal contida

### T5.1.2 · Busca
- [ ] **T5.1.2.1** Campo que filtra por código ou nome do Programa
- [ ] **T5.1.2.2** Filtro sem diferenciar maiúsculas

### T5.1.3 · Filtro da fila
- [ ] **T5.1.3.1** Três opções: todos · com iniciativas aguardando análise · com devolvidas
- [ ] **T5.1.3.2** Combinar com a busca sem conflito

### T5.1.4 · Menu → Visualizar Programa
- [ ] **T5.1.4.1** Item que abre a ficha de diagnóstico em leitura
- [ ] **T5.1.4.2** Conferir que a ficha é a mesma que o órgão vê

### T5.1.5 · Menu → Cobertura causal
- [ ] **T5.1.5.1** Modal listando causas e subcausas, com a subcausa indentada
- [ ] **T5.1.5.2** Contagem de órgãos e iniciativas por causa
- [ ] **T5.1.5.3** Chip de alerta "Nenhuma Iniciativa" na causa órfã
- [ ] **T5.1.5.4** Aviso de que cobertura não é participação de órgão
- [ ] **T5.1.5.5** Rolagem interna quando o Programa tem muitas causas

### T5.1.6 · Menu → Ver órgãos participantes
- [ ] **T5.1.6.1** Item que expande a linha do Programa
- [ ] **T5.1.6.2** Rolar até a expansão quando ela abre fora da vista ✚

### T5.1.7 · Expansão nível 1 — órgãos
- [ ] **T5.1.7.1** Colunas: órgão, iniciativas, entregas, situação resumida
- [ ] **T5.1.7.2** Situação resumida em texto ("2 em preenchimento · 1 devolvida")
- [ ] **T5.1.7.3** Estado "nenhum órgão cadastrou Iniciativas neste Programa"

### T5.1.8 · Expansão nível 2 — iniciativas
- [ ] **T5.1.8.1** Colunas: iniciativa, status, entregas, atualização, analista
- [ ] **T5.1.8.2** Analista com travessão quando ainda não há
- [ ] **T5.1.8.3** Recuo visual indicando o terceiro nível

### T5.1.9 · Botão contextual
- [ ] **T5.1.9.1** Rótulo por status: Analisar (enviada), Continuar análise (em análise),
      Visualizar (demais)
- [ ] **T5.1.9.2** Levar à ficha de análise da Iniciativa

### T5.1.10 · Ler os Programas do estado ⚠
- [ ] **T5.1.10.1** Trocar a leitura do seed fixo pelo store
- [ ] **T5.1.10.2** Verificar o mesmo no modal de cobertura causal
- [ ] **T5.1.10.3** Confirmar que um Programa criado na Administração aparece aqui

### T5.1.11 · Acertar as colunas de status ⚠
- [ ] **T5.1.11.1** Separar "enviadas" de "em análise", ou renomear a coluna que soma as duas
- [ ] **T5.1.11.2** Incluir coluna de "em preenchimento"
- [ ] **T5.1.11.3** Garantir que as colunas fechem com o total de iniciativas

### T5.1.12 · Corrigir "Ver órgãos participantes" ⚠
- [ ] **T5.1.12.1** Tratar o caso de a linha já estar aberta — hoje o clique não faz nada
- [ ] **T5.1.12.2** Definir se recolhe ou apenas rola até ela

### T5.1.13 · Unificar a definição de cobertura ⚠ ↯
- [ ] **T5.1.13.1** Decidir com os stakeholders: só direta, ou direta e indireta por subcausas
- [ ] **T5.1.13.2** Aplicar a mesma regra aqui e em Análises › Por Causas
- [ ] **T5.1.13.3** Explicar a definição na interface

### T5.1.14 · Faixa de indicadores ✚ ↯
- [ ] **T5.1.14.1** Definir quais números importam ao analista nesta tela
- [ ] **T5.1.14.2** Implementar a faixa, alinhada às outras telas da área central

---

## 5.2 · Entregas do PPA — `/central/entregas`

### T5.2.1 · Tabela transversal
- [ ] **T5.2.1.1** Colunas: entrega, órgão, iniciativa, programa, meta total, previsto, situação
- [ ] **T5.2.1.2** Status da Iniciativa em chip
- [ ] **T5.2.1.3** Link para a ficha da Entrega
- [ ] **T5.2.1.4** Estado vazio próprio

### T5.2.2 · Busca ampla
- [ ] **T5.2.2.1** Cobrir entrega, órgão, programa, iniciativa, região, projeto e IPOF
- [ ] **T5.2.2.2** Placeholder dizendo o que a busca alcança

### T5.2.3 · Filtros estruturados ⚠ ✚
- [ ] **T5.2.3.1** Filtro por órgão
- [ ] **T5.2.3.2** Filtro por programa
- [ ] **T5.2.3.3** Filtro por situação da Iniciativa
- [ ] **T5.2.3.4** Filtro por vínculo orçamentário (com e sem Ação) ↯

---

## 5.3 · Órgãos participantes — `/central/orgaos`

### T5.3.1 · Faixa de indicadores
- [ ] **T5.3.1.1** Cinco números: órgãos, iniciativas, entregas, aguardando análise, previsto

### T5.3.2 · Tabela por órgão
- [ ] **T5.3.2.1** Colunas: órgão, programas, iniciativas, entregas, previsto, executado, %
- [ ] **T5.3.2.2** Busca por órgão
- [ ] **T5.3.2.3** Percentual com travessão quando não há previsto

### T5.3.3 · Situação em chips
- [ ] **T5.3.3.1** Um chip por status com contagem, omitindo os zerados
- [ ] **T5.3.3.2** Cores conforme os tons semânticos

### T5.3.4 · Expansão em quatro níveis
- [ ] **T5.3.4.1** Órgão → programas
- [ ] **T5.3.4.2** Programa → iniciativas
- [ ] **T5.3.4.3** Iniciativa → entregas, com a situação de cada uma
- [ ] **T5.3.4.4** Botão de abrir a análise da Iniciativa

### T5.3.5 · Mostrar os órgãos silenciosos ⚠ ↯
- [ ] **T5.3.5.1** Listar também quem não contribuiu — hoje o órgão silencioso é invisível
- [ ] **T5.3.5.2** Distinguir "sem contribuição informada" de "não avaliado"
- [ ] **T5.3.5.3** Definir se a tela vira instrumento de cobrança

---

## 5.4 · Análise por Causas — `/central/analises/causas`

### T5.4.1 · Seleção do Programa
- [ ] **T5.4.1.1** Select obrigatório, com estado inicial sem escolha
- [ ] **T5.4.1.2** Mensagem orientando a escolher um Programa

### T5.4.2 · Tabela de causas
- [ ] **T5.4.2.1** Causa e subcausa hierarquizadas
- [ ] **T5.4.2.2** Colunas: cobertura, órgãos, iniciativas, entregas

### T5.4.3 · Chip de cobertura
- [ ] **T5.4.3.1** Direta (ok), por subcausas (info), sem atuação (alerta)
- [ ] **T5.4.3.2** Explicar a diferença na interface

### T5.4.4 · Expansão da causa
- [ ] **T5.4.4.1** Iniciativas que a enfrentam, com órgão
- [ ] **T5.4.4.2** Entregas dessas iniciativas
- [ ] **T5.4.4.3** Link para a ficha da Entrega

### T5.4.5 · Visão consolidada ✚ ↯
- [ ] **T5.4.5.1** Panorama de todos os Programas, para achar as maiores lacunas do plano
- [ ] **T5.4.5.2** Ordenar por número de causas sem cobertura

---

## 5.5 · Análise Financeira — `/central/analises/financeira`

### T5.5.1 · Faixa de indicadores
- [ ] **T5.5.1.1** Cinco números do recorte: previsto, fontes, órgãos, IPOFs, entregas com recursos
- [ ] **T5.5.1.2** Recalcular a cada mudança de filtro

### T5.5.2 · Quadro plurianual
- [ ] **T5.5.2.1** Colunas de 2028 a 2031 mais total
- [ ] **T5.5.2.2** Linha de total geral
- [ ] **T5.5.2.3** Usar o componente T4.6

### T5.5.3 · Dimensão de agrupamento
- [ ] **T5.5.3.1** Nove opções: fonte, órgão, programa, iniciativa, entrega, IPOF, projeto, ação,
      classificação
- [ ] **T5.5.3.2** Rótulo da coluna mudando com a dimensão
- [ ] **T5.5.3.3** Dimensão de detalhe coerente com a escolhida

### T5.5.4 · Filtros
- [ ] **T5.5.4.1** Ano, com opção de ver os quatro
- [ ] **T5.5.4.2** Eixo e objetivo estratégico, encadeados
- [ ] **T5.5.4.3** Programa, órgão e fonte
- [ ] **T5.5.4.4** Indicar o recorte ativo em texto

### T5.5.5 · Expansão da linha
- [ ] **T5.5.5.1** Abrir na dimensão de detalhe
- [ ] **T5.5.5.2** Manter os valores por ano coerentes com a linha-mãe

### T5.5.6 · Mostrar o executado ⚠
- [ ] **T5.5.6.1** Incluir o executado do SIAFIC, que existe no modelo e some nesta tela
- [ ] **T5.5.6.2** Percentual de execução por linha
- [ ] **T5.5.6.3** Nota de que a execução é financeira, não desempenho físico

### T5.5.7 · Gráficos ✚ ↯
- [ ] **T5.5.7.1** Barras de previsto × executado por órgão
- [ ] **T5.5.7.2** Série anual do recorte
- [ ] **T5.5.7.3** Usar ApexCharts, já no pacote

### T5.5.8 · Exportação ✚ ↯
- [ ] **T5.5.8.1** Decidir se exportar é requisito, e em quais telas
- [ ] **T5.5.8.2** Exportar o quadro em CSV respeitando o recorte
- [ ] **T5.5.8.3** Avaliar o exemplo `tables-datatables-export-data`

---

## 5.6 · Projetos GOMAP — `/central/analises/projetos`

### T5.6.1 · Tabela de Projetos
- [ ] **T5.6.1.1** Colunas: projeto, órgão, entregas, programas, IPOFs, apropriado ao PPA, situação
- [ ] **T5.6.1.2** Fase, execução e cronograma do Projeto
- [ ] **T5.6.1.3** Conclusão prevista e última atualização

### T5.6.2 · Busca
- [ ] **T5.6.2.1** Por código, nome ou órgão
- [ ] **T5.6.2.2** Aceitar `?q=` vindo da busca global

### T5.6.3 · Expansão
- [ ] **T5.6.3.1** Entregas do PPA relacionadas ao Projeto
- [ ] **T5.6.3.2** Valores apropriados por Entrega
- [ ] **T5.6.3.3** Link para a ficha da Entrega

### T5.6.4 · Descompasso GOMAP × PPA ↯
- [ ] **T5.6.4.1** Comparar valor global do Projeto com o refletido no PPA
- [ ] **T5.6.4.2** Explicar que a diferença pode estar fora do período do plano
- [ ] **T5.6.4.3** Definir se existe limiar a partir do qual vira pendência
- [ ] **T5.6.4.4** Sinalizar Projeto sem nenhuma Entrega relacionada ↯

---

## 5.7 · IPOFs — `/central/analises/ipofs`

### T5.7.1 · Tabela de IPOFs
- [ ] **T5.7.1.1** Colunas: IPOF, órgão, fontes, valor SIAFIC, no PPA, fora do PPA, entregas
- [ ] **T5.7.1.2** Fontes concatenadas quando há mais de uma

### T5.7.2 · Alerta de valor fora do PPA
- [ ] **T5.7.2.1** Chip de alerta quando há valor não refletido no plano
- [ ] **T5.7.2.2** Explicar o que "fora do PPA" significa ↯

### T5.7.3 · Expansão em parcelas
- [ ] **T5.7.3.1** Parcelas por ano, com SIAFIC, dentro e fora do PPA
- [ ] **T5.7.3.2** Detalhe de mês, fonte e classificação

### T5.7.4 · Expansão nas entregas financiadas
- [ ] **T5.7.4.1** Entrega, ação, iniciativa, programa e órgão
- [ ] **T5.7.4.2** Valores ano a ano mais total
- [ ] **T5.7.4.3** Link para a ficha da Entrega

### T5.7.5 · Busca
- [ ] **T5.7.5.1** Por código, nome, fonte, órgão ou projeto
- [ ] **T5.7.5.2** Aceitar `?q=` vindo da busca global
- [ ] **T5.7.5.3** Listar IPOF sem Ação vinculada a nenhuma Entrega ↯

---

## 5.8 · Administração de Programas — `/central/programas`

O único CRUD completo do sistema — e onde estão os problemas mais graves.

### T5.8.1 · Lista
- [ ] **T5.8.1.1** Colunas: código, nome, aptidão, disponibilização
- [ ] **T5.8.1.2** Aptidão em chip: diagnóstico incompleto ou apto
- [ ] **T5.8.1.3** Disponibilização em chip: em estruturação, pronto, disponível, encerrado
- [ ] **T5.8.1.4** Faixa de indicadores dos Programas

### T5.8.2 · Busca e filtros
- [ ] **T5.8.2.1** Busca por nome ou código
- [ ] **T5.8.2.2** Filtros de eixo e objetivo estratégico, encadeados

### T5.8.3 · Novo Programa
- [ ] **T5.8.3.1** Modal rolável com o formulário
- [ ] **T5.8.3.2** Código e nome, ambos obrigatórios
- [ ] **T5.8.3.3** Eixo e objetivo estratégico
- [ ] **T5.8.3.4** Descrição, problema, objetivo e população afetada
- [ ] **T5.8.3.5** Órgão coordenador e governança
- [ ] **T5.8.3.6** Bloquear salvar sem os obrigatórios

### T5.8.4 · Editar Programa
- [ ] **T5.8.4.1** Mesmo formulário, carregado com os dados
- [ ] **T5.8.4.2** Título do modal indicando o Programa editado
- [ ] **T5.8.4.3** Cancelar sem gravar

### T5.8.5 · Aptidão e disponibilização
- [ ] **T5.8.5.1** Select de aptidão, com dois estados
- [ ] **T5.8.5.2** Select de disponibilização, com quatro estados
- [ ] **T5.8.5.3** Explicar o efeito de cada estado para os órgãos

### T5.8.6 · Editar causas e subcausas ⚠ ↯

O formulário não edita causas. Programa novo nasce sem nenhuma — e sem causa a Iniciativa do órgão
trava numa pendência impeditiva sem saída pela interface.

- [ ] **T5.8.6.1** Descobrir onde o diagnóstico é montado hoje, se não é aqui
- [ ] **T5.8.6.2** Editor de causas: adicionar, editar e remover
- [ ] **T5.8.6.3** Subcausas aninhadas na causa
- [ ] **T5.8.6.4** Reordenar causas ↯
- [ ] **T5.8.6.5** Impedir ou avisar ao remover causa referenciada por Iniciativas
- [ ] **T5.8.6.6** Avaliar o `jstree` do template para a árvore

### T5.8.7 · Editar o resto do diagnóstico ⚠
- [ ] **T5.8.7.1** Evidências (lista de textos)
- [ ] **T5.8.7.2** Consequências (lista de textos)
- [ ] **T5.8.7.3** Resultado esperado
- [ ] **T5.8.7.4** Indicadores de resultado do Programa, com unidade, linha de base e meta

### T5.8.8 · Excluir Programa ↯
- [ ] **T5.8.8.1** Confirmar se é impedimento legal ou só não foi construído
- [ ] **T5.8.8.2** Se houver exclusão, restringir a Programa sem contribuição
- [ ] **T5.8.8.3** Definir o caminho alternativo: arquivar, ocultar ou encerrar
- [ ] **T5.8.8.4** Diálogo destrutivo dizendo o que se perde

### T5.8.9 · Regra de disponibilização ⚠ ↯
- [ ] **T5.8.9.1** Hoje um Programa com diagnóstico incompleto pode ser liberado aos órgãos
- [ ] **T5.8.9.2** Definir os pré-requisitos para disponibilizar
- [ ] **T5.8.9.3** Bloquear ou avisar quando não atendidos
- [ ] **T5.8.9.4** Definir quem pode disponibilizar ↯

### T5.8.10 · Histórico de alterações ✚ ↯
- [ ] **T5.8.10.1** Registrar quem mudou o quê e quando
- [ ] **T5.8.10.2** Exibir o histórico na ficha do Programa

---

## 5.9 · Iniciativa em análise — `/central/iniciativa/$id`

### T5.9.1 · Cabeçalho
- [ ] **T5.9.1.1** Órgão, programa, status, versão e analista
- [ ] **T5.9.1.2** Trilha de contexto
- [ ] **T5.9.1.3** Botões de ação conforme o status

### T5.9.2 · Ficha em leitura
- [ ] **T5.9.2.1** Dados da Iniciativa, sem edição
- [ ] **T5.9.2.2** Causas enfrentadas
- [ ] **T5.9.2.3** Entregas com metas, território, comportamento e financeiro
- [ ] **T5.9.2.4** Resposta GOMAP de cada Entrega
- [ ] **T5.9.2.5** Previsão financeira da Iniciativa

### T5.9.3 · Pendências
- [ ] **T5.9.3.1** Pendências calculadas por Entrega
- [ ] **T5.9.3.2** Resumo por nível no topo

### T5.9.4 · Apontamentos e histórico
- [ ] **T5.9.4.1** Lista de apontamentos com autor, data e campo
- [ ] **T5.9.4.2** Distinguir resolvidos de abertos
- [ ] **T5.9.4.3** Linha do tempo dos eventos, com versão

### T5.9.5 · Iniciar análise
- [ ] **T5.9.5.1** Botão visível só no status "enviada"
- [ ] **T5.9.5.2** Assumir a Iniciativa, gravando o analista
- [ ] **T5.9.5.3** Registrar o evento

### T5.9.6 · Registrar apontamento
- [ ] **T5.9.6.1** Modal com alvo (Iniciativa ou Entrega)
- [ ] **T5.9.6.2** Select do campo apontado
- [ ] **T5.9.6.3** Texto do apontamento, obrigatório
- [ ] **T5.9.6.4** Atalho para apontar direto de um campo da ficha
- [ ] **T5.9.6.5** Destacar na ficha os campos já apontados

### T5.9.7 · Devolver
- [ ] **T5.9.7.1** Modal de confirmação com a contagem de apontamentos abertos
- [ ] **T5.9.7.2** Explicar que a versão será incrementada no reenvio
- [ ] **T5.9.7.3** Registrar o evento com o número de apontamentos

### T5.9.8 · Validar
- [ ] **T5.9.8.1** Modal de confirmação
- [ ] **T5.9.8.2** Aviso quando há pendências impeditivas
- [ ] **T5.9.8.3** Registrar o evento

### T5.9.9 · Resolver apontamento ⚠ ↯

Existe no modelo de dados e não tem tela em lugar nenhum — hoje ninguém consegue fechar um
apontamento.

- [ ] **T5.9.9.1** Decidir quem resolve: o órgão ao corrigir ou o analista ao conferir
- [ ] **T5.9.9.2** Ação de marcar como resolvido
- [ ] **T5.9.9.3** Estado visual de resolvido, com quem resolveu e quando
- [ ] **T5.9.9.4** Contagem de abertos separada da de resolvidos

### T5.9.10 · Editar e excluir apontamento ⚠
- [ ] **T5.9.10.1** Editar o texto de um apontamento próprio
- [ ] **T5.9.10.2** Excluir apontamento registrado por engano
- [ ] **T5.9.10.3** Definir se cabe depois de a Iniciativa ter sido devolvida ↯

### T5.9.11 · Bloqueio da validação ⚠ ↯

O órgão não consegue enviar com pendência impeditiva, mas o analista valida com elas — o modal só
avisa. A régua é mais dura para quem preenche do que para quem aprova.

- [ ] **T5.9.11.1** Decidir se validar é bloqueado por pendência impeditiva
- [ ] **T5.9.11.2** Aplicar a decisão no modal
- [ ] **T5.9.11.3** Mesma decisão para devolver sem nenhum apontamento

### T5.9.12 · Documento da análise ✚ ↯
- [ ] **T5.9.12.1** Definir se a área central precisa emitir documento
- [ ] **T5.9.12.2** Layout com apontamentos, decisão e histórico
