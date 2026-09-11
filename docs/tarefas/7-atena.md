# Bloco 7 · Atena

Camada de apoio contextual. Assistente **determinística**: regras, sem modelo de linguagem. O
princípio declarado no protótipo é que ela observa, identifica e sugere — **nunca altera dados**.

Referência: `prototipo-lovable/src/lib/ppa/atena.ts` e `src/components/ppa/atena.tsx`.

---

## T7.1 · Botão flutuante

- [ ] **T7.1.1** Fixo no canto inferior direito, acima do conteúdo
- [ ] **T7.1.2** Avatar da Atena
- [ ] **T7.1.3** Contador de observações relevantes (nível 2 ou 3)
- [ ] **T7.1.4** Texto alternando entre "N observações da Atena" e "Precisa de ajuda?"
- [ ] **T7.1.5** Esconder na impressão
- [ ] **T7.1.6** Não cobrir ações da tela nas larguras menores

## T7.2 · Painel lateral

- [ ] **T7.2.1** Offcanvas à direita, com largura confortável para textos longos
- [ ] **T7.2.2** Cabeçalho com o contexto da tela atual
- [ ] **T7.2.3** Bloco de sugestões acima da conversa
- [ ] **T7.2.4** Fechar por botão, Esc e clique fora
- [ ] **T7.2.5** Devolver o foco ao botão flutuante ao fechar

## T7.3 · Cartão de sugestão

- [ ] **T7.3.1** Três níveis com hierarquia visual distinta
- [ ] **T7.3.2** Nível 1 informativo, 2 atenção, 3 apontamento conceitual
- [ ] **T7.3.3** Link opcional para o componente citado
- [ ] **T7.3.4** Limite de 6 sugestões por contexto, como no protótipo
- [ ] **T7.3.5** Estado sem sugestões

## T7.4 · Portar as regras da Atena

- [ ] **T7.4.1** Sugestões de Entrega: nome que parece Projeto, metas faltantes, unidade ausente,
      território incompleto, sem Ação vinculada, Projeto sem Ação, descompasso acima de 30%
- [ ] **T7.4.2** Sugestões de Iniciativa: sem causas, resultado esperado igual ao detalhamento,
      pronta para envio, versão devolvida
- [ ] **T7.4.3** Sugestões do painel setorial: devolvidas, aptas a enviar, programas não avaliados,
      iniciativas sem entregas
- [ ] **T7.4.4** Sugestões do painel central: programas prontos para disponibilizar, causas sem
      cobertura, órgãos sem contribuição, IPOFs fora do PPA, descompasso de projeto, consolidação
- [ ] **T7.4.5** Detecção de contexto pela rota
- [ ] **T7.4.6** Respostas por casamento de padrão às perguntas

## T7.5 · Conversa

- [ ] **T7.5.1** Bolhas distintas para usuário e Atena
- [ ] **T7.5.2** Campo de entrada com envio por Enter e por botão
- [ ] **T7.5.3** Sugestões clicáveis como atalho de pergunta
- [ ] **T7.5.4** Rolagem automática para a última mensagem
- [ ] **T7.5.5** Resposta padrão quando nenhuma regra casa

## T7.6 · Persistir as observações ✚ ↯

Hoje fechar o painel apaga a conversa, e nada do que a Atena observou fica registrado.

- [ ] **T7.6.1** Decidir se as observações ficam registradas na Iniciativa
- [ ] **T7.6.2** Decidir se o analista vê as mesmas observações que o órgão viu
- [ ] **T7.6.3** Manter a conversa entre navegações da mesma sessão
- [ ] **T7.6.4** Definir se haverá integração real com modelo de linguagem, e com qual base
      documental ↯
