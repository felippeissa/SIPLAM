/**
 * Listagem dos Cadastros Estratégicos.
 *
 * Só lista e leva às telas de criar e editar — o formulário mora em
 * `<cadastro>/criar.html` e `<cadastro>/editar.html`, montado por
 * `form-pagina.js` a partir desta mesma configuração.
 *
 * A configuração é única de propósito: listagem e formulário discordarem sobre
 * o que o cadastro tem é o tipo de erro que só aparece em produção.
 */
import { obterEstado, ppaCorrente } from "./dados/store.js";
import { montarShell, cabecalhoPagina, somenteLeitura, url } from "./shell.js";
import { esc } from "./ui.js";

export function montarLista(cfg) {
    const { estado } = montarShell();
    const leitura = somenteLeitura() || cfg.somenteAdminCentral === true;
    let busca = "";

    // Um PPA por vez: a listagem mostra só o que pertence ao plano escolhido no
    // cabeçalho. Registro sem `ppaId` é anterior ao vínculo — aparece sempre,
    // senão sumiria sem que ninguém pudesse alcançá-lo.
    const plano = ppaCorrente(estado);
    const doPlano = (i) => !i.ppaId || !plano || i.ppaId === plano.id;

    const itens = () => (estado[cfg.colecao] ?? []).filter(doPlano);
    const opcoesPai = () => (cfg.pai ? (estado[cfg.pai.colecao] ?? []).filter(doPlano) : []);

    const nomeDoPai = (item) => {
        if (!cfg.pai) return "";
        return opcoesPai().find((p) => p.id === item[cfg.pai.campo])?.nome ?? "—";
    };

    const dependentes = (item) =>
        (cfg.filhos ?? []).reduce(
            (total, filho) => total + (estado[filho.colecao] ?? []).filter((f) => f[filho.campo] === item.id).length,
            0
        );

    // Um cadastro pode mostrar mais de um vínculo na tabela. `coluna` no
    // singular continua valendo para quem tem só um.
    const extras = cfg.extra?.colunas ?? (cfg.extra?.coluna ? [cfg.extra.coluna] : []);

    const criar = url(`${cfg.pasta}/criar.html`);
    const editar = (id) => url(`${cfg.pasta}/editar.html?id=${encodeURIComponent(id)}`);

    function render() {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        const lista = itens().filter(
            (i) =>
                !termo ||
                i.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
                (i.descricao ?? "").toLocaleLowerCase("pt-BR").includes(termo)
        );

        // Sem o nível acima não há o que vincular: o botão fica visível e
        // desabilitado, com o motivo ao lado — esconder deixaria a pessoa
        // procurando uma ação que existe.
        const semPai = cfg.pai && !cfg.pai.opcional && opcoesPai().length === 0;

        const colunas = 3 + (cfg.pai ? 1 : 0) + extras.length + (cfg.filhos?.length ? 1 : 0) + (cfg.codigo ? 1 : 0);

        document.getElementById("conteudo").innerHTML = `
        ${cabecalhoPagina(
            esc(cfg.titulo),
            esc(cfg.subtitulo),
            `
            <div class="app-search">
                <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar" value="${esc(busca)}" />
                <i class="ti ti-search app-search-icon text-muted"></i>
            </div>
            ${
                leitura
                    ? `<span class="fs-12 text-muted">${esc(cfg.avisoLeitura ?? "Perfil sem edição neste cadastro.")}</span>`
                    : `<a href="${criar}" class="btn btn-sm btn-primary ${semPai ? "disabled" : ""}">
                    <i class="ti ti-plus me-1"></i>${esc(cfg.novoRotulo)}
                </a>`
            }`
        )}

        ${
            semPai
                ? `<div class="alert alert-warning py-2 px-3 fs-13">
                Cadastre ao menos ${esc(cfg.pai.artigo)}
                <a href="${url(cfg.pai.href)}" class="fw-semibold">${esc(cfg.pai.rotulo)}</a>
                antes de usar “${esc(cfg.novoRotulo)}”.
            </div>`
                : ""
        }

        <div class="card">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            ${cfg.codigo ? '<th class="codigo" style="width:5rem">Nº</th>' : ""}
                            <th style="width:22rem">${esc(cfg.singular)}</th>
                            ${cfg.pai ? `<th style="width:18rem">${esc(cfg.pai.rotulo)}</th>` : ""}
                            ${extras.map((c) => `<th style="width:12rem">${esc(c.rotulo)}</th>`).join("")}
                            <th>Descrição</th>
                            ${cfg.filhos?.length ? `<th class="num" style="width:9rem">${esc(cfg.filhos[0].rotulo)}</th>` : ""}
                            <th style="width:7rem">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${
                        lista.length === 0
                            ? `<tr><td colspan="${colunas}" class="text-center text-muted py-4 fs-12">
                            ${itens().length === 0 ? `Nenhum registro. Comece por “${esc(cfg.novoRotulo)}”.` : "Nenhum registro corresponde à busca."}
                        </td></tr>`
                            : lista
                                  .map(
                                      (i) => `
                        <tr>
                            ${cfg.codigo ? `<td class="codigo text-muted">${esc(cfg.codigo(i, estado))}</td>` : ""}
                            <td class="fw-medium">${esc(i.nome)}</td>
                            ${cfg.pai ? `<td class="fs-13 text-muted">${esc(nomeDoPai(i))}</td>` : ""}
                            ${extras.map((c) => `<td class="fs-13 text-muted">${c.valor(i, estado)}</td>`).join("")}
                            <td class="fs-13 text-muted">${esc(i.descricao || "—")}</td>
                            ${cfg.filhos?.length ? `<td class="num">${dependentes(i) || "—"}</td>` : ""}
                            <td>
                                <a href="${editar(i.id)}" class="btn btn-sm ${leitura ? "btn-light" : "btn-outline-primary"}">
                                    ${leitura ? "Ver" : "Editar"}
                                </a>
                            </td>
                        </tr>`
                                  )
                                  .join("")
                    }
                    </tbody>
                </table>
            </div>
        </div>`;
    }

    document.addEventListener("input", (e) => {
        if (e.target.id !== "busca") return;
        busca = e.target.value;
        render();
        // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o texto
        // digitado sai embaralhado.
        const campo = document.getElementById("busca");
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    });

    render();
}
