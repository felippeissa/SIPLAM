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
     * Os perfis de alta gestão são acumulativos: fazem tudo que o perfil do seu
     * nível faz, mais aprovar. Por isso não têm telas próprias — usam as mesmas,
     * e a camada de aprovação virá por cima.
     *
     * `leitura: true` é só dos órgãos de controle, o único perfil que não escreve.
     *
     * Por ora só Setorial e Administrador central têm tela inicial. Os outros
     * três caem na home provisória, até que a vez deles chegue.
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
            // Acumulativo: fará tudo que o Setorial faz, mais aprovar. A tela
            // inicial dele entra numa entrega adiante; por ora, home provisória.
            inicio: null,
            leitura: false,
            descricao: "Faz tudo que o Setorial faz e aprova a proposta do órgão",
        },
        {
            id: "gestao-central",
            nome: "Alta gestão central",
            visao: "central",
            // Sem tela própria ainda: cai na home provisória.
            inicio: null,
            leitura: true,
            descricao: "Acompanha a consolidação do plano",
        },
        {
            id: "controle",
            nome: "Órgãos de controle",
            visao: "central",
            // Sem tela própria ainda: cai na home provisória.
            inicio: null,
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

    /**
     * Para onde o perfil escolhido leva. Perfil sem tela própria cai na home
     * provisória, em vez de na tela de outro perfil.
     */
    function telaInicial(perfilId) {
        return perfilPorId(perfilId)?.inicio || "em-construcao.html";
    }

    /** Visão do perfil: "setorial" ou "central". */
    function visaoDoPerfil(perfilId) {
        return perfilPorId(perfilId)?.visao || "setorial";
    }

    /** Só os órgãos de controle não escrevem; a alta gestão preenche e ainda aprova. */
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
