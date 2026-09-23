/**
 * Programas do PPA 2024–2027 do Estado de Goiás.
 *
 * Extraídos do Projeto de Lei do PPA — eixo, objetivo estratégico, código,
 * nome, descrição e órgão são **os oficiais**. O que o PL não traz em forma de
 * cadastro — problema central, evidências, causas e consequências — foi escrito
 * a partir do Diagnóstico Socioeconômico do próprio documento, que é onde os
 * números do Estado estão.
 *
 * Fonte: Projeto de Lei do PPA 2024–2027, Anexo Único e seção 3.1 (Diagnóstico
 * Socioeconômico). https://ppa.go.gov.br/
 *
 * Os valores financeiros e as metas do protótipo continuam sendo de
 * demonstração: o PL traz o montante por programa, não a Ação Orçamentária de
 * cada Entrega, que é de onde o SIPLAM tira o dinheiro.
 */

/**
 * Os dez Programas que o protótipo já tinha, realocados nos eixos e objetivos
 * reais. Eles carregam as Iniciativas e Entregas, e por isso não foram
 * substituídos — ganharam o código e o lugar que têm no plano de verdade.
 */
export const ESTRUTURA_REAL = {
    "pg-saude": { codigo: "1043", eixo: "Goiás da Saúde Integral", objetivo: "Vida saudável, longevidade e humanização" },
    "pg-infancia": { codigo: "1040", eixo: "Goiás Social", objetivo: "Proteção social" },
    "pg-fome": { codigo: "1041", eixo: "Goiás Social", objetivo: "Proteção social" },
    "pg-juventude": { codigo: "1052", eixo: "Goiás Social", objetivo: "Proteção social" },
    "pg-cidades": { codigo: "1050", eixo: "Goiás da Infraestrutura Social e Econômica", objetivo: "Infraestrutura para famílias" },
    "pg-idoso": { codigo: "1042", eixo: "Goiás Social", objetivo: "Proteção social" },
    "pg-regional": { codigo: "1054", eixo: "Goiás do Desenvolvimento Econômico e Sustentável", objetivo: "Ambiente atrativo" },
    "pg-seguranca": { codigo: "1051", eixo: "Goiás da Segurança Pública e Justiça", objetivo: "Segurança e proteção" },
    "pg-cultura": { codigo: "1026", eixo: "Goiás Social", objetivo: "Proteção social" },
    "pg-digital": { codigo: "1049", eixo: "Goiás da Inovação, Ciência e Tecnologia", objetivo: "Inovação" },
};

const SEDUC = "Secretaria de Estado da Educação";
const SEINFRA = "Secretaria de Estado da Infraestrutura";
const SEMAD = "Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável";
const SEDS = "Secretaria de Estado de Desenvolvimento Social";
const SSP = "Secretaria de Estado de Segurança Pública";
const SEAD = "Secretaria de Estado da Administração";
const SIC = "Secretaria de Estado de Indústria, Comércio e Serviços";
const SEAPA = "Secretaria de Estado de Agricultura, Pecuária e Abastecimento";
const SGG = "Secretaria-Geral da Governadoria";
const CGE = "Controladoria-Geral do Estado";
const SEEL = "Secretaria de Estado de Esporte e Lazer";

