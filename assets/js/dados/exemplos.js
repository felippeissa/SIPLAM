/**
 * Conteúdo de demonstração dos Cadastros Estratégicos.
 *
 * A estrutura é a do **PPA 2024–2027 do Estado de Goiás**: os oito eixos, os
 * catorze objetivos estratégicos e os programas são os do Projeto de Lei, e os
 * números das evidências vêm do Diagnóstico Socioeconômico do mesmo documento.
 *
 * Fonte: https://ppa.go.gov.br/ — Projeto de Lei do PPA 2024–2027, Anexo Único
 * e seção 3.1. Os indicadores reproduzem os 27 indicadores socioeconômicos que
 * o PL acompanha por eixo.
 *
 * O que **não** é oficial: metas por ano, valores por Entrega e a atribuição de
 * subcausas às causas. O PL não desce a esse nível — ele traz o montante por
 * programa, e o SIPLAM tira o dinheiro da Ação Orçamentária de cada Entrega.
 */

/** Os quatro ciclos: dois encerrados, um em execução e o que está sendo feito. */
export const PPAS = [
    {
        id: "ppa-2016",
        nome: "Plano Plurianual 2016–2019",
        primeiroAno: "2016",
        ultimoAno: "2019",
        descricao:
            "Ciclo encerrado, anterior à metodologia hoje em uso. Foi elaborado antes de o Estado adotar o " +
            "alinhamento estratégico por problema, resultado e solução, e por isso seus programas não se " +
            "comparam diretamente com os dos planos seguintes. Permanece no sistema para consulta, " +
            "prestação de contas e comparação histórica de séries de indicadores.",
        situacao: "encerrado",
        processoSei: "201400006000221",
    },
    {
        id: "ppa-2020",
        nome: "Plano Plurianual 2020–2023",
        primeiroAno: "2020",
        ultimoAno: "2023",
        descricao:
            "Instituído pela Lei estadual nº 20.755, de 28 de janeiro de 2020, e atualizado pela Lei nº 20.935. " +
            "Organizou a ação do Estado em oito eixos estratégicos — Goiás da responsabilidade fiscal, Goiás na " +
            "saúde integral, Goiás da educação plena, Goiás da paz, Goiás de inclusão, Goiás da infraestrutura " +
            "sustentável, Goiás do desenvolvimento econômico e Goiás da governança — desdobrados em 54 programas. " +
            "Foi o primeiro ciclo a partir do Plano de Governo com metodologia de alinhamento estratégico, " +
            "identificando problema, resultado esperado e solução antes de definir o programa. Ciclo encerrado, " +
            "mantido para consulta e para a comparação com o plano em execução.",
        situacao: "encerrado",
        processoSei: "201800006000745",
    },
    {
        id: "ppa-2024",
        nome: "Plano Plurianual 2024–2027",
        primeiroAno: "2024",
        ultimoAno: "2027",
        descricao:
            "Plano em execução, com previsão de R$ 45 bilhões em políticas públicas ao longo do quadriênio. " +
            "Lei de iniciativa do Poder Executivo, nos termos dos arts. 110 e 110-A da Constituição Estadual e do " +
            "art. 165 da Constituição Federal, vinculada às leis orçamentárias pelos arts. 5º e 16 da Lei de " +
            "Responsabilidade Fiscal.\n\n" +
            "O princípio orientador é o foco na gestão por resultados diante das restrições fiscais. Os programas " +
            "foram concebidos para ser transversais e intersetoriais — não circunscritos às competências de um " +
            "único órgão, e preferencialmente com iniciativas de mais de uma organização. Cada programa se propõe " +
            "a resolver um problema e precisa estar vinculado a pelo menos um indicador, de preferência do rol " +
            "acompanhado pelo Instituto Mauro Borges.\n\n" +
            "A ação do Estado está organizada em oito eixos estratégicos: Goiás Social, Goiás da Saúde Integral, " +
            "Goiás da Educação Plena, Goiás da Segurança Pública e Justiça, Goiás do Desenvolvimento Econômico e " +
            "Sustentável, Goiás da Infraestrutura Social e Econômica, Goiás da Inovação, Ciência e Tecnologia e " +
            "Goiás de Gestão Responsável e Transformadora. São catorze objetivos estratégicos, que desdobram os " +
            "eixos, e os programas que deles decorrem.\n\n" +
            "Outras premissas do ciclo: estímulo à participação social, aderência ao Plano de Governo, vinculação " +
            "da ação orçamentária ao produto, camadas de Inovação e Continuidade, e equilíbrio entre " +
            "responsabilidade fiscal e responsabilidade social.",
        situacao: "vigente",
        processoSei: "202200006000914",
    },
    {
        id: "ppa-2028",
        nome: "Plano Plurianual 2028–2031",
        primeiroAno: "2028",
        ultimoAno: "2031",
        descricao:
            "Ciclo em elaboração, a ser encaminhado à Assembleia Legislativa no ano anterior ao início da " +
            "vigência, como determina a Constituição Estadual. Parte da base construída em 2024–2027: os " +
            "programas do plano vigente são o ponto de partida, e a revisão se concentra no que o diagnóstico " +
            "socioeconômico indicar como prioridade para o novo quadriênio.\n\n" +
            "Mantém o foco na gestão por resultados e a exigência de que todo programa enfrente um problema " +
            "identificado e esteja vinculado a pelo menos um indicador. A construção é feita pelos órgãos " +
            "setoriais, que enviam suas contribuições — iniciativas e entregas, com metas por ano do ciclo — " +
            "para análise e consolidação pela Área Central.\n\n" +
            "Os valores previstos ainda não estão fechados: o financeiro do plano é a soma das Ações " +
            "Orçamentárias vinculadas às Entregas, e cresce conforme as contribuições dos órgãos são validadas.",
        situacao: "elaboracao",
        // Número do processo no SEI. Vem de lá, não daqui.
        processoSei: "202600006001287",
    },
];

/** Os oito eixos do plano. */
export const DESCRICOES_EIXO = {
    "Goiás Social":
        "Proteção social, habitação, cultura e enfrentamento às desigualdades — o que ampara quem depende do Estado para viver com dignidade.",
    "Goiás da Saúde Integral":
        "Acesso ao SUS com equidade, longevidade e convívio: da atenção primária ao esporte como política de saúde.",
    "Goiás da Educação Plena":
        "Acesso e aprendizagem na educação básica e superior, com equidade entre as regiões e as condições socioeconômicas.",
    "Goiás da Segurança Pública e Justiça":
        "Segurança, proteção e acesso à justiça, incluindo o sistema prisional e a segurança no trânsito.",
    "Goiás do Desenvolvimento Econômico e Sustentável":
        "Ambiente de negócios, agronegócio, turismo e meio ambiente — crescer sem consumir o Cerrado.",
    "Goiás da Infraestrutura Social e Econômica":
        "Saneamento, mobilidade, energia e rodovias: a base física de que dependem as famílias e a produção.",
    "Goiás da Inovação, Ciência e Tecnologia":
        "Pesquisa, transformação digital e conectividade como motor de produtividade do Estado.",
    "Goiás de Gestão Responsável e Transformadora":
        "Modernização do próprio Estado: sistemas, integridade, controle social e valorização do servidor.",
};

