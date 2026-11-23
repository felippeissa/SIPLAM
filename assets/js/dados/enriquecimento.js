/**
 * Cadastros com dados de demonstração mais completos e plausíveis.
 *
 * Os cadastros nasciam com o nome do registro e pouco mais: indicador sem tipo, sem linha de base e sem metas,
 * marcador sem dimensão, grupo populacional sem estimativa. Aqui entra o resto, com ordens de grandeza de Goiás
 * (7,3 milhões de habitantes, 246 municípios) e metas que andam na direção certa para cada indicador.
 *
 * Só preenche o que está vazio — nada do que a pessoa digitou é sobrescrito — e roda uma vez por estado salvo
 * (`cadastrosEnriquecidos`). Os valores são de demonstração, não estatística oficial.
 */

const ANOS_PLANO = ["2028", "2029", "2030", "2031"];
const vazio = (v) => v === undefined || v === null || v === "" || v === "—" || (Array.isArray(v) && !v.length);

/* ---------- indicadores de impacto (os 27 socioeconômicos) ---------- */
// id: [linhaBase, meta 2028, 2029, 2030, 2031]
const METAS_IMPACTO = {
    "in-001": ["6,10", "6,20", "6,30", "6,40", "6,50"],
    "in-002": ["98,60", "98,80", "99,00", "99,20", "99,40"],
    "in-003": ["4,30", "4,10", "3,90", "3,70", "3,50"],
    "in-004": ["2,80", "2,60", "2,40", "2,20", "2,00"],
    "in-005": ["74,99", "75,30", "75,60", "75,90", "76,20"],
    "in-006": ["79,50", "81,00", "82,50", "84,00", "85,50"],
    "in-007": ["11,20", "10,80", "10,40", "10,00", "9,60"],
    "in-008": ["6,08", "5,90", "5,70", "5,50", "5,30"],
    "in-009": ["0,658", "0,670", "0,680", "0,690", "0,700"],
    "in-010": ["23,17", "22,00", "21,00", "20,00", "19,00"],
    "in-011": ["5º lugar", "4º lugar", "3º lugar", "3º lugar", "2º lugar"],
    "in-012": ["2.898,00", "2.950,00", "3.010,00", "3.070,00", "3.130,00"],
    "in-013": ["2.833,00", "2.890,00", "2.950,00", "3.010,00", "3.070,00"],
    "in-014": ["36,70", "35,50", "34,50", "33,50", "32,50"],
    "in-015": ["19,60", "19,00", "18,30", "17,60", "17,00"],
    "in-016": ["0,456", "0,452", "0,448", "0,444", "0,440"],
    "in-017": ["12,40", "12,00", "11,50", "11,00", "10,50"],
    "in-018": ["24,90", "24,20", "23,50", "22,80", "22,00"],
    "in-019": ["61,70", "64,00", "67,00", "70,00", "73,00"],
    "in-020": ["95,25", "95,60", "96,00", "96,40", "96,80"],
    "in-021": ["1,30", "1,60", "2,00", "2,50", "3,00"],
    "in-022": ["28,50", "27,50", "26,50", "25,50", "24,50"],
    "in-023": ["1.480.000,00", "1.850.000,00", "2.200.000,00", "2.550.000,00", "2.900.000,00"],
    "in-024": ["302.000,00", "290.000,00", "278.000,00", "266.000,00", "254.000,00"],
    "in-025": ["21.500,00", "24.000,00", "27.000,00", "30.000,00", "33.000,00"],
    "in-026": ["0,35", "0,38", "0,42", "0,46", "0,50"],
    "in-027": ["3,67", "3,75", "3,85", "3,95", "4,05"],
};

/* ---------- indicadores de resultado (in-028 a in-047) ---------- */
const SAUDE = "Secretaria de Estado da Saúde";
const EDUCACAO = "Secretaria de Estado da Educação";
const SOCIAL = "Secretaria de Estado de Desenvolvimento Social";
const AMBIENTE = "Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável";
const INDUSTRIA = "Secretaria de Estado de Indústria, Comércio e Serviços";
const SEGURANCA = "Secretaria de Estado de Segurança Pública";
const ADMINISTRACAO = "Secretaria de Estado da Administração";
const INFRA = "Secretaria de Estado da Infraestrutura";
const AGRICULTURA = "Secretaria de Estado de Agricultura, Pecuária e Abastecimento";
const ESPORTE = "Secretaria de Estado de Esporte e Lazer";
const CGE = "Controladoria-Geral do Estado";

