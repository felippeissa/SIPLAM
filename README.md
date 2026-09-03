# SIPLAM

Sistema de elaboração do **Plano Plurianual 2028–2031 do Estado de Goiás**.

Interface construída sobre o template Inspinia 5 (Bootstrap 5), reproduzindo o comportamento
validado no protótipo React que está em `prototipo-lovable/`.

## Estado atual

Início do projeto. Este commit sobe apenas os insumos — template, protótipo de referência e
documentação. **Ainda não há tela construída**; as primeiras entram na próxima entrega.

## Estrutura

```
src/                 o SIPLAM (vazio nesta etapa)
inspinia/            template Inspinia 5 — referência de markup e componentes
prototipo-lovable/   protótipo React/TanStack que define o comportamento a reproduzir
docs/                backlog, mapa do sistema e registro de entregas
```

## Documentação

| Arquivo | O que é |
|---|---|
| [docs/ENTREGAS.md](docs/ENTREGAS.md) | O que já foi entregue e qual é a próxima |
| [docs/backlog-frontend.html](docs/backlog-frontend.html) | 92 histórias de front-end e design, em 7 épicos |
| [docs/mapa-sistema.html](docs/mapa-sistema.html) | Mapa das 20 telas: ações, lacunas, problemas e perguntas em aberto |
| [docs/mapa-area-central.html](docs/mapa-area-central.html) | Mapa detalhado da visão da Área Central |
| [CLAUDE.md](CLAUDE.md) | Contexto do domínio e regras de trabalho no repositório |

Os arquivos `.html` de `docs/` são páginas interativas — abra no navegador. Os dois mapas têm
nós arrastáveis e guardam a posição que você deixar.

## O domínio em cinco linhas

**Programa** (o problema e seu diagnóstico) → **Iniciativa** (o que um órgão propõe fazer) →
**Entrega** (o produto concreto, com metas de 2028 a 2031).

O financeiro nunca é digitado: cada **Ação Orçamentária** da LOA financia uma única Entrega, e o
valor vem das parcelas do IPOF no SIAFIC. O **Projeto GOMAP** diz *como* a Entrega é produzida —
nunca quanto ela custa.

## Fluxo de trabalho

O órgão preenche e envia; a Área Central analisa, registra apontamentos e então devolve para
ajuste ou valida.

```
em preenchimento → enviada → em análise → devolvida ↺  |  validada ✓
```

## Como rodar

Nesta etapa não há build. O template pode ser aberto direto do navegador a partir de
`inspinia/index.html`, e o protótipo de referência com:

```bash
cd prototipo-lovable && npm install && npm run dev
```