/** Os catorze objetivos estratégicos, cada um dentro de um eixo. */
export const DESCRICOES_OBJETIVO = {
    "Proteção social":
        "Amparar quem está em vulnerabilidade, com renda, acolhimento, moradia e enfrentamento à discriminação.",
    "Vida saudável, longevidade e humanização":
        "Melhorar a qualidade e a equidade do atendimento no SUS, regionalizando o serviço e ampliando o acesso a medicamentos.",
    "Convívio e inclusão":
        "Usar o esporte e o convívio comunitário como política de saúde e de inclusão de grupos em vulnerabilidade.",
    "Educação para cidadania":
        "Garantir acesso à educação de qualidade com equidade, do ensino básico ao superior.",
    Justiça:
        "Democratizar o acesso à justiça e melhorar a gestão do sistema prisional.",
    "Segurança e proteção":
        "Modernizar e aparelhar o sistema de Segurança Pública e reduzir a mortalidade no trânsito.",
    "Ambiente atrativo":
        "Melhorar o ambiente de negócios, do agronegócio ao turismo, atraindo investimento e gerando emprego.",
    "Meio ambiente":
        "Integrar a gestão ambiental entre Estado e municípios para preservar o Cerrado e a Mata Atlântica.",
    "Infraestrutura para famílias":
        "Levar saneamento, mobilidade e acesso digital às cidades, em parceria com os municípios.",
    "Infraestrutura para negócios":
        "Melhorar rodovias, energia e logística nas rotas de escoamento da produção.",
    Inovação:
        "Disseminar a cultura de inovação e ampliar a conectividade entre os órgãos e o cidadão.",
    "Atendimento de excelência":
        "Integrar os sistemas estruturantes de governo e modernizar a infraestrutura do Estado.",
    "Confiança e controle social":
        "Promover integridade, transparência e participação social na Administração Pública.",
    "Servidor público":
        "Valorizar, capacitar e engajar o servidor como condição da modernização da gestão.",
};

/**
 * Catálogo de subcausas.
 *
 * Repare nas repetições ao longo do plano: a falta de servidor explica causas
 * de saúde, de educação e de meio ambiente. É por isso que a subcausa é cadastro
 * do sistema, e não campo de dentro da causa — guardada dentro de uma delas,
 * este mesmo texto estaria escrito dez vezes, com dez grafias.
 */
export const SUBCAUSAS = [
    ["Concurso público sem reposição de aposentadorias",
     "O quadro encolhe a cada ano sem que a reposição acompanhe, e o serviço passa a depender de contratos temporários.",
     "A modernização da gestão depende de servidores efetivos nos sistemas estruturantes do Estado."],
    ["Concentração de profissionais na Região Metropolitana",
     "O profissional formado no interior migra para a capital, onde há mais oferta e melhor remuneração.",
     "A expectativa de vida ao nascer em Goiás foi de 74,99 anos em 2021, abaixo do Centro-Oeste (76,17) e do Brasil (76,97)."],
    ["Frota de equipamentos fora do ciclo de vida",
     "Equipamento sem plano de reposição só é trocado quando quebra, e a parada nunca é programada.",
     "A mortalidade por causas evitáveis entre 5 e 74 anos subiu de 3,88 para 6,08 por mil entre 2018 e 2021."],
    ["Ausência de plano municipal de contingência",
     "Sem plano, o município só reage depois do evento, e a resposta depende de socorro estadual.",
     "As áreas de cicatrizes de queimadas somaram 302 mil hectares em Goiás em 2022."],
    ["Transporte escolar insuficiente na zona rural",
     "A vaga existe, mas o estudante não chega até ela — a distância vira desistência.",
     "A taxa de abandono escolar voltou a crescer em 2022, no 9º ano e no Ensino Médio."],
    ["Defasagem de aprendizagem acumulada na pandemia",
     "Quem passou de ano sem aprender carrega a lacuna para a etapa seguinte, e ela cresce.",
     "O IDEB dos Anos Finais da rede estadual foi 5,3 em 2021, contra 6,1 nos Anos Iniciais."],
    ["Cadastro desatualizado do público prioritário",
     "Quem não está no cadastro não é encontrado pela busca ativa, e a política não chega a ele.",
     "O Bolsa Família considera elegível quem tem renda média por membro até R$ 218,00."],
    ["Descontinuidade de contrato com fornecedores",
     "O equipamento público fecha entre um contrato e o seguinte, e o público atendido se dispersa.",
     "A interrupção de serviço é apontada como fator de perda de vínculo com o equipamento público."],
    ["Baixa capacidade técnica das equipes municipais",
     "O município não consegue elaborar o projeto que daria acesso ao recurso estadual e federal.",
     "Municípios de pequeno porte não dispõem de servidor efetivo na área de planejamento."],
    ["Sistemas sem interoperabilidade",
     "O mesmo dado é redigitado em cada sistema, e cada base passa a ter uma versão diferente da verdade.",
     "Goiás ocupou a 5ª posição entre 27 unidades federativas no Índice de Transparência e Governança Pública."],
    ["Ausência de protocolo comum de notificação",
     "Cada serviço registra de um jeito, e o que não é comparável não entra na estatística.",
     "Os registros de racismo cresceram 246% entre 2021 e 2022 — efeito de notificação, não de ocorrência."],
    ["Malha viária sem pavimentação nos trechos de escoamento",
     "O custo do frete inviabiliza a produção antes de ela chegar ao mercado.",
     "A avaliação das rodovias melhorou nos últimos anos, mas trechos de escoamento seguem sem pavimentação."],
    ["Informalidade no mercado de trabalho",
     "Sem vínculo formal, a renda oscila e a família não consegue planejar o mês.",
     "A taxa de informalidade de Goiás chegou a 36,7% no 4º trimestre de 2022."],
    ["Jovens fora da escola e fora do trabalho",
     "Quem não estuda nem trabalha perde os dois caminhos de inserção ao mesmo tempo.",
     "O percentual de jovens de 15 a 29 anos que não trabalham nem estudam é acompanhado como indicador do eixo Goiás Social."],
    ["Ônus excessivo com aluguel",
     "A família compromete parcela da renda que deveria ir para alimentação e transporte.",
     "O ônus excessivo com aluguel é a dimensão predominante do déficit habitacional goiano, acima de 24%."],
    ["Irregularidade fundiária",
     "Sem escritura, a família não acessa crédito nem programa habitacional, e a posse é frágil.",
     "A regularização fundiária figura entre os produtos previstos no programa de habitação."],
    ["Elevada proporção de presos provisórios",
     "Quem aguarda julgamento ocupa vaga do sistema sem que a pena tenha sido definida.",
     "Em 2022, 34,7% da população prisional de Goiás era de presos provisórios."],
    ["Perdas de água na distribuição",
     "A água tratada se perde antes de chegar ao consumidor, e o custo é pago por quem recebe.",
     "O Índice de Perdas de Água na Distribuição em Goiás foi de 28,5% em 2021, contra 40,3% no Brasil."],
    ["Baixa recuperação de resíduos sólidos",
     "Sem coleta seletiva abrangente, o resíduo reciclável vira aterro.",
     "O Índice de Recuperação de Resíduos de Goiás foi de 1,30% em 2019, 12ª posição no ranking nacional."],
    ["Queimadas no período seco",
     "O fogo usado no manejo escapa e consome área nativa, ano após ano.",
     "As cicatrizes de queimadas em Goiás somaram 302 mil hectares em 2022, 2,68% do Centro-Oeste."],
    ["Gargalos de transmissão de energia",
     "A geração existe, mas não chega a quem consome, e o investimento produtivo trava.",
     "A capacidade de geração solar cresceu de forma acelerada entre 2015 e 2022, exigindo transmissão compatível."],
    ["Sinalização turística e divulgação insuficientes",
     "O visitante não encontra o destino, e o destino não aparece para quem decide a viagem.",
     "O emprego no turismo representou 3,67% do emprego formal de Goiás em 2021."],
    ["Equipamentos culturais concentrados na capital",
     "O equipamento cultural se instala onde o público já tinha acesso.",
     "A capilaridade dos equipamentos culturais é objeto do programa Mais Cultura e Arte."],
    ["Rede de acolhimento concentrada nos grandes centros",
     "A vítima do interior precisa se deslocar para ser atendida, e muitas desistem.",
     "A lesão corporal dolosa por violência doméstica passou de 11.200 casos em 2022."],
    ["Unidades socioeducativas acima da capacidade",
     "Acima da capacidade, a unidade deixa de cumprir a medida e passa a apenas conter.",
     "O SINASE (Lei 12.594/2012) fixa parâmetros de atendimento ainda não alcançados."],
    ["Oferta de capacitação desigual entre os órgãos",
     "O servidor de um órgão é formado e o de outro não, e o sistema anda na velocidade do mais lento.",
     "A capacitação de servidores é eixo do programa M.O.V.E. Goiás."],
    ["Infraestrutura tecnológica desatualizada",
     "O sistema novo não roda no parque instalado, e a modernização para no meio.",
     "A modernização da infraestrutura é objeto do programa Goiás da Gestão Transformadora."],
    ["Canais de participação social pouco divulgados",
     "O canal existe, mas quem deveria usá-lo não sabe que ele existe.",
     "A promoção da participação social integra o programa de Compliance e Controle."],
    ["Defesa agropecuária com processos não modernizados",
     "A fiscalização em papel não acompanha o volume do rebanho e da safra.",
     "A modernização da defesa agropecuária é objeto do programa O Agro é de Todos."],
    ["Baixa diversificação produtiva regional",
     "A região depende de uma cadeia só, e qualquer oscilação de preço vira crise local.",
     "O PIB per capita das regiões mais distantes permanece abaixo da média estadual."],
];

