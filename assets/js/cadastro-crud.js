/**
 * Construtor das telas de cadastro.
 *
 * Diagnóstico, Problema, Subproblema e Causa têm a mesma estrutura — tabela,
 * modal, criar, editar e excluir — e a mesma forma de dados: nome, descrição e o
 * vínculo com o nível acima. Uma função monta as quatro, no padrão da tela de
 * PPA, para não repetir o mesmo código quatro vezes.
 */
import { obterEstado, addItem, updItem, removeItem } from "./dados/store.js";
import { montarShell, cabecalhoPagina, somenteLeitura } from "./shell.js";
import { esc } from "./ui.js";
import { confirmarExclusao } from "./confirmar.js";
import { avisar } from "./toast.js";
import { campoErro, validar, limparAoDigitar } from "./validacao.js";

/**
 * @param {object} cfg
 * @param {string} cfg.colecao      chave da coleção no estado
 * @param {string} cfg.titulo       título da tela
 * @param {string} cfg.subtitulo    linha de apoio
 * @param {string} cfg.singular     nome do item, como aparece na coluna
 * @param {string} cfg.novoRotulo   texto do botão de criar, já com o artigo
 * @param {object} [cfg.pai]        vínculo com o nível acima
 * @param {object[]} [cfg.filhos]   coleções que dependem deste item, com a tela onde vivem
 * @param {function} [cfg.codigo]   numeração do item (ex.: 1.0, 1.1)
 * @param {"m"|"f"} [cfg.genero]    concordância dos avisos ("criada" x "criado")
 */
