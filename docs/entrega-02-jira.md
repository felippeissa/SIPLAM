# SIPLAM — Entrega 02 · Cadastros · Atividades para lançamento de horas

## 1. Valor previsto do PPA e Programas em Cadastros

**Tempo gasto:** 3h
**Data de início:** 14/09/2026 14:30
**Descrição do trabalho:**
Inclusão do valor previsto no cadastro de PPA e mudança do cadastro de Programa para o grupo Cadastros do menu, com ajustes na listagem de Programas e nos indicadores que usam o valor.

## 2. Cadastros ligados ao diagnóstico real e situações do PPA

**Tempo gasto:** 2h 30m
**Data de início:** 17/09/2026 09:30
**Descrição do trabalho:**
Ligação dos cadastros de Causa, Problema, Subcausa e Diagnóstico aos dados reais do diagnóstico, em vez de dados soltos de exemplo. Criação das situações do PPA (elaboração, submetido, aprovado, reprovado, vigente e encerrado) com as travas de uma elaboração e uma vigência por vez.

## 3. Situação e valor do PPA derivados

**Tempo gasto:** 1h
**Data de início:** 17/09/2026 16:00
**Descrição do trabalho:**
A situação e o valor previsto do PPA passam a ser derivados, e não digitados: o valor é a soma das Ações Orçamentárias das Entregas. A vigência virou um campo só, com ano inicial e final, e as regras ficaram documentadas.

## 4. Diagnóstico, Eixos e Objetivos Estratégicos

**Tempo gasto:** 5h
**Data de início:** 18/09/2026 09:00
**Descrição do trabalho:**
Remodelagem do diagnóstico como uma cadeia de vínculos (Problema, Causa, Iniciativa) de muitos para muitos. Criação dos cadastros de Eixo e de Objetivo Estratégico e ajuste das regras de cálculo, da base de dados e do menu a essa estrutura.

## 5. Cadastros em tela própria e segundo PPA

**Tempo gasto:** 5h
**Data de início:** 22/09/2026 09:00
**Descrição do trabalho:**
Separação de cada cadastro (Eixo, Objetivo, Causa, Problema, Diagnóstico) em listagem, tela de criar e tela de editar próprias, com um formulário padrão de cabeçalho com Cancelar, Salvar e Excluir. Abertura de um segundo PPA na base para testar o ciclo variável.

## 6. Iniciativas e subcausas em tabela

**Tempo gasto:** 1h
**Data de início:** 22/09/2026 14:00
**Descrição do trabalho:**
As iniciativas e as subcausas deixaram de ser listas soltas e passaram a tabelas dentro dos formulários, com os campos que identificam cada registro, nas telas de Causa, Programa e Iniciativa.

## 7. PPA real de Goiás na base e vínculo por catálogo

**Tempo gasto:** 6h
**Data de início:** 23/09/2026 09:00
**Descrição do trabalho:**
Carga do PPA real do Estado de Goiás na base de demonstração (programas, eixos, objetivos, causas, problemas e indicadores). Criação do componente de catálogo: um campo de busca sobre uma tabela que lista o que já existe, acrescenta o escolhido e oferece cadastrar o que falta, sem perder o formulário.

## 8. Filtro e exportação nas listagens

**Tempo gasto:** 3h
**Data de início:** 24/09/2026 08:15
**Descrição do trabalho:**
Inclusão, em todas as listagens de cadastros, da barra de filtros (busca por texto e filtros por campo) e da exportação em CSV e Excel das linhas que passam pelo filtro.

## 9. Cadastros e telas de acesso alinhados à matriz de mapeamento

**Tempo gasto:** 4h
**Data de início:** 06/10/2026 09:00
**Descrição do trabalho:**
Revisão de cada cadastro (PPA, Eixo, Objetivo, Causa, Indicador, Problema, Programa) contra a matriz de mapeamento do cliente: quais campos aparecem, quais são obrigatórios, quais editam e qual componente usa cada um. Os campos que divergiam do documento de requisitos seguiram a matriz.

## 10. Exclusão com justificativa e bloqueio por vínculo

**Tempo gasto:** 2h
**Data de início:** 13/10/2026 15:00
**Descrição do trabalho:**
Toda exclusão nos cadastros passa a pedir uma justificativa de no mínimo 20 caracteres, registrada no Histórico. Registro que já está vinculado a outro não pode ser excluído: o botão Excluir fica desabilitado, e um aviso lista o que depende do registro. Vale para PPA, Eixo, Objetivo, Causa, Indicador, Problema, Programa, Iniciativa e Entrega.
