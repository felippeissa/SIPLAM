import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Diagnóstico.
 * Cada Programa tem o seu: é ali que o problema a enfrentar é caracterizado,
 * com as evidências que o sustentam.
 */
montarCadastro({
    colecao: "diagnosticos",
    titulo: "Cadastro de Diagnóstico",
    subtitulo: "O diagnóstico de cada Programa, com as evidências que o sustentam.",
    novoRotulo: "Novo diagnóstico",
    singular: "Diagnóstico",
    pai: { colecao: "programas", campo: "programaId", rotulo: "Programa", artigo: "um", href: "central-programas.html" },
    filhos: [{ colecao: "problemas", campo: "diagnosticoId", rotulo: "Problemas", href: "central-problema.html", tela: "Cadastro de Problemas" }],
});
