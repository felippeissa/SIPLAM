"""Ponte entre o protótipo, o navegador e o plugin do Figma (porta 9230, só local).

  GET  /icone?cp=ea5f        -> { d, w, h } caminho SVG do glifo Tabler, na altura de 1em
  GET  /svg?arquivo=...      -> arquivo do projeto (logo)
  POST /salvar?nome=x        -> grava dados/x.json (corpo JSON)
  GET  /dados/x.json         -> devolve
  GET  /lib/x.js             -> scripts desta pasta
CORS aberto: quem chama é o navegador do protótipo e o plugin do Figma (origem null).
"""
import http.server, json, os, socketserver, urllib.parse
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

AQUI = os.path.dirname(os.path.abspath(__file__))
PROJETO = r"C:\Users\felip\Desktop\SIPLAM"
FONTE = TTFont(os.path.join(PROJETO, "inspinia", "assets", "css", "fonts", "tabler-icons.ttf"))
CMAP = FONTE.getBestCmap(); GS = FONTE.getGlyphSet(); UPM = FONTE["head"].unitsPerEm
ASC = FONTE["hhea"].ascent; DESC = FONTE["hhea"].descent  # descent negativo
BASE = (UPM - (ASC - DESC)) / 2 + ASC  # linha de base dentro de uma caixa de altura 1em (line-height: 1)

def glifo(cp):
    nome = CMAP.get(cp)
    if not nome: return None
    pen = SVGPathPen(GS)
    GS[nome].draw(TransformPen(pen, (1, 0, 0, -1, 0, BASE)))
    return {"d": pen.getCommands(), "w": GS[nome].width, "h": UPM}

class H(http.server.BaseHTTPRequestHandler):
    def _c(self, code=200, tipo="application/json; charset=utf-8"):
        self.send_response(code); self.send_header("Content-Type", tipo)
        self.send_header("Access-Control-Allow-Origin", "*"); self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); self.send_header("Cache-Control", "no-store"); self.end_headers()
    def do_OPTIONS(self): self._c(204)
    def log_message(self, *a): pass
    def do_GET(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        if u.path == "/icone":
            g = glifo(int(q["cp"][0], 16)); self._c(200 if g else 404); self.wfile.write(json.dumps(g).encode()); return
        if u.path == "/svg":
            p = os.path.normpath(os.path.join(PROJETO, q["arquivo"][0]))
            if not p.startswith(PROJETO): self._c(403); return
            self._c(200, "image/svg+xml; charset=utf-8"); self.wfile.write(open(p, "rb").read()); return
        base = u.path.lstrip("/")
        if base.startswith(("dados/", "lib/", "req/")) and ".." not in base:
            p = os.path.join(AQUI, base)
            if os.path.exists(p):
                self._c(200, "image/png" if base.endswith(".png") else "application/javascript; charset=utf-8" if base.endswith(".js") else "application/json; charset=utf-8")
                self.wfile.write(open(p, "rb").read()); return
        self._c(404); self.wfile.write(b"{}")
    def do_POST(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        if u.path == "/salvar":
            n = "".join(ch for ch in q["nome"][0] if ch.isalnum() or ch in "-_.")
            corpo = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            open(os.path.join(AQUI, "dados", n + ".json"), "wb").write(corpo)
            self._c(); self.wfile.write(json.dumps({"ok": True, "bytes": len(corpo)}).encode()); return
        self._c(404)

class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    def handle_error(self, *a): pass

if __name__ == "__main__":
    print("ponte em http://localhost:9230"); S(("127.0.0.1", 9230), H).serve_forever()
