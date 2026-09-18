/**
 * Estado vazio dos relatórios que ainda não foram construídos.
 *
 * A tela existe e o menu leva a ela, mas o conteúdo depende de decisões que
 * ainda não foram tomadas. Em vez de mostrar números inventados — que numa
 * demonstração passam por verdade —, ela diz o que o relatório vai reunir, o que
 * já existe no sistema para alimentá-lo e o que falta definir.
 */
import { montarShell, cabecalhoPagina } from "./shell.js";
import { esc } from "./ui.js";

export function montarRelatorio({ titulo, subtitulo, reune, jaTemos, falta }) {
    montarShell();

    const lista = (itens) => itens.map((i) => `<li class="mb-1">${i}</li>`).join("");

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(esc(titulo), esc(subtitulo))}

    <div class="card">
        <div class="card-body">
            <div class="d-flex align-items-start gap-3 mb-4">
                <i class="ti ti-file-text fs-24 text-muted"></i>
                <div>
                    <h5 class="fs-15 fw-semibold mb-1">Relatório ainda não construído</h5>
                    <p class="fs-13 text-muted mb-0">
                        A tela está reservada. O conteúdo entra quando o formato do relatório
                        estiver definido com a área de requisitos.
                    </p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-4">
                    <div class="rotulo-secao mb-2">O que ele reúne</div>
                    <ul class="fs-13 ps-3 mb-0">${lista(reune)}</ul>
                </div>
                <div class="col-md-4">
                    <div class="rotulo-secao mb-2">O que o sistema já tem</div>
                    <ul class="fs-13 ps-3 mb-0">${lista(jaTemos)}</ul>
                </div>
                <div class="col-md-4">
                    <div class="rotulo-secao mb-2">O que falta definir</div>
                    <ul class="fs-13 ps-3 mb-0 text-muted">${lista(falta)}</ul>
                </div>
            </div>
        </div>
    </div>`;
}
