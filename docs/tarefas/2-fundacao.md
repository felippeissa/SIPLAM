# Bloco 2 · Fundação visual

Traduzir o design system do protótipo (tokens oklch + Tailwind v4) para o Inspinia.

---

## T2.1 · Trazer os fontes SCSS do Inspinia ↯

O pacote em `inspinia/` é a distribuição compilada: só `app.min.css`, sem `scss/`, sem
`package.json`, sem gulpfile. Os fontes existem — estão no repositório que foi substituído, e há
cópia em `backup-SIPLAM-antigo.zip` (16 MB, 196 arquivos SCSS).

- [ ] **T2.1.1** Decidir com o time se o projeto adota o pipeline SCSS ou segue com override de CSS
- [ ] **T2.1.2** Trazer `src/assets/scss/`, `gulpfile.js`, `package.json` e `plugins.config.js`
- [ ] **T2.1.3** Rodar o build e confirmar que o CSS gerado bate com o compilado atual
- [ ] **T2.1.4** Documentar o comando de build no `README.md`
- [ ] **T2.1.5** Decidir se o `dist` gerado entra no repositório (o GitHub Pages serve da raiz)

## T2.2 · Tema SIPLAM — `_theme-siplam.scss`

Um tema ao lado dos onze do template (`_theme-default`, `_theme-flat`, `_theme-luxe`…). Depende de
T2.1; sem os fontes, vira ampliação do `assets/css/siplam.css`.

- [ ] **T2.2.1** Converter a paleta do protótipo de oklch para as variáveis do Bootstrap
- [ ] **T2.2.2** Cor primária institucional
- [ ] **T2.2.3** Os quatro tons semânticos: ok, alerta, impeditivo e info
- [ ] **T2.2.4** Os pares `*-soft` dos chips, que hoje só existem em versão clara
- [ ] **T2.2.5** Neutros com leve viés da matiz primária, como no protótipo
- [ ] **T2.2.6** Fundo verde das telas de acesso migrado para o tema

## T2.3 · Densidade

O protótipo roda em 13px com rótulos de 11px em caixa alta; o Inspinia é 14px. É override global,
com risco de regressão em todo o template.

- [ ] **T2.3.1** Base tipográfica em 13px
- [ ] **T2.3.2** Classe de rótulo: 11px, caixa alta, espaçamento entre letras
- [ ] **T2.3.3** Variante densa de tabela: padding reduzido, cabeçalho em caixa alta de 11px
- [ ] **T2.3.4** `form-control-sm` como padrão dos filtros de listagem
- [ ] **T2.3.5** Revisar botões, chips e cards nessa escala
- [ ] **T2.3.6** Conferir que as páginas de exemplo do Inspinia não quebram com o override

## T2.4 · Ícones — lucide para Tabler

- [ ] **T2.4.1** Inventariar os ícones em uso no protótipo (Gauge, Boxes, Network, Receipt,
      GitBranch, Target, ListChecks, Building2, Coins, Settings, ChevronRight, MoreVertical, Search)
- [ ] **T2.4.2** Mapear cada um para o equivalente Tabler (`ti ti-*`)
- [ ] **T2.4.3** Padronizar os tamanhos em 14px e 16px
- [ ] **T2.4.4** Registrar o mapa no guia da linguagem (T8.4)

## T2.5 · Tema escuro

- [ ] **T2.5.1** Definir os tons `*-soft` dos chips no fundo escuro
- [ ] **T2.5.2** Conferir tabelas densas, faixas de indicadores e quadros financeiros no escuro
- [ ] **T2.5.3** Decidir se o sistema oferece a alternância ao usuário ou fica fixo no claro ↯

## T2.6 · Contraste

- [ ] **T2.6.1** Auditar os pares texto/fundo dos cinco tons de chip contra WCAG AA
- [ ] **T2.6.2** Auditar texto secundário sobre fundo de tabela e de card
- [ ] **T2.6.3** Ajustar as cores que não passarem, mantendo a distinção entre os tons
- [ ] **T2.6.4** Verificar que cor não é o único canal de informação — status também tem rótulo
