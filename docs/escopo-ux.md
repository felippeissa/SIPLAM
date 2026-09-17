# Escopo de UX — telas do SIPLAM 3.0

Levantado em 17/09/2026, cruzando três fontes: o [discovery](discovery/README.md) feito com o
cliente, o protótipo React em `prototipo-lovable/` e o que já está construído neste repositório.

O estado de cada tela foi conferido no código, não estimado.

---

## 1 · O que já existe

### Acesso — completo

Entrar, termos, permissões e escolha de perfil. Cinco perfis declarados.

### Administrador central — a visão madura

| Tela | O que faz |
|---|---|
| Visão Geral | consolidação dos Programas |
| Cadastro de PPA | CRUD, com valor previsto |
| Cadastro de Diagnóstico, Causa, Problemas, Subproblemas | CRUD |
| Cadastro de Programa | CRUD |
| Hub de Programas | painel por Programa, com gráficos |
| Entregas, Por Causas, Financeira, Projetos, IPOFs, Órgãos | consultas transversais |
| Iniciativa em análise | apontamentos, devolver e validar |

### Setorial — construída, porém inalcançável

| Tela | O que faz |
|---|---|
| Programas do órgão | tela inicial do órgão; cria Iniciativa |
| Ficha da Iniciativa | edita, cria e remove Entregas, envia para análise |
| Ficha da Entrega | metas por ano, território, GOMAP, vínculo com Ação Orçamentária |
| Indicadores | CRUD, de Programa e de Iniciativa |
| Listagens de Iniciativas e Entregas | leitura |

**O perfil Setorial tem `inicio: null`** em `assets/js/acesso.js` e cai na home provisória.
Quem escolhe esse perfil não chega a nenhuma dessas telas.

### Alta gestão setorial, Alta gestão central, Órgãos de controle

Nada. Os três caem em `em-construcao.html`.

---

## 2 · O que falta

Doze telas, em seis blocos. A ordem dentro de cada bloco importa; a ordem entre blocos é
discutível e está proposta na seção 3.

### Bloco A · Destravar o Setorial

Esforço pequeno, efeito grande: é a jornada do Jorge, a persona mais numerosa do sistema.

| # | Tela | Observação |
|---|---|---|
| A1 | **Home do Setorial** | apontar o perfil para `programas.html` e revisar a tela como porta de entrada: o que o órgão deve fazer hoje, o que está pendente, o prazo |
| A2 | **Pendências do órgão** | o que falta preencher, por Programa e Iniciativa, com caminho direto para o campo vazio |

As listagens de Iniciativas e Entregas já existem; precisam de revisão de ação, não de
reconstrução.

### Bloco B · Alta gestão — sem telas novas

Confirmado em 17/09/2026: **a alta gestão é acumulativa.** A setorial faz tudo que o Setorial faz
mais aprovar; a central, tudo que o Administrador Central faz mais aprovar.

Isso apaga três telas que este escopo previa. Alta gestão não precisa de home própria nem de
variante de leitura das fichas — usa as telas que já existem, com a mesma capacidade de edição.
O que falta é apenas apontar os dois perfis para a tela inicial certa em `assets/js/acesso.js` e
acrescentar a camada do Bloco C por cima.

### Bloco C · Aprovação da proposta

As funcionalidades F026 a F032 do inventário. Pertencem à **alta gestão**, nos dois níveis, em
cadeia: a alta gestão setorial aprova a contribuição do próprio órgão, a alta gestão central
aprova a consolidação do plano.

| # | Tela | Observação |
|---|---|---|
| C1 | **Fila de aprovação** | o que aguarda decisão; para a setorial, só o próprio órgão; para a central, o plano inteiro |
| C2 | **Decisão sobre a proposta** | aprovar, devolver com ajuste ou pactuar, com justificativa registrada |
| C3 | **Histórico da tramitação** | quem fez o quê e quando; o `store` já registra eventos, falta a tela |

### Bloco D · Órgãos de controle

Funcionalidades F033 a F035. Perfil de consulta, sem nenhuma escrita.

| # | Tela | Observação |
|---|---|---|
| D1 | **Consulta de entregas** | filtros amplos, leitura analítica, sem ação |
| D2 | **Extração de dados** | montar o recorte e exportar |

### Bloco E · Etiquetas e alinhamento

