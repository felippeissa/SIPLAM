/**
 * Histórico — Gestão, Área Central.
 *
 * Tudo o que se cria, edita ou exclui nos cadastros deixa um evento (quem, quando, antes e depois). Esta
 * tela lista os eventos, filtra por cadastro, registro, ação, pessoa e data, e abre a ficha de cada um.
 *
 * Só consulta: a tela não reverte nada. A reversão continua no store (`reverterEvento`), sem botão aqui.
 */
import { eventosDeAuditoria, situacaoPpa, situacaoUsuario } from "../dados/store.js";
import { montarShell, barraTitulo, perfilAtual } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { chip, esc } from "../ui.js";
import { nomeDoPerfil } from "../usuarios-decisao.js";

const { estado } = montarShell();

const CADASTRO = {
    ppas: "PPA",
    programas: "Programa",
    eixos: "Eixo",
    objetivos: "Objetivo estratégico",
    causas: "Causa",
    subcausas: "Subcausa",
    problemas: "Problema",
    populacoes: "População afetada",
    indicadores: "Indicador",
    usuarios: "Usuário",
    iniciativas: "Iniciativa",
    entregas: "Entrega",
    diagnosticos: "Diagnóstico",
};
const rotuloCadastro = (c) => CADASTRO[c] ?? c;

const ACAO = { criou: "Criou", editou: "Editou", excluiu: "Excluiu", reverteu: "Reverteu" };
const TOM_ACAO = { criou: "ok", editou: "info", excluiu: "impeditivo", reverteu: "alerta" };

