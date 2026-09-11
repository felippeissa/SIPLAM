import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Diagnóstico.
 * O diagnóstico pertence a um plano e reúne os problemas que ele enfrenta.
 */
montarCadastro({
    colecao: "diagnosticos",
    titulo: "Cadastro de Diagnóstico",
    subtitulo: "Diagnósticos do plano, que reúnem os problemas a enfrentar.",
    novoRotulo: "Novo diagnóstico",
    singular: "Diagnóstico",
    pai: { colecao: "ppas", campo: "ppaId", rotulo: "PPA", artigo: "um", href: "central-ppa.html" },
    filhos: [{ colecao: "causas", campo: "diagnosticoId", rotulo: "Causas", href: "central-causa.html", tela: "Cadastro de Causa" }],
});
