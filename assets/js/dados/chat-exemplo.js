/**
 * Conversas de exemplo do chat da equipe.
 *
 * O protótipo não tem servidor de mensagens: para o chat não nascer vazio, cada perfil recebe estas conversas na
 * primeira vez que abre o sistema. São pessoas dos órgãos e da Área Central, tratando do que o PPA de fato pede —
 * prazos, devoluções, metas, vínculos com a LOA. Parte delas tem mensagens ainda não lidas.
 *
 * Mensagem: `{ de: "eu" | "outro", texto, em: "dd/mm/aaaa hh:mm", lida }`. `lida` só importa no que se recebeu.
 */

/** Pessoas com quem se conversa, além da equipe do plano. */
export const CONTATOS_EXEMPLO = [
    { id: "ct-01", nome: "Ana Paula Moreira", funcao: "Planejamento setorial · Secretaria da Saúde" },
    { id: "ct-02", nome: "Bruno Carvalho", funcao: "Planejamento setorial · Secretaria da Educação" },
    { id: "ct-03", nome: "Carla Mendes", funcao: "Alta gestão setorial · Secretaria da Educação" },
    { id: "ct-04", nome: "Diego Araújo", funcao: "Planejamento setorial · Segurança Pública" },
    { id: "ct-05", nome: "Elaine Rocha", funcao: "Administradora central · Economia" },
    { id: "ct-06", nome: "Fábio Nogueira", funcao: "Planejamento setorial · Infraestrutura" },
    { id: "ct-07", nome: "Gabriela Lima", funcao: "Planejamento setorial · Desenvolvimento Social" },
    { id: "ct-08", nome: "Henrique Duarte", funcao: "Alta gestão central · Economia" },
    { id: "ct-09", nome: "Isabela Freitas", funcao: "Planejamento setorial · Meio Ambiente" },
    { id: "ct-10", nome: "João Victor Alves", funcao: "Planejamento setorial · Agricultura" },
    { id: "ct-11", nome: "Karina Souza", funcao: "Consulta · Controladoria-Geral do Estado" },
    { id: "ct-12", nome: "Leonardo Pires", funcao: "Planejamento setorial · Cultura" },
    { id: "ct-13", nome: "Mariana Teixeira", funcao: "Administradora central · Economia" },
    { id: "ct-14", nome: "Nelson Batista", funcao: "Alta gestão setorial · Segurança Pública" },
    { id: "ct-15", nome: "Olívia Campos", funcao: "Planejamento setorial · Ciência e Tecnologia" },
    { id: "ct-16", nome: "Paulo Sérgio Reis", funcao: "Planejamento setorial · Esporte e Lazer" },
    { id: "ct-17", nome: "Renata Barbosa", funcao: "Alta gestão setorial · Saúde" },
    { id: "ct-18", nome: "Samuel Costa", funcao: "Planejamento setorial · Habitação" },
    { id: "ct-19", nome: "Tatiane Gomes", funcao: "Consulta · Tribunal de Contas do Estado" },
    { id: "ct-20", nome: "Vinícius Moraes", funcao: "Planejamento setorial · Turismo" },
    { id: "ct-21", nome: "Yasmin Ferreira", funcao: "Planejamento setorial · Mulher" },
    { id: "ct-22", nome: "Wagner Lopes", funcao: "Administrador central · Economia" },
];

const m = (de, texto, em, lida = true) => ({ de, texto, em, lida });