// id: [descrição, fórmula, polaridade, periodicidade, fonte, órgão, [meta 2028, 2029, 2030, 2031]]
const RESULTADO = {
    "in-028": ["Dias entre a solicitação e a consulta com especialista na rede estadual.", "Média de dias entre a data da solicitação e a data da consulta", "Menor-Melhor", "Mensal", "Regulação Estadual / SES-GO", SAUDE, ["105", "98", "90", "84"]],
    "in-029": ["Leitos de UTI disponíveis na rede, por 10 mil habitantes.", "(leitos de UTI ÷ população) × 10.000", "Maior-Melhor", "Anual", "CNES / DATASUS", SAUDE, ["1,9", "2,0", "2,1", "2,2"]],
    "in-030": ["Crianças de 0 a 3 anos matriculadas em creche, sobre a população da faixa.", "(matrículas em creche ÷ população de 0 a 3 anos) × 100", "Maior-Melhor", "Anual", "Censo Escolar / INEP", EDUCACAO, ["42%", "45%", "48%", "52%"]],
    "in-031": ["Domicílios que relatam fome no período de referência.", "(domicílios em insegurança alimentar grave ÷ domicílios pesquisados) × 100", "Menor-Melhor", "Anual", "PNAD Contínua / IBGE", SOCIAL, ["6,0%", "5,6%", "5,2%", "4,8%"]],
    "in-032": ["Municípios com restaurante popular, cozinha comunitária ou banco de alimentos em funcionamento.", "Contagem de municípios com equipamento ativo", "Maior-Melhor", "Semestral", "Cadastro de equipamentos / SEDS", SOCIAL, ["40", "70", "100", "130"]],
    "in-033": ["Pessoas de 14 a 24 anos sem ocupação que procuram trabalho.", "(jovens desocupados ÷ força de trabalho jovem) × 100", "Menor-Melhor", "Trimestral", "PNAD Contínua / IBGE", INDUSTRIA, ["17,8%", "16,9%", "16,0%", "15,0%"]],
    "in-034": ["Domicílios urbanos ligados à rede de esgotamento sanitário.", "(domicílios com rede de esgoto ÷ domicílios urbanos) × 100", "Maior-Melhor", "Anual", "SNIS / Ministério das Cidades", AMBIENTE, ["66%", "69%", "72%", "75%"]],
    "in-035": ["Unidades de atendimento diurno a pessoas idosas e com deficiência em operação.", "Contagem de centros-dia com funcionamento regular", "Maior-Melhor", "Semestral", "Sistema da Assistência Social / SEDS", SOCIAL, ["12", "16", "20", "24"]],
    "in-036": ["Parcela do PIB estadual gerada nas regiões de planejamento de menor dinamismo.", "(PIB das regiões prioritárias ÷ PIB estadual) × 100", "Maior-Melhor", "Anual", "IMB / Instituto Mauro Borges", INDUSTRIA, ["11,5%", "12,0%", "12,5%", "13,0%"]],
    "in-037": ["Homicídios dolosos por 100 mil habitantes.", "(homicídios dolosos ÷ população) × 100.000", "Menor-Melhor", "Mensal", "Sistema de ocorrências / SSP-GO", SEGURANCA, ["28,0", "26,5", "25,0", "23,5"]],
    "in-038": ["Municípios que receberam apoio a equipamento ou projeto cultural no ano.", "Contagem de municípios com equipamento cultural apoiado", "Maior-Melhor", "Anual", "Sistema de convênios / SECULT", ESPORTE, ["50", "70", "90", "110"]],
    "in-039": ["Serviços ao cidadão que podem ser pedidos e acompanhados pela internet.", "(serviços digitalizados ÷ total de serviços catalogados) × 100", "Maior-Melhor", "Trimestral", "Catálogo de serviços / SEAD", ADMINISTRACAO, ["50%", "62%", "75%", "85%"]],
    "in-040": ["Municípios com projeto de mobilidade urbana apoiado pelo Estado.", "Contagem de municípios com projeto apoiado", "Maior-Melhor", "Anual", "Sistema de convênios / SEINFRA", INFRA, ["46", "56", "66", "76"]],
    "in-041": ["Extensão da malha rodoviária estadual pavimentada em condição boa ou ótima.", "(km em condição boa ou ótima ÷ km pavimentados) × 100", "Maior-Melhor", "Anual", "Levantamento de condição da malha / Goinfra", INFRA, ["66,0%", "70,0%", "74,0%", "78,0%"]],
    "in-042": ["Parcela das compras da alimentação escolar feita da agricultura familiar.", "(valor comprado da agricultura familiar ÷ total comprado) × 100", "Maior-Melhor", "Anual", "FNDE / Seduc", AGRICULTURA, ["20,0%", "25,0%", "30,0%", "35,0%"]],
    "in-043": ["Registros de violência doméstica na rede de saúde e segurança.", "Contagem de notificações compulsórias de violência doméstica", "Menor-Melhor", "Mensal", "SINAN / SES-GO", SEGURANCA, ["10.900", "10.500", "10.100", "9.700"]],
    "in-044": ["Adolescentes que seguem acompanhados na rede depois de cumprir a medida socioeducativa.", "(adolescentes acompanhados ÷ adolescentes que concluíram a medida) × 100", "Maior-Melhor", "Semestral", "Sistema socioeducativo / SEDS", SOCIAL, ["60%", "68%", "76%", "84%"]],
    "in-045": ["Municípios com programa de esporte e lazer em oferta contínua durante o ano.", "Contagem de municípios com oferta continuada", "Maior-Melhor", "Anual", "Relatório de programas / SEEL", ESPORTE, ["55", "70", "85", "100"]],
    "in-046": ["Órgãos e entidades com programa de integridade formalmente implantado.", "(órgãos com programa implantado ÷ total de órgãos) × 100", "Maior-Melhor", "Anual", "Painel de integridade / CGE", CGE, ["50,0%", "62,0%", "74,0%", "86,0%"]],
    "in-047": ["Servidores que concluíram ao menos uma capacitação no ano.", "Contagem de servidores com capacitação concluída", "Maior-Melhor", "Anual", "Escola de Governo / SEAD", ADMINISTRACAO, ["5.000", "5.800", "6.600", "7.400"]],
};

