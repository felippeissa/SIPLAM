# Bloco 4 · Componentes compartilhados

Os oito componentes próprios do protótipo mais o que a migração exige. Construí-los antes das telas
evita retrabalho: todos os blocos 5, 6 e 7 dependem daqui.

Referência: `prototipo-lovable/src/components/ppa/`.

---

## T4.1 · Chip semântico

- [ ] **T4.1.1** Cinco tons: ok, alerta, impeditivo, info e neutro
- [ ] **T4.1.2** Pílula de 11px, fundo suave e texto forte da mesma matiz
- [ ] **T4.1.3** Variante clicável, para os chips que filtram
- [ ] **T4.1.4** Conferir contraste nos dois temas (depende de T2.6)

## T4.2 · StatusChip do fluxo

- [ ] **T4.2.1** Cinco status: em preenchimento (neutro), enviada e em análise (info), devolvida
      (alerta), validada (ok)
- [ ] **T4.2.2** Rótulo curto para tabela e longo para cabeçalho de ficha
- [ ] **T4.2.3** Usar o mesmo componente nas duas visões

## T4.3 · Seção

Contêiner de praticamente todo conteúdo de detalhe.

- [ ] **T4.3.1** Card com cabeçalho de rótulo em caixa alta de 11px
- [ ] **T4.3.2** Slot de ação à direita do título
- [ ] **T4.3.3** Variante recolhível, usando o `card-toggle` do template
- [ ] **T4.3.4** Estado de seção bloqueada, quando a Iniciativa não é editável

## T4.4 · Campo

- [ ] **T4.4.1** Par rótulo/valor de leitura
- [ ] **T4.4.2** Variante de valor longo, com quebra
- [ ] **T4.4.3** Variante de valor vazio, com travessão
- [ ] **T4.4.4** Marcação de campo apontado pela Área Central ✚

## T4.5 · Faixa de indicadores

Aparece em 7 telas. **Não** usar os widgets de card do Inspinia: o padrão é uma faixa única
dividida, não cards soltos.

- [ ] **T4.5.1** Faixa horizontal de 4 a 6 números, com divisores
- [ ] **T4.5.2** Valor em destaque com `tabular-nums` e rótulo em caixa alta
- [ ] **T4.5.3** Rodapé opcional para a nota metodológica
- [ ] **T4.5.4** Quebra em várias linhas nas larguras menores

## T4.6 · Quadro financeiro plurianual

O componente mais complexo do sistema, e o segundo ponto caro do projeto.

- [ ] **T4.6.1** Tabela ano a ano (2028 a 2031) com coluna de total
- [ ] **T4.6.2** Agrupamento por dimensão, com as 9 opções
- [ ] **T4.6.3** Expansão da linha para a dimensão de detalhe
- [ ] **T4.6.4** Linha de total geral
- [ ] **T4.6.5** Formato curto nas telas de listagem e completo nas de detalhe
- [ ] **T4.6.6** Estado vazio: "nenhum recurso apropriado"
- [ ] **T4.6.7** Rolagem horizontal contida, sem empurrar a página
- [ ] **T4.6.8** Aviso de que os valores são derivados, nunca digitados

## T4.7 · Lista de pendências

- [ ] **T4.7.1** Três níveis com ícone e cor: impeditivo, alerta e informação
- [ ] **T4.7.2** Contagem por nível no cabeçalho
- [ ] **T4.7.3** Link para a Entrega de origem quando a pendência vem dela
- [ ] **T4.7.4** Estado sem pendências
- [ ] **T4.7.5** Variante compacta para o modal de envio

## T4.8 · Cabeçalho de página com filtros

Padrão repetido em 9 listagens: título, subtítulo e, à direita, busca mais 2 a 4 filtros e
ordenação.

- [ ] **T4.8.1** Título e subtítulo à esquerda
- [ ] **T4.8.2** Barra de filtros à direita, com quebra nas larguras menores
- [ ] **T4.8.3** Campo de busca com ícone
- [ ] **T4.8.4** Selects no padrão Choices, em tamanho reduzido
- [ ] **T4.8.5** Slot de ação primária (ex.: "Novo Programa")
- [ ] **T4.8.6** Indicar quantos registros o filtro deixou visíveis ✚

## T4.9 · Linha expansível

- [ ] **T4.9.1** Chevron que rotaciona, com rótulo acessível de expandir/recolher
- [ ] **T4.9.2** Sub-tabela com cabeçalho próprio
- [ ] **T4.9.3** Até **três níveis** encaixados, como na Visão Geral
- [ ] **T4.9.4** Estado inicial: uma linha aberta por padrão, como no protótipo
- [ ] **T4.9.5** Avaliar o exemplo `tables-datatables-child-rows`, que resolve um nível
- [ ] **T4.9.6** Manter o estado de expansão ao filtrar ↯

## T4.10 · Estados vazios e carregamento

- [ ] **T4.10.1** Texto de lista vazia próprio de cada tela, não genérico
- [ ] **T4.10.2** Estado de filtro sem resultado, diferente de lista sem dados
- [ ] **T4.10.3** Esqueleto durante a leitura do `localStorage`
- [ ] **T4.10.4** Estado de erro ao ler estado corrompido

## T4.11 · Confirmações destrutivas ⚠

O protótipo usa `confirm()` do navegador em três lugares: excluir Iniciativa, excluir Entrega e
reiniciar.

- [ ] **T4.11.1** Padrão de diálogo com SweetAlert2, já incluído no template
- [ ] **T4.11.2** Texto que diz o que será perdido, nomeando o registro
- [ ] **T4.11.3** Botão de confirmação com o verbo da ação, não "OK"
- [ ] **T4.11.4** Substituir os três usos do `confirm()`

## T4.12 · Notificações de ação

- [ ] **T4.12.1** Toast de sucesso para enviar, devolver, validar e salvar
- [ ] **T4.12.2** Toast de erro com o motivo
- [ ] **T4.12.3** Posição e duração padronizadas
- [ ] **T4.12.4** Anúncio em região `aria-live` para leitor de tela

## T4.13 · Gerador de documento

- [ ] **T4.13.1** Modal com o documento formatado
- [ ] **T4.13.2** Cabeçalho institucional "Plano Plurianual 2028–2031 · Estado de Goiás"
- [ ] **T4.13.3** Rodapé com data de geração e aviso de conteúdo de demonstração
- [ ] **T4.13.4** Botão imprimir / salvar em PDF
- [ ] **T4.13.5** Conteúdo montado por tipo de documento (Iniciativa, e os que forem definidos)

## T4.14 · Folha de impressão

- [ ] **T4.14.1** Classe `.no-print` escondendo shell, menu, filtros e Atena
- [ ] **T4.14.2** Área `[data-print]` como conteúdo impresso
- [ ] **T4.14.3** Formato A4 com margens e quebras de página controladas
- [ ] **T4.14.4** Tabelas largas cabendo na página impressa
- [ ] **T4.14.5** Conferir se o `_print.scss` do template já cobre parte disso
