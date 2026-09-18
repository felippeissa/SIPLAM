"""Servidor local de desenvolvimento do SIPLAM.

    python servidor.py          → http://127.0.0.1:8899/
    python servidor.py 3000     → outra porta

Serve a pasta do projeto. Difere do `python -m http.server` em dois pontos que
importam aqui:

  * manda `Cache-Control: no-store` — sem isso o navegador segura os módulos ES
    em cache e alterações em `assets/js/` não aparecem nem recarregando;
  * usa threads e ignora conexões abortadas pelo navegador, que derrubavam o
    servidor padrão no meio da navegação.
"""

import functools
import http.server
import os
import socketserver
import sys

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
RAIZ = os.path.dirname(os.path.abspath(__file__))


class SemCache(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        """Recebe uma captura de tela da própria página e grava em disco.

        Existe só para montar a documentação: a página desenha a si mesma num
        canvas e manda o PNG para cá. Aceita apenas nomes simples, dentro de
        `docs/imagens/capturas/`, e só responde em 127.0.0.1.
        """
        if not self.path.startswith("/captura/"):
            self.send_error(404)
            return

        nome = os.path.basename(self.path[len("/captura/"):])
        if not nome.endswith(".png") or not nome[:-4].replace("-", "").replace("_", "").isalnum():
            self.send_error(400, "nome invalido")
            return

        destino = os.path.join(RAIZ, "docs", "imagens", "capturas")
        os.makedirs(destino, exist_ok=True)
        dados = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        with open(os.path.join(destino, nome), "wb") as arquivo:
            arquivo.write(dados)

        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        print("captura:", nome, f"({len(dados) // 1024} KB)")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, formato, *args):
        # Só o que interessa durante o desenvolvimento: caminhos inexistentes.
        if len(args) > 1 and "404" in str(args[1]):
            print("404:", args[0])

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            self.close_connection = True


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        pass  # navegador desistindo da conexão não é erro do servidor


if __name__ == "__main__":
    Handler = functools.partial(SemCache, directory=RAIZ)
    with Servidor(("127.0.0.1", PORTA), Handler) as servidor:
        print(f"SIPLAM em http://127.0.0.1:{PORTA}/   (Ctrl+C para parar)")
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nservidor encerrado")
