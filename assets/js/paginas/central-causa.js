import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Causa.
 * A causa pertence a um diagnóstico e se desdobra em problemas.
 */
montarCadastro({
    colecao: "causas",
    titulo: "Cadastro de Causa",
    subtitulo: "Causas identificadas em cada diagnóstico.",
    novoRotulo: "Nova causa",
    singular: "Causa",
    genero: "f",
    pai: {
        colecao: "diagnosticos",
        campo: "diagnosticoId",
        rotulo: "Diagnóstico",
        artigo: "um",
        href: "central-diagnostico.html",
    },
    filhos: [{ colecao: "problemas", campo: "causaId", rotulo: "Problemas", href: "central-problema.html", tela: "Cadastro de Problemas" }],
});
