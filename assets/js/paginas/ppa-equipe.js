/**
 * Equipe do PPA — a lista.
 *
 * Mesmo desenho das listagens dos cadastros: barra de filtros com o botão de
 * criar, tabela e o lápis na última coluna. Criar e editar são telas à parte.
 */
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { esc } from "../ui.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { equipeDoPlano } from "../ppa-equipe-dados.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");
const ppa = (estado.ppas ?? []).find((p) => p.id === id);
const leitura = somenteLeitura();
const voltar = url(`ppa-detalhe.html?id=${encodeURIComponent(id ?? "")}`);

if (!ppa) {
    document.getElementById("conteudo").innerHTML = `
    <div class="my-4"><div class="alert alert-warning py-3 px-3">Este PPA não existe.
        <a href="${url("ppa-detalhe.html")}" class="fw-semibold">Voltar</a>.</div></div>`;
} else {
    montar();
}

function montar() {
    const membros = () => equipeDoPlano(estado, ppa);
    const criar = url(`ppa-equipe-criar.html?id=${encodeURIComponent(ppa.id)}`);
    const editar = (mid) => url(`ppa-equipe-editar.html?id=${encodeURIComponent(ppa.id)}&membro=${encodeURIComponent(mid)}`);

    const filtros = criarFiltros({
        livre: { rotulo: "Nome", texto: (m) => `${m.nome} ${m.orgao} ${m.perfil}` },
        campos: [
            {
                id: "funcao",
                rotulo: "Função",
                icone: "ti-briefcase",
                opcoes: () => opcoesDe(membros(), (m) => m.funcao),
                valorDe: (m) => [m.funcao],
            },
        ],
        exportar: "equipe",
        acao: () =>
            leitura
                ? '<span class="fs-12 text-muted">Perfil sem edição neste cadastro.</span>'
                : `<a href="${criar}" class="btn btn-primary"><i class="ti ti-plus me-1"></i>Novo membro</a>`,
    });

    function linhas() {
        const lista = membros().filter((m) => filtros.passa(m));
        if (!lista.length) {
            return `<tr><td colspan="4" class="text-center text-muted py-4 fs-12">${
                membros().length ? "Nenhum registro corresponde ao filtro." : "Ninguém na equipe. Comece por “Novo membro”."
            }</td></tr>`;
        }
        return lista
            .map(
                (m) => `
            <tr>
                <td><span class="fw-medium">${esc(m.nome)}</span><span class="d-block fs-12 text-muted">${esc(m.orgao || "—")}</span></td>
                <td class="fs-13 text-muted">${esc(m.perfil)}</td>
                <td class="fs-13">${esc(m.funcao)}</td>
                <td class="text-end coluna-acoes"><a href="${editar(m.id)}" class="btn btn-sm ${leitura ? "btn-light" : "btn-outline-primary"}">${leitura ? "Ver" : "Editar"}</a></td>
            </tr>`
            )
            .join("");
    }

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Equipe do plano", [esc(ppa.nome)])}
    <div class="card">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2 p-3">
            <div>
                <h4 class="card-title mb-1">Equipe do plano</h4>
                <p class="text-muted mb-0 fs-13">Quem trabalha no ${esc(ppa.nome)} e com que função.</p>
            </div>
            <a href="${voltar}" class="btn btn-light">Voltar ao plano</a>
        </div>
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead><tr>
                    <th style="width:22rem">Nome</th>
                    <th style="width:18rem">Perfil</th>
                    <th>Função</th>
                    <th class="text-end coluna-acoes" style="width:7rem">Ações</th>
                </tr></thead>
                <tbody id="corpo-lista">${linhas()}</tbody>
            </table>
        </div>
    </div>`;

    filtros.ligar(() => {
        document.getElementById("corpo-lista").innerHTML = linhas();
    });
}
