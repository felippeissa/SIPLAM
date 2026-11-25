/**
 * Cadastro de Grupos das etiquetas (Gestão › Marcadores).
 *
 * O grupo reúne dimensões (ambiental, social, governança…). Mora em `dimensoesMarcador`, nome antigo de quando o
 * grupo se chamava dimensão. As dimensões de cada grupo se cadastram na tela Dimensão.
 */
export const grupoMarcador = {
    colecao: "dimensoesMarcador",
    pasta: "central-grupo",
    listagem: "central-grupo.html",
    titulo: "Cadastro de Grupos",
    subtitulo: "Os grupos que reúnem as dimensões das etiquetas.",
    novoRotulo: "Novo grupo",
    singular: "Grupo",
    rotuloNome: "Nome do grupo",
    exemplo: "Econômico",
    // Excluir um grupo deixaria dimensões e etiquetas sem grupo: fica de fora por ora.
    podeExcluir: false,
    semDescricao: true,

    extra: {
        // Grupo novo vale para todos os planos, como os que já existem.
        ler: () => ({ ppaId: "" }),
    },
};
