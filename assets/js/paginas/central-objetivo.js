import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Objetivos Estratégicos.
 * O objetivo é a ele que os Programas se vinculam. O eixo é opcional: um
 * objetivo pode ser cadastrado antes de os eixos existirem, ou sem pertencer a
 * nenhum.
 */
montarCadastro({
    colecao: "objetivos",
    titulo: "Cadastro de Objetivos Estratégicos",
    subtitulo: "O que cada eixo se propõe a alcançar.",
    novoRotulo: "Novo objetivo estratégico",
    singular: "Objetivo estratégico",
    pai: { colecao: "eixos", campo: "eixoId", rotulo: "Eixo", artigo: "um", href: "central-eixo.html", opcional: true },
    filhos: [
        {
            colecao: "programas",
            campo: "objetivoId",
            rotulo: "Programas",
            href: "central-programas.html",
            tela: "Cadastro de Programa",
        },
    ],
});
