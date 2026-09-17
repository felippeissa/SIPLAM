# Perguntas do projeto — SIPLAM 3.0

Levantadas ao cruzar o [discovery](discovery/README.md) com o que já está construído.
Separadas por quem responde. Cada pergunta diz **o que ela muda ou trava**, para dar ordem à
resposta.

✅ respondida · 🟡 respondida em parte · ❓ em aberto

---

## Shirley · Requisitos

**1 ✅ A alta gestão aprova ou só acompanha?**
→ **As duas aprovam**, a setorial e a central.
*Mudou:* alta gestão deixou de ser perfil de leitura. São duas aprovações em cadeia — a setorial
libera a contribuição do órgão, a central fecha o plano.

**2 ✅ Alta gestão é um perfil à parte?**
→ **É acumulativa**: faz tudo que o perfil correspondente faz, **mais** aprovar.
*Mudou:* não precisa de telas próprias. Apagou três telas do escopo — usa as que já existem, com
a camada de aprovação por cima.

**3 ✅ São quatro perfis ou cinco?**
→ **Cinco.**
*Mudou:* nada. Confirmou o que já estava no código.

**4 ✅ A etiqueta atravessa ciclos?**
→ **Só dentro do ciclo.** A etiqueta pertence ao PPA.

**5 ✅ ODS, diretrizes e etiquetas são a mesma coisa?**
→ **São coisas separadas.**
*Mudou:* três campos, não um seletor. ODS é lista oficial fechada, diretriz é definida por ciclo,
etiqueta é aberta com vocabulário controlado.

**6 ✅ A territorialização chega a município?**
→ **Chega até município.**
*Mudou:* virou trabalho próprio. O campo hoje mostra dez regiões em caixas de seleção; Goiás tem
**246 municípios** e a mesma lista seria impraticável. Muda o modelo de dados e o desenho do
campo na Ficha da Entrega, não só a tela de consulta.

**7 ✅ O que conta como pendência?**
→ **Tudo o que falta preencher**: campo obrigatório vazio, Iniciativa sem Entrega, Entrega sem
meta e Programa sem contribuição de órgão convidado.
*Mudou:* destravou as duas telas de pendência. E exige ordenar por impacto — mostrando tudo, a
lista de um órgão grande vira ruído que a pessoa aprende a ignorar.

**8 ✅ A aprovação setorial é obrigatória?**
→ **É, e o fluxo é linear.** Analista setorial → **alta gestão setorial** → analista central →
**alta gestão central**, que aprova o que o analista central consolidou.
*Mudou:* nada corre em paralelo. São quatro etapas em fila, com dois portões de aprovação — um em
cada nível. A contribuição do órgão não chega à Central sem passar pela alta gestão do órgão.

**9 ✅ Quem escreve pode aprovar o que escreveu?**
→ **Pode.** A alta gestão faz tudo que o analista do seu nível faz, mais aprovar — nos dois lados.
*Mudou:* some a trava de segregação que eu tinha previsto. Em compensação, **o registro de quem
fez o quê passa a ser o único controle que sobra** — o histórico da tramitação deixa de ser um
detalhe e vira item obrigatório, principalmente porque os órgãos de controle consultam o sistema.

**10 ✅ Região e município convivem?**
→ **Convivem.** Escolher uma região significa **todos os municípios dela**; também dá para
escolher um município específico. Precisa ser fácil marcar tanto um quanto vários.
*Mudou:* resolveu o risco de contagem dupla que eu tinha levantado. Como região é atalho para um
conjunto de municípios, **o dado guardado é sempre município** — somar por região nunca conta
duas vezes.
*Desenho:* marcar a região inteira em um clique, poder tirar municípios depois, e o resumo dizer
o que de fato foi escolhido — "Região Norte, todos os 26" ou "12 de 26 do Norte".

**11 ✅ Ao abrir um PPA novo, as etiquetas do ciclo anterior são copiadas?**
→ **Não por enquanto.** As etiquetas são de um PPA só, e a visão do sistema é de **um PPA por
vez**. Talvez no futuro.
*Mudou:* nada a construir agora. Fica registrado que, quando o segundo ciclo chegar, o vocabulário
nasce vazio — é uma escolha consciente, não um esquecimento.

**12 ✅ Um plano de dois anos ainda é um PPA, ou é revisão de um PPA existente?**
→ **Nem um nem outro: o PPA permanece.** Segundo o cliente, o plano sobrevive à troca de governo.
A base continua a mesma. O governo novo não cria outro PPA — ele **pede alterações no plano
vigente**, podendo solicitar mudanças pontuais e direcionar o que deve mudar.
*Mudou:* some a ideia de "plano novo" ou "versão". Em compensação, aparece um conceito que o
sistema não tem: **alterar um PPA já aprovado**, depois de fechado o ciclo de elaboração.

**13 ❓ A partir de qual situação o plano congela?**
O PPA tem cinco situações: Elaboração, Submetido, Aprovado, Vigente e Encerrado. Tudo que o
sistema faz hoje pressupõe Elaboração — o órgão preenche, envia, a Central analisa. A partir de
**Submetido** nada disso deveria mais funcionar, e as telas ainda não sabem disso.
*Trava:* o congelamento das telas do órgão e da análise.

**14 ❓ Quem muda a situação do plano, e quando?**
Passar de Elaboração para Submetido é um ato — alguém decide e o plano inteiro trava. Hoje é um
campo no Cadastro de PPA, editável por qualquer Administrador Central. Provavelmente deveria ser
uma ação com confirmação, registro de quem fez, e talvez restrita à alta gestão central.
*Trava:* o desenho dessa transição.

