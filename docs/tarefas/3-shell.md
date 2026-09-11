# Bloco 3 · Shell e navegação

O esqueleto que todas as telas usam. O ponto fora do padrão do Inspinia é ter **dois menus
mutuamente exclusivos**, trocados pela visão.

Referência: `prototipo-lovable/src/components/ppa/shell.tsx` e `inspinia/src/partials/`.

---

## T3.1 · Topbar

- [ ] **T3.1.1** Marca "PPA 2028–2031 · Estado de Goiás" à esquerda
- [ ] **T3.1.2** Comutador Visão Setorial ⇄ Área Central, em dois estados
- [ ] **T3.1.3** Persona e órgão do usuário, vindos do fluxo de acesso
- [ ] **T3.1.4** Menu do usuário com sair e reiniciar protótipo
- [ ] **T3.1.5** Campo de busca abrindo a paleta (T3.6)
- [ ] **T3.1.6** Limpar do partial do template o que não se aplica: mega menu, apps, mensagens,
      notificações, idiomas e carrinho

## T3.2 · Sidenav com os dois menus

- [ ] **T3.2.1** Menu setorial: Programas, Iniciativas, Entregas, Indicadores
- [ ] **T3.2.2** Menu da área central: Visão Geral, Entregas, Órgãos participantes
- [ ] **T3.2.3** Grupo "Análises" com Causas, Financeira, Projetos e IPOFs
- [ ] **T3.2.4** Administração de Programas ao fim do menu central
- [ ] **T3.2.5** Troca do conjunto inteiro conforme a visão, com `li.side-nav-title` nos grupos
- [ ] **T3.2.6** Estado recolhido (`data-sidenav-size="condensed"`) com rótulo em tooltip

## T3.3 · Menu por perfil ✚

Hoje o protótipo tem dois arrays fixos. Vindo de estrutura de dados, quando os perfis forem
definidos é configuração, não refatoração.

- [ ] **T3.3.1** Descrever os itens de menu em estrutura de dados, com visão e perfis de cada um
- [ ] **T3.3.2** Montar o menu a partir do perfil escolhido no acesso
- [ ] **T3.3.3** Esconder o comutador de visão para quem só tem uma
- [ ] **T3.3.4** Definir o comportamento do perfil de consulta ↯

## T3.4 · Item ativo

- [ ] **T3.4.1** Marcar por prefixo de rota
- [ ] **T3.4.2** Exceção das raízes exatas (`/` e `/central`), que não podem casar com tudo
- [ ] **T3.4.3** Manter o grupo "Análises" aberto quando um filho está ativo

## T3.5 · Trilha de contexto

- [ ] **T3.5.1** Componente com separador "›", no lugar do breadcrumb padrão
- [ ] **T3.5.2** Elos navegáveis, com o último em texto simples
- [ ] **T3.5.3** Aplicar nas telas de detalhe: Programa › Iniciativa › Entrega
- [ ] **T3.5.4** Incluir o órgão na trilha quando a visão é a central

## T3.6 · Busca global

Não há equivalente pronto no Inspinia — o `cmdk` some na migração. Um dos dois pontos caros do
projeto.

- [ ] **T3.6.1** Modal de paleta com atalho `Ctrl+K` / `Cmd+K`
- [ ] **T3.6.2** Busca a partir de 2 caracteres, com no mínimo 7 grupos de resultado
- [ ] **T3.6.3** Grupos: Programa, Iniciativa, Entrega, Indicador, Projeto GOMAP, Ação e IPOF
- [ ] **T3.6.4** Linha de contexto por resultado (ex.: "financia a Entrega X")
- [ ] **T3.6.5** Escopo limitado ao órgão na visão setorial, amplo na área central
- [ ] **T3.6.6** Navegação por teclado entre resultados e Enter para abrir
- [ ] **T3.6.7** Estado vazio e estado de termo curto demais

## T3.7 · Indicar corte de resultados ⚠

A busca do protótipo limita a 30 itens sem avisar, então o usuário não sabe que há mais.

- [ ] **T3.7.1** Contar o total antes de cortar
- [ ] **T3.7.2** Mostrar "exibindo 30 de N" no rodapé da paleta
- [ ] **T3.7.3** Decidir se há como ver todos os resultados ↯

## T3.8 · Erros de rota

- [ ] **T3.8.1** Página 404 em português, com caminho de volta
- [ ] **T3.8.2** Estado de registro inexistente nas telas de detalhe (Programa, Iniciativa, Entrega)
- [ ] **T3.8.3** Estado de acesso a registro de outro órgão na visão setorial ↯
