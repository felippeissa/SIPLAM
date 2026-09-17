import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Causas.
 * A causa explica por que o problema acontece, e é a ela que as Iniciativas dos
 * órgãos se vinculam. Numeração 1.0, 2.0… dentro de cada problema.
 */
montarCadastro({
    colecao: "causas",
    titulo: "Cadastro de Causas",
    subtitulo: "O que produz cada problema — é aqui que as Iniciativas se vinculam.",
    novoRotulo: "Nova causa",
    singular: "Causa",
    genero: "f",
    pai: { colecao: "problemas", campo: "problemaId", rotulo: "Problema", artigo: "um", href: "central-problema.html" },
    filhos: [{ colecao: "subcausas", campo: "causaId", rotulo: "Subcausas", href: "central-subcausa.html", tela: "Cadastro de Subcausas" }],
    codigo: (item, estado) => {
        const irmas = estado.causas.filter((c) => c.problemaId === item.problemaId);
        return `${irmas.findIndex((c) => c.id === item.id) + 1}.0`;
    },
});
