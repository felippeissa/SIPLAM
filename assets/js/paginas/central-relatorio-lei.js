import { montarRelatorio } from "../relatorio-vazio.js";

/**
 * Relatório final da lei do PPA.
 * A peça que sai do sistema para virar projeto de lei: o plano fechado,
 * com a estrutura e os anexos que a Assembleia recebe.
 */
montarRelatorio({
    titulo: "Relatório final da lei do PPA",
    subtitulo: "O plano consolidado, no formato que acompanha o projeto de lei.",
    reune: [
        "A estrutura do plano: eixos, objetivos estratégicos e Programas",
        "O diagnóstico de cada Programa, com problemas e causas",
        "As Iniciativas e Entregas de cada órgão, com metas por ano",
        "Os anexos financeiros, somados das Ações Orçamentárias",
    ],
    jaTemos: [
        "Eixos, objetivos e Programas cadastrados",
        "Diagnóstico, problemas e causas",
        "Iniciativas e Entregas com metas e território",
        "Valor derivado das Ações Orçamentárias",
    ],
    falta: [
        "O formato exigido pela Assembleia e o que é anexo",
        "Se o relatório sai do plano vigente ou de uma versão congelada",
        "Se a emissão exige o plano submetido ou funciona em elaboração",
    ],
});