**15 ❓ Reprovado devolve o plano inteiro à Elaboração?**
Se a apreciação reprova, o plano volta a ser editável — mas volta inteiro, com todas as
Iniciativas reabertas, ou só o que foi apontado? E quem registra o motivo da reprovação, já que
é ele que orienta a correção?
*Trava:* a transição de volta e o que o órgão vê quando ela acontece.

**16 ❓ Como funciona a alteração de um PPA vigente?**
O cliente descreve algo que o modelo atual não prevê. Elaborar e alterar são fluxos diferentes:
um parte do zero e termina em aprovação; o outro mexe num plano que já está valendo. Precisamos
saber quem pede a alteração, quem aprova, e se ela reabre o mesmo caminho de quatro etapas ou um
mais curto.
*Trava:* qualquer tela de alteração — e, antes disso, o versionamento do PPA.

**17 ❓ Depois de alterado, o que o sistema mostra: o plano atual ou o histórico também?**
Como o PPA alterado continua sendo o mesmo plano, é preciso decidir se guardamos o que ele era
antes. Os órgãos de controle consultam este sistema, e "o que estava escrito antes da alteração"
é exatamente o tipo de pergunta que eles fazem.
*Trava:* o modelo de dados do PPA.

**18 ❓ Então o ciclo tem sempre quatro anos?**
Desenvolvimento disse que pode ter dois; o cliente diz que o PPA permanece e atravessa governos.
As duas coisas se encaixam se "dois anos" for o **tempo que resta** a um governo que assume no
meio de um PPA — não um PPA de dois anos. Confirmar, porque decide se as tabelas de meta têm
sempre quatro colunas ou largura variável.
*Trava:* o desenho das tabelas de meta.

---

## Renato · PO

**1 ✅ Etiquetas entram no MVP?**
→ **Sim.**
*Mudou:* subiram na ordem de construção. O campo precisa existir antes de haver muito cadastro
feito — acrescentar depois custa migração e retreino.

**2 ❓ Qual o próximo perfil a ganhar tela?**
Hoje só o Administrador Central tem jornada completa. Alta gestão e órgãos de controle caem numa
tela provisória, e são 10 das 35 funcionalidades do inventário.
*Muda:* o que construímos nas próximas semanas.

**3 ❓ O que precisa estar pronto para a próxima demonstração, e quando?**
Ajuda a escolher entre aprofundar um perfil ou dar largura a vários.

**4 ❓ Quais são as métricas de sucesso?**
O discovery registra essa ausência como lacuna L003. Sem métrica não conseguimos justificar
escolha de desenho por outro critério que não opinião — nem saber depois se funcionou.

**5 ❓ Até onde vai o "não monitora entregas"?**
O quadro É/Não é diz que o produto não monitora execução. Ao mesmo tempo, o modelo de dados já
prevê empenhado, liquidado e pago vindos do SIAFIC.
*Muda:* a tela financeira e a Ficha da Entrega.

---

## Alexandre e Eduardo · Desenvolvimento

**1 ✅ O acesso devolve perfil e órgão?**
→ **Vem do Aplicações Expresso**, junto com o vínculo funcional.
*Mudou:* `perfil.html` deixa de ser uma escolha. Pedir que a pessoa declare o próprio perfil é
pedir duas vezes o que o sistema já sabe. A tela passa a valer só para quem acumula mais de um
papel.

**2 ✅ O Expresso devolve mais de um papel para a mesma pessoa?**
→ **Vai poder ter.**
*Mudou:* `perfil.html` continua existindo, mas como **confirmação, não escolha**. Quem tem um
papel só entra direto na sua tela — mostrar uma lista de uma opção é fazer a pessoa clicar à toa.
A tela só aparece para quem acumula.

**3 ✅ Os anos do ciclo vêm do PPA ou ficam fixos?**
→ **Dependem do PPA criado.** E o ciclo **nem sempre tem quatro anos**: se um governador sai e o
vice assume, o plano pode cobrir dois.
*Mudou:* mais do que tirar a constante do código. A Ficha da Entrega, a tela financeira e as
tabelas de meta hoje assumem quatro colunas — precisam funcionar com **duas, três ou cinco**, sem
quebrar o layout nem a leitura. É desenho de tabela de largura variável, não só troca de dado.

*Falta:* se um plano de dois anos é um PPA novo ou revisão do anterior — pergunta 12 com a
Shirley.

**4 ✅ Existe cadastro corporativo de órgãos e unidades?**
→ **Existe lista oficial, mas no protótipo usamos a do IBGE.**
*Mudou:* destrava a lista dos 246 municípios. O campo já nasce com o mesmo formato da fonte
oficial, para a troca depois ser só de origem do dado.

**5 🟡 GoMap e SIAFIC: o que dá para ler, e quando?**
→ **Não existe API hoje** — vai precisar ser construída. O PO confirma que **será endpoint**.
*Mudou:* dá para desenhar as telas assumindo que o dado chega, mas **ainda não sabemos quais
campos**. Continuamos sem poder prometer nada específico em tela.
*Falta:* a lista de campos de cada integração, a frequência de atualização e o que a tela mostra
quando a chamada falha — esse último é desenho nosso e pode começar agora.

**6 🟡 O SEI entra?**
→ **Entra**, e o Alexandre já conhece a integração.
*Falta:* em que ponto do fluxo. Provavelmente na tramitação e na aprovação, mas é preciso ouvir
do Alexandre antes de desenhar.

**7 ✅ Já existe back-end ou banco definido?**
→ **Não para esta fase.** A orientação é padronizar de um jeito que fique **leve para mostrar no
protótipo**.
*Mudou:* confirma o que já fazíamos — estado no navegador, sem servidor. Interações que só se
sustentam com back-end (busca ampla sobre muito dado, edição simultânea) ficam fora até haver
definição.
