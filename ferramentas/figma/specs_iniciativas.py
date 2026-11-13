import json
D = "dados"
def S(n, o): json.dump(o, open(f"{D}/{n}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

S("spec_i1", {
    "nome": "Fluxo I1 · Planejamento setorial — criar, preencher e enviar a Iniciativa",
    "faixa": "Fluxo de Iniciativas · Planejamento setorial",
    "faixaSub": "O setorial cria a Iniciativa, preenche, salva e envia para avaliação da Área Central.",
    "telas": [
        {"dados": "i1_01_lista", "titulo": "Iniciativas do órgão", "passo": "abre Iniciativas — big numbers por status, filtros e o botão Criar iniciativa"},
        {"dados": "i1_02_nova", "titulo": "Nova Iniciativa", "passo": "clica em Criar iniciativa — Cancelar e Cadastrar ficam no topo do cartão"},
        {"dados": "i1_03_nova_preenchida", "titulo": "Nova Iniciativa preenchida", "passo": "preenche nome, descrição, Programa, Indicadores e causas — o status nasce Em preenchimento"},
        {"dados": "i1_04_ficha", "titulo": "Ficha da Iniciativa", "passo": "abre a Iniciativa — o título é uma ilha com Cancelar, Salvar e Enviar para avaliação"},
        {"dados": "i1_05_ficha_nao_salva", "titulo": "Alterações ainda não salvas", "passo": "altera o nome — o selo avisa que a alteração só vale depois de Salvar"},
        {"dados": "i1_06_envio", "titulo": "Confirmar envio", "passo": "clica em Enviar para avaliação — a janela pede para confirmar o envio para análise"},
        {"dados": "i1_07_enviada", "titulo": "Iniciativa enviada", "passo": "confirma — a Iniciativa fica Enviada e bloqueada para edição"},
    ],
    "handoff": {
        "titulo": "Planejamento setorial — Iniciativa",
        "arquivo": "iniciativas.html · iniciativa/criar.html · iniciativa.html",
        "entrega": "O Planejamento setorial cria a Iniciativa do órgão, preenche os campos e a envia para avaliação da Área Central. A lista mostra só as Iniciativas do órgão, com a contagem por status no alto. Na ficha, as alterações ficam em rascunho até a pessoa clicar em Salvar; Cancelar as descarta. O envio só habilita quando os campos obrigatórios estão preenchidos.",
        "acesso": [
            ["Perfil", "Planejamento setorial e Alta gestão setorial. A Consulta só vê."],
            ["Menu", "Planejamento › Iniciativas."],
            ["Ao fim", "A Iniciativa fica Enviada e segue para a Área Central."],
        ],
        "componentes": [
            ["Big numbers por status", "div.card.border-dashed em fundo translúcido, com número, ícone e rótulo; não são clicáveis"],
            ["Ilha", "cartão branco com borda cinza de 1px, cantos arredondados e 8px de distância dos vizinhos"],
            ["Busca em catálogo (Indicadores)", "campo de busca sobre uma tabela com Tipo, Unidade e Linha de base; só escolhe o que já existe"],
            ["Selo de alterações", "badge-soft-warning “alterações não salvas”, enquanto houver rascunho"],
            ["Janela de envio", "div.modal com o aviso de pendências e o botão Confirmar envio para análise"],
        ],
        "tabelas": [{"titulo": "Campos da Iniciativa", "cab": ["Campo", "Obrigatório", "Edita", "Componente"], "linhas": [
            ["Nome da iniciativa", "Sim", "Sim", "Texto"],
            ["Status", "—", "Não (só para ver)", "Texto bloqueado"],
            ["Descrição da iniciativa", "Não", "Sim", "Área de texto"],
            ["Programa", "Não", "Sim", "Lista"],
            ["Indicadores", "Não", "Sim", "Busca em catálogo"],
            ["Causa e subcausa", "Sim (pelo menos uma)", "Sim", "Caixas de seleção"],
        ]}],
        "secoes": [
            {"titulo": "Status", "texto": "O status nunca se digita: a Iniciativa nasce Em preenchimento, vira Enviada ao confirmar o envio e é levada a Validada ou Devolvida pela Área Central."},
            {"titulo": "Salvar e Cancelar", "texto": "Salvar grava as alterações e continua na ficha. Cancelar descarta o que não foi salvo e volta à lista. Ao enviar, o que estiver em rascunho vai junto."},
            {"titulo": "Quando o envio habilita", "texto": "Só com o nome preenchido e pelo menos uma causa marcada. Enquanto faltar algo, o botão fica bloqueado e explica o motivo."},
        ],
        "estados": ["Lista — status e filtros", "Formulário vazio", "Formulário preenchido", "Ficha — alterações não salvas", "Janela de confirmação", "Enviada — somente leitura"],
    },
})

S("spec_i2", {
    "nome": "Fluxo I2 · Área Central — avaliar a Iniciativa campo a campo",
    "faixa": "Fluxo de Iniciativas · Avaliação da Área Central",
    "faixaSub": "A Central só avalia: aprova ou reprova cada campo, e devolve a Iniciativa ao setorial.",
    "telas": [
        {"dados": "i2_01_lista", "titulo": "Cadastro de Iniciativas", "passo": "a Central vê todas as Iniciativas do plano; o ícone de avaliar abre a ficha"},
        {"dados": "i2_02_inicio", "titulo": "Avaliação começa", "passo": "abre a Iniciativa enviada — cada campo tem os botões ✓ e ✗, e Devolver está bloqueado"},
        {"dados": "i2_03_avaliando", "titulo": "Avaliando campo a campo", "passo": "aprova uns campos e reprova outro — o campo ganha fundo verde ou vermelho, e o reprovado pede justificativa"},
        {"dados": "i2_04_completa", "titulo": "Todos os campos avaliados", "passo": "avalia todos os campos — o botão Devolver iniciativa é liberado"},
        {"dados": "i2_05_devolvida", "titulo": "Iniciativa devolvida", "passo": "clica em Devolver iniciativa — com um campo reprovado, ela volta ao setorial como Devolvida"},
    ],
    "handoff": {
        "titulo": "Área Central — avaliação da Iniciativa",
        "arquivo": "central-iniciativas.html · central-iniciativa.html",
        "entrega": "A Área Central não cria nem edita Iniciativa. Ela abre a Iniciativa enviada e avalia cada campo: aprova (✓) ou reprova (✗, com justificativa obrigatória). Aprovar todos e Reprovar todos ajudam nos casos extremos. Salvar guarda a avaliação em andamento para continuar outro dia; Devolver iniciativa encerra, e só habilita quando todos os campos foram avaliados.",
        "acesso": [
            ["Perfil", "Administrador central e Alta gestão central. A Consulta só vê."],
            ["Menu", "Planejamento › Iniciativas, ícone de avaliar na coluna Ações."],
            ["Ao fim", "Todos aprovados: Validada. Algum reprovado: Devolvida, de volta ao setorial."],
        ],
        "componentes": [
            ["Botões ✓ e ✗", "dois botões de ícone à direita de cada campo; o escolhido fica cheio na cor"],
            ["Campo avaliado", "bloco com fundo verde ou vermelho claro e borda tracejada na mesma cor"],
            ["Justificativa", "área de texto que aparece sob o campo reprovado; obrigatória para encerrar"],
            ["Ações do cabeçalho", "Aprovar todos os campos, Reprovar todos os campos, Salvar e Devolver iniciativa"],
        ],
        "tabelas": [{"titulo": "Campos avaliados", "cab": ["Campo", "Aprova", "Reprova", "Justificativa"], "linhas": [
            ["Nome da iniciativa", "✓", "✗", "Obrigatória se reprovado"],
            ["Descrição da iniciativa", "✓", "✗", "Obrigatória se reprovado"],
            ["Programa", "✓", "✗", "Obrigatória se reprovado"],
            ["Indicadores", "✓", "✗", "Obrigatória se reprovado"],
            ["Causa e subcausa", "✓", "✗", "Obrigatória se reprovado"],
        ]}],
        "secoes": [
            {"titulo": "Salvar e Devolver", "texto": "Salvar não exige nada: guarda os ✓ e ✗ e as justificativas já feitas. Devolver iniciativa só fica clicável com todos os campos avaliados e com justificativa em cada reprovado."},
            {"titulo": "Resultado", "texto": "Todos os campos aprovados levam a Iniciativa ao status Validada. Basta um campo reprovado para ela voltar ao setorial como Devolvida."},
        ],
        "estados": ["Lista da Central", "Nenhum campo avaliado — Devolver bloqueado", "Avaliação em andamento", "Todos avaliados — Devolver liberado", "Devolvida"],
    },
})

S("spec_i3", {
    "nome": "Fluxo I3 · Ciclo de devolução — corrigir, reenviar e validar",
    "faixa": "Fluxo de Iniciativas · Ciclo de devolução",
    "faixaSub": "O setorial corrige só o que foi reprovado, reenvia, e a Central reavalia só esse campo até validar.",
    "telas": [
        {"dados": "i3_01_ficha_devolvida", "titulo": "Ficha devolvida", "passo": "o setorial abre a Iniciativa devolvida — campos aprovados em verde e travados, reprovado livre, cartão Pendências"},
        {"dados": "i3_02_corrigindo", "titulo": "Corrigindo o campo", "passo": "edita só o campo reprovado — o selo avisa que falta salvar"},
        {"dados": "i3_03_reavaliacao", "titulo": "Reavaliação da Central", "passo": "reenvia — a Central vê os campos já aprovados travados em verde e avalia só o campo corrigido"},
        {"dados": "i3_04_validada_central", "titulo": "Validada — visão da Central", "passo": "aprova o campo — a Iniciativa fica Validada e a Central só visualiza"},
        {"dados": "i3_05_validada_setorial", "titulo": "Validada — visão do setorial", "passo": "o setorial também só visualiza: campos bloqueados e sem as marcações em verde"},
    ],
    "handoff": {
        "titulo": "Ciclo de devolução e validação",
        "arquivo": "iniciativa.html · central-iniciativa.html",
        "entrega": "Quando a Central devolve, a ficha do setorial mostra o cartão Pendências, com cada campo reprovado e sua justificativa. Só os campos reprovados se editam; os aprovados aparecem em verde e travados. No reenvio, a versão da Iniciativa sobe, os campos aprovados continuam aprovados e a Central avalia apenas o que foi corrigido. Com tudo aprovado, a Iniciativa fica Validada: os dois lados só visualizam, sem as marcações em verde.",
        "acesso": [
            ["Perfil", "Setorial corrige e reenvia; Central reavalia."],
            ["Menu", "Planejamento › Iniciativas."],
            ["Ao fim", "A Iniciativa fica Validada, somente leitura, e passa a compor o plano."],
        ],
        "componentes": [
            ["Cartão Pendências", "só aparece em Iniciativa devolvida; lista os campos reprovados e as justificativas"],
            ["Campo aprovado", "fundo verde claro, borda tracejada verde, travado"],
            ["Campo reprovado", "livre para edição até o reenvio"],
            ["Campo travado na reavaliação", "botões ✓ e ✗ do campo já aprovado ficam bloqueados"],
        ],
        "tabelas": [{"titulo": "O que cada status permite", "cab": ["Status", "Setorial edita", "Central avalia", "Marcações em verde"], "linhas": [
            ["Em preenchimento", "Tudo", "Não", "—"],
            ["Enviada", "Não", "Sim", "Só na Central, nos campos aprovados antes"],
            ["Devolvida", "Só os reprovados", "Não", "Campos aprovados, no setorial"],
            ["Validada", "Não", "Não", "Não aparecem"],
        ]}],
        "secoes": [
            {"titulo": "Versões", "texto": "Cada reenvio cria uma versão nova. A avaliação anterior não volta a zero: o que foi aprovado fica aprovado."},
            {"titulo": "Fim do fluxo", "texto": "Validada é o último status. Nenhum dos dois perfis edita ou avalia de novo; a tela é só para consulta."},
        ],
        "estados": ["Devolvida — pendências à vista", "Correção em andamento", "Reavaliação — só o campo corrigido", "Validada — Central", "Validada — setorial"],
    },
})
print("specs ok")