/**
 * O que preenche cada causa. A chave é o texto da causa, como ele aparece no
 * Programa; o valor traz por que ela existe, o número que a sustenta e as
 * subcausas que a detalham.
 */
export const CAUSAS = {
    /* ---------- Saúde ---------- */
    "Capacidade instalada insuficiente na média e alta complexidade": {
        justificativa: "A oferta de leitos e de serviços especializados não acompanhou o crescimento populacional fora da capital.",
        evidencia: "A mortalidade por causas evitáveis entre 5 e 74 anos subiu de 3,88 para 6,08 por mil entre 2018 e 2021.",
        subcausas: ["Concentração de profissionais na Região Metropolitana", "Frota de equipamentos fora do ciclo de vida"],
    },
    "Déficit de leitos de UTI fora da região metropolitana": {
        justificativa: "O paciente grave do interior depende de transferência, e o tempo de transporte piora o desfecho.",
        evidencia: "A expectativa de vida em Goiás (74,99 anos em 2021) está abaixo do Centro-Oeste e do Brasil.",
        subcausas: ["Concentração de profissionais na Região Metropolitana"],
    },
    "Equipamentos hospitalares obsoletos": {
        justificativa: "Equipamento no fim da vida útil para com frequência e reduz a capacidade já insuficiente.",
        evidencia: "A reposição só ocorre após a falha, sem plano de ciclo de vida.",
        subcausas: ["Frota de equipamentos fora do ciclo de vida"],
    },
    "Fragilidade da atenção primária como porta de entrada": {
        justificativa: "Sem atenção primária resolutiva, o caso simples chega à urgência e ocupa a vaga do caso grave.",
        evidencia: "A proporção de nascidos vivos com sete ou mais consultas de pré-natal cresceu apenas 1,89% em Goiás nos dois últimos anos medidos.",
        subcausas: ["Concurso público sem reposição de aposentadorias"],
    },
    "Baixa cobertura de equipes de saúde da família em municípios pequenos": {
        justificativa: "O município pequeno não consegue fixar profissional, e a equipe fica incompleta por longos períodos.",
        evidencia: "A mortalidade infantil e as causas evitáveis em menores de cinco anos somaram 2,2 por mil em 2022.",
        subcausas: ["Concurso público sem reposição de aposentadorias", "Concentração de profissionais na Região Metropolitana"],
    },
    "Fragmentação da regulação assistencial": {
        justificativa: "Cada porta regula por conta própria, e a fila estadual não existe como fila única.",
        evidencia: "Sistemas de regulação em uso simultâneo, sem integração entre si.",
        subcausas: ["Sistemas sem interoperabilidade"],
    },

    /* ---------- Primeira infância ---------- */
    "Déficit de vagas em creche": {
        justificativa: "A oferta não acompanha a demanda nos municípios de maior crescimento populacional.",
        evidencia: "A taxa de escolarização por faixa etária é acompanhada como indicador do eixo Goiás da Educação Plena.",
        subcausas: ["Transporte escolar insuficiente na zona rural", "Concurso público sem reposição de aposentadorias"],
    },
    "Insuficiência de infraestrutura em municípios de médio porte": {
        justificativa: "O prédio existe, mas não comporta a ampliação de turmas nem o turno integral.",
        evidencia: "A expansão da rede depende de contrapartida municipal que a maioria não consegue oferecer.",
        subcausas: ["Baixa capacidade técnica das equipes municipais"],
    },
    "Baixa cobertura de visitação domiciliar qualificada": {
        justificativa: "Sem visita, o risco no domicílio só é identificado quando já virou agravo.",
        evidencia: "A busca ativa depende do cadastro, e parte dele está desatualizada.",
        subcausas: ["Cadastro desatualizado do público prioritário"],
    },
    "Ausência de acompanhamento intersetorial da criança": {
        justificativa: "Saúde, educação e assistência acompanham a mesma criança sem trocar informação.",
        evidencia: "Não há prontuário compartilhado entre as três áreas.",
        subcausas: ["Sistemas sem interoperabilidade"],
    },

    /* ---------- Segurança alimentar ---------- */
    "Baixa renda e informalidade no trabalho": {
        justificativa: "A renda instável não cobre a alimentação do mês, e a insegurança reaparece a cada oscilação.",
        evidencia: "A taxa de informalidade em Goiás foi de 36,7% no 4º trimestre de 2022.",
        subcausas: ["Informalidade no mercado de trabalho", "Cadastro desatualizado do público prioritário"],
    },
    "Cobertura insuficiente de equipamentos públicos de alimentação": {
        justificativa: "Os municípios de maior insegurança alimentar são justamente os sem restaurante ou cozinha comunitária.",
        evidencia: "O Índice de Pobreza caiu cerca de 32% entre 2021 e 2022, mas segue concentrado nas mesmas regiões.",
        subcausas: ["Descontinuidade de contrato com fornecedores"],
    },
    "Ausência de restaurantes comunitários no interior": {
        justificativa: "A rede se concentrou na Região Metropolitana e não alcançou o interior.",
        evidencia: "A cobertura de equipamentos públicos de alimentação é desigual entre as regiões de planejamento.",
        subcausas: [],
    },
    "Descontinuidade operacional das cozinhas comunitárias": {
        justificativa: "A unidade abre e fecha conforme o contrato, e o público atendido se dispersa a cada interrupção.",
        evidencia: "A interrupção entre contratos é apontada como fator de perda de vínculo com o equipamento.",
        subcausas: ["Descontinuidade de contrato com fornecedores"],
    },
    "Fragilidade da agricultura familiar e das cadeias curtas": {
        justificativa: "Sem compra institucional previsível, o produtor não planeja a safra seguinte.",
        evidencia: "A agricultura familiar responde por parcela pequena da compra institucional do Estado.",
        subcausas: ["Malha viária sem pavimentação nos trechos de escoamento"],
    },
    "Baixa articulação entre cadastro social e transferências": {
        justificativa: "Quem tem direito não é localizado, e quem já não precisa continua recebendo.",
        evidencia: "O Índice de Gini de Goiás foi 0,456 em 2022, o segundo menor da série 2012–2022.",
        subcausas: ["Cadastro desatualizado do público prioritário", "Sistemas sem interoperabilidade"],
    },

    /* ---------- Juventude ---------- */
    "Descompasso entre oferta de cursos e demanda das empresas": {
        justificativa: "O curso é ofertado pelo que a rede sabe ensinar, não pelo que o mercado local contrata.",
        evidencia: "O percentual de jovens que não trabalham nem estudam é indicador de acompanhamento do eixo Goiás Social.",
        subcausas: ["Jovens fora da escola e fora do trabalho"],
    },
    "Baixa cobertura de intermediação pública de emprego": {
        justificativa: "A vaga existe e o candidato existe, mas nada os aproxima.",
        evidencia: "Os postos de intermediação cobrem uma fração dos 246 municípios goianos.",
        subcausas: ["Baixa capacidade técnica das equipes municipais"],
    },
    "Dificuldade de deslocamento até os centros de qualificação": {
        justificativa: "O custo do transporte consome a renda que o curso pretende gerar.",
        evidencia: "O rendimento médio mensal de pessoas ocupadas em Goiás foi de R$ 2.833,00 no 1º trimestre de 2023.",
        subcausas: ["Transporte escolar insuficiente na zona rural"],
    },

    /* ---------- Saneamento e cidades ---------- */
    "Ocupação irregular em áreas de risco": {
        justificativa: "A ausência de alternativa habitacional empurra a ocupação para a encosta e a margem do córrego.",
        evidencia: "O ônus excessivo com aluguel é a dimensão predominante do déficit habitacional goiano.",
        subcausas: ["Ausência de plano municipal de contingência", "Ônus excessivo com aluguel", "Irregularidade fundiária"],
    },
    "Déficit de infraestrutura de drenagem": {
        justificativa: "A rede foi dimensionada para uma cidade menor e para chuvas menos intensas.",
        evidencia: "O percentual de domicílios com esgotamento sanitário por rede geral ou fossa ligada à rede era de 61,7% em 2022.",
        subcausas: ["Baixa capacidade técnica das equipes municipais", "Perdas de água na distribuição"],
    },
    "Baixa capacidade técnica municipal de planejamento": {
        justificativa: "Sem equipe própria, o município não elabora o projeto que daria acesso ao recurso.",
        evidencia: "A coleta direta de lixo chegou a 95,25% em 2022, mas a recuperação de resíduos ficou em 1,30%.",
        subcausas: ["Baixa capacidade técnica das equipes municipais", "Baixa recuperação de resíduos sólidos"],
    },

    /* ---------- Pessoa idosa ---------- */
    "Rede de cuidado continuado insuficiente": {
        justificativa: "Sem alternativa de cuidado diário, a família recorre à institucionalização.",
        evidencia: "A expectativa de vida ao nascer em Goiás foi de 74,99 anos em 2021.",
        subcausas: ["Concurso público sem reposição de aposentadorias"],
    },
    "Poucos centros-dia em funcionamento": {
        justificativa: "A implantação depende de contrapartida municipal que a maioria não consegue oferecer.",
        evidencia: "A cobertura de centros-dia alcança uma fração dos municípios goianos.",
        subcausas: ["Baixa capacidade técnica das equipes municipais"],
    },
    "Subnotificação de violência contra a pessoa idosa": {
        justificativa: "O que não é notificado não entra na estatística, e a política é dimensionada por baixo.",
        evidencia: "Os registros de racismo cresceram 246% entre 2021 e 2022 — efeito de notificação, e não de ocorrência.",
        subcausas: ["Ausência de protocolo comum de notificação", "Rede de acolhimento concentrada nos grandes centros"],
    },

    /* ---------- Desenvolvimento regional ---------- */
    "Infraestrutura logística deficiente": {
        justificativa: "O custo do frete elimina a vantagem competitiva da produção regional.",
        evidencia: "Trechos prioritários de escoamento seguem sem pavimentação.",
        subcausas: ["Malha viária sem pavimentação nos trechos de escoamento"],
    },
    "Baixa diversificação produtiva regional": {
        justificativa: "A região depende de uma cadeia só, e qualquer oscilação de preço vira crise local.",
        evidencia: "O PIB per capita das regiões mais distantes permanece abaixo da média estadual.",
        subcausas: ["Baixa diversificação produtiva regional", "Malha viária sem pavimentação nos trechos de escoamento"],
    },

    /* ---------- Segurança ---------- */
    "Baixa presença de programas de prevenção social": {
        justificativa: "A atuação chega depois do crime, nos territórios onde a prevenção teria mais efeito.",
        evidencia: "Há relação apontada na literatura entre a proporção de jovens 'nem-nem' e os índices de homicídio.",
        subcausas: ["Jovens fora da escola e fora do trabalho"],
    },
    "Fragilidade da integração entre forças de segurança": {
        justificativa: "Cada força mantém o próprio dado, e a leitura conjunta do território não existe.",
        evidencia: "Goiás registrou 23,17 óbitos por 100 mil habitantes em acidentes de trânsito em 2021.",
        subcausas: ["Sistemas sem interoperabilidade", "Ausência de protocolo comum de notificação"],
    },

    /* ---------- Cultura ---------- */
    "Baixa capilaridade dos equipamentos culturais": {
        justificativa: "O equipamento cultural se concentra onde o público já tinha acesso.",
        evidencia: "A manutenção e a gestão dos equipamentos culturais integram o programa Mais Cultura e Arte.",
        subcausas: ["Equipamentos culturais concentrados na capital"],
    },
    "Ausência de política continuada de restauro": {
        justificativa: "O restauro só acontece em regime de emergência, quando o dano já é grave.",
        evidencia: "A conservação do patrimônio depende de dotação continuada, hoje inexistente.",
        subcausas: [],
    },

    /* ---------- Governo digital ---------- */
    "Sistemas legados sem integração": {
        justificativa: "O cidadão informa o mesmo dado várias vezes, e cada sistema guarda uma versão diferente.",
        evidencia: "Goiás ocupou a 5ª posição entre 27 unidades federativas no Índice de Transparência e Governança Pública.",
        subcausas: ["Sistemas sem interoperabilidade", "Infraestrutura tecnológica desatualizada"],
    },
    "Baixa maturidade digital das unidades administrativas": {
        justificativa: "A unidade digitaliza o papel em vez de redesenhar o processo, e a fila continua.",
        evidencia: "A ampliação da malha de fibra óptica para conectar órgãos integra o programa de transformação digital.",
        subcausas: ["Oferta de capacitação desigual entre os órgãos", "Infraestrutura tecnológica desatualizada"],
    },

    /* ---------- Educação ---------- */
    "Abandono escolar concentrado no Ensino Médio": {
        justificativa: "O estudante que precisa trabalhar abandona na etapa em que a escola menos se adapta a ele.",
        evidencia: "A queda da taxa de abandono desde 2019 foi interrompida em 2022, quando ela voltou a crescer.",
        subcausas: ["Transporte escolar insuficiente na zona rural", "Jovens fora da escola e fora do trabalho"],
    },
    "Defasagem de aprendizagem acumulada na pandemia": {
        justificativa: "Quem passou de ano sem aprender carrega a lacuna para a etapa seguinte, e ela cresce.",
        evidencia: "O IDEB dos Anos Finais da rede estadual foi 5,3 em 2021, contra 6,1 nos Anos Iniciais.",
        subcausas: ["Defasagem de aprendizagem acumulada na pandemia", "Concurso público sem reposição de aposentadorias"],
    },
    "Analfabetismo persistente na população de 15 anos ou mais": {
        justificativa: "A política de alfabetização de adultos não alcança quem já saiu da idade escolar.",
        evidencia: "A taxa de analfabetismo das pessoas de 15 anos ou mais é indicador acompanhado do eixo da Educação.",
        subcausas: ["Cadastro desatualizado do público prioritário"],
    },

    /* ---------- Mobilidade e infraestrutura ---------- */
    "Concentração da oferta de transporte coletivo na Região Metropolitana": {
        justificativa: "Fora do eixo metropolitano, o deslocamento depende de transporte próprio.",
        evidencia: "A mobilidade urbana é tratada em parceria com os municípios, que respondem pelo sistema local.",
        subcausas: ["Baixa capacidade técnica das equipes municipais"],
    },
    "Baixa capacidade técnica municipal para projetos de mobilidade": {
        justificativa: "O município não elabora o projeto e perde o recurso que já estava reservado para ele.",
        evidencia: "Municípios de pequeno porte não dispõem de servidor efetivo na área de planejamento.",
        subcausas: ["Baixa capacidade técnica das equipes municipais"],
    },
    "Trechos prioritários de escoamento sem pavimentação": {
        justificativa: "O trecho sem pavimento encarece o frete e isola a produção na safra chuvosa.",
        evidencia: "A avaliação das rodovias estaduais evoluiu para 'bom' e 'ótimo', mas não em todos os trechos.",
        subcausas: ["Malha viária sem pavimentação nos trechos de escoamento"],
    },
    "Sinalização e conservação insuficientes na malha estadual": {
        justificativa: "A rodovia sem sinalização adequada soma custo logístico a risco de acidente.",
        evidencia: "Goiás registrou 23,17 óbitos por 100 mil habitantes em acidentes de trânsito em 2021.",
        subcausas: ["Malha viária sem pavimentação nos trechos de escoamento"],
    },
    "Baixa diversificação das fontes de geração": {
        justificativa: "Depender de poucas fontes expõe o Estado à sazonalidade e ao preço.",
        evidencia: "A capacidade de geração solar cresceu de forma acelerada entre 2015 e 2022, a partir de uma base baixa.",
        subcausas: ["Gargalos de transmissão de energia"],
    },
    "Gargalos de transmissão nas regiões produtoras": {
        justificativa: "A energia é gerada, mas não chega a quem produz.",
        evidencia: "A expansão da geração distribuída exige transmissão compatível.",
        subcausas: ["Gargalos de transmissão de energia"],
    },

    /* ---------- Meio ambiente ---------- */
    "Queimadas recorrentes no período seco": {
        justificativa: "O fogo usado no manejo escapa e consome área nativa, ano após ano.",
        evidencia: "As cicatrizes de queimadas somaram 302 mil hectares em Goiás em 2022.",
        subcausas: ["Queimadas no período seco", "Ausência de plano municipal de contingência"],
    },
    "Gestão ambiental fragmentada entre Estado e municípios": {
        justificativa: "Licenciamento e fiscalização se sobrepõem sem que ninguém responda pelo conjunto.",
        evidencia: "A integração entre Estado e municípios é objetivo declarado do programa de recursos naturais.",
        subcausas: ["Baixa capacidade técnica das equipes municipais", "Sistemas sem interoperabilidade"],
    },
    "Baixa recuperação de resíduos sólidos": {
        justificativa: "Sem coleta seletiva abrangente, o resíduo reciclável vira aterro.",
        evidencia: "O IRR de Goiás foi de 1,30% em 2019, contra 4,35% de Santa Catarina, o primeiro colocado.",
        subcausas: ["Baixa recuperação de resíduos sólidos", "Baixa capacidade técnica das equipes municipais"],
    },

    /* ---------- Agro e turismo ---------- */
    "Estrutura rural insuficiente para a agricultura familiar": {
        justificativa: "Sem estrutura de armazenagem e escoamento, o pequeno produtor vende no pior preço.",
        evidencia: "A agricultura familiar responde por parcela pequena da compra institucional do Estado.",
        subcausas: ["Malha viária sem pavimentação nos trechos de escoamento"],
    },
    "Defesa agropecuária com processos não modernizados": {
        justificativa: "A fiscalização em papel não acompanha o volume do rebanho e da safra.",
        evidencia: "A modernização da defesa agropecuária é objeto do programa O Agro é de Todos.",
        subcausas: ["Defesa agropecuária com processos não modernizados", "Sistemas sem interoperabilidade"],
    },
    "Sinalização e divulgação turística insuficientes": {
        justificativa: "O visitante não encontra o destino, e o destino não aparece para quem decide a viagem.",
        evidencia: "O emprego no turismo representou 3,67% do emprego formal de Goiás em 2021.",
        subcausas: ["Sinalização turística e divulgação insuficientes"],
    },
    "Baixa qualificação da mão de obra do setor": {
        justificativa: "O serviço mal prestado encurta a permanência e reduz o gasto do visitante.",
        evidencia: "A qualificação do mercado turístico integra o programa Mais Turismo.",
        subcausas: ["Oferta de capacitação desigual entre os órgãos"],
    },

    /* ---------- Habitação e igualdade ---------- */
    "Ônus excessivo com aluguel entre famílias de baixa renda": {
        justificativa: "A família compromete com moradia a renda que faltaria para alimentação e transporte.",
        evidencia: "O ônus excessivo com aluguel supera 24% no déficit habitacional goiano.",
        subcausas: ["Ônus excessivo com aluguel", "Informalidade no mercado de trabalho"],
    },
    "Irregularidade fundiária em áreas ocupadas": {
        justificativa: "Sem escritura, a família não acessa crédito nem programa habitacional.",
        evidencia: "A entrega de escrituras integra os produtos previstos no programa de habitação.",
        subcausas: ["Irregularidade fundiária"],
    },
    "Subnotificação histórica dos crimes de ódio": {
        justificativa: "A vítima não registra por medo ou descrença, e a política é dimensionada por baixo.",
        evidencia: "Entre 2021 e 2022 os registros de racismo cresceram 246%, injúria racial 48% e homofobia/transfobia 163%.",
        subcausas: ["Ausência de protocolo comum de notificação"],
    },
    "Rede de acolhimento concentrada na capital": {
        justificativa: "A vítima do interior precisa se deslocar para ser atendida, e muitas desistem.",
        evidencia: "A lesão corporal dolosa por violência doméstica passou de 11.200 casos em 2022.",
        subcausas: ["Rede de acolhimento concentrada nos grandes centros"],
    },

    /* ---------- Justiça e socioeducativo ---------- */
    "Elevada proporção de presos provisórios": {
        justificativa: "Quem aguarda julgamento ocupa vaga do sistema sem que a pena tenha sido definida.",
        evidencia: "Em 2022, 34,7% da população prisional de Goiás era de presos provisórios.",
        subcausas: ["Elevada proporção de presos provisórios"],
    },
    "Déficit de vagas no sistema prisional": {
        justificativa: "Acima da capacidade, a unidade deixa de ressocializar e passa a apenas conter.",
        evidencia: "A população privada de liberdade em Goiás era de 21.428 pessoas em 2022.",
        subcausas: ["Elevada proporção de presos provisórios"],
    },
    "Assistência jurídica concentrada nos grandes centros": {
        justificativa: "Quem não tem defensoria perto não exerce o direito que a lei lhe dá.",
        evidencia: "O índice de acesso à justiça estadual de Goiás foi 0,658 em 2022.",
        subcausas: ["Rede de acolhimento concentrada nos grandes centros"],
    },
    "Unidades socioeducativas acima da capacidade": {
        justificativa: "Acima da capacidade, a unidade deixa de cumprir a medida e passa a apenas conter.",
        evidencia: "O SINASE fixa parâmetros de atendimento ainda não alcançados.",
        subcausas: ["Unidades socioeducativas acima da capacidade"],
    },
    "Ausência de acompanhamento após o cumprimento da medida": {
        justificativa: "Sem acompanhamento, o adolescente volta ao mesmo contexto que o levou à medida.",
        evidencia: "A reincidência é o principal indicador de efetividade do atendimento socioeducativo.",
        subcausas: ["Jovens fora da escola e fora do trabalho"],
    },

    /* ---------- Esporte, gestão e controle ---------- */
    "Equipamentos esportivos concentrados nos grandes centros": {
        justificativa: "Quem mora longe do equipamento não pratica, por mais que o programa exista.",
        evidencia: "O esporte é tratado como política de saúde no eixo Goiás da Saúde Integral.",
        subcausas: ["Equipamentos culturais concentrados na capital"],
    },
    "Ausência de oferta adaptada para pessoas com deficiência": {
        justificativa: "Sem adaptação, a oferta existe no papel e exclui na prática.",
        evidencia: "O programa prevê iniciativas específicas para pessoas com deficiência e em vulnerabilidade.",
        subcausas: ["Oferta de capacitação desigual entre os órgãos"],
    },
    "Sistemas estruturantes sem integração": {
        justificativa: "Planejamento, orçamento e execução falam línguas diferentes, e o dado não fecha.",
        evidencia: "A formação de redes para operacionalizar sistemas estruturantes integra o programa de gestão.",
        subcausas: ["Sistemas sem interoperabilidade", "Infraestrutura tecnológica desatualizada"],
    },
    "Infraestrutura tecnológica desatualizada em parte dos órgãos": {
        justificativa: "O sistema novo não roda no parque instalado, e a modernização para no meio.",
        evidencia: "A modernização da infraestrutura é objeto do programa Goiás da Gestão Transformadora.",
        subcausas: ["Infraestrutura tecnológica desatualizada"],
    },
    "Canais de participação pouco divulgados": {
        justificativa: "O canal existe, mas quem deveria usá-lo não sabe que ele existe.",
        evidencia: "A promoção da participação social integra o programa de Compliance e Controle.",
        subcausas: ["Canais de participação social pouco divulgados"],
    },
    "Programa de integridade em implantação desigual entre os órgãos": {
        justificativa: "Onde o programa não chegou, o risco segue sem tratamento.",
        evidencia: "O Programa de Compliance Público do Estado está em implantação progressiva.",
        subcausas: ["Oferta de capacitação desigual entre os órgãos"],
    },
    "Reposição de quadro abaixo das aposentadorias": {
        justificativa: "O quadro encolhe a cada ano, e o serviço passa a depender de contratos temporários.",
        evidencia: "A valorização e a capacitação do servidor integram o programa M.O.V.E. Goiás.",
        subcausas: ["Concurso público sem reposição de aposentadorias"],
    },
    "Oferta de capacitação desigual entre os órgãos": {
        justificativa: "O servidor de um órgão é formado e o de outro não, e o sistema anda na velocidade do mais lento.",
        evidencia: "A capacitação é eixo declarado do programa de valorização do servidor.",
        subcausas: ["Oferta de capacitação desigual entre os órgãos"],
    },
    "Educação para o trânsito com alcance limitado": {
        justificativa: "A campanha não alcança quem mais se expõe ao risco.",
        evidencia: "Goiás registrou 23,17 óbitos por 100 mil habitantes no trânsito em 2021.",
        subcausas: ["Oferta de capacitação desigual entre os órgãos"],
    },
    "Sinalização deficiente em trechos de maior risco": {
        justificativa: "O trecho perigoso não avisa que é perigoso.",
        evidencia: "A sinalização integra as ações do programa Rotas da Produção e do Trânsito Seguro.",
        subcausas: ["Malha viária sem pavimentação nos trechos de escoamento"],
    },
};

