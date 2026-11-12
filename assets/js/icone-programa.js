/**
 * Ícone do Programa.
 *
 * Cada Programa pode ter um ícone que o simboliza. Ele aparece ao lado do nome nas tabelas de Programas e se escolhe no
 * formulário, numa janela com os ícones do sistema (os Tabler, `ti-*`), agrupados por assunto e com busca.
 *
 * O Programa sem ícone escolhido mostra o ícone padrão, para a coluna nunca ficar torta.
 */
import { esc } from "./ui.js";

export const ICONE_PADRAO = "ti-stack-2";

/** [classe do ícone, nome para busca]. O grupo é o título que antecede os ícones. */
export const GRUPOS_DE_ICONES = [
    ["Saúde", [["ti-heartbeat", "Saúde"], ["ti-stethoscope", "Atendimento médico"], ["ti-pill", "Medicamentos"], ["ti-first-aid-kit", "Primeiros socorros"], ["ti-ambulance", "Urgência"], ["ti-vaccine", "Vacinação"], ["ti-microscope", "Laboratório"], ["ti-brain", "Saúde mental"], ["ti-dental", "Saúde bucal"], ["ti-heart-plus", "Cuidado"], ["ti-activity", "Vigilância"], ["ti-bandage", "Curativo"]]],
    ["Educação e cultura", [["ti-school", "Escola"], ["ti-book", "Livro"], ["ti-books", "Biblioteca"], ["ti-backpack", "Estudantes"], ["ti-certificate", "Certificação"], ["ti-abacus", "Matemática"], ["ti-writing", "Alfabetização"], ["ti-palette", "Arte"], ["ti-music", "Música"], ["ti-masks-theater", "Teatro"], ["ti-camera", "Fotografia"], ["ti-movie", "Cinema"]]],
    ["Segurança e justiça", [["ti-shield-check", "Segurança pública"], ["ti-shield", "Proteção"], ["ti-lock", "Sistema prisional"], ["ti-alarm", "Alerta"], ["ti-scale", "Justiça"], ["ti-gavel", "Tribunal"], ["ti-eye-check", "Monitoramento"], ["ti-radar-2", "Inteligência"]]],
    ["Infraestrutura e transporte", [["ti-building-bridge-2", "Obras"], ["ti-road", "Rodovias"], ["ti-bus", "Transporte coletivo"], ["ti-train", "Ferrovia"], ["ti-plane", "Aeroporto"], ["ti-ship", "Hidrovia"], ["ti-truck", "Logística"], ["ti-bike", "Mobilidade"], ["ti-car", "Trânsito"], ["ti-building", "Edificação"], ["ti-building-skyscraper", "Cidade"], ["ti-stairs", "Acessibilidade urbana"]]],
    ["Social e cidadania", [["ti-heart-handshake", "Assistência social"], ["ti-users", "Pessoas"], ["ti-users-group", "Juventude"], ["ti-user-heart", "Cuidado com pessoas"], ["ti-baby-carriage", "Primeira infância"], ["ti-mood-kid", "Crianças"], ["ti-home", "Moradia"], ["ti-home-heart", "Habitação social"], ["ti-accessible", "Pessoa com deficiência"], ["ti-wheelchair", "Inclusão"], ["ti-tools-kitchen-2", "Alimentação"], ["ti-building-community", "Comunidade"]]],
    ["Meio ambiente e campo", [["ti-leaf", "Meio ambiente"], ["ti-trees", "Florestas"], ["ti-plant", "Agricultura"], ["ti-plant-2", "Sustentabilidade"], ["ti-wheat", "Grãos"], ["ti-tractor", "Produção rural"], ["ti-droplet", "Água"], ["ti-recycle", "Resíduos"], ["ti-mountain", "Território"], ["ti-cloud-rain", "Clima"], ["ti-fish", "Pesca"], ["ti-paw", "Fauna"]]],
    ["Energia, economia e inovação", [["ti-bolt", "Energia"], ["ti-sun", "Energia solar"], ["ti-wind", "Energia eólica"], ["ti-flame", "Gás"], ["ti-chart-bar", "Economia"], ["ti-coin", "Finanças"], ["ti-building-bank", "Banco"], ["ti-building-factory-2", "Indústria"], ["ti-shopping-cart", "Comércio"], ["ti-briefcase", "Trabalho e renda"], ["ti-truck-delivery", "Exportação"], ["ti-bulb", "Inovação"], ["ti-cpu", "Tecnologia"], ["ti-device-laptop", "Governo digital"], ["ti-wifi", "Conectividade"], ["ti-rocket", "Empreendedorismo"], ["ti-atom", "Ciência"], ["ti-flask", "Pesquisa"]]],
    ["Esporte, turismo e gestão", [["ti-ball-football", "Esporte"], ["ti-trophy", "Competição"], ["ti-barbell", "Atividade física"], ["ti-run", "Corrida"], ["ti-swimming", "Natação"], ["ti-tent", "Turismo"], ["ti-map-pin", "Território"], ["ti-world", "Relações externas"], ["ti-flag", "Metas"], ["ti-award", "Reconhecimento"], ["ti-target", "Resultado"], ["ti-file-text", "Gestão e transparência"], ["ti-calendar", "Planejamento"], ["ti-speakerphone", "Comunicação"], ["ti-ruler-2", "Projeto"], ["ti-stack-2", "Programa"]]],
];

