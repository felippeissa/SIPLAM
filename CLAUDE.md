# SIPLAM — PPA 2028–2031 · Estado de Goiás

Sistema de elaboração do Plano Plurianual. Front-end sobre o template **Inspinia 5** (Bootstrap 5).

## Como trabalhar neste repositório

**Modelo lean: uma entrega por vez.** Cada entrega termina em commit e a sessão encerra.
A sessão seguinte lê só o necessário para a entrega da vez — não releia o repositório inteiro.

Ordem de leitura ao iniciar uma entrega:

1. Este arquivo.
2. `docs/escopo-ux.md` — o que já existe, o que falta e em que ordem.
3. `docs/perguntas.md` — o que os stakeholders já decidiram e o que ainda está em aberto.
4. Só os arquivos que a entrega da vez toca.

Não leia `prototipo-lovable/` inteiro nem `inspinia/` inteiro. São referências para consulta pontual:

| Preciso de… | Leia só |
|---|---|
| regra de negócio, cálculo, validação | `prototipo-lovable/src/lib/ppa/regras.ts`, `financeiro.ts` |
| modelo de dados | `prototipo-lovable/src/lib/ppa/types.ts` |
| como uma tela era no protótipo | a rota equivalente em `prototipo-lovable/src/routes/` |
| markup de um componente Inspinia | a página de exemplo correspondente em `inspinia/` |
| tokens e temas do template | `inspinia/src/assets/scss/_variables.scss` e `config/` |
| o que o cliente pediu na Lean Inception | `docs/discovery/` — comece pelo `README.md` |

## Estrutura

- `src/` — o SIPLAM (ainda vazio; começa na segunda entrega)
- `inspinia/` — template Inspinia 5, referência de markup e componentes
- `prototipo-lovable/` — protótipo React/TanStack que define o comportamento a reproduzir
- `docs/` — backlog, mapa do sistema e registro de entregas

## Decisões já tomadas

- Bootstrap 5 + Inspinia 5; ícones Tabler (`ti ti-*`); DataTables; ApexCharts/ECharts; Choices.js; SweetAlert2.
- Publicado no GitHub Pages a partir da raiz de `main`: https://felippeissa.github.io/SIPLAM/
- Escopo atual é **front-end e design**: sem API, sem banco, sem autenticação.
- O estado do protótipo vive em `localStorage`; nada de servidor nesta fase.

## Vocabulário do domínio — não confundir

- **Programa** → **Iniciativa** (contribuição de um órgão) → **Entrega** (produto concreto, com
  metas **por ano do ciclo**).
- **O ciclo não tem tamanho fixo.** Os anos vêm do PPA criado, e podem ser menos de quatro — se um
  governador sai e o vice assume, o plano pode cobrir dois. Toda tabela de meta precisa funcionar
  com um número variável de colunas.
- A **Ação Orçamentária** da LOA financia **no máximo uma** Entrega. O valor financeiro do PPA é **sempre derivado** dela — nunca digitado.
- O **Projeto GOMAP** descreve *como* a Entrega é produzida. Seu valor global **nunca** é o valor da Entrega.
- **Entrega** é resultado para a sociedade, não obra. "Construção de X" é nome de Projeto, não de Entrega.

## Perfis e visões

**A visão é consequência do perfil**, não uma escolha na interface. São **cinco perfis**,
confirmados com requisitos em 17/09/2026. Os perfis de alta gestão são **acumulativos**: fazem
tudo que o perfil correspondente faz, **mais** aprovar.

| Perfil | Visão | Faz |
|---|---|---|
| Setorial | setorial | preenche e envia a contribuição do órgão |
| Alta gestão setorial | setorial | **tudo que o Setorial faz + aprova** a proposta do órgão |
| Administrador central | central | analisa, valida e administra os Programas |
| Alta gestão central | central | **tudo que o Administrador central faz + aprova** a consolidação |
| Órgãos de controle | central | consulta; único perfil sem escrita |

**Alta gestão não é perfil de leitura** e não tem telas próprias: reaproveita as telas do perfil
que ela estende, com a camada de aprovação por cima. São duas aprovações em cadeia — a setorial
libera a contribuição do órgão, a central fecha o plano. Em `assets/js/acesso.js` os dois estão
marcados `leitura: true` e `inicio: null`; ambos deixaram de valer.

O perfil vem do **Aplicações Expresso** junto com o vínculo funcional — quem acessa não declara
quem é. A tela `perfil.html` deixa de ser escolha e passa a valer só para quem acumula mais de um
papel. No protótipo ela segue disponível, por não haver integração.

Abrir uma tela da outra visão devolve o usuário para a dele. Não existe comutador de visão no
cabeçalho.

### Fluxo de aprovação

Linear, sem etapa paralela. Quatro passos, com dois portões:

```
analista setorial  →  alta gestão setorial  →  analista central  →  alta gestão central
   preenche              aprova o órgão          consolida            aprova o plano
```

A contribuição não chega à Central sem passar pela alta gestão do órgão. **Quem escreve pode
aprovar o que escreveu** — a alta gestão faz tudo que o analista do seu nível faz. Como não há
segregação de funções, o **registro de quem fez o quê é o único controle que resta**, e por isso
o histórico da tramitação é obrigatório, não acessório.

### Um PPA por vez

A visão do sistema é de um PPA de cada vez. As etiquetas pertencem ao ciclo e **não são copiadas**
de um PPA para o outro.

### Situações do PPA

Seis, e não é uma fila reta — a submissão se bifurca:

```
elaboração → submetido → aprovado → vigente → encerrado
                  ↓
              reprovado → volta para elaboração
```

| Situação | O que significa | Edita? |
|---|---|---|
| **Elaboração** | em construção pelos órgãos e pela Área Central | sim |
| **Submetido** | encaminhado para apreciação | não |
| **Aprovado** | aprovado, aguardando o início da vigência | não |
| **Reprovado** | não aprovado; volta para Elaboração para ser corrigido | não |
| **Vigente** | em execução | só por alteração |
| **Encerrado** | ciclo concluído, permanece para consulta | não |

O corte está entre **Elaboração** e **Submetido**: antes o plano é construído, depois vira peça
formal. **Reprovado é o único estado que anda para trás**, e anda porque precisa — é o que
devolve o plano à edição.

**Só um plano pode estar vigente por vez** — dois seriam duas leis valendo para os mesmos anos.

**A situação não é escolhida, é reflexo.** O Cadastro de PPA a exibe e não a edita: mudar de
Elaboração para Submetido trava o plano para todos os órgãos, então é um ato do fluxo, não um
campo de formulário. O ato em si ainda não existe — e, enquanto não existir, todo plano fica em
Elaboração, que é o que o sistema inteiro pressupõe.

**O valor previsto também não é digitado.** É a soma das Ações Orçamentárias vinculadas às
Entregas do plano, dentro dos anos dele. Plano recém-criado vale zero, e cresce conforme as
Entregas são vinculadas.

### O PPA sobrevive à troca de governo

O plano não é refeito quando entra um governo novo: a base permanece. O governo que assume **pede
alterações no plano vigente** — mudanças pontuais, direcionadas. Elaborar e alterar são, portanto,
dois fluxos distintos, e o segundo ainda não existe no modelo: mexer num PPA **já aprovado**.
Enquanto não for desenhado, nenhuma tela deve sugerir que um plano fechado é editável.

## Convenções

- Idioma da interface e dos nomes de arquivo: português.
- Commits em português, no imperativo.
- Densidade: base 13px, rótulos 11px em caixa alta — mais denso que o padrão do Inspinia.
