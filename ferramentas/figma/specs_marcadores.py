import json
D = "dados"
def S(n, o): json.dump(o, open(f"{D}/{n}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

COMUM_COMP = [
    ["Cartão com cabeçalho", "div.card > div.card-header — título, subtítulo e as ações no canto superior direito"],
    ["Barra de filtros", "div.filtros — busca livre, Exportar, Limpar e Buscar"],
    ["Tabela densa", ".table dentro de .content-page, com coluna Ações"],
    ["Selo de marcador", "span.badge na cor escolhida, com o nome"],
]

S("spec_mk1", {
    "nome": "Fluxo M1 · Marcadores — Listagem e busca",
    "faixa": "Fluxo de Gestão · Marcadores · Listagem e busca",
    "faixaSub": "Os marcadores que a pessoa pode usar, com a cor, a área e a descrição; o administrador vê todos.",
    "telas": [
        {"dados": "mk1_01_lista", "titulo": "Listagem", "passo": "abre Gestão › Marcadores — o Administrador central vê os 40 marcadores de exemplo"},
        {"dados": "mk1_02_busca", "titulo": "Busca aplicada", "passo": "digita “prioridade” e clica em Buscar — só as linhas que casam ficam"},
        {"dados": "mk1_03_sem_resultado", "titulo": "Sem resultado", "passo": "busca por um texto que ninguém tem — a tabela avisa que nada corresponde"},
        {"dados": "mk1_04_lista_setorial", "titulo": "Visão do setorial", "passo": "o Planejamento setorial abre a mesma tela e vê só os marcadores do perfil dele"},
    ],
    "handoff": {
        "titulo": "Marcadores — Listagem e busca",
        "arquivo": "central-marcador.html",
        "entrega": "Lista os marcadores: etiquetas coloridas que a pessoa põe nos Programas para achá-los depois. Cada linha mostra o nome no selo da cor escolhida, a área (quem pode usar) e a descrição. Cada pessoa vê os marcadores que pode usar: os dela e os do perfil dela; o administrador vê todos.",
        "acesso": [
            ["Perfil", "Todos. Quem tem escrita cria e edita; Consulta só lê."],
            ["Menu", "Planejamento › Gestão › Marcadores. Na visão setorial, o último item do menu."],
            ["Permissão", "Cada pessoa vê os marcadores “só para mim” que criou e os marcados para o perfil dela. O administrador vê também os de qualquer perfil."],
        ],
        "componentes": COMUM_COMP,
        "tabelas": [{"titulo": "Colunas da listagem", "cab": ["Coluna", "Tipo", "Obrig.", "Regra"], "linhas": [
            ["Marcador", "Texto", "—", "O nome do marcador."],
            ["Cor", "Selo", "—", "O nome sobre a cor escolhida, texto branco."],
            ["Área", "Texto", "—", "“Só para mim” ou “Todos: <perfil>”."],
            ["Descrição", "Texto", "—", "Para que serve; aparece na dica nos Programas."],
            ["Ações", "Botão", "—", "Editar para quem pode alterar; Ver para quem só lê."],
        ]}],
        "secoes": [
            {"titulo": "Quem vê o quê", "texto": "O marcador “só para mim” é visível só para quem o criou. O marcado para um perfil é visível para todos que têm o perfil. O administrador (Administrador central e Alta gestão central) vê também os marcados para qualquer perfil, mas não os “só para mim” de outras pessoas."},
            {"titulo": "Marcadores de exemplo", "texto": "O protótipo traz 40 marcadores de exemplo, gravados uma vez na primeira carga, em temas de prioridade, situação, risco, recurso e área de governo."},
        ],
        "estados": ["Listagem — marcadores do perfil", "Busca aplicada — só as linhas que casam", "Sem resultado — mensagem na tabela", "Visão do setorial — só os marcadores do perfil", "Somente leitura — botão Ver no lugar de Editar"],
    },
})

S("spec_mk2", {
    "nome": "Fluxo M2 · Marcadores — Criar",
    "faixa": "Fluxo de Gestão · Marcadores · Criar",
    "faixaSub": "Nome, área, descrição e cor. O administrador marca para todo um perfil; os demais só para si.",
    "telas": [
        {"dados": "mk2_01_criar_admin", "titulo": "Novo marcador", "passo": "clica em Novo marcador — o administrador pode escolher a área"},
        {"dados": "mk2_02_erros", "titulo": "Campo obrigatório", "passo": "clica em Cadastrar sem preencher — o nome aparece em vermelho"},
        {"dados": "mk2_03_preenchido", "titulo": "Preenchido", "passo": "nome, área para um perfil, descrição e uma cor — o selo mostra a prévia"},
        {"dados": "mk2_04_criar_setorial", "titulo": "Visão do setorial", "passo": "outro perfil: a área fica travada em “Só para mim”"},
    ],
    "handoff": {
        "titulo": "Marcadores — Criar",
        "arquivo": "central-marcador/criar.html",
        "entrega": "Cria um marcador com quatro campos: nome, área, descrição e cor. A área diz quem pode usar o marcador: o administrador escolhe entre “só para mim” e todo um perfil; os demais perfis só podem marcar para si.",
        "acesso": [
            ["Perfil", "Todos com escrita. Consulta não cria."],
            ["Menu", "Planejamento › Gestão › Marcadores › Novo marcador"],
            ["Ao fim", "Volta para a listagem com o marcador criado, vinculado ao plano escolhido."],
        ],
        "componentes": [
            ["Cartão com cabeçalho", "div.card > div.card-header — título e Cancelar / Cadastrar no canto superior direito"],
            ["Campo de texto", "input.form-control, rótulo com asterisco quando obrigatório"],
            ["Seleção", "select.form-select — Área do marcador"],
            ["Seletor de cor", "dez círculos (input radio) nas cores do tema, com o selo de prévia ao lado"],
            ["Mensagem de erro", "div.invalid-feedback abaixo do campo"],
        ],
        "tabelas": [{"titulo": "Campos do formulário", "cab": ["Campo", "Tipo", "Obrig.", "Regra"], "linhas": [
            ["Nome do marcador", "Texto", "Sim", "Como o marcador aparece no selo."],
            ["Área do marcador", "Seleção", "Sim", "Administrador: “Só para mim” ou um dos cinco perfis. Demais: só “Só para mim”, campo travado."],
            ["Cor do marcador", "Cor", "Sim", "Uma das dez cores do tema; a primeira vem escolhida."],
            ["Descrição", "Texto longo", "Não", "Para que serve o marcador."],
        ]}],
        "secoes": [
            {"titulo": "Área do marcador", "texto": "“Só para mim”: só quem criou enxerga e usa. “Todos que têm o perfil”: o marcador fica disponível para todo o perfil escolhido. No protótipo não há login por pessoa, então “eu” é o perfil com que se entrou."},
        ],
        "estados": ["Novo — administrador com a lista de perfis", "Nome vazio — mensagem em vermelho", "Preenchido — prévia do selo na cor escolhida", "Outro perfil — Área travada em “Só para mim”"],
    },
})

S("spec_mk3", {
    "nome": "Fluxo M3 · Marcadores — Editar e excluir",
    "faixa": "Fluxo de Gestão · Marcadores · Editar e excluir",
    "faixaSub": "Corrigir um marcador e excluí-lo, com justificativa, quando nenhum Programa o usa.",
    "telas": [
        {"dados": "mk3_01_editar", "titulo": "Editar marcador", "passo": "clica em Editar numa linha — os campos vêm preenchidos"},
        {"dados": "mk3_02_leitura_setorial", "titulo": "Só leitura", "passo": "quem não criou o marcador (setorial vendo o do administrador) só lê"},
        {"dados": "mk3_03_excluir", "titulo": "Excluir marcador", "passo": "clica em Excluir num marcador sem uso — a janela pede a justificativa"},
        {"dados": "mk3_04_excluir_bloqueado", "titulo": "Excluir bloqueado", "passo": "marcador já posto em um Programa — Excluir fica desabilitado e o aviso diz o que depende dele"},
    ],
    "handoff": {
        "titulo": "Marcadores — Editar e excluir",
        "arquivo": "central-marcador/editar.html",
        "entrega": "Edita os quatro campos de um marcador e permite excluí-lo. Edita quem criou o marcador e, no caso dos marcados para um perfil, o administrador. Marcador já posto em algum Programa não pode ser excluído.",
        "acesso": [
            ["Perfil", "Quem criou o marcador; o administrador edita também os marcados para perfis. Os demais só leem."],
            ["Menu", "Planejamento › Gestão › Marcadores › Editar"],
            ["Ao fim", "Volta para a listagem com a alteração, ou sem o marcador excluído."],
        ],
        "componentes": [
            ["Cartão com cabeçalho", "div.card > div.card-header — título e as ações no canto superior direito"],
            ["Campo desabilitado", "input.form-control disabled — “Criado por”, que o sistema preenche"],
            ["Aviso de vínculos", "div.alert no cartão — lista o que usa o marcador e desabilita Excluir"],
            ["Janela de confirmação", "div.modal — pede a justificativa antes de excluir"],
            ["Campo de justificativa", "textarea.form-control — obrigatório, mínimo de 20 caracteres"],
        ],
        "tabelas": [{"titulo": "Quem pode o quê", "cab": ["Quem", "Marcador", "Pode", "Regra"], "linhas": [
            ["Quem criou", "Seu, “só para mim”", "Editar e excluir", "Só ele enxerga."],
            ["Administrador", "Marcado para um perfil", "Editar e excluir", "Administra os marcadores dos perfis."],
            ["Quem tem o perfil", "Marcado para o perfil", "Só ver", "Usa nos Programas, mas não altera."],
        ]}],
        "secoes": [
            {"titulo": "Exclusão", "texto": "Toda exclusão pede justificativa de no mínimo 20 caracteres, registrada no histórico. Marcador já posto em um Programa não se exclui: o botão fica desabilitado e o aviso lista “Programa (n)”. Tire o marcador dos Programas antes."},
        ],
        "estados": ["Edição — campos preenchidos e Criado por", "Só leitura — campos desabilitados, só Voltar", "Excluir — janela com justificativa", "Com uso — Excluir desabilitado e aviso de vínculos"],
    },
})

S("spec_mk4", {
    "nome": "Fluxo M4 · Marcadores nos Programas",
    "faixa": "Fluxo de Programas · Marcadores nos Programas",
    "faixaSub": "Pôr, ver e filtrar marcadores nos Programas: no cadastro, na Home do plano e na visão do setorial.",
    "telas": [
        {"dados": "mk4_01_cadastro", "titulo": "Cadastro de Programa", "passo": "a primeira coluna passa a ser Marcador, com um selo na cor de cada marcador"},
        {"dados": "mk4_02_dica", "titulo": "Dica do selo", "passo": "passa o mouse num selo — nome, descrição e a observação daquele Programa"},
        {"dados": "mk4_03_filtro", "titulo": "Filtro por marcador", "passo": "abre o filtro Marcador — escolhe um ou mais e clica em Buscar"},
        {"dados": "mk4_04_janela_dropdown", "titulo": "Adicionar marcadores", "passo": "clica no ícone de tag ao lado de Editar — a janela abre com o dropdown"},
        {"dados": "mk4_05_janela_previa", "titulo": "Escolher e observar", "passo": "escolhe um marcador — vê a cor, o título e a descrição — e escreve a observação"},
        {"dados": "mk4_06_janela_lista", "titulo": "Marcadores do registro", "passo": "a lista enxuta mostra o que já está no Programa, com um X para tirar"},
        {"dados": "mk4_07_formulario", "titulo": "Formulário do Programa", "passo": "o formulário de editar ganha o campo Marcadores, um dropdown com caixas de marcar"},
        {"dados": "mk4_08_home", "titulo": "Home do plano", "passo": "a aba Programas da Home mostra a coluna, o filtro e o botão de marcar"},
        {"dados": "mk4_09_setorial", "titulo": "Visão do setorial", "passo": "o Planejamento setorial vê a coluna e filtra, só para consulta"},
    ],
    "handoff": {
        "titulo": "Marcadores nos Programas",
        "arquivo": "central-programas.html · ppa-detalhe.html · programas.html",
        "entrega": "Liga os marcadores aos Programas. A Área Central põe e tira marcadores pelo cadastro, pela Home do plano ou pelo formulário. Em qualquer tela de Programas, a primeira coluna mostra os marcadores do Programa e há um filtro por marcador. O planejamento setorial vê os marcadores e filtra, mas não altera.",
        "acesso": [
            ["Perfil", "Pôr e tirar: quem edita Programas (Administrador central e Alta gestão central). Ver e filtrar: todos."],
            ["Menu", "Cadastros › Programa; Home › aba Programas; Programas (visão setorial)."],
            ["Permissão", "Os perfis setoriais e Consulta só visualizam."],
        ],
        "componentes": [
            ["Selo na tabela", "span.badge.rounded-pill com ti-tag, na cor do marcador, e dica (Tooltip) com nome, descrição e observação"],
            ["Botão Adicionar marcadores", "button.btn.btn-sm com ti-tag-plus, ao lado de Editar"],
            ["Janela de marcadores", "div.modal — dropdown, prévia do marcador, observação e lista com X"],
            ["Filtro Marcador", "select multiselect (Choices.js) na barra de filtros; na Home e no setorial, select simples"],
            ["Dropdown com caixas", "campo Marcadores do formulário: button.form-select + dropdown-menu com input checkbox"],
        ],
        "tabelas": [{"titulo": "Onde o marcador aparece", "cab": ["Tela", "Coluna", "Filtro", "Põe e tira"], "linhas": [
            ["Cadastro de Programa", "Sim", "Sim", "Sim"],
            ["Home do plano — aba Programas", "Sim", "Sim", "Sim"],
            ["Formulário do Programa", "Campo", "—", "Sim"],
            ["Programas do PPA — setorial", "Sim", "Sim", "Não"],
        ]}],
        "secoes": [
            {"titulo": "Quem vê o marcador no Programa", "texto": "Quem vê o Programa vê os marcadores postos nele, seja qual for a área do marcador. A área decide só quem pode usar o marcador para marcar. O filtro oferece os marcadores que a pessoa pode usar e os que já estão postos nos Programas listados."},
            {"titulo": "Observação", "texto": "Ao pôr um marcador num Programa, a pessoa pode escrever uma observação. Ela vale só para aquele marcador naquele Programa e aparece na dica do selo."},
            {"titulo": "Marcador de outra pessoa", "texto": "Na janela, o marcador que a pessoa não pode usar aparece com um cadeado: fica no Programa e não pode ser tirado por ela."},
        ],
        "estados": ["Cadastro — coluna Marcador", "Dica — nome, descrição e observação", "Filtro aberto — marcadores disponíveis", "Janela vazia — dropdown", "Janela com prévia — cor, título, descrição e observação", "Janela com lista — marcadores do Programa", "Formulário — campo Marcadores aberto", "Home — coluna, filtro e botão", "Setorial — só consulta"],
    },
})
print("specs ok")