export function montarCadastro(cfg) {
    const { estado } = montarShell();
    const leitura = somenteLeitura();

    let edicao = null;
    let novo = false;
    let busca = "";

    const itens = () => estado[cfg.colecao] ?? [];

    /**
     * O aviso de vínculo, com o link para a tela onde os dependentes estão —
     * dizer "exclua as causas primeiro" sem dizer onde deixa a pessoa procurando.
     */
    const avisoDeVinculo = (usos) => {
        const filho = cfg.filhos[0];
        const plural = filho.rotulo.toLowerCase();            // "causas"
        const singular = plural.replace(/s$/, "");            // "causa"
        const nome = usos === 1 ? singular : plural;
        const verbo = usos === 1 ? "depende" : "dependem";
        // Sem demonstrativo ("essa causa"/"esse problema"): o gênero muda a cada
        // cadastro e a frase funciona igual sem ele.
        const link = filho.href
            ? ` Exclua primeiro em
                <a href="${filho.href}" class="fw-semibold">${esc(filho.tela || filho.rotulo)}</a>.`
            : "";
        return `${usos} ${nome} ${verbo} deste registro, e por isso ele não pode ser excluído.${link}`;
    };

    // "Causa criada" x "Problema criado": o aviso concorda com o nome do item.
    const fim = cfg.genero === "f" ? "a" : "o";
    const avisoDe = (verbo) => `${cfg.singular} ${verbo}${fim} com sucesso.`;
    const opcoesPai = () => (cfg.pai ? (estado[cfg.pai.colecao] ?? []) : []);

    const nomeDoPai = (item) => {
        if (!cfg.pai) return "";
        const pai = opcoesPai().find((p) => p.id === item[cfg.pai.campo]);
        return pai ? pai.nome : "—";
    };

    /**
     * Quantos itens de outras coleções dependem deste.
     *
     * Registro com vínculo não pode ser excluído; sem vínculo, pode. O botão
     * continua visível e desabilitado, com o motivo ao lado — esconder deixaria
     * a pessoa procurando uma ação que existe.
     */
    const dependentes = (item) =>
        (cfg.filhos ?? []).reduce(
            (total, filho) => total + (estado[filho.colecao] ?? []).filter((f) => f[filho.campo] === item.id).length,
            0
        );

    function vazio() {
        const base = { id: "", nome: "", descricao: "" };
        if (cfg.pai) base[cfg.pai.campo] = opcoesPai()[0]?.id ?? "";
        return base;
    }

    /* ---------- tabela ---------- */

    function render() {
        const termo = busca.trim().toLowerCase();
        const lista = itens().filter(
            (i) => !termo || i.nome.toLowerCase().includes(termo) || (i.descricao ?? "").toLowerCase().includes(termo)
        );

        const semPai = cfg.pai && opcoesPai().length === 0;

        document.getElementById("conteudo").innerHTML = `
        ${cabecalhoPagina(
            cfg.titulo,
            cfg.subtitulo,
            `
            <div class="app-search">
                <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar" value="${esc(busca)}" />
                <i class="ti ti-search app-search-icon text-muted"></i>
            </div>
            ${
                leitura
                    ? `<span class="fs-12 text-muted">Perfil de acompanhamento — sem edição.</span>`
                    : `<button class="btn btn-sm btn-primary" id="novo" ${semPai ? "disabled" : ""}>
                    <i class="ti ti-plus me-1"></i>${esc(cfg.novoRotulo)}
                </button>`
            }`
        )}

        ${
            semPai
                ? `<div class="alert alert-warning py-2 px-3 fs-13">
                Cadastre ao menos ${esc(cfg.pai.artigo)} <a href="${cfg.pai.href}" class="fw-semibold">${esc(cfg.pai.rotulo)}</a>
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
                            <th>Descrição</th>
                            ${cfg.filhos?.length ? `<th class="num" style="width:9rem">${esc(cfg.filhos[0].rotulo)}</th>` : ""}
                            <th style="width:7rem">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${
                        lista.length === 0
                            ? `<tr><td colspan="${3 + (cfg.pai ? 1 : 0) + (cfg.filhos?.length ? 1 : 0) + (cfg.codigo ? 1 : 0)}" class="text-center text-muted py-4 fs-12">
                            ${itens().length === 0 ? `Nenhum registro. Comece por “${esc(cfg.novoRotulo)}”.` : "Nenhum registro corresponde à busca."}
                        </td></tr>`
                            : lista
                                  .map(
                                      (i) => `
                        <tr>
                            ${cfg.codigo ? `<td class="codigo text-muted">${esc(cfg.codigo(i, estado))}</td>` : ""}
                            <td class="fw-medium">${esc(i.nome)}</td>
                            ${cfg.pai ? `<td class="fs-13 text-muted">${esc(nomeDoPai(i))}</td>` : ""}
                            <td class="fs-13 text-muted">${esc(i.descricao || "—")}</td>
                            ${cfg.filhos?.length ? `<td class="num">${dependentes(i) || "—"}</td>` : ""}
                            <td>${
                                leitura
                                    ? `<button class="btn btn-sm btn-light" data-editar="${i.id}">Ver</button>`
                                    : `<button class="btn btn-sm btn-outline-primary" data-editar="${i.id}">Editar</button>`
                            }</td>
                        </tr>`
                                  )
                                  .join("")
                    }
                    </tbody>
                </table>
            </div>
        </div>
        ${edicao ? modal() : ""}`;

        if (edicao) {
            const el = document.getElementById("modal-cadastro");
            limparAoDigitar(el);
            new bootstrap.Modal(el).show();
            el.addEventListener("hidden.bs.modal", () => {
                edicao = null;
                render();
            }, { once: true });
        }
    }

    /* ---------- modal ---------- */

    function modal() {
        const usos = novo ? 0 : dependentes(edicao);

        return `
    <div class="modal fade" id="modal-cadastro" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15">
                        ${novo ? esc(cfg.novoRotulo) : leitura ? esc(edicao.nome) : `Editar ${esc(cfg.singular.toLowerCase())}`}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        ${
                            cfg.codigo && !novo
                                ? `<div class="col-12">
                            <span class="rotulo-secao">Número</span>
                            <div class="codigo">${esc(cfg.codigo(edicao, estado))}</div>
                            <div class="form-text fs-12">A numeração segue a ordem de cadastro dentro do nível acima.</div>
                        </div>`
                                : ""
                        }
                        <div class="col-12">
                            <label class="form-label" for="f-nome">${esc(cfg.singular)} <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="f-nome" value="${esc(edicao.nome)}" ${leitura ? "disabled" : ""} />
                            ${campoErro("f-nome")}
                        </div>
                        ${
                            cfg.pai
                                ? `<div class="col-12">
                            <label class="form-label" for="f-pai">${esc(cfg.pai.rotulo)} <span class="text-danger">*</span></label>
                            <select class="form-select" id="f-pai" ${leitura ? "disabled" : ""}>
                                ${opcoesPai()
                                    .map(
                                        (p) =>
                                            `<option value="${p.id}"${edicao[cfg.pai.campo] === p.id ? " selected" : ""}>${esc(p.nome)}</option>`
                                    )
                                    .join("")}
                            </select>
                            ${campoErro("f-pai")}
                        </div>`
                                : ""
                        }
                        <div class="col-12">
                            <label class="form-label" for="f-descricao">Descrição</label>
                            <textarea class="form-control" id="f-descricao" rows="3" ${leitura ? "disabled" : ""}>${esc(edicao.descricao ?? "")}</textarea>
                        </div>
                    </div>

                    ${
                        usos
                            ? `<div class="alert alert-warning py-2 px-3 fs-12 mt-3 mb-0">
                        ${avisoDeVinculo(usos)}
                    </div>`
                            : ""
                    }
                </div>
                <div class="modal-footer">
                    ${
                        leitura || novo
                            ? ""
                            : `<button type="button" class="btn btn-outline-danger me-auto" id="excluir"
                        ${usos ? `disabled title="${esc(cfg.filhos[0].rotulo)} vinculados impedem a exclusão"` : ""}>
                        Excluir
                    </button>`
                    }
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">${leitura ? "Fechar" : "Cancelar"}</button>
                    ${leitura ? "" : '<button type="button" class="btn btn-primary" id="salvar">Salvar</button>'}
                </div>
            </div>
        </div>
    </div>`;
    }

    /** Fecha o modal de edição e resolve quando ele terminou de sair da tela. */
    function fecharModal() {
        return new Promise((resolve) => {
            const el = document.getElementById("modal-cadastro");
            const instancia = el && bootstrap.Modal.getInstance(el);
            if (!instancia) return resolve();
            el.addEventListener("hidden.bs.modal", () => resolve(), { once: true });
            instancia.hide();
        });
    }

    function lerModal() {
        const v = (id) => document.getElementById(id)?.value ?? "";
        const dados = { ...edicao, nome: v("f-nome").trim(), descricao: v("f-descricao").trim() };
        if (cfg.pai) dados[cfg.pai.campo] = v("f-pai");
        return dados;
    }

    /* ---------- eventos ---------- */

    document.addEventListener("click", (e) => {
        if (e.target.closest("#novo")) {
            edicao = vazio();
            novo = true;
            return render();
        }

        const editar = e.target.closest("[data-editar]");
        if (editar) {
            edicao = structuredClone(itens().find((i) => i.id === editar.dataset.editar));
            novo = false;
            return render();
        }

        if (!edicao || leitura) return;

        if (e.target.closest("#excluir")) {
            if (dependentes(edicao) > 0) return;

            const item = edicao;

            // O modal do Bootstrap prende o foco; fecha antes de confirmar.
            fecharModal().then(async () => {
                const confirmou = await confirmarExclusao({
                    titulo: `Excluir ${cfg.singular.toLowerCase()}`,
                    texto: `“${item.nome}” será removido do sistema. Não há como desfazer.`,
                });

                if (confirmou) {
                    removeItem(cfg.colecao, item.id);
                    avisar(avisoDe("excluíd"));
                    edicao = null;
                } else {
                    edicao = item;
                    novo = false;
                }
                render();
            });
            return;
        }

        if (e.target.closest("#salvar")) {
            const dados = lerModal();
            const caixa = document.getElementById("modal-cadastro");

            const ok = validar(caixa, [
                {
                    campo: "f-nome",
                    valido: !!dados.nome,
                    mensagem: `Informe ${cfg.genero === "f" ? "a" : "o"} ${cfg.singular.toLowerCase()}.`,
                },
                {
                    campo: "f-pai",
                    valido: !cfg.pai || !!dados[cfg.pai.campo],
                    mensagem: cfg.pai
                        ? `Escolha ${cfg.pai.artigo} ${cfg.pai.rotulo.toLowerCase()}.`
                        : "",
                },
            ]);
            if (!ok) return;

            const existente = itens().some((i) => i.id === dados.id);
            if (existente) updItem(cfg.colecao, dados.id, dados);
            else addItem(cfg.colecao, dados);
            avisar(avisoDe(existente ? "editad" : "criad"));

            bootstrap.Modal.getInstance(document.getElementById("modal-cadastro")).hide();
            edicao = null;
            render();
        }
    });

    document.addEventListener("input", (e) => {
        if (e.target.id === "busca") {
            busca = e.target.value;
            render();
            // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o
            // texto digitado sai embaralhado.
            const campo = document.getElementById("busca");
            campo.focus();
            campo.setSelectionRange(campo.value.length, campo.value.length);
        }
    });

    render();
}
