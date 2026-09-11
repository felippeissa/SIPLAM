# Bloco 0 · Acesso

Fluxo de entrada no sistema. **Concluído**, salvo duas pendências ao fim.

---

## T0.1 · Tela de login com validação de formato — `index.html` ✅

Cartão centralizado do Inspinia com a marca do SIPLAM, no padrão da tela de acesso do Estado.

- [x] **T0.1.1** Campo Usuário, com asterisco de obrigatório e placeholder "Digite seu usuário"
- [x] **T0.1.2** Campo Senha com o componente *Show/Hide Password* do template
      (`input-group-text password-eye`, ícones `ti-eye` e `ti-eye-off`)
- [x] **T0.1.3** Caixa "Me manter conectado" e link "Esqueceu sua senha?"
- [x] **T0.1.4** Botão Entrar, separador "Ou", e os dois botões de SSO no padrão
      *Button Outline Rounded* com os logos do ID Goiás e do gov.br
- [x] **T0.1.5** Validação: usuário não vazio e senha com no mínimo 6 caracteres, com erro no campo
      (`is-invalid` + `invalid-feedback`)
- [x] **T0.1.6** Avisos de cookie e Política de Privacidade, e o Expresso creditado como plataforma
- [x] **T0.1.7** Encaminhamento para a próxima tela conforme seja primeiro acesso ou não

## T0.2 · Termos de uso no primeiro acesso — `termos.html` ✅

- [x] **T0.2.1** Texto em área de rolagem com `data-simplebar`, altura máxima de 320px
- [x] **T0.2.2** Seis seções: finalidade, responsabilidade do usuário, informações registradas,
      dados pessoais (LGPD), uso adequado e vigência
- [x] **T0.2.3** "Li e não concordo" encerra a sessão e volta ao login
- [x] **T0.2.4** "Li e concordo" grava o aceite e segue para as permissões

## T0.3 · Permissões de compartilhamento — `permissoes.html` ✅

- [x] **T0.3.1** Sete caixas: Selecionar todas, Celular, Nome completo, CPF, Email pessoal, Nome e
      Email corporativo — **todas marcadas por padrão**
- [x] **T0.3.2** "Selecionar todas" em estado indeterminado quando a seleção é parcial
- [x] **T0.3.3** Asterisco nos obrigatórios (Nome completo, CPF, Email corporativo) e bloqueio com
      alerta ao tentar seguir sem eles
- [x] **T0.3.4** Bloco "Verifique se a aplicação é confiável" com link para a Política
- [x] **T0.3.5** Escolha entre "Aprovar uma vez" e "Aprovar sempre"
- [x] **T0.3.6** Cancelar volta ao login; Continuar grava a escolha e segue para o perfil

## T0.4 · Escolha de perfil a cada login — `perfil.html` ✅

- [x] **T0.4.1** Select com o componente Choices (`data-choices`), incluindo o `form-choice.js` do
      template — sem ele o campo fica nativo, sem a seta
- [x] **T0.4.2** Cinco perfis propostos: técnico setorial, ponto focal do órgão, analista da Área
      Central, administrador de Programas e consulta
- [x] **T0.4.3** "Lembrar minha escolha" marcado por padrão, com a escolha anterior pré-selecionada
- [x] **T0.4.4** Bloqueio ao continuar sem escolher, com mensagem no campo
- [x] **T0.4.5** Sem seleção de órgão — diferente do padrão do Expresso, que pede órgão e perfil

## T0.5 · Sessão e saída — `assets/js/acesso.js` ✅

- [x] **T0.5.1** Guarda nas telas internas: sem sessão ativa, redireciona ao login
- [x] **T0.5.2** Chaves de estado no `localStorage` (termos, permissões, perfil, usuário, sessão)
- [x] **T0.5.3** Sair encerra a sessão e mantém termos e permissões já aceitos
- [x] **T0.5.4** Reiniciar protótipo apaga tudo, para testar o primeiro acesso de novo
- [x] **T0.5.5** Tela de fim de fluxo (`sistema.html`) mostrando perfil, termos e permissões

## T0.6 · Logos ✅

- [x] **T0.6.1** `logo-siplam.svg` na marca das cinco telas
- [x] **T0.6.2** `logo-expresso.svg` no rodapé do login, como plataforma de acesso
- [x] **T0.6.3** `logo-id-goias.svg` e `logo-govbr.svg` dentro dos botões de SSO

## T0.7 · Configuração de tema ✅

- [x] **T0.7.1** Atributos no elemento raiz: skin `minimal`, tema claro, topbar `light`, sidenav
      `gray` em tamanho `default`, largura `fluid`, sem informação de usuário na sidenav
- [x] **T0.7.2** Fundo verde `#e9f8f1` do padrão do Estado, em `assets/css/siplam.css`
- [x] **T0.7.3** Folha própria carregada depois do `app.min.css`, isolada para virar
      `_theme-siplam.scss` quando os fontes SCSS entrarem

---

## Pendências do bloco

### T0.8 · Barra de acessibilidade do goias.gov.br ↯ ✚

Aparece no topo de todas as telas da referência do Expresso e não foi incluída — não é componente
do Inspinia.

- [ ] **T0.8.1** Confirmar com os stakeholders se faz parte do padrão obrigatório
- [ ] **T0.8.2** Barra fixa no topo com a marca GOIAS.GOV.BR à esquerda
- [ ] **T0.8.3** Controles A− / A / A+ alterando o tamanho da fonte da página
- [ ] **T0.8.4** Alternância de alto contraste
- [ ] **T0.8.5** Link de acessibilidade
- [ ] **T0.8.6** Decidir se a barra vale para o sistema inteiro ou só para as telas de acesso

### T0.9 · Tornar o mostrar/ocultar senha focável por teclado ⚠

O `password-eye` do Inspinia é uma `div`, então não entra na ordem de tabulação. Para sistema de
governo, provável exigência de acessibilidade.

- [ ] **T0.9.1** Trocar a `div` por `<button type="button">` mantendo as classes do template
- [ ] **T0.9.2** `aria-label` alternando entre "Mostrar senha" e "Ocultar senha"
- [ ] **T0.9.3** Conferir se o estilo do template não quebra com o elemento novo
- [ ] **T0.9.4** Registrar o desvio do padrão do Inspinia no guia da linguagem (T8.4)
