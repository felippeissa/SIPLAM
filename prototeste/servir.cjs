/**
 * Servidor estático mínimo para o Prototeste: serve a pasta do projeto com conexões persistentes (HTTP/1.1
 * keep-alive) e `Cache-Control: no-store`, como o servidor.py. Existe só porque o servidor.py fecha uma conexão por
 * arquivo e, em 100 rodadas, esgota as portas de rede do Windows (net::ERR_NO_BUFFER_SPACE). Os arquivos servidos
 * são exatamente os mesmos.
 *
 *   node prototeste/servir.cjs [porta]      (padrão 8898)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const PORTA = Number(process.argv[2] || 8898);
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".ico": "image/x-icon", ".map": "application/json" };

http
    .createServer((req, res) => {
        let caminho = decodeURIComponent(req.url.split("?")[0]);
        if (caminho.endsWith("/")) caminho += "index.html";
        const arq = path.normalize(path.join(RAIZ, caminho));
        if (!arq.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
        fs.readFile(arq, (erro, dados) => {
            if (erro) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("404"); }
            res.writeHead(200, { "Content-Type": TIPOS[path.extname(arq).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
            res.end(dados);
        });
    })
    .listen(PORTA, "127.0.0.1", () => console.log(`Prototeste: servindo ${RAIZ} em http://127.0.0.1:${PORTA}`));
