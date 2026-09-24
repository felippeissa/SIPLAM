/**
 * Seleção por catálogo: buscar o que já existe, cadastrar o que falta.
 *
 * O padrão é este, e vale para qualquer vínculo com um cadastro do sistema:
 * um campo de busca em cima de uma tabela. A pessoa digita, vê o que já está
 * cadastrado e escolhe. Se o que ela digitou não existe, a própria lista oferece
 * cadastrá-lo, e a janela abre **já com o texto digitado no lugar do nome**: ela
 * completa os campos que faltam, salva, e o registro entra na tabela — sem sair
 * da tela em que estava.
 *
 * Há dois modos. No padrão, o vínculo é de muitos — a tabela lista tudo o que
 * foi escolhido. Com `unico: true`, o vínculo é de um só: escolher substitui o
 * anterior, e a busca some enquanto houver escolha, porque oferecer busca ao
 * lado de um valor já definido convida a trocar sem querer.
 *
 * O que isso resolve: antes, cada vínculo era ou um `select` do que já existia
 * — e quem precisasse de um registro novo tinha de abandonar o formulário — ou
 * um campo livre, que criava duplicata a cada grafia diferente. Aqui o cadastro
 * é um só, e cadastrar não interrompe.
 */
import { obterEstado, addItem, updItem, ppaCorrente } from "./dados/store.js";
import { esc } from "./ui.js";
import { avisar } from "./toast.js";

/**
 * @param {object} cfg
 * @param {string} cfg.colecao    coleção no estado, ex.: "subcausas"
 * @param {string} cfg.singular   "Subcausa"
 * @param {string} cfg.plural     "Subcausas"
 * @param {string} cfg.artigo     "a" ou "o"
 * @param {{id:string, rotulo:string, tipo?:"texto"|"area", ajuda?:string}[]} cfg.campos
 *                                campos próprios do registro, além do nome
 * @param {{rotulo:string, valor:Function}[]} cfg.colunasExtra
 *                                colunas só de leitura na grade, ao lado dos campos —
 *                                o que se deriva do registro e não se digita nele
 * @param {string} cfg.prefixo    prefixo dos ids no HTML, para dois catálogos na mesma tela
 */