export const TODOS_OS_ICONES = GRUPOS_DE_ICONES.flatMap(([, lista]) => lista);
const nomeDoIcone = (classe) => TODOS_OS_ICONES.find(([c]) => c === classe)?.[1] ?? "Ícone";

/** O ícone do Programa, com o padrão para quem não escolheu. */
export const iconeDoPrograma = (p) => (TODOS_OS_ICONES.some(([c]) => c === p?.icone) ? p.icone : ICONE_PADRAO);

/** O selo do ícone, para o lado do nome nas tabelas. */
export function seloDoIcone(p) {
    const c = iconeDoPrograma(p);
    return `<span class="icone-programa" title="${esc(nomeDoIcone(c))}" aria-hidden="true"><i class="ti ${c}"></i></span>`;
}

/* ---------- o campo do formulário ---------- */

/** Botão que mostra o ícone escolhido e abre a janela de escolha. */
export function campoDeIcone(valor, leitura) {
    const c = iconeDoPrograma({ icone: valor });
    return `
    <div class="mb-3">
        <label class="form-label" for="f-icone-botao">Ícone do programa</label>
        <input type="hidden" id="f-icone" value="${esc(valor ?? "")}" />
        <button type="button" class="form-select text-start d-flex align-items-center gap-2" id="f-icone-botao" ${leitura ? "disabled" : ""}>
            <span class="icone-programa" id="f-icone-previa"><i class="ti ${c}"></i></span>
            <span class="text-truncate" id="f-icone-nome">${valor ? esc(nomeDoIcone(c)) : "Ícone padrão"}</span>
        </button>
        <div class="form-text fs-12">Simboliza o Programa nas tabelas.</div>
    </div>`;
}

export const lerIcone = () => document.getElementById("f-icone")?.value ?? "";

export function ligarCampoDeIcone(escopo) {
    escopo.querySelector("#f-icone-botao")?.addEventListener("click", () => {
        abrirSeletorDeIcone(lerIcone(), (escolhido) => {
            escopo.querySelector("#f-icone").value = escolhido;
            const c = iconeDoPrograma({ icone: escolhido });
            escopo.querySelector("#f-icone-previa").innerHTML = `<i class="ti ${c}"></i>`;
            escopo.querySelector("#f-icone-nome").textContent = escolhido ? nomeDoIcone(c) : "Ícone padrão";
        });
    });
}

