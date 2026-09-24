# Quem usa o SIPLAM, e para quê

Este documento diz, em português corrido, **o que cada perfil faz no sistema, em que
ordem, e em qual tela**. Ele existe para ser conferido: se alguma frase aqui estiver
errada, a tela correspondente está errada junto.

Escrito em 24/09/2026, a partir do que está construído no protótipo.

---

## O que o sistema é

O SIPLAM é onde o **Plano Plurianual** do Estado de Goiás é elaborado. O plano é uma
lei: vale por quatro anos, é escrito no ano anterior ao início da vigência, e sai daqui
como projeto de lei para a Assembleia.

A peça central é o **Programa**. Ele nasce de um problema real — "crianças de 0 a 3 anos
fora da creche" — e existe para enfrentá-lo. Quem define o Programa é a Área Central;
quem diz *como* vai atacá-lo, com o orçamento do seu órgão, são as secretarias.

Daí a divisão do trabalho que o sistema reproduz:

```
     Área Central                          Órgãos setoriais
────────────────────────            ──────────────────────────────
 desenha o plano:                     preenchem o que vão fazer:
 eixos, objetivos,                    Iniciativas e Entregas,
 Programas, diagnóstico               com metas por ano
        │                                        │
        └──── disponibiliza ────►  ◄──── devolve preenchido ────┘
                       consolida e fecha o plano
```

---

## Os cinco perfis

O perfil **não é escolhido na interface**. Ele vem do Aplicações Expresso junto com o
vínculo funcional da pessoa: quem entra não declara quem é. A visão — central ou
setorial — é consequência do perfil, e não existe botão para trocar de visão.

| Perfil | Visão | O que faz |
|---|---|---|
| **Planejamento setorial** | setorial | preenche a contribuição do órgão |
| **Alta gestão setorial** | setorial | tudo o que o Planejamento setorial faz, **mais aprovar** a proposta do órgão |
| **Administrador central** | central | desenha, analisa, valida e administra o plano |
| **Alta gestão central** | central | tudo o que o Administrador central faz, **mais aprovar** a consolidação |
| **Consulta** | central | só lê |

Dois pontos que costumam ser mal-entendidos:

- **Alta gestão não é perfil de leitura.** Ela não tem telas próprias: usa as mesmas
  telas do perfil que estende, com a aprovação por cima.
- **Quem escreve pode aprovar o que escreveu.** Não há segregação de funções. Por isso o
  registro de quem fez o quê é o único controle que resta — o histórico da tramitação é
  obrigatório, não acessório.

---

## O fluxo, do começo ao fim

Quatro passos e dois portões, em linha, sem etapa paralela:

```
analista setorial  →  alta gestão setorial  →  analista central  →  alta gestão central
   preenche              aprova o órgão          consolida            aprova o plano
```

A contribuição de um órgão **não chega à Área Central sem passar pela alta gestão dele**.

---

## 1. Administrador central

É quem abre o ciclo e monta o esqueleto do plano. Trabalha sozinho no começo: enquanto
ele não disponibilizar os Programas, os órgãos não têm o que preencher.

### A ordem do trabalho dele

**Primeiro, o ciclo.** Em **PPA** ele cria o plano: nome, vigência, descrição. Dois
planos não podem ocupar o mesmo ano — seriam duas leis regendo o mesmo exercício —, e o
sistema impede. A situação do plano **não é escolhida**: é reflexo do fluxo. O valor
previsto também não se digita; é a soma das Ações Orçamentárias das Entregas.

**Depois, a estrutura.** Nesta ordem, que é a do menu:

| Tela | O que ele cadastra |
|---|---|
| **Eixos** | o nível mais alto do plano — "Goiás que cuida" |
| **Objetivos estratégicos** | o que cada eixo se propõe a alcançar; é a eles que os Programas se vinculam |
| **Causas** | por que um problema acontece, com justificativa e evidência |
| **Subcausas** | o detalhe da causa; a mesma subcausa costuma explicar mais de uma causa |
| **Indicadores** | o que mede o problema — definição, fórmula, linha de base, periodicidade |
| **Problemas** | o que o plano enfrenta: população afetada, indicadores, causas, consequências |
| **Programa** | junta tudo: eixo, objetivo, problema, causas e indicadores de resultado |

Em qualquer uma dessas telas, ao vincular um registro a outro, ele **busca o que já
existe e cadastra o que falta sem sair da tela** — é o padrão do sistema, e existe para
evitar as duas falhas antigas: abandonar o formulário para cadastrar o que faltava, ou
digitar texto livre e criar uma duplicata a cada grafia diferente.

**Por fim, ele libera.** No Cadastro de Programa, cada Programa tem **aptidão**
(diagnóstico completo ou não) e **disponibilização**. Programa disponibilizado é
Programa que aparece para os órgãos. Programa sem causas cadastradas trava o órgão: ele
não consegue concluir nenhuma Iniciativa.

### Enquanto os órgãos preenchem

- **Visão Geral** — o painel de entrada: como está o ciclo, o que está parado.
- **Visão por Programas** — tudo o que pende de um Programa num lugar só: contribuições
  recebidas, entregas, recursos, o que falta. É tela de leitura e navegação; edita-se
  onde sempre se editou.
