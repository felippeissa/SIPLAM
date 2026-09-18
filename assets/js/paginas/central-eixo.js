import { montarCadastro } from "../cadastro-crud.js";

/**
 * Cadastro de Eixos.
 * O eixo é o nível mais alto da estrutura do plano: reúne os objetivos
 * estratégicos, e por eles os Programas.
 */
montarCadastro({
    colecao: "eixos",
    titulo: "Cadastro de Eixos",
    subtitulo: "Os eixos do plano, que reúnem os objetivos estratégicos.",
    novoRotulo: "Novo eixo",
    singular: "Eixo",
    filhos: [
        {
            colecao: "objetivos",
            campo: "eixoId",
            rotulo: "Objetivos estratégicos",
            href: "central-objetivo.html",
            tela: "Cadastro de Objetivos Estratégicos",
        },
    ],
});
