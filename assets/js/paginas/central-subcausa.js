import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Subcausas.
 * A subcausa detalha uma causa, e herda o número dela: a causa 1.0 tem as
 * subcausas 1.1, 1.2, e assim por diante.
 */
montarCadastro({
    colecao: "subcausas",
    titulo: "Cadastro de Subcausas",
    subtitulo: "Desdobramentos de cada causa.",
    novoRotulo: "Nova subcausa",
    singular: "Subcausa",
    genero: "f",
    pai: { colecao: "causas", campo: "causaId", rotulo: "Causa", artigo: "uma", href: "central-causa.html" },
    codigo: (item, estado) => {
        const causa = estado.causas.find((c) => c.id === item.causaId);
        if (!causa) return "—";
        const causasDoProblema = estado.causas.filter((c) => c.problemaId === causa.problemaId);
        const numero = causasDoProblema.findIndex((c) => c.id === causa.id) + 1;
        const irmas = estado.subcausas.filter((s) => s.causaId === causa.id);
        return `${numero}.${irmas.findIndex((s) => s.id === item.id) + 1}`;
    },
});