const CAMPO = {
    nome: "Nome",
    descricao: "Descrição",
    situacao: "Situação",
    status: "Status",
    primeiroAno: "Primeiro ano",
    ultimoAno: "Último ano",
    processoSei: "Processo SEI",
    janelas: "Janela de aprovações",
    equipe: "Equipe",
    documentos: "Documentos",
    justificativa: "Justificativa",
    eixoId: "Eixo",
    eixo: "Eixo",
    objetivoEstrategico: "Objetivo estratégico",
    subcausaIds: "Subcausas",
    causaIds: "Causas",
    populacaoIds: "População afetada",
    indicadorIds: "Indicadores",
    consequencias: "Consequências",
    perfis: "Perfis",
    perfilSolicitado: "Perfil pedido",
    orgao: "Órgão",
    cpf: "CPF",
    email: "E-mail",
    login: "Login",
    observacao: "Observação",
    decididoEm: "Decidido em",
    decididoPor: "Decidido por",
    codigo: "Código",
};
const rotuloCampo = (k) => CAMPO[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

/** id → nome, para mostrar “Goiás Social” onde o dado guarda `ex-7`. */
function indice() {
    const mapa = new Map();
    for (const [colecao, lista] of Object.entries(estado)) {
        if (!Array.isArray(lista) || colecao === "auditoria") continue;
        for (const r of lista) if (r && r.id && (r.nome || r.titulo)) mapa.set(r.id, r.nome || r.titulo);
    }
    return mapa;
}

function legivel(campo, valor, colecao, nomes) {
    if (valor === null || valor === undefined || valor === "" || (Array.isArray(valor) && !valor.length)) return "—";
    if (campo === "situacao") {
        if (colecao === "ppas") return situacaoPpa(valor).rotulo;
        if (colecao === "usuarios") return situacaoUsuario(valor).rotulo;
    }
    if (campo === "perfis" && Array.isArray(valor)) return valor.map(nomeDoPerfil).join(", ");
    if (typeof valor === "boolean") return valor ? "Sim" : "Não";
    if (Array.isArray(valor)) {
        return valor
            .map((v) => {
                if (v && typeof v === "object") {
                    if (v.id && v.funcao) return `${nomes.get(v.id) ?? v.id} (${v.funcao})`;
                    if (v.nome) return v.nome;
                    return JSON.stringify(v);
                }
                return nomes.get(v) ?? String(v);
            })
            .join(", ");
    }
    if (typeof valor === "object") return JSON.stringify(valor);
    return nomes.get(valor) ?? String(valor);
}

const aparar = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function resumo(e) {
    if (e.acao === "criou") return "Novo registro";
    if (e.acao === "excluiu") return "Registro removido";
    const campos = (e.campos ?? []).map(rotuloCampo).join(", ");
    if (e.acao !== "reverteu") return campos;
    // reverter uma criação ou exclusão mexe no registro inteiro; só a edição tem campos a citar
    if (e.acaoOriginal === "criou") return "Reversão da criação";
    if (e.acaoOriginal === "excluiu") return "Reversão da exclusão";
    return `Reversão da edição: ${campos}`;
}

const situacaoDoEvento = (e) => (e.revertidoPor ? { rotulo: "Revertida", tom: "alerta" } : e.acao === "reverteu" ? { rotulo: "Reversão", tom: "info" } : { rotulo: "Mantida", tom: "ok" });

const eventos = () => eventosDeAuditoria();

/* ---------- a tela ---------- */

function acessoNegado() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Histórico")}
    <div class="alert alert-warning py-3 px-3">Esta tela é do Administrador central.</div>`;
}

function montar() {
    const filtros = criarFiltros({
        livre: { rotulo: "Registro", texto: (e) => `${e.registroNome} ${e.ator} ${resumo(e)}` },
        campos: [
            {
                id: "cadastro",
                rotulo: "Cadastro",
                icone: "ti-database",
                opcoes: () => opcoesDe(eventos(), (e) => rotuloCadastro(e.colecao)),
                valorDe: (e) => [rotuloCadastro(e.colecao)],
            },
            {
                id: "acao",
                rotulo: "Ação",
                icone: "ti-activity",
                opcoes: () => opcoesDe(eventos(), (e) => ACAO[e.acao]),
                valorDe: (e) => [ACAO[e.acao]],
            },
            {
                id: "quem",
                rotulo: "Quem",
                icone: "ti-user",
                opcoes: () => opcoesDe(eventos(), (e) => e.ator),
                valorDe: (e) => [e.ator],
            },
            { id: "data", tipo: "texto", rotulo: "Data", icone: "ti-calendar", valorDe: (e) => e.dataHora },
            {
                id: "situacao",
                rotulo: "Situação",
                icone: "ti-progress",
                opcoes: () => opcoesDe(eventos(), (e) => situacaoDoEvento(e).rotulo),
                valorDe: (e) => [situacaoDoEvento(e).rotulo],
            },
        ],
        exportar: "historico",
        acao: () => "",
    });

    const vazio = (msg) => `<tr><td colspan="7" class="text-center text-muted py-4 fs-12">${msg}</td></tr>`;

    function linhas() {
        const todos = eventos();
        if (!todos.length) return vazio("Nenhum evento ainda. O que for criado, editado ou excluído nos cadastros passa a aparecer aqui.");
        const lista = todos.filter((e) => filtros.passa(e));
        if (!lista.length) return vazio("Nenhum evento corresponde ao filtro.");
        return lista
            .slice(0, 200)
            .map((e) => {
                const s = situacaoDoEvento(e);
                return `
            <tr class="linha-clicavel" data-id="${esc(e.id)}">
                <td class="text-nowrap">${esc(e.dataHora)}</td>
                <td>${esc(rotuloCadastro(e.colecao))}</td>
                <td class="fw-medium">${esc(e.registroNome)}</td>
                <td>${chip(ACAO[e.acao] ?? e.acao, TOM_ACAO[e.acao] ?? "neutro")}</td>
                <td>${esc(e.ator)}${e.perfil ? `<span class="d-block fs-12 text-muted">${esc(nomeDoPerfil(e.perfil))}</span>` : ""}</td>
                <td class="fs-13 text-muted"><span class="d-block" style="max-width:20rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(resumo(e))}</span></td>
                <td>${chip(s.rotulo, s.tom)}</td>
            </tr>`;
            })
            .join("");
    }

    function rodape() {
        const total = eventos().length;
        const vistos = eventos().filter((e) => filtros.passa(e)).length;
        return total ? `Mostrando ${Math.min(vistos, 200)} de ${vistos} eventos${vistos !== total ? ` (${total} no total)` : ""}. O histórico guarda os 500 mais recentes.` : "";
    }

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Histórico")}
    <div class="card">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-1">Histórico dos cadastros</h4>
            <p class="text-muted mb-0 fs-13">Tudo o que foi criado, editado ou excluído. Abra um evento para ver o antes e o depois.</p>
        </div>
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead><tr>
                    <th style="width:9.5rem">Quando</th>
                    <th style="width:11rem">Cadastro</th>
                    <th>Registro</th>
                    <th style="width:7rem">Ação</th>
                    <th style="width:13rem">Quem</th>
                    <th>O que mudou</th>
                    <th style="width:8rem">Situação</th>
                </tr></thead>
                <tbody id="corpo-lista">${linhas()}</tbody>
            </table>
        </div>
        <div class="card-footer fs-12 text-muted" id="rodape-lista">${rodape()}</div>
    </div>`;

    const redesenhar = () => {
        document.getElementById("corpo-lista").innerHTML = linhas();
        document.getElementById("rodape-lista").textContent = rodape();
    };
    filtros.ligar(redesenhar);
    document.getElementById("corpo-lista").addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-id]");
        if (tr) abrirFicha(eventos().find((x) => x.id === tr.dataset.id), redesenhar);
    });
}

