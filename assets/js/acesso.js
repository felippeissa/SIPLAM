/**
 * Fluxo de acesso do SIPLAM — protótipo.
 *
 * Não há banco de dados nem autenticação real: o estado do fluxo vive no
 * localStorage do navegador. A validação é apenas de formato (usuário
 * preenchido e senha com no mínimo 6 caracteres).
 *
 * Ordem das telas:
 *   index.html → (primeiro acesso) termos.html → permissoes.html → perfil.html → sistema.html
 *   index.html → (acesso seguinte) perfil.html → sistema.html
 */
(function (window) {
    "use strict";

    var CHAVES = {
        termos: "siplam.termos",
        permissoes: "siplam.permissoes",
        perfil: "siplam.perfil",
        lembrarPerfil: "siplam.lembrarPerfil",
        usuario: "siplam.usuario",
        sessao: "siplam.sessao",
    };

    var PERFIS = [
        { id: "tecnico-setorial", nome: "Técnico setorial", descricao: "Preenche Iniciativas e Entregas do órgão" },
        { id: "ponto-focal", nome: "Ponto focal do órgão", descricao: "Envia as contribuições do órgão para análise" },
        { id: "analista-central", nome: "Analista da Área Central", descricao: "Analisa, aponta, devolve e valida" },
        { id: "admin-programas", nome: "Administrador de Programas", descricao: "Mantém e disponibiliza os Programas" },
        { id: "consulta", nome: "Consulta", descricao: "Somente leitura, sem entrar na fila de trabalho" },
    ];

    var SENHA_MINIMA = 6;

    function ler(chave) {
        try {
            return window.localStorage.getItem(chave);
        } catch (e) {
            return null;
        }
    }

    function gravar(chave, valor) {
        try {
            window.localStorage.setItem(chave, valor);
        } catch (e) {
            /* navegador sem armazenamento: o protótipo segue sem lembrar */
        }
    }

    function remover(chave) {
        try {
            window.localStorage.removeItem(chave);
        } catch (e) {
            /* ignora */
        }
    }

    /** Encerra a sessão e volta para a tela de acesso. */
    function sair() {
        remover(CHAVES.sessao);
        window.location.href = "index.html";
    }

    /** Impede abrir uma tela do meio do fluxo sem ter passado pelo acesso. */
    function exigirSessao() {
        if (ler(CHAVES.sessao) !== "ativa") {
            window.location.replace("index.html");
            return false;
        }
        return true;
    }

    /** Próxima tela depois do acesso: primeiro acesso passa por termos e permissões. */
    function proximaTelaAposAcesso() {
        if (ler(CHAVES.termos) !== "aceitos") return "termos.html";
        if (!ler(CHAVES.permissoes)) return "permissoes.html";
        return "perfil.html";
    }

    /** Apaga tudo — usado pelo "Reiniciar protótipo". */
    function reiniciar() {
        Object.keys(CHAVES).forEach(function (nome) {
            remover(CHAVES[nome]);
        });
        window.location.href = "index.html";
    }

    /** Marca ou limpa o estado de erro de um campo, no padrão do Bootstrap. */
    function validarCampo(campo, valido, mensagem) {
        var retorno = campo.parentElement.parentElement.querySelector(".invalid-feedback");
        campo.classList.toggle("is-invalid", !valido);
        if (retorno && mensagem) retorno.textContent = mensagem;
        return valido;
    }

    window.Acesso = {
        CHAVES: CHAVES,
        PERFIS: PERFIS,
        SENHA_MINIMA: SENHA_MINIMA,
        ler: ler,
        gravar: gravar,
        remover: remover,
        sair: sair,
        exigirSessao: exigirSessao,
        proximaTelaAposAcesso: proximaTelaAposAcesso,
        reiniciar: reiniciar,
        validarCampo: validarCampo,
    };
})(window);
