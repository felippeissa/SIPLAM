import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Subproblemas.
 * O subproblema detalha um problema, e herda o número dele: o problema 1.0 tem
 * os subproblemas 1.1, 1.2, e assim por diante.
 */
montarCadastro({
    colecao: "subproblemas",
    titulo: "Cadastro de Subproblemas",
    subtitulo: "Desdobramentos de cada problema.",
    novoRotulo: "Novo subproblema",
    singular: "Subproblema",
    pai: { colecao: "problemas", campo: "problemaId", rotulo: "Problema", artigo: "um", href: "central-problema.html" },
    codigo: (item, estado) => {
        const problema = estado.problemas.find((p) => p.id === item.problemaId);
        if (!problema) return "—";
        const problemasDaCausa = estado.problemas.filter((p) => p.causaId === problema.causaId);
        const numero = problemasDaCausa.findIndex((p) => p.id === problema.id) + 1;
        const irmaos = estado.subproblemas.filter((s) => s.problemaId === problema.id);
        return `${numero}.${irmaos.findIndex((s) => s.id === item.id) + 1}`;
    },
});
