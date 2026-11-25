import { obterEstado } from "../dados/store.js";

/**
 * Cadastro de Dimensões das etiquetas (Gestão › Marcadores › Dimensão).
 *
 * Cada linha é uma dimensão e o grupo a que pertence. O grupo se escolhe entre os cadastrados na tela Grupos — a
 * dimensão é atribuída a um grupo que já existe, não cria grupo. As dimensões moram em `tiposMarcador`, ligadas ao
 * grupo por `dimensaoId` (o grupo mora em `dimensoesMarcador`, nomes de quando os níveis se chamavam dimensão e tipo).
 */
export const dimensaoMarcador = {
    colecao: "tiposMarcador",
    pasta: "central-dimensao",
    listagem: "central-dimensao.html",
    titulo: "Cadastro de Dimensões",
    subtitulo: "As dimensões das etiquetas e o grupo de cada uma.",
    novoRotulo: "Nova dimensão",
    singular: "Dimensão",
    genero: "f",
    rotuloNome: "Dimensão",
    exemplo: "Mudanças climáticas",
    podeExcluir: true,
    semDescricao: true,

    pai: { colecao: "dimensoesMarcador", campo: "dimensaoId", rotulo: "Grupo", artigo: "um", href: "central-grupo.html" },

    filtros: [
        {
            tipo: "texto",
            id: "grupo",
            rotulo: "Grupo",
            campo: "dimensaoId",
            opcoes: () => (obterEstado().dimensoesMarcador ?? []).map((d) => ({ valor: d.id, rotulo: d.nome })),
        },
    ],

    // Dimensão nova vale para todos os planos, como as que já existem.
    extra: { ler: () => ({ ppaId: "" }) },
};
