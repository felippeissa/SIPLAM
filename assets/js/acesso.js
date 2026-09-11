/**
 * Fluxo de acesso do SIPLAM — protótipo.
 *
 * Não há banco de dados nem autenticação real: o estado do fluxo vive no
 * localStorage do navegador. A validação é apenas de formato (usuário
 * preenchido e senha com no mínimo 6 caracteres).
 *
 * Ordem das telas:
 *   index.html → (primeiro acesso) termos.html → permissoes.html → perfil.html → sistema
 *   index.html → (acesso seguinte) perfil.html → sistema
 *
 * A tela em que o usuário cai depende do perfil escolhido: quem preenche entra
 * pela visão setorial, quem analisa ou administra entra pela área central.
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

    /**
     * A visão é consequência do perfil, não uma escolha do usuário:
     * quem preenche trabalha na visão setorial, quem analisa ou administra
     * trabalha na visão da área central.
     */
    /**
     * A visão é consequência do perfil, não uma escolha do usuário: o Analista
     * Setorial trabalha na visão do órgão, o Analista da Área Central na visão
     * de consolidação e análise.
     */
    var VISAO = {
        "analista-setorial": "setorial",
        "analista-central": "central",
    };

    /** Tela inicial de cada perfil. */
    var INICIO = {
        "analista-setorial": "programas.html",
        "analista-central": "central.html",
    };

    var PERFIS = [
        {
            id: "analista-setorial",
            nome: "Analista Setorial",
            descricao: "Elabora e envia as contribuições do órgão",
        },
        {
            id: "analista-central",
            nome: "Analista da Área Central",
            descricao: "Analisa, valida e administra os Programas",
        },
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

    /** Para onde o perfil escolhido leva. */
    function telaInicial(perfilId) {
        return INICIO[perfilId] || "programas.html";
    }

    /** Visão do perfil: "setorial" ou "central". */
    function visaoDoPerfil(perfilId) {
        return VISAO[perfilId] || "setorial";
    }

    /** Perfil escolhido nesta sessão. */
    function perfilAtual() {
        return ler("siplam.perfilSessao") || ler(CHAVES.perfil);
    }

    window.Acesso = {
        CHAVES: CHAVES,
        PERFIS: PERFIS,
        INICIO: INICIO,
        VISAO: VISAO,
        telaInicial: telaInicial,
        visaoDoPerfil: visaoDoPerfil,
        perfilAtual: perfilAtual,
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