/** Os demais Programas do plano, sem contribuição de órgão ainda recebida. */
export const PROGRAMAS_PPA = [
    {
        id: "pg-educacao",
        codigo: "1008",
        nome: "Educação que Queremos",
        eixo: "Goiás da Educação Plena",
        objetivoEstrategico: "Educação para cidadania",
        orgaoCoordenador: SEDUC,
        problema:
            "Desigualdade de acesso e de aprendizagem na educação básica, com abandono escolar voltando a crescer e analfabetismo concentrado na população adulta.",
        evidencias: [
            "A taxa de abandono escolar no 9º ano e no Ensino Médio interrompeu a queda em 2022 e voltou a crescer.",
            "O IDEB dos Anos Iniciais da rede estadual foi 6,1 em 2021 e o dos Anos Finais, 5,3 — o melhor do país nesta etapa.",
        ],
        causas: [
            { id: "c1", texto: "Abandono escolar concentrado no Ensino Médio" },
            { id: "c2", texto: "Defasagem de aprendizagem acumulada na pandemia" },
            { id: "c3", texto: "Analfabetismo persistente na população de 15 anos ou mais" },
        ],
        consequencias: ["Perda de rendimento ao longo da vida", "Reprodução da desigualdade entre gerações"],
        populacaoAfetada: "Estudantes da rede estadual e população adulta não alfabetizada",
        objetivo: "Garantir acesso e melhorar a qualidade do ensino e da aprendizagem em todos os níveis da educação básica.",
        resultadoEsperado: "Acesso à educação de qualidade, com equidade e respeito às diferentes situações socioeconômicas da população goiana.",
        indicadores: [
            { nome: "Índice de Desenvolvimento da Educação Básica (IDEB)", unidade: "Unidade", linhaBase: "6,1", meta: "6,5" },
            { nome: "Taxa de abandono escolar", unidade: "Percentual", linhaBase: "4,2%", meta: "2,5%" },
        ],
    },
    {
        id: "pg-mobilidade",
        codigo: "1003",
        nome: "Cidades Inteligentes e Mobilidade Urbana Eficiente",
        eixo: "Goiás da Infraestrutura Social e Econômica",
        objetivoEstrategico: "Infraestrutura para famílias",
        orgaoCoordenador: SGG,
        problema:
            "Infraestrutura urbana de mobilidade e de acesso digital desigual entre os municípios, concentrada na Região Metropolitana.",
        evidencias: [
            "O tempo de deslocamento casa–trabalho na Região Metropolitana de Goiânia está entre os mais altos do Centro-Oeste.",
            "Municípios de pequeno porte não dispõem de equipe técnica para elaborar o projeto que daria acesso ao recurso estadual.",
        ],
        causas: [
            { id: "c1", texto: "Concentração da oferta de transporte coletivo na Região Metropolitana" },
            { id: "c2", texto: "Baixa capacidade técnica municipal para projetos de mobilidade" },
        ],
        consequencias: ["Tempo de deslocamento elevado", "Desigualdade de acesso a serviços entre municípios"],
        populacaoAfetada: "População urbana dos municípios goianos",
        objetivo: "Celebrar parcerias com os municípios para melhorar e manter a infraestrutura de mobilidade e de acesso à informação digital.",
        resultadoEsperado: "Infraestrutura urbana de mobilidade ampliada e mantida em parceria com os municípios.",
        indicadores: [{ nome: "Municípios com projeto de mobilidade apoiado", unidade: "Município atendido", linhaBase: "38", meta: "120" }],
    },
    {
        id: "pg-rotas",
        codigo: "1055",
        nome: "Rotas da Produção",
        eixo: "Goiás da Infraestrutura Social e Econômica",
        objetivoEstrategico: "Infraestrutura para negócios",
        orgaoCoordenador: SEINFRA,
        problema:
            "Condições da malha viária estadual limitam o escoamento da produção e elevam o custo do frete nas regiões mais distantes.",
        evidencias: [
            "A avaliação das rodovias goianas evoluiu nos últimos anos para as faixas 'ótimo' e 'bom', mas trechos de escoamento seguem sem pavimentação.",
            "O PIB per capita das regiões mais distantes permanece abaixo da média estadual.",
        ],
        causas: [
            { id: "c1", texto: "Trechos prioritários de escoamento sem pavimentação" },
            { id: "c2", texto: "Sinalização e conservação insuficientes na malha estadual" },
        ],
        consequencias: ["Custo logístico elevado", "Perda de competitividade da produção regional"],
        populacaoAfetada: "Produtores rurais e indústrias do interior do Estado",
        objetivo: "Melhorar a infraestrutura de negócios, com atenção especial às rotas de escoamento da produção.",
        resultadoEsperado: "Malha viária estadual com melhores condições de trafegabilidade e sinalização.",
        indicadores: [{ nome: "Rodovias estaduais em condição boa ou ótima", unidade: "Percentual", linhaBase: "62,0%", meta: "80,0%" }],
    },
    {
        id: "pg-energia",
        codigo: "1029",
        nome: "Matriz Energética de Goiás",
        eixo: "Goiás da Infraestrutura Social e Econômica",
        objetivoEstrategico: "Infraestrutura para negócios",
        orgaoCoordenador: SEINFRA,
        problema: "Dependência de poucas fontes na matriz energética estadual, com transmissão e distribuição limitando a expansão produtiva.",
        evidencias: [
            "A capacidade de geração de energia solar fotovoltaica cresceu de forma acelerada entre 2015 e 2022, partindo de uma base muito baixa.",
        ],
        causas: [
            { id: "c1", texto: "Baixa diversificação das fontes de geração" },
            { id: "c2", texto: "Gargalos de transmissão nas regiões produtoras" },
        ],
        consequencias: ["Custo de energia elevado para a indústria", "Restrição à instalação de novas plantas"],
        populacaoAfetada: "Consumidores e setor produtivo do Estado",
        objetivo: "Diversificar e aumentar a eficiência da matriz energética, na geração, transmissão, distribuição e comercialização.",
        resultadoEsperado: "Matriz energética mais diversificada e eficiente.",
        indicadores: [{ nome: "Capacidade de geração de energia solar", unidade: "Unidade", linhaBase: "1.480.000 kW", meta: "3.000.000 kW" }],
    },
    {
        id: "pg-recursos-naturais",
        codigo: "1011",
        nome: "Gestão e Desenvolvimento Sustentável de Recursos Naturais",
        eixo: "Goiás do Desenvolvimento Econômico e Sustentável",
        objetivoEstrategico: "Meio ambiente",
        orgaoCoordenador: SEMAD,
        problema: "Pressão sobre o Cerrado e a Mata Atlântica, com queimadas recorrentes e gestão ambiental fragmentada entre Estado e municípios.",
        evidencias: [
            "As áreas de cicatrizes de queimadas em Goiás somaram 302 mil hectares em 2022, 2,68% do total do Centro-Oeste.",
            "O Índice de Recuperação de Resíduos do Estado foi de 1,30% em 2019, 12ª posição no ranking nacional.",
        ],
        causas: [
            { id: "c1", texto: "Queimadas recorrentes no período seco" },
            { id: "c2", texto: "Gestão ambiental fragmentada entre Estado e municípios" },
            { id: "c3", texto: "Baixa recuperação de resíduos sólidos" },
        ],
        consequencias: ["Perda de cobertura vegetal nativa", "Agravamento de doenças respiratórias no período seco"],
        populacaoAfetada: "População do Estado e produtores rurais",
        objetivo: "Integrar a gestão entre Estado e municípios para a preservação da natureza goiana e o desenvolvimento sustentável.",
        resultadoEsperado: "Gestão ambiental integrada, com redução da área queimada e aumento da recuperação de resíduos.",
        indicadores: [
            { nome: "Área de cicatrizes de queimadas", unidade: "Unidade", linhaBase: "302.000 ha", meta: "200.000 ha" },
            { nome: "Índice de Recuperação de Resíduos (IRR)", unidade: "Percentual", linhaBase: "1,30%", meta: "3,00%" },
        ],
    },
    {
        id: "pg-agro",
        codigo: "1035",
        nome: "O Agro é de Todos",
        eixo: "Goiás do Desenvolvimento Econômico e Sustentável",
        objetivoEstrategico: "Ambiente atrativo",
        orgaoCoordenador: SEAPA,
        problema: "Cadeias produtivas agropecuárias com estrutura rural desigual e defesa agropecuária a modernizar.",
        evidencias: ["A agricultura familiar responde por parcela pequena da compra institucional do Estado."],
        causas: [
            { id: "c1", texto: "Estrutura rural insuficiente para a agricultura familiar" },
            { id: "c2", texto: "Defesa agropecuária com processos não modernizados" },
        ],
        consequencias: ["Perda de renda no campo", "Risco sanitário para o rebanho estadual"],
        populacaoAfetada: "Produtores rurais, com foco na agricultura familiar",
        objetivo: "Estruturar e fomentar cadeias produtivas agropecuárias e modernizar as ações de defesa agropecuária.",
        resultadoEsperado: "Cadeias produtivas agropecuárias estruturadas e defesa agropecuária modernizada.",
        indicadores: [{ nome: "Compra institucional da agricultura familiar", unidade: "Percentual", linhaBase: "12,0%", meta: "30,0%" }],
    },
    {
        id: "pg-turismo",
        codigo: "1028",
        nome: "Mais Turismo",
        eixo: "Goiás do Desenvolvimento Econômico e Sustentável",
        objetivoEstrategico: "Ambiente atrativo",
        orgaoCoordenador: SIC,
        problema: "Potencial turístico do Estado pouco estruturado, com baixa participação do turismo no emprego formal.",
        evidencias: ["O emprego no turismo representou 3,67% do emprego formal de Goiás em 2021."],
        causas: [
            { id: "c1", texto: "Sinalização e divulgação turística insuficientes" },
            { id: "c2", texto: "Baixa qualificação da mão de obra do setor" },
        ],
        consequencias: ["Permanência curta do visitante", "Baixa geração de renda nos destinos"],
        populacaoAfetada: "Trabalhadores e empreendedores do setor de turismo",
        objetivo: "Estruturar e fomentar as atividades turísticas, qualificando o mercado e o potencial turístico do Estado.",
        resultadoEsperado: "Mercado turístico qualificado e melhor divulgado.",
        indicadores: [{ nome: "Emprego formal na área do turismo", unidade: "Percentual", linhaBase: "3,67%", meta: "5,00%" }],
    },
    {
        id: "pg-moradia",
        codigo: "1032",
        nome: "Moradia como Base da Cidadania",
        eixo: "Goiás Social",
        objetivoEstrategico: "Proteção social",
        orgaoCoordenador: SEDS,
        problema: "Déficit habitacional persistente, com famílias comprometendo parcela excessiva da renda com aluguel.",
        evidencias: ["O ônus excessivo com aluguel é a dimensão predominante do déficit habitacional goiano, acima de 24% no período recente."],
        causas: [
            { id: "c1", texto: "Ônus excessivo com aluguel entre famílias de baixa renda" },
            { id: "c2", texto: "Irregularidade fundiária em áreas ocupadas" },
        ],
        consequencias: ["Insegurança habitacional", "Ocupação de áreas de risco"],
        populacaoAfetada: "Famílias de baixa renda em áreas urbanas",
        objetivo: "Manter políticas públicas de habitação e fomentar a construção habitacional de interesse social.",
        resultadoEsperado: "Famílias atendidas por política habitacional e regularização fundiária.",
        indicadores: [{ nome: "Dimensões do déficit habitacional", unidade: "Percentual", linhaBase: "24,9%", meta: "18,0%" }],
    },
    {
        id: "pg-igualdade",
        codigo: "1044",
        nome: "Somos Todos Iguais",
        eixo: "Goiás Social",
        objetivoEstrategico: "Proteção social",
        orgaoCoordenador: SEDS,
        problema: "Violência e discriminação contra mulheres, população negra e LGBTQIA+, com registros em forte crescimento.",
        evidencias: [
            "A lesão corporal dolosa por violência doméstica cresceu 2,6% em 2022, passando de 11.200 casos, e o feminicídio cresceu 2,4%.",
            "Entre 2021 e 2022 os registros de racismo cresceram 246%, injúria racial 48% e homofobia/transfobia 163%.",
        ],
        causas: [
            { id: "c1", texto: "Subnotificação histórica dos crimes de ódio" },
            { id: "c2", texto: "Rede de acolhimento concentrada na capital" },
        ],
        consequencias: ["Reincidência da violência doméstica", "Afastamento da vítima dos serviços públicos"],
        populacaoAfetada: "Mulheres, população negra, comunidades tradicionais e população LGBTQIA+",
        objetivo: "Prevenir e reprimir a discriminação e a violência, garantindo os direitos assegurados a esses grupos.",
        resultadoEsperado: "Rede de proteção ampliada e registros qualificados.",
        indicadores: [{ nome: "Notificações de violência doméstica", unidade: "Unidade", linhaBase: "11.200", meta: "—" }],
    },
    {
        id: "pg-socioeducativo",
        codigo: "1053",
        nome: "Nova Chance aos Jovens",
        eixo: "Goiás Social",
        objetivoEstrategico: "Proteção social",
        orgaoCoordenador: SEDS,
        problema: "Atendimento ao adolescente em cumprimento de medida socioeducativa aquém do previsto no ECA e no SINASE.",
        evidencias: ["O Estatuto da Criança e do Adolescente e a Lei 12.594/2012 estabelecem parâmetros de atendimento ainda não alcançados."],
        causas: [
            { id: "c1", texto: "Unidades socioeducativas acima da capacidade" },
            { id: "c2", texto: "Ausência de acompanhamento após o cumprimento da medida" },
        ],
        consequencias: ["Reincidência", "Interrupção da trajetória escolar"],
        populacaoAfetada: "Adolescentes em cumprimento de medida socioeducativa",
        objetivo: "Melhorar o atendimento aos internos do sistema socioeducativo estadual.",
        resultadoEsperado: "Atendimento socioeducativo alinhado ao SINASE.",
        indicadores: [{ nome: "Adolescentes com acompanhamento pós-medida", unidade: "Percentual", linhaBase: "—", meta: "60,0%" }],
    },
    {
        id: "pg-justica",
        codigo: "1007",
        nome: "Defesa da Sociedade",
        eixo: "Goiás da Segurança Pública e Justiça",
        objetivoEstrategico: "Justiça",
        orgaoCoordenador: SSP,
        problema: "Acesso desigual à justiça e superlotação do sistema prisional.",
        evidencias: [
            "O índice de acesso à justiça estadual de Goiás foi 0,658 em 2022, 8ª melhor colocação entre os tribunais do país.",
            "A população privada de liberdade era de 21.428 pessoas em 2022, com 34,7% de presos provisórios.",
        ],
        causas: [
            { id: "c1", texto: "Elevada proporção de presos provisórios" },
            { id: "c2", texto: "Déficit de vagas no sistema prisional" },
            { id: "c3", texto: "Assistência jurídica concentrada nos grandes centros" },
        ],
        consequencias: ["Superlotação", "Reincidência após o cumprimento da pena"],
        populacaoAfetada: "População privada de liberdade e pessoas sem assistência jurídica",
        objetivo: "Democratizar o acesso à justiça e melhorar a gestão do sistema prisional.",
        resultadoEsperado: "Acesso à justiça ampliado e déficit de vagas reduzido.",
        indicadores: [{ nome: "Índice de Acesso à Justiça", unidade: "Unidade", linhaBase: "0,658", meta: "0,720" }],
    },
    {
        id: "pg-transito",
        codigo: "1036",
        nome: "Trânsito Seguro",
        eixo: "Goiás da Segurança Pública e Justiça",
        objetivoEstrategico: "Segurança e proteção",
        orgaoCoordenador: SSP,
        problema: "Mortalidade no trânsito acima da média nacional, com concentração em rodovias estaduais.",
        evidencias: ["Goiás registrou 23,17 óbitos por 100 mil habitantes em acidentes de trânsito em 2021."],
        causas: [
            { id: "c1", texto: "Educação para o trânsito com alcance limitado" },
            { id: "c2", texto: "Sinalização deficiente em trechos de maior risco" },
        ],
        consequencias: ["Mortes evitáveis", "Custo hospitalar e previdenciário"],
        populacaoAfetada: "Condutores e pedestres do Estado",
        objetivo: "Desenvolver a estrutura para educação e segurança no trânsito e facilitar o acesso aos serviços do DETRAN.",
        resultadoEsperado: "Redução da mortalidade em acidentes de trânsito.",
        indicadores: [{ nome: "Mortes por acidente de trânsito", unidade: "Unidade", linhaBase: "23,17", meta: "16,00" }],
    },
    {
        id: "pg-esporte",
        codigo: "1027",
        nome: "Esporte Transformando Vidas",
        eixo: "Goiás da Saúde Integral",
        objetivoEstrategico: "Convívio e inclusão",
        orgaoCoordenador: SEEL,
        problema: "Oferta de atividade desportiva concentrada, com pouco alcance entre pessoas com deficiência e em vulnerabilidade social.",
        evidencias: ["O sedentarismo é fator de risco para as doenças crônicas que pesam na mortalidade por causas evitáveis."],
        causas: [
            { id: "c1", texto: "Equipamentos esportivos concentrados nos grandes centros" },
            { id: "c2", texto: "Ausência de oferta adaptada para pessoas com deficiência" },
        ],
        consequencias: ["Sedentarismo", "Perda de espaço de convívio comunitário"],
        populacaoAfetada: "População em vulnerabilidade social e pessoas com deficiência",
        objetivo: "Ofertar atividades desportivas à população, incluindo iniciativas para grupos em vulnerabilidade.",
        resultadoEsperado: "Oferta desportiva ampliada e mais inclusiva.",
        indicadores: [{ nome: "Municípios com oferta desportiva continuada", unidade: "Município atendido", linhaBase: "42", meta: "120" }],
    },
    {
        id: "pg-gestao",
        codigo: "1048",
        nome: "Goiás da Gestão Transformadora",
        eixo: "Goiás de Gestão Responsável e Transformadora",
        objetivoEstrategico: "Atendimento de excelência",
        orgaoCoordenador: SEAD,
        problema: "Sistemas estruturantes de governo sem integração, o que obriga o cidadão a informar o mesmo dado várias vezes.",
        evidencias: ["Goiás ocupou a 5ª posição entre as 27 unidades federativas no Índice de Transparência e Governança Pública."],
        causas: [
            { id: "c1", texto: "Sistemas estruturantes sem integração" },
            { id: "c2", texto: "Infraestrutura tecnológica desatualizada em parte dos órgãos" },
        ],
        consequencias: ["Retrabalho entre órgãos", "Dados divergentes sobre o mesmo cidadão"],
        populacaoAfetada: "Cidadãos e servidores do Estado",
        objetivo: "Melhorar a eficiência do Estado pela modernização da infraestrutura e integração entre órgãos.",
        resultadoEsperado: "Sistemas estruturantes integrados e infraestrutura modernizada.",
        indicadores: [{ nome: "Índice de Transparência e Governança Pública", unidade: "Unidade", linhaBase: "5º lugar", meta: "3º lugar" }],
    },
    {
        id: "pg-compliance",
        codigo: "1047",
        nome: "Compliance, Controle e Participação Social",
        eixo: "Goiás de Gestão Responsável e Transformadora",
        objetivoEstrategico: "Confiança e controle social",
        orgaoCoordenador: CGE,
        problema: "Participação social na Administração Pública ainda restrita, com canais de controle pouco conhecidos pelo cidadão.",
        evidencias: ["O Índice de Transparência e Governança Pública avalia os entes em escala de 0 a 100 pontos."],
        causas: [
            { id: "c1", texto: "Canais de participação pouco divulgados" },
            { id: "c2", texto: "Programa de integridade em implantação desigual entre os órgãos" },
        ],
        consequencias: ["Baixa confiança no serviço público", "Risco de integridade não tratado"],
        populacaoAfetada: "Cidadãos e órgãos da Administração estadual",
        objetivo: "Promover a transparência das ações da Administração Pública e a participação social.",
        resultadoEsperado: "Programa de compliance implantado e participação social ampliada.",
        indicadores: [{ nome: "Órgãos com programa de integridade implantado", unidade: "Percentual", linhaBase: "38,0%", meta: "100,0%" }],
    },
    {
        id: "pg-servidor",
        codigo: "1025",
        nome: "M.O.V.E. Goiás",
        eixo: "Goiás de Gestão Responsável e Transformadora",
        objetivoEstrategico: "Servidor público",
        orgaoCoordenador: SEAD,
        problema: "Quadro de servidores com reposição insuficiente e oferta de capacitação desigual entre os órgãos.",
        evidencias: ["A modernização da gestão depende de servidores capacitados nos sistemas estruturantes do Estado."],
        causas: [
            { id: "c1", texto: "Reposição de quadro abaixo das aposentadorias" },
            { id: "c2", texto: "Oferta de capacitação desigual entre os órgãos" },
        ],
        consequencias: ["Perda de memória institucional", "Dependência de contratos temporários"],
        populacaoAfetada: "Servidores do Poder Executivo estadual",
        objetivo: "Modernizar a gestão pública e valorizar, capacitar e engajar os servidores estaduais.",
        resultadoEsperado: "Servidores capacitados e gestão modernizada.",
        indicadores: [{ nome: "Servidores capacitados no ano", unidade: "Profissional capacitado", linhaBase: "4.200", meta: "12.000" }],
    },
];
