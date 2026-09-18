const ORGAOS = [
  "Secretaria de Desenvolvimento Social",
  "Secretaria de Sa\xFAde",
  "Secretaria de Educa\xE7\xE3o",
  "Secretaria de Infraestrutura",
  "Secretaria de Agricultura",
  "Secretaria de Meio Ambiente",
  "Secretaria de Ind\xFAstria e Com\xE9rcio",
  "Secretaria de Seguran\xE7a P\xFAblica"
];
const PERIODICIDADES = ["Mensal", "Trimestral", "Semestral", "Anual"];
const ANOS = ["2028", "2029", "2030", "2031"];
const ORGAO_SETORIAL = "Secretaria de Desenvolvimento Social";
const REGIOES = [
  "Metropolitana de Goi\xE2nia",
  "Entorno do DF",
  "Sudoeste Goiano",
  "Norte Goiano",
  "Nordeste Goiano",
  "Centro Goiano",
  "Sul Goiano"
];
const UNIDADES = [
  "Unidade",
  "Pessoa atendida",
  "Munic\xEDpio atendido",
  "Percentual",
  "Profissional capacitado",
  "Tonelada",
  "Refei\xE7\xE3o servida"
];
const PROGRAMAS = [
  {
    id: "pg-saude",
    codigo: "001",
    nome: "Sa\xFAde Integral",
    eixo: "Goi\xE1s que cuida",
    objetivoEstrategico: "Ampliar o acesso qualificado \xE0 rede de aten\xE7\xE3o \xE0 sa\xFAde em todas as regi\xF5es.",
    problema: "Tempo de espera elevado para atendimento especializado e distribui\xE7\xE3o desigual da capacidade assistencial entre as regi\xF5es de sa\xFAde.",
    evidencias: [
      "Fila de regula\xE7\xE3o com 214 mil solicita\xE7\xF5es pendentes em 2026.",
      "4 das 7 macrorregi\xF5es abaixo do par\xE2metro de leitos de UTI por habitante."
    ],
    causas: [
      { id: "c1", texto: "Capacidade instalada insuficiente na m\xE9dia e alta complexidade" },
      { id: "c1a", texto: "D\xE9ficit de leitos de UTI fora da regi\xE3o metropolitana" },
      { id: "c1b", texto: "Equipamentos hospitalares obsoletos" },
      { id: "c2", texto: "Fragilidade da aten\xE7\xE3o prim\xE1ria como porta de entrada" },
      { id: "c2a", texto: "Baixa cobertura de equipes de sa\xFAde da fam\xEDlia em munic\xEDpios pequenos" },
      { id: "c3", texto: "Fragmenta\xE7\xE3o da regula\xE7\xE3o assistencial" }
    ],
    consequencias: [
      "Agravamento de quadros cl\xEDnicos evit\xE1veis",
      "Deslocamento de pacientes para a capital",
      "Judicializa\xE7\xE3o crescente do acesso"
    ],
    populacaoAfetada: "Usu\xE1rios do SUS em Goi\xE1s, com maior impacto sobre a popula\xE7\xE3o do interior",
    objetivo: "Reduzir o tempo m\xE9dio de espera por atendimento especializado e equilibrar a capacidade assistencial regional.",
    resultadoEsperado: "Tempo m\xE9dio de espera reduzido em 30% at\xE9 2031, com amplia\xE7\xE3o regionalizada da capacidade.",
    indicadores: [
      { nome: "Tempo m\xE9dio de espera em consulta especializada", unidade: "Dias", linhaBase: "112", meta: "78" },
      { nome: "Leitos de UTI por 10 mil habitantes", unidade: "Raz\xE3o", linhaBase: "1,8", meta: "2,6" }
    ],
    orgaoCoordenador: "Secretaria de Sa\xFAde"
  },
  {
    id: "pg-infancia",
    codigo: "002",
    nome: "Primeira Inf\xE2ncia Goiana",
    eixo: "Goi\xE1s que cuida",
    objetivoEstrategico: "Assegurar desenvolvimento integral \xE0s crian\xE7as de 0 a 6 anos.",
    problema: "Acesso desigual ao cuidado integral na primeira inf\xE2ncia, com d\xE9ficit de vagas em creche e acompanhamento intersetorial fragmentado.",
    evidencias: [
      "D\xE9ficit estimado de 38 mil vagas em creche p\xFAblica.",
      "Somente 31% dos munic\xEDpios com visita\xE7\xE3o domiciliar estruturada."
    ],
    causas: [
      { id: "c1", texto: "D\xE9ficit de vagas em creche" },
      { id: "c1a", texto: "Insufici\xEAncia de infraestrutura em munic\xEDpios de m\xE9dio porte" },
      { id: "c2", texto: "Baixa cobertura de visita\xE7\xE3o domiciliar qualificada" },
      { id: "c3", texto: "Aus\xEAncia de acompanhamento intersetorial da crian\xE7a" }
    ],
    consequencias: ["Atraso no desenvolvimento infantil", "Evas\xE3o do cuidado em sa\xFAde", "Sobrecarga das fam\xEDlias"],
    populacaoAfetada: "Crian\xE7as de 0 a 6 anos e suas fam\xEDlias",
    objetivo: "Ampliar e integrar a oferta de cuidado na primeira inf\xE2ncia.",
    resultadoEsperado: "Cobertura de cuidado integral ampliada em todas as regi\xF5es de planejamento.",
    indicadores: [{ nome: "Taxa de atendimento em creche", unidade: "Percentual", linhaBase: "39%", meta: "58%" }],
    orgaoCoordenador: "Secretaria de Educa\xE7\xE3o"
  },
  {
    id: "pg-fome",
    codigo: "003",
    nome: "Goi\xE1s Sem Fome",
    eixo: "Goi\xE1s que protege",
    objetivoEstrategico: "Erradicar a inseguran\xE7a alimentar grave no Estado.",
    problema: "Parcela significativa das fam\xEDlias goianas em inseguran\xE7a alimentar moderada ou grave, concentrada no Nordeste Goiano e nas periferias metropolitanas.",
    evidencias: [
      "6,4% dos domic\xEDlios em inseguran\xE7a alimentar grave (PNAD 2026).",
      "Cobertura de equipamentos p\xFAblicos de alimenta\xE7\xE3o em apenas 22 munic\xEDpios."
    ],
    causas: [
      { id: "c1", texto: "Baixa renda e informalidade no trabalho" },
      { id: "c2", texto: "Cobertura insuficiente de equipamentos p\xFAblicos de alimenta\xE7\xE3o" },
      { id: "c2a", texto: "Aus\xEAncia de restaurantes comunit\xE1rios no interior" },
      { id: "c2b", texto: "Descontinuidade operacional das cozinhas comunit\xE1rias" },
      { id: "c3", texto: "Fragilidade da agricultura familiar e das cadeias curtas" },
      { id: "c4", texto: "Baixa articula\xE7\xE3o entre cadastro social e transfer\xEAncias" }
    ],
    consequencias: ["Desnutri\xE7\xE3o e agravos de sa\xFAde", "Evas\xE3o escolar", "Aprofundamento da pobreza intergeracional"],
    populacaoAfetada: "Fam\xEDlias em situa\xE7\xE3o de inseguran\xE7a alimentar",
    objetivo: "Ampliar o acesso regular a alimenta\xE7\xE3o adequada e fortalecer a produ\xE7\xE3o local de alimentos.",
    resultadoEsperado: "Redu\xE7\xE3o da inseguran\xE7a alimentar grave para menos de 3% dos domic\xEDlios at\xE9 2031.",
    indicadores: [
      { nome: "Domic\xEDlios em inseguran\xE7a alimentar grave", unidade: "Percentual", linhaBase: "6,4%", meta: "2,9%" },
      { nome: "Munic\xEDpios com equipamento p\xFAblico de alimenta\xE7\xE3o", unidade: "Munic\xEDpio", linhaBase: "22", meta: "60" }
    ],
    orgaoCoordenador: "Secretaria de Desenvolvimento Social"
  },
  {
    id: "pg-juventude",
    codigo: "004",
    nome: "Juventude, Trabalho e Renda",
    eixo: "Goi\xE1s que gera oportunidades",
    objetivoEstrategico: "Ampliar a inser\xE7\xE3o produtiva da juventude goiana.",
    problema: "Jovens de 16 a 29 anos com alta desocupa\xE7\xE3o e baixa conex\xE3o entre qualifica\xE7\xE3o ofertada e vagas existentes.",
    evidencias: ["Taxa de desocupa\xE7\xE3o juvenil de 18,7%.", "42% dos concluintes de cursos sem inser\xE7\xE3o em 12 meses."],
    causas: [
      { id: "c1", texto: "Descompasso entre oferta de cursos e demanda das empresas" },
      { id: "c2", texto: "Baixa cobertura de intermedia\xE7\xE3o p\xFAblica de emprego" },
      { id: "c3", texto: "Dificuldade de deslocamento at\xE9 os centros de qualifica\xE7\xE3o" }
    ],
    consequencias: ["Informalidade precoce", "Migra\xE7\xE3o juvenil", "Perda de produtividade regional"],
    populacaoAfetada: "Jovens de 16 a 29 anos",
    objetivo: "Conectar qualifica\xE7\xE3o, intermedia\xE7\xE3o e primeiro emprego.",
    resultadoEsperado: "Eleva\xE7\xE3o da taxa de inser\xE7\xE3o produtiva juvenil.",
    indicadores: [{ nome: "Taxa de desocupa\xE7\xE3o juvenil", unidade: "Percentual", linhaBase: "18,7%", meta: "12,0%" }],
    orgaoCoordenador: "Secretaria de Ind\xFAstria e Com\xE9rcio"
  },
  {
    id: "pg-cidades",
    codigo: "005",
    nome: "Cidades Resilientes e Saneamento",
    eixo: "Goi\xE1s sustent\xE1vel",
    objetivoEstrategico: "Elevar a resili\xEAncia urbana e a cobertura de saneamento.",
    problema: "Baixa capacidade municipal de resposta a eventos clim\xE1ticos extremos e cobertura desigual de esgotamento sanit\xE1rio.",
    evidencias: ["58 munic\xEDpios com \xE1reas de risco mapeadas sem plano de conting\xEAncia."],
    causas: [
      { id: "c1", texto: "Ocupa\xE7\xE3o irregular em \xE1reas de risco" },
      { id: "c2", texto: "D\xE9ficit de infraestrutura de drenagem" },
      { id: "c3", texto: "Baixa capacidade t\xE9cnica municipal de planejamento" }
    ],
    consequencias: ["Perdas materiais recorrentes", "Doen\xE7as de veicula\xE7\xE3o h\xEDdrica"],
    populacaoAfetada: "Popula\xE7\xE3o urbana em \xE1reas de risco",
    objetivo: "Reduzir a vulnerabilidade urbana a eventos clim\xE1ticos e ampliar o saneamento.",
    resultadoEsperado: "Cobertura de esgotamento sanit\xE1rio ampliada nas regi\xF5es priorit\xE1rias.",
    indicadores: [{ nome: "Cobertura de esgotamento sanit\xE1rio", unidade: "Percentual", linhaBase: "64%", meta: "80%" }],
    orgaoCoordenador: "Secretaria de Meio Ambiente"
  },
  {
    id: "pg-idoso",
    codigo: "006",
    nome: "Envelhecer com Cuidado",
    eixo: "Goi\xE1s que protege",
    objetivoEstrategico: "Ampliar a rede de cuidado \xE0 pessoa idosa.",
    problema: "Crescimento acelerado da popula\xE7\xE3o idosa sem rede correspondente de cuidado continuado e preven\xE7\xE3o de viol\xEAncia.",
    evidencias: ["Aumento de 27% nas notifica\xE7\xF5es de viol\xEAncia contra a pessoa idosa em cinco anos."],
    causas: [
      { id: "c1", texto: "Rede de cuidado continuado insuficiente" },
      { id: "c1a", texto: "Poucos centros-dia em funcionamento" },
      { id: "c2", texto: "Subnotifica\xE7\xE3o de viol\xEAncia contra a pessoa idosa" }
    ],
    consequencias: ["Institucionaliza\xE7\xE3o precoce", "Sobrecarga de cuidadores familiares"],
    populacaoAfetada: "Pessoas com 60 anos ou mais",
    objetivo: "Estruturar rede estadual de cuidado e prote\xE7\xE3o \xE0 pessoa idosa.",
    resultadoEsperado: "Rede de centros-dia presente em todas as regi\xF5es de planejamento.",
    indicadores: [{ nome: "Centros-dia em funcionamento", unidade: "Unidade", linhaBase: "9", meta: "28" }],
    orgaoCoordenador: "Secretaria de Desenvolvimento Social"
  },
  {
    id: "pg-regional",
    codigo: "007",
    nome: "Desenvolvimento Regional Equilibrado",
    eixo: "Goi\xE1s que gera oportunidades",
    objetivoEstrategico: "Reduzir as desigualdades econ\xF4micas entre as regi\xF5es goianas.",
    problema: "Concentra\xE7\xE3o da atividade econ\xF4mica no eixo metropolitano e baixa diversifica\xE7\xE3o produtiva no norte e nordeste do Estado.",
    evidencias: ["PIB per capita do Nordeste Goiano equivale a 41% da m\xE9dia estadual."],
    causas: [
      { id: "c1", texto: "Infraestrutura log\xEDstica deficiente" },
      { id: "c2", texto: "Baixa diversifica\xE7\xE3o produtiva regional" }
    ],
    consequencias: ["Migra\xE7\xE3o interna", "Depend\xEAncia de transfer\xEAncias"],
    populacaoAfetada: "Popula\xE7\xE3o das regi\xF5es de menor dinamismo econ\xF4mico",
    objetivo: "Fomentar arranjos produtivos e infraestrutura nas regi\xF5es de menor dinamismo.",
    resultadoEsperado: "Crescimento do PIB regional acima da m\xE9dia estadual nas regi\xF5es priorit\xE1rias.",
    indicadores: [{ nome: "Participa\xE7\xE3o das regi\xF5es priorit\xE1rias no PIB estadual", unidade: "Percentual", linhaBase: "11%", meta: "15%" }],
    orgaoCoordenador: "Secretaria de Ind\xFAstria e Com\xE9rcio"
  },
  {
    id: "pg-seguranca",
    codigo: "008",
    nome: "Goi\xE1s Mais Seguro",
    eixo: "Goi\xE1s que protege",
    objetivoEstrategico: "Reduzir a viol\xEAncia letal e fortalecer a preven\xE7\xE3o social.",
    problema: "Concentra\xE7\xE3o de crimes violentos em territ\xF3rios espec\xEDficos das regi\xF5es metropolitanas e do entorno do DF.",
    evidencias: ["62% dos homic\xEDdios concentrados em 18 munic\xEDpios."],
    causas: [
      { id: "c1", texto: "Baixa presen\xE7a de programas de preven\xE7\xE3o social" },
      { id: "c2", texto: "Fragilidade da integra\xE7\xE3o entre for\xE7as de seguran\xE7a" }
    ],
    consequencias: ["Perda de vidas jovens", "Inseguran\xE7a percebida elevada"],
    populacaoAfetada: "Popula\xE7\xE3o residente em territ\xF3rios de alta vulnerabilidade",
    objetivo: "Integrar preven\xE7\xE3o social e a\xE7\xE3o policial nos territ\xF3rios priorit\xE1rios.",
    resultadoEsperado: "Redu\xE7\xE3o da taxa de homic\xEDdios nos territ\xF3rios priorit\xE1rios.",
    indicadores: [{ nome: "Taxa de homic\xEDdios por 100 mil habitantes", unidade: "Taxa", linhaBase: "29,4", meta: "20,0" }],
    orgaoCoordenador: "Secretaria de Seguran\xE7a P\xFAblica"
  },
  {
    id: "pg-cultura",
    codigo: "009",
    nome: "Cultura e Patrim\xF4nio Goiano",
    eixo: "Goi\xE1s que cuida",
    objetivoEstrategico: "Democratizar o acesso a bens culturais e preservar o patrim\xF4nio.",
    problema: "Concentra\xE7\xE3o dos equipamentos culturais na capital e degrada\xE7\xE3o de bens tombados no interior.",
    evidencias: ["71% dos equipamentos culturais estaduais localizados na Regi\xE3o Metropolitana."],
    causas: [
      { id: "c1", texto: "Baixa capilaridade dos equipamentos culturais" },
      { id: "c2", texto: "Aus\xEAncia de pol\xEDtica continuada de restauro" }
    ],
    consequencias: ["Perda de patrim\xF4nio hist\xF3rico", "Desigualdade de acesso cultural"],
    populacaoAfetada: "Popula\xE7\xE3o do interior e comunidades tradicionais",
    objetivo: "Ampliar a presen\xE7a cultural do Estado nas regi\xF5es e preservar o patrim\xF4nio.",
    resultadoEsperado: "Rede cultural presente em todas as regi\xF5es de planejamento.",
    indicadores: [{ nome: "Munic\xEDpios com equipamento cultural apoiado", unidade: "Munic\xEDpio", linhaBase: "34", meta: "80" }],
    orgaoCoordenador: "Secretaria de Cultura",
    aptidao: "apto",
    disponibilizacao: "disponivel"
  },
  {
    id: "pg-digital",
    codigo: "010",
    nome: "Governo Digital e Transpar\xEAncia",
    eixo: "Goi\xE1s eficiente",
    objetivoEstrategico: "Ampliar a digitaliza\xE7\xE3o dos servi\xE7os p\xFAblicos estaduais.",
    problema: "Servi\xE7os p\xFAblicos com baixa digitaliza\xE7\xE3o e alto custo de atendimento presencial.",
    evidencias: ["Apenas 38% dos servi\xE7os estaduais dispon\xEDveis integralmente on-line."],
    causas: [
      { id: "c1", texto: "Sistemas legados sem integra\xE7\xE3o" },
      { id: "c2", texto: "Baixa maturidade digital das unidades administrativas" }
    ],
    consequencias: ["Custo elevado de atendimento", "Baixa satisfa\xE7\xE3o do cidad\xE3o"],
    populacaoAfetada: "Cidad\xE3os e empresas usu\xE1rios de servi\xE7os estaduais",
    objetivo: "Digitalizar e integrar os servi\xE7os p\xFAblicos estaduais.",
    resultadoEsperado: "Maioria dos servi\xE7os dispon\xEDvel em canal digital \xFAnico.",
    indicadores: [{ nome: "Servi\xE7os estaduais digitalizados", unidade: "Percentual", linhaBase: "38%", meta: "85%" }],
    orgaoCoordenador: "Secretaria de Administra\xE7\xE3o",
    aptidao: "incompleto",
    disponibilizacao: "em_estruturacao"
  }
];
const EXECUCAO_SIAFIC = {
  "ent-1": 94e5,
  "ent-3": 11e5,
  "ent-4": 542e5,
  "ent-6": 128e5,
  "ent-8": 73e5,
  "ent-10": 64e4
};
const mi = (n) => n * 1e6;
const FONTES = [
  "Tesouro Estadual",
  "Conv\xEAnios com a Uni\xE3o",
  "Recursos Pr\xF3prios",
  "PROTEGE",
  "Opera\xE7\xF5es de Cr\xE9dito"
];
const ACOES = [
  { id: "2210", codigo: "2210", nome: "Implanta\xE7\xE3o de restaurantes e cozinhas comunit\xE1rias", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2215", codigo: "2215", nome: "Opera\xE7\xE3o da rede p\xFAblica de alimenta\xE7\xE3o", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2220", codigo: "2220", nome: "Capacita\xE7\xE3o de equipes socioassistenciais", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2230", codigo: "2230", nome: "Transfer\xEAncia de renda \u2014 Cart\xE3o Alimenta\xE7\xE3o", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2235", codigo: "2235", nome: "Gest\xE3o do cadastro social estadual", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2240", codigo: "2240", nome: "Implanta\xE7\xE3o da rede de centros-dia", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2245", codigo: "2245", nome: "Atendimento e acompanhamento continuado da pessoa idosa", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2250", codigo: "2250", nome: "Prote\xE7\xE3o \xE0 pessoa idosa em situa\xE7\xE3o de viol\xEAncia", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2260", codigo: "2260", nome: "Inclus\xE3o produtiva da juventude", orgao: ORGAO_SETORIAL, situacao: "Ativa" },
  { id: "2310", codigo: "2310", nome: "Compra institucional da agricultura familiar", orgao: "Secretaria de Agricultura", situacao: "Ativa" },
  { id: "2315", codigo: "2315", nome: "Log\xEDstica de abastecimento alimentar", orgao: "Secretaria de Agricultura", situacao: "Ativa" },
  { id: "2045", codigo: "2045", nome: "Amplia\xE7\xE3o da capacidade hospitalar", orgao: "Secretaria de Sa\xFAde", situacao: "Ativa" },
  { id: "2060", codigo: "2060", nome: "Requalifica\xE7\xE3o de hospitais regionais", orgao: "Secretaria de Sa\xFAde", situacao: "Ativa" },
  { id: "2080", codigo: "2080", nome: "Aquisi\xE7\xE3o de equipamentos hospitalares", orgao: "Secretaria de Sa\xFAde", situacao: "Ativa" },
  { id: "2090", codigo: "2090", nome: "Aten\xE7\xE3o especializada ambulatorial", orgao: "Secretaria de Sa\xFAde", situacao: "Ativa" },
  { id: "2410", codigo: "2410", nome: "Expans\xE3o de vagas em creche", orgao: "Secretaria de Educa\xE7\xE3o", situacao: "Ativa" },
  { id: "2510", codigo: "2510", nome: "Obras de hospitais regionais", orgao: "Secretaria de Infraestrutura", situacao: "Ativa" }
];
const PROJETOS = [
  {
    id: "prj-3120",
    codigo: "GOMAP-3120",
    nome: "Rede Estadual de Restaurantes e Cozinhas Comunit\xE1rias",
    orgao: ORGAO_SETORIAL,
    situacao: "Em execu\xE7\xE3o",
    fase: "Execu\xE7\xE3o f\xEDsica",
    execucao: 42,
    cronograma: "2027\u20132030",
    conclusaoPrevista: "12/2030",
    ultimaAtualizacao: "08/08/2026",
    valorGlobal: mi(82.5)
  },
  {
    id: "prj-3145",
    codigo: "GOMAP-3145",
    nome: "Cart\xE3o Alimenta\xE7\xE3o Goi\xE1s",
    orgao: ORGAO_SETORIAL,
    situacao: "Em execu\xE7\xE3o",
    fase: "Opera\xE7\xE3o continuada",
    execucao: 68,
    cronograma: "2026\u20132031",
    conclusaoPrevista: "12/2031",
    ultimaAtualizacao: "11/08/2026",
    valorGlobal: mi(210)
  },
  {
    id: "prj-3188",
    codigo: "GOMAP-3188",
    nome: "Log\xEDstica de Abastecimento Alimentar",
    orgao: "Secretaria de Agricultura",
    situacao: "Em planejamento",
    fase: "Estrutura\xE7\xE3o",
    execucao: 12,
    cronograma: "2028\u20132031",
    conclusaoPrevista: "12/2031",
    ultimaAtualizacao: "05/08/2026",
    valorGlobal: mi(90)
  },
  {
    id: "prj-3201",
    codigo: "GOMAP-3201",
    nome: "Qualifica\xE7\xE3o de Equipes Socioassistenciais",
    orgao: ORGAO_SETORIAL,
    situacao: "Em execu\xE7\xE3o",
    fase: "Execu\xE7\xE3o",
    execucao: 25,
    cronograma: "2028\u20132029",
    conclusaoPrevista: "12/2029",
    ultimaAtualizacao: "01/08/2026",
    valorGlobal: mi(7.2)
  },
  {
    id: "prj-3260",
    codigo: "GOMAP-3260",
    nome: "Moderniza\xE7\xE3o do Cadastro Social \xDAnico Estadual",
    orgao: ORGAO_SETORIAL,
    situacao: "Em planejamento",
    fase: "Estudos preliminares",
    execucao: 0,
    cronograma: "2028\u20132030",
    conclusaoPrevista: "06/2030",
    ultimaAtualizacao: "29/07/2026",
    valorGlobal: mi(18)
  },
  {
    id: "prj-3305",
    codigo: "GOMAP-3305",
    nome: "Rede Estadual de Centros-Dia da Pessoa Idosa",
    orgao: ORGAO_SETORIAL,
    situacao: "Em execu\xE7\xE3o",
    fase: "Obras",
    execucao: 33,
    cronograma: "2027\u20132031",
    conclusaoPrevista: "06/2031",
    ultimaAtualizacao: "10/08/2026",
    valorGlobal: mi(60)
  },
  {
    id: "prj-4010",
    codigo: "GOMAP-4010",
    nome: "Constru\xE7\xE3o do Hospital Regional Norte",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Em execu\xE7\xE3o",
    fase: "Obras civis",
    execucao: 38,
    cronograma: "2027\u20132031",
    conclusaoPrevista: "09/2031",
    ultimaAtualizacao: "12/08/2026",
    valorGlobal: mi(200)
  },
  {
    id: "prj-4020",
    codigo: "GOMAP-4020",
    nome: "Amplia\xE7\xE3o do Hospital Estadual de Urg\xEAncias",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Em execu\xE7\xE3o",
    fase: "Execu\xE7\xE3o",
    execucao: 51,
    cronograma: "2028\u20132030",
    conclusaoPrevista: "12/2030",
    ultimaAtualizacao: "12/08/2026",
    valorGlobal: mi(85)
  }
];
let seqParcela = 0;
const serie = (a, b, c, d) => ({
  "2028": a,
  "2029": b,
  "2030": c,
  "2031": d
});
const parcelas = (acaoId, fonte, classificacao, vals) => ANOS.flatMap((ano) => {
  const total = vals[ano] ?? 0;
  if (total <= 0) return [];
  const primeira = Math.round(total * 0.4);
  const partes = [
    { mes: 3, valor: primeira },
    { mes: 9, valor: total - primeira }
  ];
  return partes.map(({ mes, valor }) => {
    const base = { id: `pc-${++seqParcela}`, acaoId, fonte, classificacao, ano, mes, valor };
    return ano === "2028" ? { ...base, empenhado: Math.round(valor * 0.82), liquidado: Math.round(valor * 0.7), pago: Math.round(valor * 0.63) } : base;
  });
});
const IPOFS = [
  {
    id: "ip-3120-a",
    codigo: "IPOF 2028.0011",
    nome: "Obras e instala\xE7\xF5es da rede de alimenta\xE7\xE3o",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3120",
    parcelas: parcelas("2210", "Tesouro Estadual", "4490.51 \u2014 Obras e instala\xE7\xF5es", serie(mi(12), mi(14), mi(10), mi(6)))
  },
  {
    id: "ip-3120-b",
    codigo: "IPOF 2028.0012",
    nome: "Custeio operacional da rede de alimenta\xE7\xE3o",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3120",
    // IPOF com parcelas de duas Ações diferentes — relaciona-se a duas Entregas.
    parcelas: [
      ...parcelas("2215", "Tesouro Estadual", "3390.30 \u2014 Material de consumo", serie(mi(6), mi(7.5), mi(7.5), mi(7.5))),
      ...parcelas("2220", "PROTEGE", "3390.39 \u2014 Servi\xE7os de terceiros", serie(mi(1), mi(1), mi(1), mi(1)))
    ]
  },
  {
    id: "ip-3120-c",
    codigo: "IPOF 2028.0013",
    nome: "Equipamentos das unidades de alimenta\xE7\xE3o",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3120",
    // Mesma Ação 2210 presente em outro IPOF.
    parcelas: parcelas("2210", "Conv\xEAnios com a Uni\xE3o", "4490.52 \u2014 Equipamentos", serie(mi(5), mi(5), mi(2), 0))
  },
  {
    id: "ip-3145-a",
    codigo: "IPOF 2028.0021",
    nome: "Transfer\xEAncia direta \xE0s fam\xEDlias",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3145",
    parcelas: parcelas("2230", "Tesouro Estadual", "3390.48 \u2014 Aux\xEDlio financeiro", serie(mi(42), mi(45), mi(46), mi(47)))
  },
  {
    id: "ip-3145-b",
    codigo: "IPOF 2028.0022",
    nome: "Gest\xE3o e opera\xE7\xE3o do benef\xEDcio",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3145",
    parcelas: parcelas("2235", "Recursos Pr\xF3prios", "3390.39 \u2014 Servi\xE7os de terceiros", serie(mi(2), mi(2.5), mi(2.5), mi(2.5)))
  },
  {
    id: "ip-3188-a",
    codigo: "IPOF 2028.0031",
    nome: "Aquisi\xE7\xE3o de alimentos da agricultura familiar",
    orgao: "Secretaria de Agricultura",
    situacao: "Ativo",
    projetoId: "prj-3188",
    // IPOF com parcelas de fontes diferentes na mesma Ação.
    parcelas: [
      ...parcelas("2310", "Conv\xEAnios com a Uni\xE3o", "3390.32 \u2014 Material distribu\xEDdo", serie(mi(16), mi(16), mi(16), mi(16))),
      ...parcelas("2310", "Tesouro Estadual", "3390.32 \u2014 Material distribu\xEDdo", serie(mi(2), mi(2), mi(2), mi(2)))
    ]
  },
  {
    id: "ip-3188-b",
    codigo: "IPOF 2028.0032",
    nome: "Transporte e armazenagem de alimentos",
    orgao: "Secretaria de Agricultura",
    situacao: "Ativo",
    projetoId: "prj-3188",
    parcelas: parcelas("2315", "Tesouro Estadual", "3390.33 \u2014 Transporte", serie(mi(3), mi(4), mi(4), mi(4)))
  },
  {
    id: "ip-3201-a",
    codigo: "IPOF 2028.0041",
    nome: "Forma\xE7\xE3o continuada das equipes",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3201",
    parcelas: parcelas("2220", "PROTEGE", "3390.39 \u2014 Servi\xE7os de terceiros", serie(mi(2), mi(2.4), mi(1.6), mi(1.2)))
  },
  {
    id: "ip-3305-a",
    codigo: "IPOF 2028.0051",
    nome: "Implanta\xE7\xE3o de centros-dia",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3305",
    parcelas: parcelas("2240", "Opera\xE7\xF5es de Cr\xE9dito", "4490.51 \u2014 Obras e instala\xE7\xF5es", serie(mi(9), mi(12), mi(9), mi(6)))
  },
  {
    id: "ip-3305-b",
    codigo: "IPOF 2028.0052",
    nome: "Manuten\xE7\xE3o da rede de centros-dia",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: "prj-3305",
    parcelas: parcelas("2245", "Tesouro Estadual", "3390.30 \u2014 Material de consumo", serie(mi(4), mi(4.5), mi(4.5), mi(5)))
  },
  {
    id: "ip-4010-a",
    codigo: "IPOF 2028.0101",
    nome: "Obras civis do Hospital Regional Norte",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Ativo",
    projetoId: "prj-4010",
    parcelas: parcelas("2045", "Tesouro Estadual", "4490.51 \u2014 Obras e instala\xE7\xF5es", serie(mi(20), mi(25), mi(15), mi(10)))
  },
  {
    id: "ip-4010-b",
    codigo: "IPOF 2028.0102",
    nome: "Requalifica\xE7\xE3o de alas hospitalares",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Ativo",
    projetoId: "prj-4010",
    parcelas: parcelas("2060", "Tesouro Estadual", "4490.51 \u2014 Obras e instala\xE7\xF5es", serie(mi(18), mi(22), mi(20), mi(10)))
  },
  {
    id: "ip-4010-c",
    codigo: "IPOF 2028.0103",
    nome: "Equipamentos do Hospital Regional Norte",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Ativo",
    projetoId: "prj-4010",
    parcelas: parcelas("2080", "Conv\xEAnios com a Uni\xE3o", "4490.52 \u2014 Equipamentos", serie(mi(8), mi(7), mi(5), 0))
  },
  {
    id: "ip-4020-a",
    codigo: "IPOF 2028.0111",
    nome: "Equipamentos do Hospital Estadual de Urg\xEAncias",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Ativo",
    projetoId: "prj-4020",
    parcelas: parcelas("2080", "Tesouro Estadual", "4490.52 \u2014 Equipamentos", serie(mi(10), mi(10), mi(5), mi(5)))
  },
  {
    id: "ip-av-1",
    codigo: "IPOF 2028.0201",
    nome: "Manuten\xE7\xE3o da rede socioassistencial (atividade continuada)",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: null,
    parcelas: parcelas("2245", "Tesouro Estadual", "3390.30 \u2014 Material de consumo", serie(mi(6), mi(6), mi(6), mi(6)))
  },
  {
    id: "ip-av-2",
    codigo: "IPOF 2028.0202",
    nome: "Servi\xE7os de apoio \xE0 gest\xE3o social (atividade continuada)",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: null,
    parcelas: parcelas("2235", "Recursos Pr\xF3prios", "3390.39 \u2014 Servi\xE7os de terceiros", serie(mi(2.5), mi(3), mi(3), mi(3)))
  },
  {
    id: "ip-av-3",
    codigo: "IPOF 2028.0203",
    nome: "Aquisi\xE7\xE3o de g\xEAneros aliment\xEDcios (processo continuado)",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: null,
    parcelas: parcelas("2215", "PROTEGE", "3390.32 \u2014 Material distribu\xEDdo", serie(mi(4), mi(5), mi(4.5), mi(4.5)))
  },
  {
    id: "ip-av-4",
    codigo: "IPOF 2028.0204",
    nome: "Custeio da aten\xE7\xE3o especializada",
    orgao: "Secretaria de Sa\xFAde",
    situacao: "Ativo",
    projetoId: null,
    parcelas: parcelas("2090", "Conv\xEAnios com a Uni\xE3o", "3390.39 \u2014 Servi\xE7os de terceiros", serie(mi(21), mi(23), mi(24), mi(24)))
  },
  {
    id: "ip-av-5",
    codigo: "IPOF 2028.0205",
    nome: "Manuten\xE7\xE3o da rede escolar",
    orgao: "Secretaria de Educa\xE7\xE3o",
    situacao: "Ativo",
    projetoId: null,
    parcelas: parcelas("2410", "Tesouro Estadual", "3390.30 \u2014 Material de consumo", serie(mi(10), mi(11), mi(12), mi(12)))
  },
  {
    id: "ip-av-6",
    codigo: "IPOF 2028.0206",
    nome: "Amplia\xE7\xE3o de equipamentos socioassistenciais",
    orgao: ORGAO_SETORIAL,
    situacao: "Ativo",
    projetoId: null,
    parcelas: parcelas("2240", "Opera\xE7\xF5es de Cr\xE9dito", "4490.61 \u2014 Aquisi\xE7\xE3o de im\xF3veis", serie(mi(6), mi(9), mi(9), mi(6)))
  }
];
const meta = (a, b, c, d) => ({
  "2028": a ?? null,
  "2029": b ?? null,
  "2030": c ?? null,
  "2031": d ?? null
});
const SEDS = ORGAO_SETORIAL;
const iniciativas = [
  {
    id: "ini-1",
    programaId: "pg-fome",
    orgao: SEDS,
    nome: "Amplia\xE7\xE3o da rede p\xFAblica de alimenta\xE7\xE3o",
    descricao: "Expandir e qualificar restaurantes e cozinhas comunit\xE1rias nos territ\xF3rios de maior inseguran\xE7a alimentar.",
    publicoAlvo: "Fam\xEDlias em inseguran\xE7a alimentar moderada ou grave",
    causas: ["c2", "c2a"],
    status: "em_preenchimento",
    atualizadoEm: "12/08/2026",
    versao: 1,
    unidadeResponsavel: "Superintend\xEAncia de Seguran\xE7a Alimentar",
    resultadoEsperado: "Rede p\xFAblica de alimenta\xE7\xE3o presente nos 20 munic\xEDpios de maior inseguran\xE7a alimentar, com oferta regular de refei\xE7\xF5es.",
    indicadores: [
      {
        id: "iin-1",
        nome: "Cobertura municipal da rede p\xFAblica de alimenta\xE7\xE3o",
        descricao: "Propor\xE7\xE3o dos munic\xEDpios priorit\xE1rios com equipamento p\xFAblico de alimenta\xE7\xE3o em opera\xE7\xE3o.",
        unidade: "Percentual",
        formula: "(munic\xEDpios priorit\xE1rios com equipamento / munic\xEDpios priorit\xE1rios) x 100",
        fonte: "Cadastro estadual de equipamentos de alimenta\xE7\xE3o",
        periodicidade: "Semestral",
        valorReferencia: "34%",
        anoReferencia: "2026",
        polaridade: "maior_melhor",
        metas: { "2028": "48%", "2029": "60%", "2030": "72%", "2031": "85%" }
      },
      {
        id: "iin-2",
        nome: "Refei\xE7\xF5es subsidiadas por habitante em inseguran\xE7a alimentar",
        descricao: "Volume anual de refei\xE7\xF5es servidas em rela\xE7\xE3o ao p\xFAblico estimado.",
        unidade: "Raz\xE3o",
        formula: "refei\xE7\xF5es servidas / p\xFAblico estimado",
        fonte: "Relat\xF3rio operacional da rede",
        periodicidade: "Anual",
        valorReferencia: "11,2",
        anoReferencia: "2026",
        polaridade: "maior_melhor",
        metas: { "2028": "14,0", "2029": "16,5", "2030": "18,0", "2031": "20,0" }
      }
    ]
  },
  {
    id: "ini-2",
    programaId: "pg-fome",
    orgao: SEDS,
    nome: "Transfer\xEAncia de renda para seguran\xE7a alimentar",
    descricao: "Opera\xE7\xE3o e amplia\xE7\xE3o do Cart\xE3o Alimenta\xE7\xE3o Goi\xE1s com integra\xE7\xE3o ao cadastro social.",
    publicoAlvo: "Fam\xEDlias inscritas no cadastro social estadual",
    causas: ["c1", "c4"],
    status: "em_analise",
    atualizadoEm: "11/08/2026",
    enviadoEm: "10/08/2026",
    analista: "Maria Fonseca",
    versao: 2,
    unidadeResponsavel: "Superintend\xEAncia de Transfer\xEAncia de Renda",
    resultadoEsperado: "Fam\xEDlias em inseguran\xE7a alimentar grave com transfer\xEAncia regular e cadastro atualizado.",
    indicadores: [
      {
        id: "iin-3",
        nome: "Fam\xEDlias eleg\xEDveis com benef\xEDcio ativo",
        descricao: "Propor\xE7\xE3o das fam\xEDlias eleg\xEDveis efetivamente atendidas.",
        unidade: "Percentual",
        formula: "(fam\xEDlias com benef\xEDcio ativo / fam\xEDlias eleg\xEDveis) x 100",
        fonte: "Cadastro social estadual",
        periodicidade: "Trimestral",
        valorReferencia: "68%",
        anoReferencia: "2026",
        polaridade: "maior_melhor",
        metas: { "2028": "80%", "2029": "85%", "2030": "90%", "2031": "92%" }
      }
    ]
  },
  {
    id: "ini-3",
    programaId: "pg-fome",
    orgao: SEDS,
    nome: "Fortalecimento das cadeias curtas de alimentos",
    descricao: "Compra institucional da agricultura familiar e log\xEDstica de abastecimento nos territ\xF3rios priorit\xE1rios.",
    publicoAlvo: "Agricultores familiares e equipamentos p\xFAblicos de alimenta\xE7\xE3o",
    causas: ["c3"],
    status: "devolvida",
    atualizadoEm: "10/08/2026",
    enviadoEm: "07/08/2026",
    analista: "Maria Fonseca",
    versao: 2
  },
  {
    id: "ini-4",
    programaId: "pg-idoso",
    orgao: SEDS,
    nome: "Implanta\xE7\xE3o da rede de centros-dia",
    descricao: "Implantar centros-dia regionais para cuidado continuado da pessoa idosa.",
    publicoAlvo: "Pessoas idosas com depend\xEAncia leve e moderada",
    causas: ["c1", "c1a"],
    status: "validada",
    atualizadoEm: "04/08/2026",
    enviadoEm: "28/07/2026",
    analista: "Jo\xE3o Peixoto",
    versao: 1,
    unidadeResponsavel: "Superintend\xEAncia da Pessoa Idosa",
    resultadoEsperado: "Cuidado continuado dispon\xEDvel em todas as regi\xF5es de planejamento at\xE9 2031.",
    indicadores: [
      {
        id: "iin-4",
        nome: "Regi\xF5es com centro-dia em opera\xE7\xE3o",
        descricao: "Regi\xF5es de planejamento cobertas por ao menos um centro-dia.",
        unidade: "Unidade",
        formula: "contagem de regi\xF5es cobertas",
        fonte: "Rede socioassistencial estadual",
        periodicidade: "Semestral",
        valorReferencia: "3",
        anoReferencia: "2026",
        polaridade: "maior_melhor",
        metas: { "2028": "4", "2029": "5", "2030": "6", "2031": "7" }
      }
    ]
  },
  {
    id: "ini-5",
    programaId: "pg-idoso",
    orgao: SEDS,
    nome: "Enfrentamento \xE0 viol\xEAncia contra a pessoa idosa",
    descricao: "Qualifica\xE7\xE3o da rede socioassistencial para notifica\xE7\xE3o e acolhimento.",
    publicoAlvo: "Pessoas idosas em situa\xE7\xE3o de viol\xEAncia",
    causas: ["c2"],
    status: "enviada",
    atualizadoEm: "09/08/2026",
    enviadoEm: "09/08/2026",
    versao: 1
  },
  {
    id: "ini-6",
    programaId: "pg-juventude",
    orgao: SEDS,
    nome: "Inclus\xE3o produtiva de jovens do cadastro social",
    descricao: "Encaminhamento de jovens benefici\xE1rios de programas sociais a cursos e vagas de primeiro emprego.",
    publicoAlvo: "Jovens de 16 a 29 anos inscritos no cadastro social",
    causas: ["c2"],
    status: "em_preenchimento",
    atualizadoEm: "12/08/2026",
    versao: 1
  },
  // Outros órgãos — visíveis apenas na Área Central
  {
    id: "ini-7",
    programaId: "pg-saude",
    orgao: "Secretaria de Sa\xFAde",
    nome: "Amplia\xE7\xE3o da capacidade assistencial",
    descricao: "Amplia\xE7\xE3o de leitos de UTI e requalifica\xE7\xE3o de hospitais regionais.",
    publicoAlvo: "Usu\xE1rios do SUS",
    causas: ["c1", "c1a"],
    status: "em_analise",
    atualizadoEm: "12/08/2026",
    enviadoEm: "11/08/2026",
    analista: "Maria Fonseca",
    versao: 1
  },
  {
    id: "ini-8",
    programaId: "pg-saude",
    orgao: "Secretaria de Sa\xFAde",
    nome: "Fortalecimento da aten\xE7\xE3o especializada",
    descricao: "Amplia\xE7\xE3o da oferta de consultas e exames especializados regionalizados.",
    publicoAlvo: "Usu\xE1rios em fila de regula\xE7\xE3o",
    causas: ["c3"],
    status: "validada",
    atualizadoEm: "10/08/2026",
    enviadoEm: "02/08/2026",
    analista: "Jo\xE3o Peixoto",
    versao: 1
  },
  {
    id: "ini-9",
    programaId: "pg-saude",
    orgao: "Secretaria de Infraestrutura",
    nome: "Obras de hospitais regionais",
    descricao: "Execu\xE7\xE3o das obras civis dos hospitais regionais de Formosa e Urua\xE7u.",
    publicoAlvo: "Popula\xE7\xE3o das regi\xF5es Nordeste e Norte",
    causas: ["c1"],
    status: "enviada",
    atualizadoEm: "09/08/2026",
    enviadoEm: "09/08/2026",
    versao: 1
  },
  {
    id: "ini-10",
    programaId: "pg-fome",
    orgao: "Secretaria de Agricultura",
    nome: "Compra institucional da agricultura familiar",
    descricao: "Aquisi\xE7\xE3o de alimentos da agricultura familiar para equipamentos p\xFAblicos.",
    publicoAlvo: "Agricultores familiares",
    causas: ["c3"],
    status: "validada",
    atualizadoEm: "06/08/2026",
    enviadoEm: "30/07/2026",
    analista: "Jo\xE3o Peixoto",
    versao: 1
  },
  {
    id: "ini-11",
    programaId: "pg-infancia",
    orgao: "Secretaria de Educa\xE7\xE3o",
    nome: "Expans\xE3o da rede de creches",
    descricao: "Cofinanciamento da amplia\xE7\xE3o de vagas em creche em munic\xEDpios de m\xE9dio porte.",
    publicoAlvo: "Crian\xE7as de 0 a 3 anos",
    causas: ["c1", "c1a"],
    status: "em_analise",
    atualizadoEm: "12/08/2026",
    enviadoEm: "10/08/2026",
    analista: "Maria Fonseca",
    versao: 1
  },
  {
    id: "ini-12",
    programaId: "pg-infancia",
    orgao: "Secretaria de Sa\xFAde",
    nome: "Visita\xE7\xE3o domiciliar na primeira inf\xE2ncia",
    descricao: "Implanta\xE7\xE3o de programa estadual de visita\xE7\xE3o domiciliar qualificada.",
    publicoAlvo: "Gestantes e crian\xE7as de 0 a 3 anos",
    causas: ["c2"],
    status: "devolvida",
    atualizadoEm: "11/08/2026",
    enviadoEm: "05/08/2026",
    analista: "Maria Fonseca",
    versao: 2
  }
];
const entregas = [
  {
    id: "ent-1",
    iniciativaId: "ini-1",
    nome: "Restaurantes comunit\xE1rios em funcionamento",
    descricao: "Novas unidades entregues e operando com no m\xEDnimo 300 refei\xE7\xF5es/dia.",
    unidadeMedida: "Unidade",
    metodoComprovacao: "Termo de inaugura\xE7\xE3o e relat\xF3rio mensal de opera\xE7\xE3o",
    comportamentoSugerido: "acumulativa",
    comportamento: "acumulativa",
    comportamentoValidado: true,
    metas: meta(6, 8, null, 12),
    territorio: { tipo: "territorializavel", regioes: ["Nordeste Goiano", "Entorno do DF", "Metropolitana de Goi\xE2nia"] },
    gomap: "sim"
  },
  {
    id: "ent-2",
    iniciativaId: "ini-1",
    nome: "Refei\xE7\xF5es servidas pela rede p\xFAblica",
    descricao: "Refei\xE7\xF5es subsidiadas servidas anualmente na rede estadual.",
    unidadeMedida: "Refei\xE7\xE3o servida",
    metodoComprovacao: "",
    comportamentoSugerido: "fluxo",
    comportamentoValidado: false,
    metas: meta(null, null, null, null),
    territorio: { tipo: null, regioes: [] },
    gomap: "depois"
  },
  {
    id: "ent-3",
    iniciativaId: "ini-1",
    nome: "Equipes de cozinhas comunit\xE1rias capacitadas",
    descricao: "Profissionais capacitados em manipula\xE7\xE3o de alimentos e gest\xE3o da unidade.",
    unidadeMedida: "Profissional capacitado",
    metodoComprovacao: "Lista de presen\xE7a e certifica\xE7\xE3o",
    comportamentoSugerido: "fluxo",
    comportamento: "fluxo",
    comportamentoValidado: true,
    metas: meta(120, 150, 150, 0),
    territorio: { tipo: "nao_territorializavel", regioes: [] },
    gomap: "sim"
  },
  {
    id: "ent-4",
    iniciativaId: "ini-2",
    nome: "Fam\xEDlias benefici\xE1rias do Cart\xE3o Alimenta\xE7\xE3o",
    descricao: "Fam\xEDlias com benef\xEDcio ativo no exerc\xEDcio.",
    unidadeMedida: "Pessoa atendida",
    metodoComprovacao: "Folha de pagamento do benef\xEDcio",
    comportamentoSugerido: "estoque",
    comportamento: "estoque",
    comportamentoValidado: true,
    metas: meta(12e4, 135e3, 14e4, 14e4),
    territorio: { tipo: "estadual", regioes: [] },
    gomap: "sim"
  },
  {
    id: "ent-5",
    iniciativaId: "ini-2",
    nome: "Integra\xE7\xE3o do cadastro social ao pagamento do benef\xEDcio",
    descricao: "Marco de integra\xE7\xE3o entre o cadastro estadual e o operador financeiro.",
    unidadeMedida: "Unidade",
    metodoComprovacao: "Termo de homologa\xE7\xE3o do sistema",
    comportamentoSugerido: "marco",
    comportamento: "marco",
    comportamentoValidado: true,
    metas: meta(1, 0, 0, 0),
    territorio: { tipo: "nao_territorializavel", regioes: [] },
    gomap: "nao"
  },
  {
    id: "ent-6",
    iniciativaId: "ini-3",
    nome: "Alimentos adquiridos da agricultura familiar",
    descricao: "Volume anual adquirido por compra institucional.",
    unidadeMedida: "Tonelada",
    metodoComprovacao: "Notas fiscais de aquisi\xE7\xE3o",
    comportamentoSugerido: "fluxo",
    comportamento: "fluxo",
    comportamentoValidado: true,
    metas: meta(4200, 5e3, 5600, 6e3),
    territorio: { tipo: "territorializavel", regioes: ["Sudoeste Goiano", "Centro Goiano"] },
    gomap: "sim"
  },
  {
    id: "ent-7",
    iniciativaId: "ini-3",
    nome: "Munic\xEDpios com cadeia curta estruturada",
    descricao: "Munic\xEDpios com feiras e centrais de abastecimento apoiadas.",
    unidadeMedida: "Munic\xEDpio atendido",
    metodoComprovacao: "Termo de ades\xE3o municipal",
    comportamentoSugerido: "acumulativa",
    comportamentoValidado: false,
    metas: meta(8, null, 14, 18),
    territorio: { tipo: "territorializavel", regioes: [] },
    gomap: "nao"
  },
  {
    id: "ent-8",
    iniciativaId: "ini-4",
    nome: "Centros-dia implantados",
    descricao: "Unidades regionais em funcionamento.",
    unidadeMedida: "Unidade",
    metodoComprovacao: "Ato de inaugura\xE7\xE3o",
    comportamentoSugerido: "acumulativa",
    comportamento: "acumulativa",
    comportamentoValidado: true,
    metas: meta(4, 6, 5, 4),
    territorio: { tipo: "territorializavel", regioes: ["Norte Goiano", "Sul Goiano", "Metropolitana de Goi\xE2nia"] },
    gomap: "sim"
  },
  {
    id: "ent-9",
    iniciativaId: "ini-4",
    nome: "Pessoas idosas atendidas em cuidado continuado",
    descricao: "Atendimentos continuados registrados na rede.",
    unidadeMedida: "Pessoa atendida",
    metodoComprovacao: "Registro no sistema socioassistencial",
    comportamentoSugerido: "estoque",
    comportamento: "estoque",
    comportamentoValidado: true,
    metas: meta(1800, 2600, 3200, 3800),
    territorio: { tipo: "estadual", regioes: [] },
    gomap: "nao"
  },
  {
    id: "ent-10",
    iniciativaId: "ini-5",
    nome: "Equipes socioassistenciais qualificadas em prote\xE7\xE3o \xE0 pessoa idosa",
    descricao: "Profissionais capacitados na rede municipal e estadual.",
    unidadeMedida: "Profissional capacitado",
    metodoComprovacao: "Certificados emitidos",
    comportamentoSugerido: "fluxo",
    comportamento: "fluxo",
    comportamentoValidado: true,
    metas: meta(400, 400, 400, 400),
    territorio: { tipo: "estadual", regioes: [] },
    gomap: "sim"
  },
  {
    id: "ent-11",
    iniciativaId: "ini-6",
    nome: "Jovens encaminhados a vagas de primeiro emprego",
    descricao: "Encaminhamentos efetivados pela rede socioassistencial.",
    unidadeMedida: "Pessoa atendida",
    metodoComprovacao: "",
    comportamentoSugerido: "fluxo",
    comportamentoValidado: false,
    metas: meta(null, null, null, null),
    territorio: { tipo: null, regioes: [] },
    gomap: null
  },
  {
    id: "ent-12",
    iniciativaId: "ini-7",
    nome: "Leitos de UTI acrescentados",
    descricao: "Novos leitos habilitados nas macrorregi\xF5es deficit\xE1rias.",
    unidadeMedida: "Unidade",
    metodoComprovacao: "Habilita\xE7\xE3o ministerial",
    comportamentoSugerido: "acumulativa",
    comportamento: "acumulativa",
    comportamentoValidado: true,
    metas: meta(60, 80, 60, 40),
    territorio: { tipo: "territorializavel", regioes: ["Norte Goiano", "Nordeste Goiano", "Sudoeste Goiano"] },
    gomap: "nao"
  },
  {
    id: "ent-13",
    iniciativaId: "ini-7",
    nome: "Hospitais regionais requalificados",
    descricao: "Unidades com obras e equipamentos conclu\xEDdos.",
    unidadeMedida: "Unidade",
    metodoComprovacao: "Termo de recebimento definitivo",
    comportamentoSugerido: "acumulativa",
    comportamento: "acumulativa",
    comportamentoValidado: true,
    metas: meta(1, 2, 1, 1),
    territorio: { tipo: "territorializavel", regioes: ["Nordeste Goiano", "Norte Goiano"] },
    gomap: "nao"
  },
  {
    id: "ent-14",
    iniciativaId: "ini-11",
    nome: "Vagas em creche cofinanciadas",
    descricao: "Novas vagas em funcionamento com cofinanciamento estadual.",
    unidadeMedida: "Unidade",
    metodoComprovacao: "Censo escolar",
    comportamentoSugerido: "acumulativa",
    comportamento: "acumulativa",
    comportamentoValidado: true,
    metas: meta(6e3, 8e3, 9e3, 9e3),
    territorio: { tipo: "territorializavel", regioes: ["Entorno do DF", "Sul Goiano"] },
    gomap: "nao"
  },
  {
    id: "ent-15",
    iniciativaId: "ini-12",
    nome: "Munic\xEDpios com visita\xE7\xE3o domiciliar implantada",
    descricao: "Munic\xEDpios com equipes formadas e programa em opera\xE7\xE3o.",
    unidadeMedida: "Munic\xEDpio atendido",
    metodoComprovacao: "Termo de ades\xE3o",
    comportamentoSugerido: "acumulativa",
    comportamentoValidado: false,
    metas: meta(20, null, 40, 50),
    territorio: { tipo: "territorializavel", regioes: [] },
    gomap: "depois"
  }
];
const vinculos = [
  { id: "v-1", entregaId: "ent-1", projetoId: "prj-3120" },
  { id: "v-2", entregaId: "ent-1", projetoId: "prj-3260" },
  { id: "v-3", entregaId: "ent-3", projetoId: "prj-3120" },
  { id: "v-4", entregaId: "ent-3", projetoId: "prj-3201" },
  { id: "v-5", entregaId: "ent-4", projetoId: "prj-3145" },
  { id: "v-6", entregaId: "ent-6", projetoId: "prj-3188" },
  { id: "v-7", entregaId: "ent-8", projetoId: "prj-3305" },
  { id: "v-8", entregaId: "ent-10", projetoId: "prj-3201" },
  { id: "v-9", entregaId: "ent-12", projetoId: "prj-4010" },
  { id: "v-10", entregaId: "ent-12", projetoId: "prj-4020" },
  { id: "v-11", entregaId: "ent-13", projetoId: "prj-4010" }
];
const vinculoAcao = (id, entregaId, acaoId) => ({ id, entregaId, acaoId });
const vinculosAcao = [
  vinculoAcao("va-1", "ent-1", "2210"),
  vinculoAcao("va-2", "ent-2", "2215"),
  vinculoAcao("va-3", "ent-3", "2220"),
  vinculoAcao("va-4", "ent-4", "2230"),
  vinculoAcao("va-5", "ent-5", "2235"),
  vinculoAcao("va-6", "ent-6", "2310"),
  vinculoAcao("va-7", "ent-6", "2315"),
  vinculoAcao("va-8", "ent-8", "2240"),
  vinculoAcao("va-9", "ent-9", "2245"),
  vinculoAcao("va-10", "ent-12", "2045"),
  vinculoAcao("va-11", "ent-12", "2080"),
  vinculoAcao("va-12", "ent-13", "2060"),
  vinculoAcao("va-13", "ent-14", "2410")
];
const comentarios = [
  {
    id: "cm-1",
    alvoTipo: "entrega",
    alvoId: "ent-7",
    campo: "metas",
    texto: "A meta de 2029 n\xE3o foi informada. Se a inten\xE7\xE3o \xE9 n\xE3o haver execu\xE7\xE3o no ano, informe 0 explicitamente.",
    autor: "Maria Fonseca",
    criadoEm: "10/08/2026",
    resolvido: false
  },
  {
    id: "cm-2",
    alvoTipo: "entrega",
    alvoId: "ent-7",
    campo: "territorio",
    texto: "A Entrega foi classificada como territorializ\xE1vel, mas nenhuma regi\xE3o foi indicada.",
    autor: "Maria Fonseca",
    criadoEm: "10/08/2026",
    resolvido: false
  },
  {
    id: "cm-3",
    alvoTipo: "iniciativa",
    alvoId: "ini-3",
    campo: "causas",
    texto: "Relacionar tamb\xE9m a causa de baixa articula\xE7\xE3o entre cadastro e programas, dado o p\xFAblico informado.",
    autor: "Maria Fonseca",
    criadoEm: "10/08/2026",
    resolvido: false
  },
  {
    id: "cm-4",
    alvoTipo: "entrega",
    alvoId: "ent-15",
    campo: "metas",
    texto: "Meta de 2029 ausente na s\xE9rie.",
    autor: "Maria Fonseca",
    criadoEm: "11/08/2026",
    resolvido: false
  }
];
const eventos = [
  { id: "ev-1", iniciativaId: "ini-3", quando: "07/08/2026", autor: ORGAO_SETORIAL, texto: "Iniciativa enviada para an\xE1lise (vers\xE3o 1)" },
  { id: "ev-2", iniciativaId: "ini-3", quando: "08/08/2026", autor: "Maria Fonseca", texto: "An\xE1lise iniciada pela \xC1rea Central" },
  { id: "ev-3", iniciativaId: "ini-3", quando: "10/08/2026", autor: "Maria Fonseca", texto: "Iniciativa devolvida para ajuste com 3 apontamentos" },
  { id: "ev-4", iniciativaId: "ini-2", quando: "10/08/2026", autor: ORGAO_SETORIAL, texto: "Iniciativa enviada para an\xE1lise (vers\xE3o 2)" },
  { id: "ev-5", iniciativaId: "ini-2", quando: "11/08/2026", autor: "Maria Fonseca", texto: "An\xE1lise iniciada pela \xC1rea Central" },
  { id: "ev-6", iniciativaId: "ini-4", quando: "28/07/2026", autor: ORGAO_SETORIAL, texto: "Iniciativa enviada para an\xE1lise (vers\xE3o 1)" },
  { id: "ev-7", iniciativaId: "ini-4", quando: "04/08/2026", autor: "Jo\xE3o Peixoto", texto: "Iniciativa validada" },
  { id: "ev-8", iniciativaId: "ini-5", quando: "09/08/2026", autor: ORGAO_SETORIAL, texto: "Iniciativa enviada para an\xE1lise (vers\xE3o 1)" }
];
function estadoInicial() {
  return {
    orgaoAtual: SEDS,
    usuario: "Vagner Ribeiro",
    analista: "Maria Fonseca",
    programas: PROGRAMAS.map((p) => ({
      aptidao: "apto",
      disponibilizacao: "disponivel",
      ...p
    })),
    semContribuicao: [
      { programaId: "pg-cidades", orgao: SEDS },
      { programaId: "pg-seguranca", orgao: "Secretaria de Educa\xE7\xE3o" }
    ],
    iniciativas,
    entregas,
    vinculos,
    vinculosAcao,
    comentarios,
    eventos
  };
}
export {
  ACOES,
  ANOS,
  EXECUCAO_SIAFIC,
  FONTES,
  IPOFS,
  ORGAOS,
  ORGAO_SETORIAL,
  PERIODICIDADES,
  PROGRAMAS,
  PROJETOS,
  REGIOES,
  UNIDADES,
  estadoInicial
};
