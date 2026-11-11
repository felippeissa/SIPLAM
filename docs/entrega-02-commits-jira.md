# SIPLAM — Entrega 02 · Cadastros · Commits e tempo gasto

17 commits ligados aos cadastros, do mais antigo ao mais novo. O tempo de cada um vem só do git: é o intervalo desde o commit anterior do mesmo dia; o primeiro commit do dia conta a partir das 09:00; commits no mesmo minuto dividem o intervalo; nenhum passa de 8h. Os merges de pull request ficam de fora, porque só reúnem commits que já estão aqui.

## Formato dos campos no Jira

**Tempo gasto**
Use o formato: `2w 4d 6h 45m`

* w = semanas
* d = dias
* h = horas
* m = minutos

**Data de início**
Use o formato: `00/00/0000 00:00`

**Descrição do trabalho**
Descreva o que foi feito nesse commit.

## 1. `2eaafc0` — Cria o cadastro do PPA na Administração

**Tempo gasto:** 3m
**Data de início:** 11/09/2026 16:03
**Descrição do trabalho:**
Criação do cadastro de PPA na área de Administração: listagem, formulário e regras do plano, com a entrada no menu e o registro dos planos na base de dados.

## 2. `f3ca095` — Simplifica o cadastro do PPA para tabela e modal

**Tempo gasto:** 2m
**Data de início:** 11/09/2026 16:06
**Descrição do trabalho:**
O cadastro de PPA passou de uma tela de formulário longo para uma tabela com o formulário numa janela (modal).

## 3. `27fb1d4` — Reduz o cadastro do PPA a quatro campos

**Tempo gasto:** 4m
**Data de início:** 11/09/2026 16:08
**Descrição do trabalho:**
Corte do formulário do PPA para os quatro campos que o time definiu, removendo os demais.

## 4. `5adf725` — Acrescenta calendário aos anos de vigência do PPA

**Tempo gasto:** 4m
**Data de início:** 11/09/2026 16:12
**Descrição do trabalho:**
Os anos de vigência do PPA passam a ser escolhidos num calendário.

## 5. `880b245` — Adiciona os cadastros da cadeia do diagnóstico e publica a V1

**Tempo gasto:** 1h 18m
**Data de início:** 11/09/2026 16:16
**Descrição do trabalho:**
Criação dos cadastros da cadeia do diagnóstico (Diagnóstico, Problema, Causa e Subcausa), com um componente de cadastro padrão para listar, criar, editar e excluir. Publicação da primeira versão no GitHub Pages.

## 6. `2b1662a` — Troca os alertas do navegador pela validação do template

**Tempo gasto:** 13m
**Data de início:** 11/09/2026 17:34
**Descrição do trabalho:**
Os formulários de cadastro deixam de usar os alertas do navegador e passam a usar a validação do template (campo em vermelho com mensagem abaixo).

## 7. `eb420da` — Acrescenta o valor previsto ao PPA e move Programas para Cadastros

**Tempo gasto:** 8h
**Data de início:** 14/09/2026 09:31
**Descrição do trabalho:**
Inclusão do valor previsto no cadastro de PPA e mudança do cadastro de Programa para o grupo Cadastros do menu, com ajustes na listagem de Programas e nos indicadores que usam o valor.

## 8. `7896bb1` — Liga os cadastros ao diagnóstico real e acrescenta situações do PPA

**Tempo gasto:** 2h 17m
**Data de início:** 17/09/2026 14:35
**Descrição do trabalho:**
Ligação dos cadastros de Causa, Problema, Subcausa e Diagnóstico aos dados reais do diagnóstico. Criação das situações do PPA, com as travas de uma elaboração e uma vigência por vez. A parte de usuários desse commit é da Entrega 01.

## 9. `e8e8d6b` — Deixa situação e valor do PPA derivados e a vigência num campo só

**Tempo gasto:** 20m
**Data de início:** 17/09/2026 17:12
**Descrição do trabalho:**
A situação e o valor previsto do PPA passam a ser derivados, e não digitados. A vigência virou um campo só, com ano inicial e final, e as regras ficaram documentadas.

## 10. `58e2349` — Remodela o diagnóstico, acrescenta eixos e objetivos

**Tempo gasto:** 8h
**Data de início:** 18/09/2026 09:00
**Descrição do trabalho:**
Remodelagem do diagnóstico como uma cadeia de vínculos de muitos para muitos. Criação dos cadastros de Eixo e de Objetivo Estratégico. A parte de relatórios desse commit é da Entrega 01.

## 11. `2bd766b` — Leva os cadastros para tela própria e abre o segundo PPA

**Tempo gasto:** 7h 58m
**Data de início:** 22/09/2026 09:00
**Descrição do trabalho:**
Cada cadastro (Eixo, Objetivo, Causa, Problema, Diagnóstico) passa a ter listagem, tela de criar e tela de editar próprias, com formulário padrão. Abertura de um segundo PPA na base para testar o ciclo variável.

## 12. `d381c63` — Põe trilha em toda tela e leva iniciativas e subcausas para tabela

**Tempo gasto:** 2h 53m
**Data de início:** 22/09/2026 16:58
**Descrição do trabalho:**
As iniciativas e as subcausas passam de listas soltas a tabelas dentro dos formulários. A trilha de navegação desse commit é da Entrega 01.

## 13. `d0f4619` — Põe o PPA real de Goiás na base e liga os cadastros por catálogo

**Tempo gasto:** 7h 06m
**Data de início:** 23/09/2026 09:00
**Descrição do trabalho:**
Carga do PPA real de Goiás na base de demonstração e criação do componente de catálogo: campo de busca sobre uma tabela, que acrescenta o que já existe e oferece cadastrar o que falta.

## 14. `396d7f6` — Põe filtro e exportação nas listagens

**Tempo gasto:** 5h 17m
**Data de início:** 24/09/2026 09:00
**Descrição do trabalho:**
Barra de filtros e exportação em CSV e Excel em todas as listagens de cadastros. Os dois relatórios desse commit são da Entrega 01.

## 15. `32a776b` — Alinha os cadastros e as telas de acesso à matriz de mapeamento

**Tempo gasto:** 5h 52m
**Data de início:** 06/10/2026 09:00
**Descrição do trabalho:**
Revisão de cada cadastro contra a matriz de mapeamento do cliente: campos, obrigatoriedade, edição e componente de cada um.

## 16. `23d3cde` — Exclusão com justificativa e bloqueio por vínculo

**Tempo gasto:** 8h
**Data de início:** 13/10/2026 09:05
**Descrição do trabalho:**
Toda exclusão pede justificativa de no mínimo 20 caracteres, registrada no Histórico. Registro com vínculo não se exclui: o botão fica desabilitado e um aviso lista o que depende dele. O Histórico e o chat desse commit são da Entrega 01.

## 17. `f5dc789` — Corrige o texto da exclusão

**Tempo gasto:** 2h 07m
**Data de início:** 16/10/2026 09:00
**Descrição do trabalho:**
A janela de exclusão dos cadastros e do PPA deixou de dizer que a exclusão pode ser revertida pelo Histórico, que agora é só consulta. O botão do chat e as receitas do Figma desse commit são da Entrega 01.
