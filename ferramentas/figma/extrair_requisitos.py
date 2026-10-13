"""Lê o documento de requisitos (.docx) e grava req/req2.json, que `lib/requisitos.js` desenha no Figma.

    python extrair_requisitos.py "caminho/do/documento.docx"

Precisa de `python-docx`. As imagens do documento (`word/media/image1..4.png`) devem estar em `req/`
(image1 = capa, image2 = faixa do cabeçalho, image3 = situações do PPA, image4 = estrutura do PPA).
A numeração RF, RN, RNF e CSU é a do Word: os estilos “REQ FUNCIONAL”, “REGRA DE NEGÓCIO”, “REQ NÃO
FUNCIONAL” e “Caso de Uso” numeram sozinhos, então aqui se conta na ordem em que aparecem.
"""
import json, os, sys
import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

AQUI = os.path.dirname(os.path.abspath(__file__))
d = docx.Document(sys.argv[1])


def lista_de(p):
    """No Word o marcador vem do estilo; numId 0 desliga a numeração."""
    el = p._p
    nid = el.xpath('.//w:numPr/w:numId/@w:val')
    il = el.xpath('.//w:numPr/w:ilvl/@w:val')
    if nid and nid[0] == '0':
        return False, 0
    estilo = p.style.name.startswith("Corpo de texto iten") or p.style.name.startswith("List")
    if nid or estilo:
        return True, (int(il[0]) if il else 0)
    return False, 0


def par(p):
    lista, nivel = lista_de(p)
    img = p._p.xpath('.//a:blip/@r:embed')
    runs = [r for r in p.runs if r.text.strip()]
    return {"t": p.text.strip(), "lista": lista, "nivel": nivel, "img": img[0] if img else None,
            "neg": bool(runs) and all(bool(r.bold) for r in runs)}


def celula(c):
    return [p for p in (par(p) for p in c.paragraphs) if p["t"] or p["img"]]


def tabela(el):
    t = Table(el, d)
    linhas = []
    for r in t.rows:
        vistos, cels = set(), []
        for c in r.cells:
            if id(c._tc) in vistos:
                continue
            vistos.add(id(c._tc))
            cels.append(celula(c))
        linhas.append(cels)
    return linhas


blocos, cont, pend = [], {"RF": 0, "RN": 0, "RNF": 0, "CSU": 0}, None
for el in d.element.body.iterchildren():
    tag = el.tag.split('}')[1]
    if tag == 'p':
        p = Paragraph(el, d)
        est, txt = p.style.name, p.text.strip()
        if not txt and not el.xpath('.//a:blip'):
            continue
        if est == "Capa":
            blocos.append({"k": "capa", "t": txt}); continue
        if est.startswith("Heading 1"):
            blocos.append({"k": "h1", "t": txt}); continue
        if est.startswith("Heading 2"):
            blocos.append({"k": "h2", "t": txt}); continue
        for chave, pref, k in [("REQ FUNCIONAL", "RF", "rf"), ("REGRA DE NEG", "RN", "rn"), ("REQ N", "RNF", "rnf"), ("Caso de Uso", "CSU", "csu")]:
            if est.startswith(chave):
                cont[pref] += 1
                pend = {"k": k, "num": f"{pref}{cont[pref]}", "t": txt}
                blocos.append(pend)
                break
        else:
            if el.xpath('.//a:blip') and not txt:
                blocos.append({"k": "logo"}); continue
            lista, nivel = lista_de(p)
            blocos.append({"k": "p", "t": txt, "estilo": est, "lista": lista, "nivel": nivel})
    elif tag == 'tbl':
        L = tabela(el)
        if pend is not None and pend.get("tabela") is None and pend["k"] in ("rf", "rn", "rnf", "csu"):
            pend["tabela"] = L
        else:
            blocos.append({"k": "tabela", "linhas": L})
        if pend is not None and pend["k"] != "csu":
            pend = None

os.makedirs(os.path.join(AQUI, "req"), exist_ok=True)
with open(os.path.join(AQUI, "req", "req2.json"), "w", encoding="utf-8") as f:
    json.dump(blocos, f, ensure_ascii=False, indent=1)
print(len(blocos), "blocos →", os.path.join(AQUI, "req", "req2.json"))
