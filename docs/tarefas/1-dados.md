# Bloco 1 · Camada de dados e regras

O protótipo é React/TypeScript com estado em `localStorage`. Tudo aqui precisa virar JavaScript que
rode nas páginas estáticas do Inspinia. **É pré-requisito de qualquer tela com conteúdo** — os 130
itens dos blocos 5 e 6 dependem deste bloco.

Origem: `prototipo-lovable/src/lib/ppa/`.

---

## T1.1 · Decidir a estratégia de renderização ↯

São 16 telas densas, com muita repetição de tabela. A escolha muda o volume de trabalho dos blocos
5 e 6.

- [ ] **T1.1.1** Comparar HTML escrito à mão + JS contra templates Handlebars, que já vêm no pacote
- [ ] **T1.1.2** Avaliar quanto da repetição de tabela e de linha expansível some com templates
- [ ] **T1.1.3** Verificar se o Handlebars do template é a versão completa ou só runtime
- [ ] **T1.1.4** Definir onde o HTML de cada tela mora e como os parciais são reaproveitados
- [ ] **T1.1.5** Registrar a decisão no `CLAUDE.md`

## T1.2 · Portar o modelo de dados — `types.ts`

Não há tipagem em JavaScript puro, então o valor aqui é documentar a forma dos objetos e manter os
nomes idênticos aos do protótipo.

- [ ] **T1.2.1** Programa: diagnóstico, causas com subcausas, indicadores, aptidão, disponibilização
- [ ] **T1.2.2** Iniciativa: órgão, causas enfrentadas, status, versão, analista, indicadores
- [ ] **T1.2.3** Entrega: unidade, comportamento, metas por ano, território, resposta GOMAP
- [ ] **T1.2.4** Financeiro: Ação Orçamentária, IPOF com parcelas, Projeto GOMAP
- [ ] **T1.2.5** Vínculos (Entrega↔Projeto e Entrega↔Ação), Comentário e Evento
- [ ] **T1.2.6** Documentar a forma de cada objeto em JSDoc, para autocompletar no editor

## T1.3 · Portar os dados de demonstração — `seed.ts`

1.240 linhas. A demo abre com o fluxo em andamento, não vazia — isso é parte do valor do protótipo.

- [ ] **T1.3.1** Constantes: 8 órgãos, 7 regiões de planejamento, 4 anos, unidades, periodicidades
- [ ] **T1.3.2** Programas por eixo, com diagnóstico completo e indicadores
- [ ] **T1.3.3** Iniciativas em todos os estágios do fluxo, incluindo devolvida e validada
- [ ] **T1.3.4** Entregas com metas, território e comportamento
- [ ] **T1.3.5** IPOFs com parcelas mensais, ações e execução SIAFIC
- [ ] **T1.3.6** Projetos GOMAP com fase, execução e valor global
- [ ] **T1.3.7** Vínculos, comentários abertos e trilha de eventos já em curso
- [ ] **T1.3.8** Conferir que os totais financeiros batem com os do protótipo rodando

## T1.4 · Portar as regras — `regras.ts`

- [ ] **T1.4.1** Pendências da Entrega em 3 níveis (impeditivo, alerta, informação)
- [ ] **T1.4.2** Pendências da Iniciativa, agregando as das suas Entregas
- [ ] **T1.4.3** Situação da Entrega: completa, com alertas, com impeditivos
- [ ] **T1.4.4** Cobertura de causas: direta, por subcausas, sem atuação
- [ ] **T1.4.5** Participação do órgão no Programa: com contribuição, sem contribuição, não avaliado
- [ ] **T1.4.6** Ordenação por prioridade dos Programas
- [ ] **T1.4.7** Busca global sobre os 7 tipos de entidade
- [ ] **T1.4.8** Rótulos de status, comportamento, território, aptidão e disponibilização
- [ ] **T1.4.9** Agregações por órgão, por programa e por iniciativa

## T1.5 · Portar o financeiro — `financeiro.ts`

O valor do PPA é **sempre derivado**: Entrega ← Ação ← parcelas do IPOF. Nada é digitado.

- [ ] **T1.5.1** Parcelas de uma Ação e totais por ano
- [ ] **T1.5.2** Exclusividade: uma Ação financia no máximo uma Entrega
- [ ] **T1.5.3** Linhas financeiras agrupadas por entrega × ação × IPOF × fonte × classificação
- [ ] **T1.5.4** Quadro plurianual por dimensão, com as 9 dimensões de agrupamento
- [ ] **T1.5.5** IPOFs alcançados por uma Entrega, derivados das Ações vinculadas
- [ ] **T1.5.6** Descompasso entre o valor global do Projeto no GOMAP e o refletido no PPA
- [ ] **T1.5.7** Previsto × executado (SIAFIC) por entrega, iniciativa, programa e órgão

## T1.6 · Store sobre `localStorage`

- [ ] **T1.6.1** Carregar o seed na primeira visita e hidratar do armazenamento nas seguintes
- [ ] **T1.6.2** Gravar a cada alteração, com chave versionada
- [ ] **T1.6.3** Ações da Iniciativa: criar, editar, excluir, enviar, iniciar análise, devolver,
      validar
- [ ] **T1.6.4** Ações da Entrega: criar, editar, excluir, vincular Projeto, vincular Ação
- [ ] **T1.6.5** Ações do Programa: criar, editar, aptidão e disponibilização
- [ ] **T1.6.6** Comentários e trilha de eventos, com autor e data
- [ ] **T1.6.7** Marcar e desmarcar "sem contribuição" do órgão
- [ ] **T1.6.8** Reiniciar com os dados de demonstração
- [ ] **T1.6.9** Tratar estado incompatível de versão anterior sem quebrar a tela ⚠

## T1.7 · Formatação pt-BR

- [ ] **T1.7.1** Moeda em real, sem centavos nas tabelas
- [ ] **T1.7.2** Moeda curta (R$ 1,2 mi / R$ 340 mil) para as faixas de indicadores
- [ ] **T1.7.3** Percentual com uma casa, e travessão quando não há base de cálculo
- [ ] **T1.7.4** Datas no formato brasileiro
- [ ] **T1.7.5** `font-variant-numeric: tabular-nums` em toda coluna numérica

## T1.8 · Ligar o acesso ao sistema

- [ ] **T1.8.1** Ler o usuário e o perfil escolhidos no fluxo de acesso
- [ ] **T1.8.2** Definir o órgão do usuário a partir do perfil, em vez da constante fixa do
      protótipo ⚠
- [ ] **T1.8.3** Exibir persona e órgão no topbar
- [ ] **T1.8.4** Abrir a visão inicial conforme o perfil (setorial ou área central) ↯