/** Os 27 indicadores socioeconômicos que o PPA 2024–2027 acompanha por eixo. */
export const INDICADORES = [
    ["Índice de Desenvolvimento da Educação Básica (IDEB)", "Qualidade do aprendizado e fluxo escolar da rede estadual, por etapa de ensino.", "Nota da avaliação × indicador de rendimento escolar", "Quanto maior, melhor", "Anual", "Unidade", "INEP", "https://www.gov.br/inep", "Estadual", "6,10", "2021-12-31", ["Secretaria de Estado da Educação"], "Em uso"],
    ["Taxa de escolarização por faixa etária", "Proporção da população de cada faixa etária que frequenta a escola.", "(pessoas na faixa que frequentam escola ÷ população da faixa) × 100", "Quanto maior, melhor", "Anual", "Percentual", "IBGE", "https://www.ibge.gov.br", "Estadual", "—", "2022-12-31", ["Secretaria de Estado da Educação"], "Em uso"],
    ["Taxa de analfabetismo", "Pessoas de 15 anos ou mais que não sabem ler e escrever um bilhete simples.", "(analfabetos de 15 anos ou mais ÷ população de 15 anos ou mais) × 100", "Quanto menor, melhor", "Anual", "Percentual", "IBGE", "https://www.ibge.gov.br", "Estadual", "—", "2022-12-31", ["Secretaria de Estado da Educação"], "Em uso"],
    ["Taxa de abandono escolar", "Alunos do 9º ano e do Ensino Médio que deixam a escola durante o ano letivo.", "(alunos que abandonaram ÷ matrículas) × 100", "Quanto menor, melhor", "Anual", "Percentual", "INEP", "https://www.gov.br/inep", "Estadual", "—", "2022-12-31", ["Secretaria de Estado da Educação"], "Em revisão"],
    ["Expectativa de vida ao nascer", "Número médio de anos que um recém-nascido viveria mantidas as condições atuais.", "Tábua de mortalidade do ano de referência", "Quanto maior, melhor", "Anual", "Unidade", "IBGE", "https://www.ibge.gov.br", "Estadual", "74,99", "2021-12-31", ["Secretaria de Estado da Saúde"], "Em uso"],
    ["Nascidos vivos com sete ou mais consultas pré-natal", "Cobertura e qualidade do acompanhamento da gestação.", "(nascidos vivos com 7+ consultas ÷ nascidos vivos) × 100", "Quanto maior, melhor", "Trimestral", "Percentual", "DATASUS", "https://datasus.saude.gov.br", "Regional", "—", "2021-12-31", ["Secretaria de Estado da Saúde"], "Em uso"],
    ["Taxa de mortalidade infantil", "Óbitos de menores de um ano por mil nascidos vivos.", "(óbitos de menores de 1 ano ÷ nascidos vivos) × 1.000", "Quanto menor, melhor", "Trimestral", "Unidade", "DATASUS", "https://datasus.saude.gov.br", "Regional", "—", "2022-12-31", ["Secretaria de Estado da Saúde"], "Em uso"],
    ["Taxa de mortalidade por causas evitáveis", "Mortes que poderiam ter sido evitadas por ação dos serviços de saúde, de 5 a 74 anos.", "(óbitos evitáveis de 5 a 74 anos ÷ população de 5 a 74 anos) × 1.000", "Quanto menor, melhor", "Anual", "Unidade", "DATASUS", "https://datasus.saude.gov.br", "Estadual", "6,08", "2021-12-31", ["Secretaria de Estado da Saúde"], "Em uso"],
    ["Índice de Acesso à Justiça", "Posição do tribunal estadual na avaliação de acesso à justiça do CNJ.", "Índice composto do CNJ, de 0 a 1", "Quanto maior, melhor", "Anual", "Unidade", "Órgão federal", "https://www.cnj.jus.br", "Estadual", "0,658", "2022-12-31", ["Secretaria de Estado de Segurança Pública"], "Em uso"],
    ["Mortes por acidente de trânsito", "Óbitos em acidentes de trânsito por 100 mil habitantes.", "(óbitos no trânsito ÷ população) × 100.000", "Quanto menor, melhor", "Mensal", "Unidade", "DATASUS", "https://datasus.saude.gov.br", "Municipal", "23,17", "2021-12-31", ["Secretaria de Estado de Segurança Pública"], "Em uso"],
    ["Índice de Transparência e Governança Pública", "Nota de 0 a 100 na avaliação de transparência e governança dos entes federativos.", "Índice composto, de 0 a 100 pontos", "Quanto maior, melhor", "Anual", "Unidade", "Órgão federal", "", "Estadual", "5º lugar", "2022-12-31", ["Controladoria-Geral do Estado"], "Em uso"],
    ["Rendimento médio real habitual do trabalho", "Rendimento médio real habitualmente recebido no trabalho principal.", "Média do rendimento habitual deflacionado", "Quanto maior, melhor", "Trimestral", "Unidade", "IBGE", "https://www.ibge.gov.br", "Estadual", "2.898,00", "2023-03-31", ["Secretaria de Estado de Indústria, Comércio e Serviços"], "Em uso"],
    ["Rendimento médio mensal de pessoas ocupadas", "Rendimento médio mensal real das pessoas ocupadas no Estado.", "Média do rendimento mensal real das pessoas ocupadas", "Quanto maior, melhor", "Trimestral", "Unidade", "IBGE", "https://www.ibge.gov.br", "Estadual", "2.833,00", "2023-03-31", ["Secretaria de Estado de Indústria, Comércio e Serviços"], "Em uso"],
    ["Taxa de informalidade das pessoas ocupadas", "Proporção das pessoas ocupadas sem vínculo formal de trabalho.", "(ocupados informais ÷ total de ocupados) × 100", "Quanto menor, melhor", "Trimestral", "Percentual", "IBGE", "https://www.ibge.gov.br", "Estadual", "36,70", "2022-12-31", ["Secretaria de Estado de Indústria, Comércio e Serviços"], "Em uso"],
    ["Percentual de jovens que não trabalham e não estudam", "População de 15 a 29 anos fora da escola e fora do mercado de trabalho.", "(jovens de 15 a 29 anos que não trabalham nem estudam ÷ população de 15 a 29 anos) × 100", "Quanto menor, melhor", "Anual", "Percentual", "IBGE", "https://www.ibge.gov.br", "Estadual", "—", "2022-12-31", ["Secretaria de Estado de Desenvolvimento Social"], "Em uso"],
    ["Índice de Gini", "Concentração da renda: zero é igualdade perfeita, um é concentração total.", "Índice de Gini da renda domiciliar per capita", "Quanto menor, melhor", "Anual", "Unidade", "IBGE", "https://www.ibge.gov.br", "Estadual", "0,456", "2022-12-31", ["Secretaria de Estado de Desenvolvimento Social"], "Em uso"],
    ["Índice de pobreza", "Proporção da população com renda domiciliar per capita abaixo da linha de pobreza.", "(pessoas abaixo da linha de pobreza ÷ população) × 100", "Quanto menor, melhor", "Anual", "Percentual", "IBGE", "https://www.ibge.gov.br", "Regional", "—", "2022-12-31", ["Secretaria de Estado de Desenvolvimento Social"], "Em uso"],
    ["Dimensões do déficit habitacional", "Composição do déficit: ônus com aluguel, coabitação, habitação precária e adensamento.", "Soma das quatro dimensões sobre o total de domicílios × 100", "Quanto menor, melhor", "Anual", "Percentual", "Órgão federal", "", "Estadual", "24,90", "2022-12-31", ["Secretaria de Estado de Desenvolvimento Social"], "Em uso"],
    ["Percentual de domicílios atendidos por rede de coleta de esgoto", "Domicílios com esgotamento sanitário por rede geral ou fossa séptica ligada à rede.", "(domicílios com coleta ÷ total de domicílios) × 100", "Quanto maior, melhor", "Anual", "Percentual", "IBGE", "https://www.ibge.gov.br", "Regional", "61,70", "2022-12-31", ["Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável"], "Em uso"],
    ["Percentual de domicílios atendidos com coleta de lixo", "Domicílios com coleta direta ou por caçamba de serviço de limpeza urbana.", "(domicílios com coleta ÷ total de domicílios) × 100", "Quanto maior, melhor", "Anual", "Percentual", "IBGE", "https://www.ibge.gov.br", "Municipal", "95,25", "2022-12-31", ["Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável"], "Em uso"],
    ["Índice de Recuperação de Resíduos (IRR)", "Parcela dos resíduos sólidos urbanos reutilizada, reciclada ou com recuperação energética.", "(reutilização + reciclagem + recuperação energética) ÷ geração de resíduos sólidos urbanos", "Quanto maior, melhor", "Anual", "Percentual", "Órgão federal", "https://sinir.gov.br", "Estadual", "1,30", "2019-12-31", ["Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável"], "Em revisão"],
    ["Índice de perdas de água na distribuição", "Água disponibilizada que não chega a ser faturada por perda na distribuição.", "(volume produzido + importado − consumido − serviço) ÷ (produzido + importado − serviço)", "Quanto menor, melhor", "Anual", "Percentual", "Órgão federal", "", "Estadual", "28,50", "2021-12-31", ["Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável"], "Em uso"],
    ["Capacidade de geração de energia solar", "Potência instalada dos painéis solares em geração distribuída no Estado.", "Soma da potência instalada dos painéis solares", "Quanto maior, melhor", "Semestral", "Unidade", "Órgão federal", "", "Estadual", "1.480.000,00", "2022-12-31", ["Secretaria de Estado da Infraestrutura"], "Em uso"],
    ["Área de cicatrizes de queimadas", "Extensão anual das áreas atingidas por fogo no território goiano.", "Área mapeada de cicatrizes de queimadas, em hectares", "Quanto menor, melhor", "Anual", "Unidade", "Órgão federal", "https://mapbiomas.org", "Regional", "302.000,00", "2022-12-31", ["Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável"], "Em uso"],
    ["Poupa-Florestas", "Área de vegetação nativa conservada acima da exigência legal.", "Área conservada acima da reserva legal, em hectares", "Quanto maior, melhor", "Anual", "Unidade", "Sistema próprio do órgão", "", "Regional", "—", "2022-12-31", ["Secretaria de Estado de Meio Ambiente e Desenvolvimento Sustentável"], "Novo"],
    ["Investimento em inovação", "Participação do investimento público em pesquisa e desenvolvimento no PIB estadual.", "(investimento público em P&D ÷ PIB) × 100", "Quanto maior, melhor", "Anual", "Percentual", "Órgão federal", "https://www.gov.br/mcti", "Estadual", "—", "2020-12-31", ["Secretaria de Estado de Indústria, Comércio e Serviços"], "Em uso"],
    ["Emprego formal na área do turismo", "Participação dos empregos do turismo no total de empregos formais do Estado.", "(empregos em atividades turísticas ÷ empregos formais) × 100", "Quanto maior, melhor", "Anual", "Percentual", "Órgão federal", "", "Estadual", "3,67", "2021-12-31", ["Secretaria de Estado de Indústria, Comércio e Serviços"], "Em uso"],
];
