/**
 * Cobertura das Causas — Área Central.
 * Porta `central_.analises.causas.tsx`.
 *
 * Acréscimo T5.4.5: além da análise de um Programa, um panorama de todos, para
 * achar onde estão as maiores lacunas do plano.
 */
import { obterEstado } from "../dados/store.js";
import { coberturaCausa, COBERTURA_LABEL, entregasDaIniciativa } from "../dados/regras.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

let programaId = estado.programas[0]?.id ?? "";
let modo = "programa";
const abertas = new Set();

const TOM = { direta: "ok", sem: "alerta" };

function causasDo(programa) {
    return programa.causas.map((c) => ({
        causa: c,
        resultado: coberturaCausa(estado, programa.id, c.id),
    }));
}

function linhaCausa(item, programa) {
    const { causa, resultado: r } = item;
    const aberta = abertas.has(causa.id);

    return `
    <tr>
        <td style="width:2.5rem">
            <button class="btn-expandir" data-causa="${causa.id}" aria-expanded="${aberta}" aria-label="${aberta ? "Recolher" : "Expandir"}">
                <i class="ti ti-chevron-right"></i>
            </button>
        </td>
        <td>
            <div>${esc(causa.texto)}</div>
        </td>
        <td>${chip(COBERTURA_LABEL[r.cobertura], TOM[r.cobertura])}</td>
        <td class="num">${r.orgaos.length || "—"}</td>
        <td class="num">${r.iniciativas.length || "—"}</td>
        <td class="num">${r.entregas.length || "—"}</td>
    </tr>
    ${
        aberta
            ? `<tr class="linha-filha"><td></td><td colspan="5" class="py-3">
        ${
            r.iniciativas.length === 0
                ? '<p class="fs-12 text-muted mb-0">Nenhuma Iniciativa enfrenta esta causa.</p>'
                : `<table class="table table-sm tabela-aninhada mb-0">
            <thead><tr><th>Iniciativa</th><th style="width:16rem">Órgão</th><th>Entregas</th></tr></thead>
            <tbody>
                ${r.iniciativas
                    .map((i) => {
                        const entregas = entregasDaIniciativa(estado, i.id);
                        return `<tr>
                    <td><a href="central-iniciativa.html?id=${i.id}">${esc(i.nome)}</a></td>
                    <td class="fs-12">${esc(i.orgao)}</td>
                    <td class="fs-12">${
                        entregas.length
                            ? entregas
                                  .map((e) => `<a href="entrega.html?id=${e.id}">${esc(e.nome || "sem nome")}</a>`)
                                  .join(" · ")
                            : '<span class="text-muted">sem Entregas</span>'
                    }</td>
                </tr>`;
                    })
                    .join("")}
            </tbody>
        </table>`
        }
    </td></tr>`
            : ""
    }`;
}

function panorama() {
    const ls = estado.programas
        .map((p) => {
            const itens = causasDo(p);
            return {
                programa: p,
                total: itens.length,
                sem: itens.filter((i) => i.resultado.cobertura === "sem").length,
                direta: itens.filter((i) => i.resultado.cobertura === "direta").length,
            };
        })
        .sort((a, b) => b.sem - a.sem || a.programa.codigo.localeCompare(b.programa.codigo));

    return `
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th style="width:5rem">Código</th>
                        <th>Programa</th>
                        <th class="num" style="width:6rem">Causas</th>
                        <th class="num" style="width:8rem">Cobertura direta</th>
                        <th class="num" style="width:8rem">Sem atuação</th>
                        <th style="width:8rem"></th>
                    </tr>
                </thead>
                <tbody>
                ${ls
                    .map(
                        (l) => `<tr>
                    <td class="codigo text-muted">${esc(l.programa.codigo)}</td>
                    <td>
                        <div class="fw-medium">${esc(l.programa.nome)}</div>
                        <div class="fs-12 text-muted">${esc(l.programa.eixo)}</div>
                    </td>
                    <td class="num">${l.total}</td>
                    <td class="num">${l.direta || "—"}</td>
                    <td class="num">${l.sem ? chip(String(l.sem), "alerta") : "—"}</td>
                    <td><button class="btn btn-sm btn-outline-primary" data-ver="${l.programa.id}">Analisar</button></td>
                </tr>`
                    )
                    .join("")}
                </tbody>
            </table>
        </div>
    </div>`;
}

function render() {
    const programa = estado.programas.find((p) => p.id === programaId);
    const itens = programa ? causasDo(programa) : [];
    const sem = itens.filter((i) => i.resultado.cobertura === "sem").length;

    const seletor = `
    <div class="btn-group btn-group-sm" role="group">
        <button class="btn ${modo === "programa" ? "btn-primary" : "btn-light"}" data-modo="programa">Por Programa</button>
        <button class="btn ${modo === "panorama" ? "btn-primary" : "btn-light"}" data-modo="panorama">Panorama do plano</button>
    </div>
    ${
        modo === "programa"
            ? `<select class="form-select form-select-sm w-auto" id="programa">
        ${estado.programas
            .map(
                (p) =>
                    `<option value="${p.id}"${p.id === programaId ? " selected" : ""}>${esc(p.codigo)} — ${esc(p.nome)}</option>`
            )
            .join("")}
    </select>`
            : ""
    }`;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Cobertura das Causas",
        "Quais causas do diagnóstico têm Iniciativas enfrentando, e quais ficaram sem.",
        seletor
    )}
    ${
        modo === "panorama"
            ? panorama()
            : `
        ${faixaIndicadores([
            { valor: itens.length, rotulo: "Causas do Programa" },
            { valor: itens.filter((i) => i.resultado.cobertura === "direta").length, rotulo: "Cobertura direta" },
            { valor: sem, rotulo: "Sem atuação" },
        ], "Cobertura direta é a Iniciativa que marcou a causa como enfrentada.")}
        <div class="card">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Causa</th>
                            <th style="width:13rem">Cobertura</th>
                            <th class="num" style="width:6rem">Órgãos</th>
                            <th class="num" style="width:7rem">Iniciativas</th>
                            <th class="num" style="width:7rem">Entregas</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${
                        itens.length === 0
                            ? '<tr><td colspan="6" class="text-center text-muted py-4 fs-12">Este Programa ainda não tem causas cadastradas.</td></tr>'
                            : itens.map((i) => linhaCausa(i, programa)).join("")
                    }
                    </tbody>
                </table>
            </div>
        </div>`
    }`;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("click", (e) => {
    const causa = e.target.closest("[data-causa]");
    if (causa) {
        const id = causa.dataset.causa;
        abertas.has(id) ? abertas.delete(id) : abertas.add(id);
        return render();
    }
    const m = e.target.closest("[data-modo]");
    if (m) {
        modo = m.dataset.modo;
        return render();
    }
    const ver = e.target.closest("[data-ver]");
    if (ver) {
        programaId = ver.dataset.ver;
        modo = "programa";
        return render();
    }
});

conteudo.addEventListener("change", (e) => {
    if (e.target.id === "programa") {
        programaId = e.target.value;
        abertas.clear();
        render();
    }
});

render();
