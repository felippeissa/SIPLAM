/** Cadastro de Eixos — a configuração que a listagem e o formulário compartilham. */
export const eixo = {
    colecao: "eixos",
    pasta: "central-eixo",
    listagem: "central-eixo.html",
    titulo: "Cadastro de Eixos",
    subtitulo: "Os eixos do plano, que reúnem os objetivos estratégicos.",
    novoRotulo: "Novo eixo",
    singular: "Eixo",
    exemplo: "Goiás que cuida",
    ajuda: "O eixo é o nível mais alto do plano: reúne os objetivos estratégicos e, por eles, os Programas.",
    podeExcluir: true,
    filhos: [
        {
            colecao: "objetivos",
            campo: "eixoId",
            rotulo: "Objetivos estratégicos",
            href: "central-objetivo.html",
            tela: "Cadastro de Objetivos Estratégicos",
        },
    ],
};