/** As conversas, por contato. As últimas mensagens recebidas com `lida: false` aparecem como não lidas. */
export const CONVERSAS_EXEMPLO = {
    "ct-01": [
        m("outro", "Bom dia! A Iniciativa de atenção primária voltou com devolução. Podem me dizer o que precisa ajustar?", "24/11/2026 08:42"),
        m("eu", "Bom dia, Ana. Faltou a meta de 2029 na Entrega de UBS reformadas e a ação orçamentária vinculada.", "24/11/2026 09:10"),
        m("outro", "Entendi. Vou falar com o financeiro e corrijo ainda hoje.", "24/11/2026 09:15"),
        m("outro", "Pronto, ajustei a meta e vinculei a ação 2135. Reenviei para análise.", "27/11/2026 08:05", false),
    ],
    "ct-02": [
        m("eu", "Bruno, o Programa de Educação Plena ainda está sem indicador de resultado.", "23/11/2026 14:20"),
        m("outro", "Vamos usar a taxa de aprovação no ensino médio. Cadastro hoje.", "23/11/2026 14:31"),
        m("eu", "Perfeito, obrigado.", "23/11/2026 14:33"),
    ],
    "ct-03": [
        m("outro", "A proposta da Educação já está aprovada aqui na alta gestão. Pode seguir para a Central?", "26/11/2026 17:48", false),
        m("outro", "Só confirmando o prazo final para envio: é dia 04/12?", "26/11/2026 17:49", false),
    ],
    "ct-04": [
        m("outro", "Preciso de ajuda para cadastrar a causa \"baixa integração entre as polícias\". O sistema diz que já existe.", "25/11/2026 10:02"),
        m("eu", "Ela já está no catálogo, é só buscar e vincular. Assim ela conta para os dois problemas.", "25/11/2026 10:09"),
        m("outro", "Achei! Vinculei. Obrigado.", "25/11/2026 10:12"),
    ],
    "ct-05": [
        m("outro", "Terminei a revisão dos Programas de infraestrutura. Três estão sem objetivo estratégico.", "27/11/2026 07:55", false),
    ],
    "ct-06": [
        m("eu", "Fábio, a Entrega \"Construção da ponte sobre o Rio Vermelho\" é nome de projeto, não de Entrega.", "20/11/2026 11:30"),
        m("outro", "Faz sentido. Troco para \"Ligação viária entre os municípios da região\"?", "20/11/2026 11:44"),
        m("eu", "Isso, o resultado para a sociedade. A obra fica no Projeto GOMAP.", "20/11/2026 11:47"),
        m("outro", "Alterado.", "20/11/2026 12:02"),
    ],
    "ct-07": [
        m("outro", "Oi! Como faço para pôr a etiqueta de Inclusão social em todos os Programas do órgão de uma vez?", "26/11/2026 15:12"),
        m("eu", "Na lista de Programas, use o botão de etiquetas em cada um. Em lote, só na tela de Etiquetas por enquanto.", "26/11/2026 15:20"),
        m("outro", "Certo, vou fazendo um por um mesmo.", "26/11/2026 15:22", false),
    ],
    "ct-08": [
        m("outro", "Precisamos do consolidado das finalísticas para a reunião de segunda.", "27/11/2026 08:20", false),
        m("outro", "Consegue me mandar o relatório até sexta à tarde?", "27/11/2026 08:21", false),
    ],
    "ct-09": [
        m("eu", "Isabela, a linha de base do indicador de área desmatada está com data de 2019.", "18/11/2026 09:00"),
        m("outro", "É o último dado oficial disponível. Coloco a fonte na observação.", "18/11/2026 09:40"),
    ],
    "ct-10": [
        m("outro", "O Programa de agro tem duas ações orçamentárias para a mesma Entrega. Pode?", "24/11/2026 16:05"),
        m("eu", "A ação financia no máximo uma Entrega, mas uma Entrega pode ter mais de uma ação.", "24/11/2026 16:18"),
        m("outro", "Ótimo, então está certo.", "24/11/2026 16:20"),
    ],
    "ct-11": [
        m("outro", "Bom dia. A CGE precisa da extração das Entregas com meta e valor por ano. Já está disponível?", "25/11/2026 09:30"),
        m("eu", "Ainda não, a extração está prevista para depois da consolidação.", "25/11/2026 09:47"),
    ],
    "ct-12": [
        m("outro", "Enviei a contribuição da Cultura. Podem confirmar o recebimento?", "26/11/2026 18:30", false),
    ],
    "ct-13": [
        m("eu", "Mariana, você pega a análise da Saúde ou eu fico com ela?", "25/11/2026 13:00"),
        m("outro", "Pode ficar, eu sigo com Educação e Segurança.", "25/11/2026 13:04"),
        m("eu", "Combinado.", "25/11/2026 13:05"),
    ],
    "ct-14": [
        m("outro", "A alta gestão da Segurança devolveu a Iniciativa de videomonitoramento. Faltou justificar o valor.", "22/11/2026 10:10"),
        m("eu", "Obrigado pelo aviso, vou acompanhar com o setorial.", "22/11/2026 10:25"),
    ],
    "ct-15": [
        m("outro", "O indicador de startups apoiadas pode ser de periodicidade anual?", "21/11/2026 15:00"),
        m("eu", "Pode sim, desde que a meta seja anual também.", "21/11/2026 15:08"),
    ],
    "ct-16": [
        m("outro", "Não estou conseguindo enviar a contribuição. O botão fica desabilitado.", "27/11/2026 07:40", false),
    ],
    "ct-17": [
        m("eu", "Renata, a proposta da Saúde pode ser aprovada pela alta gestão? Já está tudo preenchido.", "24/11/2026 17:00"),
        m("outro", "Vou revisar amanhã cedo e aprovo.", "24/11/2026 17:15"),
        m("outro", "Aprovado!", "25/11/2026 08:30"),
    ],
    "ct-18": [
        m("outro", "Qual o prazo para revisar as metas de habitação de interesse social?", "19/11/2026 11:00"),
        m("eu", "Até 04/12, junto com o envio da contribuição.", "19/11/2026 11:20"),
    ],
    "ct-19": [
        m("outro", "O TCE vai acompanhar a elaboração. Teremos acesso de consulta ao plano?", "23/11/2026 10:00"),
        m("eu", "Sim, o perfil Consulta vê todo o plano, sem edição.", "23/11/2026 10:12"),
        m("outro", "Obrigada.", "23/11/2026 10:13"),
    ],
    "ct-20": [
        m("outro", "Vocês recomendam uma etiqueta para os Programas de turismo regional?", "26/11/2026 09:50"),
        m("eu", "Use a de Desenvolvimento regional. Se faltar, peça o cadastro à Central.", "26/11/2026 10:05"),
    ],
    "ct-21": [
        m("outro", "A Iniciativa de enfrentamento à violência contra a mulher foi validada?", "27/11/2026 08:12", false),
    ],
    "ct-22": [
        m("eu", "Wagner, conferi o valor previsto do plano: bate com a soma das ações da LOA.", "20/11/2026 16:40"),
        m("outro", "Ótimo. Fechamos o valor na próxima reunião.", "20/11/2026 16:52"),
    ],
};
