/** Cadastro de Objetivos Estratégicos. */
export const objetivo = {
    colecao: "objetivos",
    pasta: "central-objetivo",
    listagem: "central-objetivo.html",
    titulo: "Cadastro de Objetivos Estratégicos",
    subtitulo: "O que cada eixo se propõe a alcançar.",
    novoRotulo: "Novo objetivo estratégico",
    singular: "Objetivo estratégico",
    exemplo: "Ampliar a rede de cuidado à pessoa idosa.",
    ajuda: "É ao objetivo que os Programas se vinculam. O eixo é opcional: um objetivo pode ser cadastrado antes de os eixos existirem.",
    podeExcluir: true,
    pai: {
        colecao: "eixos",
        campo: "eixoId",
        rotulo: "Eixo",
        artigo: "um",
        href: "central-eixo.html",
        opcional: true,
    },
    filhos: [
        {
            colecao: "programas",
            campo: "objetivoId",
            rotulo: "Programas",
            href: "central-programas.html",
            tela: "Cadastro de Programa",
        },
    ],
};