**Confirmado no MVP** em 17/09/2026. Contexto em
[alinhamento-etiquetas.md](discovery/alinhamento-etiquetas.md).

| # | Tela | Observação |
|---|---|---|
| E1 | **Cadastro de Etiquetas** | Central; vocabulário controlado, com proposta e aprovação. **Pertence ao PPA** — cada ciclo tem o seu |
| E2 | **Visão por Tema** | busca "feminicídio" e devolve Programas, Iniciativas, Entregas e Indicadores, cada um em sua lista, filtrados pelo perfil |

O campo de etiqueta nos cadastros existentes não é tela: é um campo a acrescentar. Deve entrar
**junto com** E1, senão não há o que escolher.

### Bloco F · Relatórios

| # | Tela | Observação |
|---|---|---|
| F1 | **Relatório de pendências** | versão central do A2, atravessando órgãos |
| F2 | **Relatórios e exportação** | escolher recorte, ver prévia, exportar |

### Bloco G · Atena

| # | Tela | Observação |
|---|---|---|
| G1 | **Análise integrada** | a IA aponta inconsistências e lacunas, sempre com justificativa e revisão humana, conforme a diretriz 8 do discovery |
| G2 | **Avaliação de preenchimento** | apoio dentro da ficha, não tela separada |

---

## 3 · Sequência proposta

1. **Bloco A** — destrava uma jornada inteira já construída. Melhor razão entre esforço e efeito
   de todo o escopo.
2. **Bloco E** — confirmado no MVP, e o campo precisa nascer antes de haver muito dado cadastrado.
3. **Bloco C** — a camada de aprovação sobre telas que já existem. Fecha o ciclo de elaboração:
   sem aprovação, o plano nunca termina.
4. **Bloco F**, depois **D** — consulta e extração dependem de haver dado maduro.
5. **Bloco G** — por último: a IA analisa o que existe, então precisa que exista.

---

## 4 · Decisões

Respondidas em 17/09/2026 — o registro completo está em
[perguntas.md](perguntas.md).

- **Alta gestão aprova**, nos dois níveis, em cadeia, e é **acumulativa**: faz tudo que o perfil
  correspondente faz. Não tem telas próprias.
- **Cinco perfis**, como já estava.
- **Etiqueta vive dentro do ciclo** — pertence ao PPA.
- **ODS, diretrizes e etiquetas são separados** — três campos.
- **A territorialização chega a município** — não para na região.
- **Pendência é tudo o que falta** — campo vazio, Iniciativa sem Entrega, Entrega sem meta e
  Programa sem contribuição de órgão convidado.
- **A aprovação é linear** — analista setorial, alta gestão setorial, analista central, alta
  gestão central. Sem etapa paralela.
- **Quem escreve pode aprovar** — sem segregação de funções; o histórico vira o único controle.
- **Região é atalho para seus municípios** — o dado guardado é sempre município.
- **Etiquetas não passam de um ciclo para o outro**; a visão é de um PPA por vez.
- **O ciclo pode ter menos de quatro anos**; as tabelas de meta precisam de largura variável.
- **Etiquetas entram no MVP.**
- **Perfil e órgão vêm do Aplicações Expresso** — a pessoa não declara quem é.

### Ainda travando

**Como se altera um PPA já aprovado?** O cliente diz que o plano sobrevive à troca de governo e
que o governo novo pede alterações no plano vigente. Elaborar e alterar são fluxos diferentes, e
o segundo não existe no modelo. *Trava um bloco de telas que este escopo ainda não previa.*

**O ciclo tem sempre quatro anos?** Desenvolvimento diz que pode ter dois; o cliente diz que o
PPA atravessa governos. Provavelmente "dois anos" é o tempo que resta a quem assume no meio.
*Trava o desenho das tabelas de meta.*

**Quais campos vêm do GoMap e do SIAFIC?** As integrações serão endpoints, mas ainda não há lista
de campos. *Trava a Ficha da Entrega, a financeira e a de projetos.*

**Em que ponto do fluxo o SEI entra?**

### Consequência a tratar

**`perfil.html` deixa de ser uma escolha.** Se o Expresso informa o vínculo funcional, pedir que
a pessoa declare o próprio perfil é pedir duas vezes e abrir espaço para erro. A tela passa a
valer só para quem acumula mais de um papel — e, enquanto não há integração, segue servindo ao
protótipo. Precisa de desenho novo, não de remoção.
