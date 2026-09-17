import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Problemas.
 * O problema central de cada diagnóstico — o que o Programa existe para
 * enfrentar. Dele decorrem as causas.
 */
montarCadastro({
    colecao: "problemas",
    titulo: "Cadastro de Problemas",
    subtitulo: "O problema central que cada diagnóstico caracteriza.",
    novoRotulo: "Novo problema",
    singular: "Problema",
    pai: { colecao: "diagnosticos", campo: "diagnosticoId", rotulo: "Diagnóstico", artigo: "um", href: "central-diagnostico.html" },
    filhos: [{ colecao: "causas", campo: "problemaId", rotulo: "Causas", href: "central-causa.html", tela: "Cadastro de Causas" }],
});
