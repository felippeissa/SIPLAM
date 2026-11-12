import json
D = "dados"
def S(n, o): json.dump(o, open(f"{D}/{n}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

S("spec_u1", {
    "nome": "Fluxo U1 · Home do plano — situação, informações e números",
    "faixa": "Fluxo de Home · Situação, informações e números",
    "faixaSub": "A Home do PPA mostra onde o plano está, os dados institucionais e os números do plano; abaixo, em ilha própria, as abas trocam a tabela.",
    "telas": [
        {"dados": "u1_01_home", "titulo": "Home do plano", "passo": "abre a Home — situação em linha do tempo, informações institucionais e os seis números do plano"},
        {"dados": "u1_02_descricao", "titulo": "Descrição aberta", "passo": "clica em “Ver mais” — a descrição inteira aparece; “Ver menos” a recolhe"},
        {"dados": "u1_03_aba_causas", "titulo": "Aba escolhida: Causas", "passo": "clica na aba Causas (68) — a tabela de Causas aparece"},
        {"dados": "u1_04_aba_indicadores", "titulo": "Aba escolhida: Indicadores", "passo": "clica na aba Indicadores (47) — a tabela de Indicadores aparece com o filtro dela"},
        {"dados": "u1_05_home_setorial", "titulo": "Visão do setorial", "passo": "o Planejamento setorial vê a mesma Home, sem os botões de Adicionar e Editar"},
    ],
    "handoff": {
        "titulo": "Home do plano",
        "arquivo": "ppa-detalhe.html",
        "entrega": "A Home resume o PPA corrente. No alto, o nome, a situação e a descrição, que se recolhe com “Ver mais” e “Ver menos”. Abaixo, seis números grandes — Programas, Eixos, Objetivos, Causas, Indicadores e Problemas — só para informar, sem clique. Numa ilha própria, as abas com ícone e contagem escolhem a tabela. As ilhas ficam a 8px uma da outra, com borda cinza de 1px. À direita, a situação do plano em linha do tempo, as informações institucionais, a equipe e os documentos.",
        "acesso": [
            ["Perfil", "Todos. Adicionar e Editar só aparecem para quem escreve; o setorial e a Consulta só leem."],
            ["Menu", "Home, o primeiro item do menu."],
            ["Plano", "O plano corrente, escolhido no seletor do cabeçalho."],
        ],
        "componentes": [
            ["Cartão de estatística tracejado", "div.card.border.border-dashed do Inspinia, com número, ícone e rótulo, em fundo translúcido na cor do tom; não é clicável"],
            ["Linha do tempo da situação", "lista vertical com as seis situações do PPA; a atual fica em destaque, Reprovado sai do ramo da submissão"],
            ["Informações institucionais", "avatar com ícone, título mais escuro e subtítulo — Vigência, Processo SEI e Valor previsto"],
            ["Descrição recolhível", "bloco de texto com altura limitada e botão “Ver mais / Ver menos”"],
            ["Abas com ícone e contagem", "nav-tabs nav-bordered do Inspinia, como “Programas (26)”, na ilha da tabela"],
            ["Ilhas", "cartões brancos separados por 8px, com borda cinza de 1px"],
        ],
        "tabelas": [{"titulo": "Os seis números", "cab": ["Número", "Cor", "Função", "Padrão"], "linhas": [
            ["Programas", "Verde", "Só informa", "—"],
            ["Eixos estratégicos", "Azul-acinzentado", "Só informa", "—"],
            ["Objetivos estratégicos", "Roxo", "Só informa", "—"],
            ["Causas", "Laranja", "Só informa", "—"],
            ["Indicadores", "Azul-claro", "Só informa", "—"],
            ["Problemas", "Vermelho", "Só informa", "—"],
        ]}],
        "secoes": [
            {"titulo": "Situação do PPA", "texto": "A linha do tempo mostra as seis situações: Em elaboração, Submetido, Reprovado (que volta à elaboração), Aprovado, Vigente e Encerrado. A atual fica marcada; as já vividas e as por vir aparecem em tons diferentes."},
            {"titulo": "Descrição", "texto": "A descrição aparece recolhida em poucas linhas para ganhar espaço de tela. O botão só existe quando o texto passa do limite."},
        ],
        "estados": ["Home — Programas escolhido", "Descrição aberta — Ver menos", "Aba escolhida — a tabela troca", "Visão do setorial — sem Adicionar e Editar"],
    },
})

S("spec_u2", {
    "nome": "Fluxo U2 · Ícone do Programa",
    "faixa": "Fluxo de Programas · Ícone do Programa",
    "faixaSub": "Cada Programa ganha um ícone, escolhido entre os ícones do sistema, que aparece em todas as tabelas de Programas.",
    "telas": [
        {"dados": "u2_01_formulario", "titulo": "Formulário do Programa", "passo": "abre Editar num Programa — o campo Ícone do programa fica ao lado do nome"},
        {"dados": "u2_02_janela", "titulo": "Janela de ícones", "passo": "clica no campo — abre a janela com os ícones do sistema, em grupos por assunto"},
        {"dados": "u2_03_busca", "titulo": "Busca por assunto", "passo": "digita “escola” — só os ícones que combinam ficam"},
        {"dados": "u2_04_escolhido", "titulo": "Ícone escolhido", "passo": "clica num ícone — a janela fecha e o campo mostra o ícone e o nome dele"},
        {"dados": "u2_05_cadastro", "titulo": "Cadastro de Programa", "passo": "o ícone aparece ao lado do nome de cada Programa na tabela"},
        {"dados": "u2_06_ficha", "titulo": "Ficha do Programa", "passo": "abre o Programa — o ícone aparece grande ao lado do título"},
    ],
    "handoff": {
        "titulo": "Ícone do Programa",
        "arquivo": "central-programas/editar.html · central-programas.html · ppa-detalhe.html · programas.html · programa.html",
        "entrega": "Dá a cada Programa um ícone que o simboliza. A pessoa o escolhe no formulário, numa janela com cerca de 110 ícones do sistema (Tabler), agrupados por assunto e com busca. O ícone aparece ao lado do nome em todas as tabelas de Programas e, maior, na ficha. Quem não escolheu mostra o ícone padrão.",
        "acesso": [
            ["Perfil", "Escolher: quem edita Programas (Administrador central e Alta gestão central). Ver: todos."],
            ["Menu", "Cadastros › Programa › Editar; Home › Programas; Programas (visão setorial)."],
            ["Ao fim", "O ícone fica salvo no Programa e aparece nas tabelas."],
        ],
        "componentes": [
            ["Campo de ícone", "button.form-select com o ícone escolhido e o nome dele; abre a janela"],
            ["Janela de ícones", "div.modal grande com busca, grupos por assunto e grade de botões"],
            ["Selo do ícone", "span de 1,9 rem com o ícone Tabler na cor primária sobre fundo claro"],
            ["Busca", "input.form-control que filtra pelo assunto do ícone"],
        ],
        "tabelas": [{"titulo": "Onde o ícone aparece", "cab": ["Tela", "Tamanho", "Escolhe", "Padrão"], "linhas": [
            ["Formulário do Programa", "Campo", "Sim", "Ícone padrão"],
            ["Cadastro de Programa", "Selo", "—", "Ícone padrão"],
            ["Home — aba Programas", "Selo", "—", "Ícone padrão"],
            ["Programas do PPA — setorial", "Selo", "—", "Ícone padrão"],
            ["Ficha do Programa", "Grande", "—", "Ícone padrão"],
        ]}],
        "secoes": [
            {"titulo": "Ícones dos grupos", "texto": "Saúde; Educação e cultura; Segurança e justiça; Infraestrutura e transporte; Social e cidadania; Meio ambiente e campo; Energia, economia e inovação; Esporte, turismo e gestão."},
            {"titulo": "Programas de exemplo", "texto": "Os Programas que já existem receberam um ícone de exemplo, escolhido pelo assunto do nome ou pelo eixo. Isso acontece uma vez só; o ícone que a pessoa escolher nunca é trocado."},
        ],
        "estados": ["Campo com ícone padrão", "Janela aberta — todos os grupos", "Busca aplicada — só o que combina", "Ícone escolhido — campo atualizado", "Tabelas com o ícone ao lado do nome"],
    },
})

S("spec_u3", {
    "nome": "Fluxo U3 · Logomarca SIPLAM 3.0",
    "faixa": "Fluxo de Marca · Logomarca SIPLAM 3.0",
    "faixaSub": "A logo enviada pelo cliente foi refeita em SVG vetorial, sem o subtítulo, e passa a valer em todo o sistema.",
    "telas": [
        {"dados": "u3_01_login", "titulo": "Entrada do sistema", "passo": "abre o endereço do SIPLAM — a logo nova aparece na tela de entrada"},
        {"dados": "u3_02_perfil", "titulo": "Escolha de perfil", "passo": "a logo também aparece na escolha de perfil"},
    ],
    "handoff": {
        "titulo": "Logomarca SIPLAM 3.0",
        "arquivo": "assets/img/logo-siplam.svg · logo-siplam-negativo.svg · logo-siplam-sm.svg",
        "entrega": "Troca a logo antiga, uma imagem raster, por uma logomarca em SVG vetorial, sem o subtítulo “Planejar, monitorar. Entregar mais valor para a sociedade.”. O símbolo foi traçado a partir da arte aprovada pelo cliente; o letreiro usa a fonte Montserrat ExtraBold (800), convertida em curvas.",
        "acesso": [
            ["Onde", "Menu lateral, barra superior, entrada do sistema e escolha de perfil."],
            ["Tamanho", "34 px de altura no menu e na barra; mais larga que a anterior."],
            ["Arquivos", "Horizontal, horizontal negativa, só o símbolo, símbolo negativo e favicon."],
        ],
        "componentes": [
            ["Logo horizontal", "img SVG — símbolo e “SIPLAM 3.0”, azul-marinho e verde, para fundo claro"],
            ["Logo negativa", "img SVG — letreiro branco e cores claras, para fundo escuro"],
            ["Símbolo", "img SVG — só o aro com a linha de gráfico e a seta, para o menu recolhido"],
            ["Favicon", "SVG — o símbolo sobre fundo branco arredondado"],
        ],
        "tabelas": [{"titulo": "Cores da logomarca", "cab": ["Elemento", "Cor", "Hex", "Uso"], "linhas": [
            ["Letreiro SIPLAM", "Azul-marinho", "#083259", "Texto e arco superior"],
            ["Aro e nós", "Azul", "#127CB7", "Arco inferior e linha"],
            ["3.0 e seta", "Verde", "#06AD7D", "Versão e arco direito"],
            ["Letreiro negativo", "Branco", "#FFFFFF", "Fundo escuro"],
        ]}],
        "secoes": [
            {"titulo": "Fonte", "texto": "Montserrat ExtraBold (peso 800) para “SIPLAM 3.0”. O letreiro é desenho vetorial, então não depende de a fonte estar instalada."},
            {"titulo": "O que mudou", "texto": "Sai o subtítulo e a imagem raster. Entram os arquivos SVG, a versão negativa e o favicon. O símbolo mantém o tamanho da arte aprovada; o letreiro cresceu para acompanhá-lo."},
        ],
        "estados": ["Horizontal — fundo claro", "Negativa — fundo escuro", "Só o símbolo — menu recolhido", "Favicon — aba do navegador"],
    },
})
print("specs ok")
