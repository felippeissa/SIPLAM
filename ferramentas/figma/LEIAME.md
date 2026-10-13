# Do protótipo para o Figma

Estas ferramentas recriam no Figma as telas do protótipo, no padrão da Entrega 1: um documento de handoff à
esquerda, a faixa do fluxo e as telas numeradas ao lado. As telas **não são desenhadas à mão** — são lidas do
protótipo rodando no navegador, com posições, cores, textos e ícones reais, e desenhadas no Figma.

## Peças

| Arquivo | O que faz |
|---|---|
| `ponte.py` | Servidor local na porta **9230** (o plugin do Figma só fala com `localhost:9223–9232`). Serve os ícones Tabler como vetor, grava e devolve as capturas e os scripts. |
| `lib/extrator.js` | Roda no navegador. Lê a página num iframe de 1440px e devolve a árvore de caixas, textos, ícones e vetores. Respeita `z-index` e os contextos de empilhamento. |
| `lib/captura.js` | Funções `cap(nome, url, { prep, ls, rm })` que abrem a página, preparam o estado (cliques, texto digitado, janelas abertas) e mandam a captura à ponte. |
| `lib/cadastro.js` | `capCad()`: captura a lista, o criar e o editar de um cadastro. |
| `lib/construtor.js` | Roda no plugin do Figma. Desenha a árvore capturada (frames, textos, ícones, SVG). |
| `lib/fluxo.js` | Monta a seção de cada fluxo (handoff, faixa, passos), o índice “00” e organiza a página. |
| `lib/requisitos.js` + `extrair_requisitos.py` | Desenham o documento de requisitos (.docx) em páginas A4 na página “Documento de requisitos” do Figma: capa, tabelas verdes, figuras e rodapé. |
| `gerar.py` + `cad/*.json` | Geram os documentos de handoff dos cadastros a partir de um bloco de dados por cadastro. |

## Como atualizar o Figma

1. Ligue o servidor do protótipo (`python servidor.py`, porta 8899) e a ponte (`python ponte.py`).
2. Abra o plugin **Figma Desktop Bridge** no arquivo SIPLAM.
3. Numa aba do navegador em `http://127.0.0.1:8899/`, carregue `captura.js` e capture as telas que mudaram.
4. No Figma (`figma_execute`), carregue `construtor.js` e `fluxo.js` e use `siplamRefazer(secaoId, indice, arquivo)`
   para trocar uma tela, ou `siplamFila([...specs])` para montar fluxos inteiros.
5. Guarde e restaure o `localStorage` do protótipo: as capturas mexem em perfil, tema e plano.

## Cuidados que custaram caro

- **Janelas modais**: a animação de entrada não roda fora da tela, então `captura.js` força o estado final.
- **`z-index`**: quem tem `z-index` positivo sobe só até o seu próprio contexto de empilhamento. Sem isso o
  fundo escuro da janela cobre a janela, ou a barra superior cobre os botões dela.
- **Fonte monoespaçada**: o texto é encolhido para caber na largura medida no navegador.
- **Limite de 30 s** por chamada ao Figma: montar fluxos grandes vai em fila, em segundo plano.

## Documento de requisitos

1. `python extrair_requisitos.py "documento.docx"` grava `req/req2.json` (copie `word/media/image1..4.png` do .docx para `req/`).
2. Com a ponte ligada, no Figma: carregue `lib/requisitos.js` e chame `siplamRequisitos()` — ela refaz a página inteira.