/* ---------- marcadores com dimensão e tipo ---------- */
// Os de exemplo que se encaixam numa dimensão ganham dimensão e tipo.
const MARCADORES_CLASSIFICADOS = {
    "marcadores-ex09": ["governanca", "Gestão de riscos"],
    "marcadores-ex10": ["governanca", "Gestão de riscos"],
    "marcadores-ex19": ["governanca", "Compliance público"],
    "marcadores-ex20": ["governanca", "Controle interno"],
    "marcadores-ex23": ["governanca", "Transparência pública"],
    "marcadores-ex25": ["social", "Saúde e bem-estar"],
    "marcadores-ex29": ["social", "Inclusão social"],
    "marcadores-ex30": ["ambiental", "Sustentabilidade ambiental"],
    "marcadores-ex34": ["governanca", "Transparência pública"],
    "marcadores-ex42": ["governanca", "Políticas baseadas em evidências"],
    "marcadores-ex44": ["governanca", "Compliance público"],
    "marcadores-ex47": ["governanca", "Gestão de riscos"],
};

// Marcadores novos, um por tipo mais usado em cada dimensão.
const MARCADORES_NOVOS = [
    ["Mudanças climáticas", "Reduz emissões ou prepara o território para eventos extremos.", "ambiental", "Mudanças climáticas", "#1AB394"],
    ["Proteção do Cerrado", "Conserva vegetação nativa, nascentes e áreas de recarga hídrica.", "ambiental", "Biodiversidade", "#23A6A8"],
    ["Gestão de resíduos", "Coleta seletiva, reciclagem e destinação correta de resíduos.", "ambiental", "Gestão de resíduos", "#8B5E3C"],
    ["Uso eficiente da água e da energia", "Reduz perdas e consumo na produção e na operação dos serviços.", "ambiental", "Eficiência no uso de recursos", "#1C84C6"],
    ["Igualdade de gênero", "Enfrenta desigualdade e violência contra a mulher.", "social", "Igualdade de gênero", "#E0559A"],
    ["Inclusão de pessoas com deficiência", "Garante acessibilidade e acesso a serviços e ao trabalho.", "social", "Inclusão social", "#7266BA"],
    ["Direitos humanos", "Protege direitos de grupos historicamente excluídos.", "social", "Direitos humanos", "#ED5565"],
    ["Trabalho e geração de renda", "Qualifica, forma e abre vagas, com foco em jovens e em quem está fora do mercado.", "social", "Trabalho e emprego", "#E08E1B"],
    ["Famílias em vulnerabilidade", "Atende famílias de baixa renda e em risco social.", "social", "Proteção a grupos vulneráveis", "#6C757D"],
    ["Integridade pública", "Previne fraude, conflito de interesses e desvio de conduta.", "governanca", "Integridade pública", "#343A40"],
    ["Prestação de contas", "Mostra à sociedade e aos órgãos de controle o que foi feito e com quanto.", "governanca", "Prestação de contas", "#1C84C6"],
    ["Decisão baseada em evidências", "A escolha da ação parte de diagnóstico, dados e avaliação anterior.", "governanca", "Políticas baseadas em evidências", "#1AB394"],
];

