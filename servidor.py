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
