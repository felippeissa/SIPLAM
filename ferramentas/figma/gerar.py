"""Gera os documentos (spec_*.json) dos fluxos de cadastro a partir de um bloco de dados por cadastro."""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "dados")

ACESSO_ESCRITA = [
    ["Perfil", "Administrador central e Alta gestão central — leitura e escrita. O perfil Consulta só vê."],
]

COMP_LISTA = [
    ["Barra de filtros", "div.card-header.filtros — busca, filtros, Exportar, Limpar, Buscar e o botão de criar, numa linha só"],
    ["Tabela", "table.table.table-hover dentro de .table-responsive"],
    ["Botão de linha", "a.btn.btn-sm.btn-outline-primary — Editar (Ver para quem só consulta)"],
    ["Botão primário", "a.btn.btn-primary com ti-plus"],
    ["Exportar", "div.dropdown — CSV ou Excel das linhas visíveis"],
    ["Ícones", "Tabler — ti-search, ti-download, ti-plus"],
]
COMP_FORM = [
    ["Cartão com cabeçalho", "div.card > div.card-header — título, subtítulo e as ações no canto superior direito"],
    ["Campo de texto", "input.form-control, rótulo com asterisco quando obrigatório"],
    ["Mensagem de erro", "div.invalid-feedback abaixo do campo"],
    ["Botão primário", "button.btn.btn-primary — Cadastrar ou Salvar"],
    ["Botão de perigo", "button.btn.btn-danger — Excluir, preenchido"],
    ["Botão secundário", "a.btn.btn-light — Cancelar"],
]


def secao(nome, spec):
    path = os.path.join(SAIDA, f"spec_{nome}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(spec, f, ensure_ascii=False, indent=1)
    print("ok", path)


def gerar(c):
    n, art = c["nome"], c.get("artigo", "o")
    # ---------------- listagem ----------------
    secao(c["id"] + "_1", {
        "nome": f"Fluxo {c['num']}.1 · {c['titulo']} — Listagem e busca",
        "faixa": f"Fluxo de Cadastro · {c['titulo']} · Listagem",
        "faixaSub": c["sub_lista"],
        "telas": [{"dados": d, "titulo": t, "passo": p} for d, t, p in c["telas_lista"]],
        "handoff": {
            "titulo": f"{c['titulo']} — Listagem e busca",
            "arquivo": c["arquivo_lista"],
            "entrega": c["entrega_lista"],
            "acesso": [["Perfil", "Administrador central e Alta gestão central. O perfil Consulta vê a lista sem o botão de criar."],
                       ["Menu", c["menu"]], ["Ao fim", c["ao_fim_lista"]]],
            "componentes": COMP_LISTA,
            "tabelas": [{"titulo": "Colunas da tabela", "cab": ["Coluna", "Tipo", "Obrig.", "Regra"], "linhas": c["colunas"]}],
            "secoes": [{"titulo": "Busca e filtros", "texto": c["busca"]}] + c.get("regras_lista", []),
            "estados": c["estados_lista"],
        },
    })
    # ---------------- criar ----------------
    secao(c["id"] + "_2", {
        "nome": f"Fluxo {c['num']}.2 · {c['titulo']} — Criar",
        "faixa": f"Fluxo de Cadastro · {c['titulo']} · Criar",
        "faixaSub": c["sub_criar"],
        "telas": [{"dados": d, "titulo": t, "passo": p} for d, t, p in c["telas_criar"]],
        "handoff": {
            "titulo": f"{c['titulo']} — Criar",
            "arquivo": c["pasta"] + "/criar.html",
            "entrega": c["entrega_criar"],
            "acesso": [["Perfil", "Administrador central e Alta gestão central."], ["Menu", c["menu"] + " › " + c["botao_novo"]], ["Ao fim", "Volta para a listagem, com " + art + " " + n.lower() + " na tabela e um aviso de sucesso."]],
            "componentes": COMP_FORM + c.get("comp_extra", []),
            "tabelas": [{"titulo": "Campos do formulário", "cab": ["Campo", "Tipo", "Obrig.", "Regra"], "linhas": c["campos"]}],
            "secoes": c.get("regras_form", []),
            "estados": c["estados_criar"],
        },
    })
    # ---------------- editar e excluir ----------------
    secao(c["id"] + "_3", {
        "nome": f"Fluxo {c['num']}.3 · {c['titulo']} — Editar e excluir",
        "faixa": f"Fluxo de Cadastro · {c['titulo']} · Editar e excluir",
        "faixaSub": c["sub_editar"],
        "telas": [{"dados": d, "titulo": t, "passo": p} for d, t, p in c["telas_editar"]],
        "handoff": {
            "titulo": f"{c['titulo']} — Editar e excluir",
            "arquivo": c["pasta"] + "/editar.html",
            "entrega": c["entrega_editar"],
            "acesso": [["Perfil", "Administrador central e Alta gestão central. O perfil Consulta abre a tela só para ver."], ["Menu", c["menu"] + " › Editar"], ["Ao fim", "Volta para a listagem com a alteração, ou sem o registro excluído."]],
            "componentes": COMP_FORM + ([] if c.get("sem_excluir") else [["Janela de confirmação", "div.modal — pede confirmação antes de excluir" + (" e a digitação do nome" if c.get("digitar") else "")]]),
            "tabelas": [{"titulo": "Campos do formulário", "cab": ["Campo", "Tipo", "Obrig.", "Regra"], "linhas": c["campos"]}],
            "secoes": c.get("regras_editar", []) + ([{"titulo": "Exclusão", "texto": c["exclusao"]}] if c.get("exclusao") else []),
            "estados": c["estados_editar"],
        },
    })


if __name__ == "__main__":
    mod = sys.argv[1]
    dados = json.load(open(os.path.join(AQUI, "cad", mod + ".json"), encoding="utf-8"))
    gerar(dados)
