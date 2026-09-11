import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Problemas.
 * O problema pertence a uma causa e se desdobra em subproblemas.
 * Numeração 1.0, 2.0… dentro de cada causa.
 */
montarCadastro({
    colecao: "problemas",
    titulo: "Cadastro de Problemas",
    subtitulo: "Problemas que decorrem de cada causa.",
    novoRotulo: "Novo problema",
    singular: "Problema",
    pai: { colecao: "causas", campo: "causaId", rotulo: "Causa", artigo: "uma", href: "central-causa.html" },
    filhos: [{ colecao: "subproblemas", campo: "problemaId", rotulo: "Subproblemas", href: "central-subproblema.html", tela: "Cadastro de Subproblemas" }],
    codigo: (item, estado) => {
        const irmaos = estado.problemas.filter((p) => p.causaId === item.causaId);
        return `${irmaos.findIndex((p) => p.id === item.id) + 1}.0`;
    },
});