/** A janela com os ícones do sistema: busca, grupos e a escolha com um clique. */
function abrirSeletorDeIcone(atual, aoEscolher) {
    const ID = "modal-icones";
    document.getElementById(ID)?.remove();
    const grade = (lista) =>
        lista
            .map(
                ([c, nome]) => `
            <button type="button" class="icone-opcao${c === atual ? " ativo" : ""}" data-icone="${c}" title="${esc(nome)}" aria-label="${esc(nome)}">
                <i class="ti ${c}"></i>
            </button>`
            )
            .join("");
    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="${ID}" tabindex="-1" aria-labelledby="${ID}-titulo" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15" id="${ID}-titulo">Escolher o ícone do Programa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="app-search mb-3">
                        <input type="search" class="form-control" id="icone-busca" placeholder="Buscar por assunto: saúde, escola, obras…" autocomplete="off" />
                        <i class="ti ti-search app-search-icon text-muted"></i>
                    </div>
                    <div id="icone-grupos">
                        ${GRUPOS_DE_ICONES.map(([titulo, lista]) => `<div class="icone-grupo"><div class="rotulo-secao mb-2">${esc(titulo)}</div><div class="icone-grade">${grade(lista)}</div></div>`).join("")}
                    </div>
                    <p class="text-muted fs-13 mb-0 d-none" id="icone-vazio">Nenhum ícone para essa busca.</p>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-light" id="icone-padrao">Usar o ícone padrão</button>
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                </div>
            </div>
        </div>
    </div>`
    );
    const el = document.getElementById(ID);
    const modal = new window.bootstrap.Modal(el);
    el.addEventListener("hidden.bs.modal", () => el.remove(), { once: true });
    el.addEventListener("shown.bs.modal", () => el.querySelector("#icone-busca").focus(), { once: true });

    const norm = (v) => String(v ?? "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, "");
    el.querySelector("#icone-busca").addEventListener("input", (e) => {
        const q = norm(e.target.value).trim();
        let achou = 0;
        el.querySelectorAll(".icone-opcao").forEach((b) => {
            const bate = !q || norm(b.title).includes(q) || norm(b.dataset.icone).includes(q);
            b.classList.toggle("d-none", !bate);
            if (bate) achou++;
        });
        el.querySelectorAll(".icone-grupo").forEach((g) => g.classList.toggle("d-none", !g.querySelector(".icone-opcao:not(.d-none)")));
        el.querySelector("#icone-vazio").classList.toggle("d-none", achou > 0);
    });
    el.addEventListener("click", (e) => {
        const b = e.target.closest("[data-icone]");
        if (b) {
            aoEscolher(b.dataset.icone);
            modal.hide();
        } else if (e.target.closest("#icone-padrao")) {
            aoEscolher("");
            modal.hide();
        }
    });
    modal.show();
}

/**
 * O ícone de cada Programa de exemplo: sai do assunto do nome e, na falta, da área de governo do eixo. Só entra onde o
 * Programa ainda não tem ícone, e uma vez só.
 */
export function iconeDeExemplo(p) {
    const nome = `${p.nome ?? ""}`.toLowerCase();
    const eixo = `${p.eixo ?? ""}`.toLowerCase();
    const porNome = [
        [/fome|aliment/, "ti-tools-kitchen-2"], [/inf[âa]ncia|crian/, "ti-baby-carriage"], [/juventude|jovem/, "ti-users-group"],
        [/envelhec|idos/, "ti-user-heart"], [/mulher/, "ti-heart-handshake"], [/morad|habita/, "ti-home-heart"],
        [/saneamento|[áa]gua/, "ti-droplet"], [/cidades|mobilidade|tr[âa]nsito/, "ti-building-skyscraper"], [/rotas|rodov|estrad/, "ti-road"],
        [/energia/, "ti-bolt"], [/turismo/, "ti-tent"], [/agro|rural|produ[çc][ãa]o/, "ti-plant"], [/cultura|patrim[ôo]nio/, "ti-palette"],
        [/esporte/, "ti-ball-football"], [/digital|governo/, "ti-device-laptop"], [/compliance|controle|transpar/, "ti-file-text"],
        [/educa/, "ti-school"], [/sa[úu]de/, "ti-heartbeat"], [/seguran/, "ti-shield-check"], [/defesa/, "ti-shield"], [/justi/, "ti-scale"],
        [/ambient|recursos naturais/, "ti-leaf"], [/inova|ci[êe]ncia|tecnolog/, "ti-bulb"], [/emprego|trabalho|renda/, "ti-briefcase"],
    ];
    for (const [re, icone] of porNome) if (re.test(nome)) return icone;
    const porEixo = [
        [/sa[úu]de/, "ti-heartbeat"], [/educa/, "ti-school"], [/seguran/, "ti-shield-check"], [/infraestrutura/, "ti-building-bridge-2"],
        [/social/, "ti-heart-handshake"], [/inova/, "ti-bulb"], [/gest[ãa]o/, "ti-briefcase"], [/econ[ôo]mico/, "ti-chart-bar"],
    ];
    for (const [re, icone] of porEixo) if (re.test(eixo)) return icone;
    return ICONE_PADRAO;
}