- Ele analisa cada contribuição e **valida ou devolve para ajuste**.

### No fim

- **Relatório final da lei do PPA** — o plano pela estrutura: quantos eixos, objetivos e
  Programas, quanto está pronto para a lei, onde o dinheiro está por eixo e por ano, e o
  anexo em tabela que a lei carrega.
- **Relatório consolidado de finalísticas** — o plano pela entrega: o que cada órgão
  contribuiu, em que estado do fluxo está, quanto já foi validado, onde há pendência
  impeditiva.

### Administração

- **Usuários** — as solicitações de acesso chegam aqui. Ele lê o que a pessoa declarou e
  **aprova, e é na aprovação que o perfil é concedido** — o papel não é pedido, é dado.
  Também reprova, revoga acesso de quem já tem, reativa quem foi revogado e **revê a
  decisão** a qualquer momento, porque mudar de ideia sobre o perfil de alguém é rotina.
  A tela não edita o cadastro da pessoa: nome e órgão vêm da base funcional, e alterá-los
  aqui seria decidir sobre um dado que não é nosso.

---

## 2. Alta gestão central

Faz tudo o que o Administrador central faz, nas mesmas telas, e é quem **aprova a
consolidação** — o último portão antes de o plano virar projeto de lei.

Não tem tela própria, e não deveria ter: separar "a tela de aprovar" da "tela de
trabalhar" obrigaria a pessoa a conferir num lugar e decidir noutro.

---

## 3. Planejamento setorial

É o analista da secretaria. Ele não desenha o plano — ele responde a ele. Só enxerga os
Programas que a Área Central disponibilizou, e só o que é do seu órgão.

| Tela | Para quê |
|---|---|
| **Programas** | ver os Programas abertos para contribuição e escolher em qual vai atuar |
| **Iniciativas** | a contribuição do órgão a um Programa: o que ele se propõe a fazer, e contra quais causas |
| **Entregas** | o produto concreto de cada Iniciativa, com **meta por ano do ciclo** |
| **Indicadores** | acompanhar o que mede o resultado |

A ordem é essa: **Programa → Iniciativa → Entrega**. Uma Iniciativa sem causa
relacionada, ou sem Entrega, tem pendência impeditiva e não fecha.

Sobre a Entrega, três regras que o vocabulário esconde:

- **Entrega é resultado para a sociedade, não obra.** "Construção de X" é nome de
  Projeto, não de Entrega.
- A **Ação Orçamentária** da LOA financia no máximo uma Entrega, e é dela que sai o valor
  financeiro do plano — nunca digitado.
- O **Projeto GOMAP** descreve *como* a Entrega é produzida; o valor global dele nunca é
  o valor da Entrega.

Quando termina, ele **envia** a contribuição. A partir daí ela sai das mãos dele.

---

## 4. Alta gestão setorial

O secretário, ou quem responde pela pasta. Faz tudo o que o Planejamento setorial faz,
nas mesmas telas, e **aprova a contribuição do órgão** — é ele quem libera o envio para a
Área Central. Sem esse aval, nada sobe.

---

## 5. Consulta

O único perfil sem escrita. Enxerga a visão central inteira — estrutura, contribuições,
relatórios — e não altera nada. Nas telas, onde apareceria "Editar" ele vê "Ver", e onde
apareceria "Novo…" ele vê o aviso de que o perfil não escreve.

---

## Coisas que valem para todo mundo

**Um PPA por vez.** No topo da tela há um seletor de plano. Tudo o que as telas mostram
— e tudo o que se cadastra — pertence ao plano escolhido ali. As etiquetas de um ciclo
não são copiadas para o outro.

**O plano sobrevive à troca de governo.** A base permanece; o governo que assume pede
*alterações* no plano vigente. Elaborar e alterar são fluxos distintos, e o segundo ainda
não existe no modelo — por isso nenhuma tela sugere que um plano fechado é editável.

**Situações do plano.** Em elaboração → submetido → aprovado → vigente → encerrado; e a
bifurcação: submetido → reprovado → volta para elaboração. Só o que está **em elaboração**
se edita. Reprovado é o único estado que anda para trás, e anda porque precisa.

**Como se procura.** Toda listagem tem a mesma barra: um campo livre para o nome, um
campo de escolha múltipla para cada coluna que classifica o registro, e os botões
**Exportar · Limpar · Buscar**. O filtro só vale quando se manda buscar, e o que é
exportado é exatamente o que está na tela, já filtrado.

---

## O que ainda não existe

Para não haver engano sobre o que o protótipo já responde:

- **O ato de submeter o plano.** Enquanto ele não existir, todo plano fica em elaboração.
- **A alteração de um plano aprovado** — o segundo fluxo, do governo que assume.
- **A integração com o Aplicações Expresso.** Hoje o perfil é concedido na tela de
  Usuários, e a tela de escolha de perfil segue disponível por não haver integração.
- **"Área finalística"** não existe no modelo: o corte disponível é o órgão, e é assim que
  o relatório consolidado agrupa.
- Os vocabulários do Indicador — polaridade, fonte, abrangência e situação — foram
  montados a partir das telas do sistema legado e **precisam de confirmação** com a área
  de requisitos.