export function catalogo(cfg) {
    const { colecao, singular, plural, campos } = cfg;
    const extras = cfg.colunasExtra ?? [];
    const artigo = cfg.artigo ?? "a";
    const px = cfg.prefixo ?? "cat";

    let escolhidos = [];
    let termo = "";
    let aberto = false;
    // O clique fora é ouvido no documento, que sobrevive ao redesenho do
    // formulário. Sem esta trava, cada redesenho somaria mais um ouvinte.
    let ouvindoForaDaTela = false;

    const estado = () => obterEstado();

    // Um PPA por vez: o catálogo só oferece o que pertence ao plano corrente.
    // Sem isso, um sistema com dois ciclos mostra cada registro duas vezes, e a
    // pessoa escolhe o do plano errado sem ter como perceber.
    const todos = () => {
        const dados = estado();
        const plano = ppaCorrente(dados);
        return (dados[colecao] ?? []).filter((r) => !r.ppaId || !plano || r.ppaId === plano.id);
    };
    const porId = (id) => todos().find((r) => r.id === id);

    /**
     * A segunda linha de cada sugestão.
     *
     * Por padrão é o primeiro campo do registro. Quem precisa de outra coisa —
     * a que eixo um objetivo já pertence, por exemplo — informa a sua.
     */
    const detalhe = (r) => (cfg.detalhe ? cfg.detalhe(r, estado()) : r[campos[0]?.id] ?? "");

    const norm = (v) =>
        String(v ?? "")
            .toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .trim();

    /** O que casa com o que foi digitado e ainda não foi escolhido. */
    const achados = () =>
        todos()
            .filter((r) => !escolhidos.includes(r.id) && (!termo || norm(r.nome).includes(norm(termo))))
            .slice(0, 8);

    /** Em quantos lugares do sistema este registro é usado. */
    const usos = (id) => (cfg.usos ? cfg.usos(id, estado()) : 1);

    /** Já existe registro com esse nome, escolhido ou não? */
    const existeComNome = (nome) => todos().find((r) => norm(r.nome) === norm(nome));

    /* ---------- desenho ---------- */

    function linhas() {
        if (!escolhidos.length) {
            return `<tr><td colspan="${campos.length + extras.length + 2}" class="text-center text-muted py-3 fs-12">
                ${
                    cfg.unico
                        ? `Nenhum${artigo === "a" ? "a" : ""} ${singular.toLowerCase()} escolhid${artigo}.`
                        : `Nenhum${artigo === "a" ? "a" : ""} ${singular.toLowerCase()} vinculad${artigo}. Busque acima ou cadastre ${artigo === "a" ? "uma" : "um"} nov${artigo}.`
                }
            </td></tr>`;
        }

        return escolhidos
            .map((id) => {
                const r = porId(id);
                if (!r) return "";
                return `
            <tr>
                <td class="fw-medium">${esc(r.nome)}</td>
                ${campos.map((c) => `<td class="fs-13 text-muted">${esc(r[c.id] || "—")}</td>`).join("")}
                ${extras.map((c) => `<td class="fs-13 text-muted">${c.valor(r, estado())}</td>`).join("")}
                <td class="text-end align-top text-nowrap">
                    <button type="button" class="btn btn-sm btn-light me-1" data-${px}-editar="${id}" title="Editar ${esc(singular.toLowerCase())}">
                        <i class="ti ti-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-light" data-${px}-tirar="${id}" title="Desvincular">
                        <i class="ti ti-x"></i>
                    </button>
                </td>
            </tr>`;
            })
            .join("");
    }

    function sugestoes() {
        if (!aberto) return "";
        const lista = achados();
        const novo = termo.trim() && !existeComNome(termo);

        if (!lista.length && !novo) {
            return `<div class="list-group-item fs-13 text-muted">Nenhum${artigo === "a" ? "a" : ""} ${singular.toLowerCase()} encontrad${artigo}.</div>`;
        }

        return (
            lista
                .map(
                    (r) => `
        <button type="button" class="list-group-item list-group-item-action" data-${px}-por="${r.id}">
            <span class="d-block fs-13">${esc(r.nome)}</span>
            ${detalhe(r) ? `<span class="fs-12 text-muted">${esc(detalhe(r))}</span>` : ""}
        </button>`
                )
                .join("") +
            (novo
                ? `
        <button type="button" class="list-group-item list-group-item-action text-primary" data-${px}-criar="1">
            <i class="ti ti-plus me-1"></i>Cadastrar “${esc(termo.trim())}” como ${singular.toLowerCase()}
        </button>`
                : "")
        );
    }

    function html(selecionados = []) {
        escolhidos = [...selecionados];
        termo = "";
        aberto = false;

        return `
        <div class="mb-3" id="${px}-bloco">
            <label class="form-label" for="${px}-busca">${esc(plural)}</label>

            <!--
                Sem botão ao lado: cadastrar é oferta da própria lista, quando o
                que foi digitado não existe. Um botão fixo competiria com a busca
                e convidaria a cadastrar antes de procurar — que é como nasce
                duplicata.
            -->
            <div class="position-relative mb-2 ${cfg.unico && escolhidos.length ? "d-none" : ""}" id="${px}-caixa">
                <input type="text" class="form-control" id="${px}-busca" autocomplete="off"
                       placeholder="Busque ${artigo === "a" ? "uma" : "um"} ${singular.toLowerCase()}, ou digite para cadastrar…" />
                <div class="list-group position-absolute w-100 shadow-sm d-none" id="${px}-sugestoes"
                     style="z-index:5; max-height:16rem; overflow:auto"></div>
            </div>


            <div class="table-responsive border rounded">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th style="width:16rem">Nome</th>
                            ${campos.map((c) => `<th>${esc(c.rotulo)}</th>`).join("")}
                            ${extras.map((c) => `<th>${esc(c.rotulo)}</th>`).join("")}
                            <th style="width:6rem"></th>
                        </tr>
                    </thead>
                    <tbody id="${px}-corpo">${linhas()}</tbody>
                </table>
            </div>
            <div class="invalid-feedback d-block" id="${px}-erro"></div>
        </div>`;
    }

    /* ---------- a janela de cadastro ---------- */

    /**
     * A janela de cadastro, que também edita.
     *
     * Editar daqui muda o registro **em todo lugar onde ele é usado**, porque o
     * catálogo é um só. A janela diz isso quando há mais de um uso — corrigir uma
     * evidência achando que se mexe só nesta tela é o erro previsível aqui.
     */
    function abrirRegistro(registro, nomeInicial) {
        const el = document.createElement("div");
        el.className = "modal fade";
        el.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${registro ? `Editar ${esc(singular.toLowerCase())}` : `Nov${artigo} ${esc(singular.toLowerCase())}`}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body" id="${px}-form">
                    ${
                        registro && usos(registro.id) > 1
                            ? `<div class="alert alert-warning py-2 px-3 fs-12">
                        <i class="ti ti-alert-triangle me-1"></i>
                        Este registro é usado em ${usos(registro.id)} lugares. A alteração vale em todos.
                    </div>`
                            : ""
                    }
                    <div class="mb-3">
                        <label class="form-label" for="${px}-nome">Nome <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="${px}-nome" value="${esc(registro?.nome ?? nomeInicial)}" />
                        <div class="invalid-feedback d-block" id="${px}-nome-erro"></div>
                    </div>
                    ${campos
                        .map(
                            (c) => `
                    <div class="mb-3">
                        <label class="form-label" for="${px}-${c.id}">${esc(c.rotulo)}</label>
                        ${
                            c.tipo === "texto"
                                ? `<input type="text" class="form-control" id="${px}-${c.id}" value="${esc(registro?.[c.id] ?? "")}" />`
                                : `<textarea class="form-control" id="${px}-${c.id}" rows="3" placeholder="${esc(c.ajuda ?? "")}">${esc(registro?.[c.id] ?? "")}</textarea>`
                        }
                    </div>`
                        )
                        .join("")}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="${px}-salvar">Salvar</button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(el);

        const modal = new bootstrap.Modal(el);
        modal.show();
        setTimeout(() => document.getElementById(`${px}-nome`)?.focus(), 200);

        document.getElementById(`${px}-salvar`).addEventListener("click", () => {
            const nome = document.getElementById(`${px}-nome`).value.trim();
            const erro = document.getElementById(`${px}-nome-erro`);

            if (!nome) {
                erro.textContent = "Informe o nome.";
                return;
            }
            // O catálogo é único: duas entradas com o mesmo nome seriam duas
            // verdades sobre a mesma coisa.
            const repetido = existeComNome(nome);
            if (repetido && repetido.id !== registro?.id) {
                erro.textContent = `Já existe ${artigo === "a" ? "uma" : "um"} ${singular.toLowerCase()} com esse nome.`;
                return;
            }

            const preenchidos = Object.fromEntries(
                campos.map((c) => [c.id, document.getElementById(`${px}-${c.id}`).value.trim()])
            );

            if (registro) {
                updItem(colecao, registro.id, { nome, ...preenchidos });
                avisar(`${singular} atualizad${artigo}.`);
            } else {
                const novo = addItem(colecao, { nome, ...preenchidos, ...(cfg.aoCriar?.() ?? {}) });
                if (cfg.unico) escolhidos = [novo.id];
                else escolhidos.push(novo.id);
                avisar(`${singular} cadastrad${artigo} e vinculad${artigo}.`);
            }

            modal.hide();
            redesenhar();
        });

        el.addEventListener("hidden.bs.modal", () => el.remove());
    }

    /* ---------- comportamento ---------- */

    function redesenhar() {
        const corpo = document.getElementById(`${px}-corpo`);
        if (corpo) corpo.innerHTML = linhas();

        // No vínculo de um só, a busca some enquanto houver escolha: para trocar,
        // a pessoa desvincula primeiro, e a troca vira um ato deliberado.
        const busca = document.getElementById(`${px}-caixa`);
        if (busca && cfg.unico) busca.classList.toggle("d-none", escolhidos.length > 0);
        const caixa = document.getElementById(`${px}-sugestoes`);
        if (caixa) {
            caixa.innerHTML = sugestoes();
            caixa.classList.toggle("d-none", !aberto);
        }
        const erro = document.getElementById(`${px}-erro`);
        if (erro) erro.textContent = "";
    }

    function ligar(escopo) {
        const busca = escopo.querySelector(`#${px}-busca`);

        busca?.addEventListener("input", () => {
            termo = busca.value;
            aberto = true;
            redesenhar();
        });
        busca?.addEventListener("focus", () => {
            aberto = true;
            redesenhar();
        });
        // Enter escolhe o primeiro achado; sem achado nenhum, abre o cadastro.
        busca?.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const primeiro = achados()[0];
            if (primeiro) {
                if (cfg.unico) escolhidos = [primeiro.id];
                else escolhidos.push(primeiro.id);
                busca.value = "";
                termo = "";
                redesenhar();
            } else if (termo.trim()) {
                abrirRegistro(null, termo.trim());
            }
        });

        // Clicar fora fecha a lista; clicar dentro não, senão o item some antes
        // de o clique chegar nele.
        if (!ouvindoForaDaTela) {
            ouvindoForaDaTela = true;
            document.addEventListener("mousedown", (e) => {
                if (!aberto) return;
                if (e.target.closest(`#${px}-bloco`)) return;
                aberto = false;
                redesenhar();
            });
        }

        if (escopo.dataset[`${px}Ligado`]) return;
        escopo.dataset[`${px}Ligado`] = "1";

        // O escopo sobrevive ao redesenho, mas o campo de busca não: procurá-lo
        // de novo a cada clique evita escrever num elemento que já saiu da tela.
        const campoBusca = () => document.getElementById(`${px}-busca`);

        escopo.addEventListener("click", (e) => {
            const por = e.target.closest(`[data-${px}-por]`);
            if (por) {
                if (cfg.unico) escolhidos = [por.dataset[`${px}Por`]];
                else escolhidos.push(por.dataset[`${px}Por`]);
                const campo = campoBusca();
                if (campo) campo.value = "";
                termo = "";
                aberto = false;
                redesenhar();
                return;
            }

            if (e.target.closest(`[data-${px}-criar]`)) {
                aberto = false;
                redesenhar();
                abrirRegistro(null, campoBusca()?.value.trim() ?? "");
                return;
            }

            const editar = e.target.closest(`[data-${px}-editar]`);
            if (editar) {
                const alvo = porId(editar.dataset[`${px}Editar`]);
                if (alvo) abrirRegistro(alvo, alvo.nome);
                return;
            }

            const tirar = e.target.closest(`[data-${px}-tirar]`);
            if (tirar) {
                escolhidos = escolhidos.filter((id) => id !== tirar.dataset[`${px}Tirar`]);
                redesenhar();
            }
        });
    }

    return { html, ligar, ler: () => [...escolhidos] };
}