/* ---------- a ficha do evento ---------- */

function abrirFicha(ev, aoMudar) {
    if (!ev) return;
    document.getElementById("modal-evento")?.remove();
    const nomes = indice();
    const plano = estado.ppas.find((p) => p.id === ev.ppaId);
    const s = situacaoDoEvento(ev);
    const interno = new Set(["id", "ppaId", "criadoEm"]);

    // O que mudou: criação e exclusão mostram o registro todo; edição e reversão, antes e depois.
    let tabela;
    if (ev.acao === "criou" || ev.acao === "excluiu") {
        const fonte = ev.acao === "criou" ? ev.depois : ev.antes;
        const campos = Object.keys(fonte ?? {}).filter((k) => !interno.has(k) && legivel(k, fonte[k], ev.colecao, nomes) !== "—");
        tabela = `<table class="table table-sm mb-0"><thead><tr><th style="width:12rem">Campo</th><th>${ev.acao === "criou" ? "Valor cadastrado" : "Valor removido"}</th></tr></thead><tbody>${campos
            .map((k) => `<tr><td class="text-muted">${esc(rotuloCampo(k))}</td><td>${esc(aparar(legivel(k, fonte[k], ev.colecao, nomes), 400))}</td></tr>`)
            .join("")}</tbody></table>`;
    } else {
        tabela = `<table class="table table-sm mb-0"><thead><tr><th style="width:12rem">Campo</th><th>Antes</th><th>Depois</th></tr></thead><tbody>${(ev.campos ?? [])
            .map(
                (k) =>
                    `<tr><td class="text-muted">${esc(rotuloCampo(k))}</td><td>${esc(aparar(legivel(k, ev.antes?.[k], ev.colecao, nomes), 400))}</td><td>${esc(aparar(legivel(k, ev.depois?.[k], ev.colecao, nomes), 400))}</td></tr>`
            )
            .join("")}</tbody></table>`;
    }

    const meta = (r, v) => `<div class="col-sm-6 mb-3"><div class="fs-12 text-muted text-uppercase">${r}</div><div class="fw-medium">${v}</div></div>`;
    const reversao = ev.revertidoPor
        ? `<div class="alert alert-warning py-2 px-3 fs-13 mb-3"><i class="ti ti-arrow-back-up me-1"></i>Revertida por <strong>${esc(ev.revertidoPor.por)}</strong> em ${esc(ev.revertidoPor.em)}.
            <span class="d-block mt-1"><strong>Justificativa:</strong> ${esc(ev.revertidoPor.justificativa)}</span></div>`
        : ev.reverte
        ? `<div class="alert alert-info py-2 px-3 fs-13 mb-3"><i class="ti ti-arrow-back-up me-1"></i>Esta ação reverteu outro evento.
            <span class="d-block mt-1"><strong>Justificativa:</strong> ${esc(ev.justificativa)}</span></div>`
        : "";

    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="modal-evento" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15">${esc(ACAO[ev.acao] ?? ev.acao)} · ${esc(rotuloCadastro(ev.colecao))} — ${esc(ev.registroNome)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        ${meta("Quando", esc(ev.dataHora))}
                        ${meta("Quem", `${esc(ev.ator)}${ev.perfil ? ` <span class="text-muted fw-normal">· ${esc(nomeDoPerfil(ev.perfil))}</span>` : ""}`)}
                        ${meta("Cadastro", esc(rotuloCadastro(ev.colecao)))}
                        ${meta("Situação", chip(s.rotulo, s.tom))}
                        ${plano ? meta("Plano", esc(plano.nome)) : ""}
                    </div>
                    ${reversao}
                    ${
                        ev.justificativa && !ev.reverte
                            ? `<h6 class="rotulo-secao mb-2">Justificativa</h6><p class="fs-13 mb-3">${esc(ev.justificativa)}</p>`
                            : ""
                    }
                    <h6 class="rotulo-secao mb-2">O que mudou</h6>
                    <div class="table-responsive border rounded mb-3">${tabela}</div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>`
    );

    const el = document.getElementById("modal-evento");
    const modal = new bootstrap.Modal(el);
    el.addEventListener("hidden.bs.modal", () => el.remove());
    modal.show();

}

if (perfilAtual() === "admin-central") montar();
else acessoNegado();
