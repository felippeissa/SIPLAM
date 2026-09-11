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
     * A visão é consequência do perfil, não uma escolha na interface.
     *
     * `leitura: true` marca quem acompanha o plano sem operá-lo — alta gestão e
     * órgãos de controle veem tudo da sua visão, sem preencher, enviar, analisar
     * ou administrar. O recorte de cada perfil ainda precisa ser confirmado com
     * os stakeholders; aqui vale a leitura mais conservadora.
     */
    var PERFIS = [
        {
            id: "setorial",
            nome: "Setorial",
            visao: "setorial",
            inicio: "programas.html",
            leitura: false,
            descricao: "Elabora e envia as contribuições do órgão",
        },
        {
            id: "admin-central",
            nome: "Administrador central",
            visao: "central",
            inicio: "central.html",
            leitura: false,
            descricao: "Analisa, valida e administra os Programas",
        },
        {
            id: "gestao-setorial",
            nome: "Alta gestão setorial",
            visao: "setorial",
            inicio: "programas.html",
            leitura: true,
            descricao: "Acompanha as contribuições do próprio órgão",
        },
        {
            id: "gestao-central",
            nome: "Alta gestão central",
            visao: "central",
            inicio: "central.html",
            leitura: true,
            descricao: "Acompanha a consolidação do plano",
        },
        {
            id: "controle",
            nome: "Órgãos de controle",
            visao: "central",
            inicio: "central.html",
            leitura: true,
            descricao: "Consulta o plano e sua execução",
        },
    ];

    function perfilPorId(id) {
        return PERFIS.filter(function (p) {
            return p.id === id;
        })[0];
    }

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
        return perfilPorId(perfilId)?.inicio || "programas.html";
    }

    /** Visão do perfil: "setorial" ou "central". */
    function visaoDoPerfil(perfilId) {
        return perfilPorId(perfilId)?.visao || "setorial";
    }

    /** Perfis de acompanhamento não operam o plano. */
    function somenteLeitura(perfilId) {
        return perfilPorId(perfilId)?.leitura === true;
    }

    /** Perfil escolhido nesta sessão. */
    function perfilAtual() {
        return ler("siplam.perfilSessao") || ler(CHAVES.perfil);
    }

    window.Acesso = {
        CHAVES: CHAVES,
        PERFIS: PERFIS,
        perfilPorId: perfilPorId,
        somenteLeitura: somenteLeitura,
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