/* ---------- grupos populacionais ---------- */
const ESTIMATIVAS = {
    "pop-1": "4,1 milhões de pessoas", "pop-2": "700 mil crianças", "pop-3": "420 mil famílias", "pop-4": "1,4 milhão de pessoas",
    "pop-5": "180 mil pessoas", "pop-6": "1,0 milhão de pessoas", "pop-7": "1,3 milhão de pessoas", "pop-8": "650 mil pessoas",
    "pop-9": "2,2 milhões de pessoas", "pop-10": "7,3 milhões de pessoas", "pop-11": "720 mil pessoas", "pop-12": "6,5 milhões de pessoas",
    "pop-13": "125 mil estabelecimentos", "pop-14": "7,3 milhões de pessoas", "pop-15": "7,3 milhões de pessoas", "pop-16": "90 mil estabelecimentos",
    "pop-17": "145 mil pessoas", "pop-18": "510 mil famílias", "pop-19": "4,3 milhões de pessoas", "pop-20": "1.800 adolescentes",
    "pop-21": "28 mil pessoas", "pop-22": "4,9 milhões de pessoas", "pop-23": "1,2 milhão de pessoas", "pop-24": "7,3 milhões de pessoas",
    "pop-25": "7,3 milhões de pessoas", "pop-26": "78 mil servidores",
};

const metasDoIndicador = (ind, valores) =>
    ANOS_PLANO.map((ano, i) => ({
        id: `meta-${ind.id}-${ano}`,
        referencia: ano,
        valor: valores[i],
        valorReferencia: "",
        responsavel: "Secretário(a) de Estado",
        orgao: ind.orgaos?.[0] ?? "",
        situacao: "Não iniciada",
    }));

function preencher(obj, campo, valor) {
    if (vazio(obj[campo])) obj[campo] = valor;
}

/** Completa os cadastros de demonstração. Idempotente: roda uma vez e só toca no que está vazio. */
export function enriquecerCadastros(base) {
    if (base.cadastrosEnriquecidos === 1) return;
    base.cadastrosEnriquecidos = 1;

    // Indicadores, subcausas e grupos populacionais de demonstração valem para qualquer plano: os Problemas e as
    // Causas do plano vigente já apontam para eles, e a lista do plano vigente aparecia vazia. Sem `ppaId`, o
    // registro aparece em todo plano (o mesmo critério dos marcadores de exemplo).
    const doSeed = { indicadores: /^in-\d+$/, subcausas: /^sc-\d+$/, populacoes: /^pop-\d+$/ };
    for (const [colecao, padrao] of Object.entries(doSeed)) {
        for (const r of base[colecao] ?? []) if (padrao.test(r.id)) r.ppaId = "";
    }

    for (const ind of base.indicadores ?? []) {
        const impacto = METAS_IMPACTO[ind.id];
        if (impacto) {
            preencher(ind, "tipo", "Impacto");
            preencher(ind, "linhaBase", impacto[0]);
            if (vazio(ind.metas)) ind.metas = metasDoIndicador(ind, impacto.slice(1));
            continue;
        }
        const r = RESULTADO[ind.id];
        if (!r) continue;
        const [descricao, formula, polaridade, periodicidade, fonte, orgao, metas] = r;
        preencher(ind, "descricao", descricao);
        preencher(ind, "formula", formula);
        preencher(ind, "polaridade", polaridade);
        preencher(ind, "periodicidade", periodicidade);
        preencher(ind, "fonte", fonte);
        preencher(ind, "abrangencia", "Estadual");
        preencher(ind, "orgaos", [orgao]);
        preencher(ind, "dataLinhaBase", "2026-12-31");
        preencher(ind, "responsavelTecnico", "Equipe de monitoramento do órgão");
        if (vazio(ind.metas)) ind.metas = metasDoIndicador(ind, metas);
    }

    const marcadores = base.marcadores ?? (base.marcadores = []);
    for (const m of marcadores) {
        const c = MARCADORES_CLASSIFICADOS[m.id];
        if (c) {
            preencher(m, "dimensao", c[0]);
            preencher(m, "tipo", c[1]);
        }
    }
    const criadoEm = new Date().toLocaleDateString("pt-BR");
    MARCADORES_NOVOS.forEach(([nome, descricao, dimensao, tipo, cor], i) => {
        const id = `marcadores-ex${51 + i}`;
        if (marcadores.some((m) => m.id === id)) return;
        marcadores.push({ id, nome, descricao, dimensao, tipo, cor, dono: "admin-central", ppaId: "", criadoEm });
    });

    for (const p of base.populacoes ?? []) {
        if (ESTIMATIVAS[p.id]) preencher(p, "estimativa", ESTIMATIVAS[p.id]);
    }
}
