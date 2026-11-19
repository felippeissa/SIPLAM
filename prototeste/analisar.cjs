/**
 * Lê resultados/execucoes.jsonl e gera resultados/resumo.json e resultados/tabelas.md.
 * Só conta e resume o que foi registrado: nada é estimado e nenhuma significância estatística é calculada.
 */
const fs = require("fs");
const path = require("path");
const SAIDA = process.env.PROTO_SAIDA ? path.resolve(process.env.PROTO_SAIDA) : path.join(__dirname, "resultados");
const runs = fs.readFileSync(path.join(SAIDA, "execucoes.jsonl"), "utf-8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

const PERSONAS = ["P1", "P2", "P3", "P4", "P5"];
const VARS = ["A-direita", "B-esquerda"];
const NOMES = { P1: "Operador experiente", P2: "Gestor ocasional", P3: "Usuário iniciante", P4: "Analista cuidadoso", P5: "Teclado" };

const nums = (a) => a.filter((x) => typeof x === "number").sort((x, y) => x - y);
const q = (a, p) => { const v = nums(a); if (!v.length) return null; const i = (v.length - 1) * p; const lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
const med = (a) => q(a, 0.5);
const f = (x, d = 0) => (x === null || x === undefined ? "—" : Number(x).toFixed(d));
const dist = (a) => { const v = nums(a); return v.length ? `${f(med(v))} (${f(q(v, 0.25))}–${f(q(v, 0.75))}; mín ${f(v[0])}, máx ${f(v[v.length - 1])})` : "—"; };

const status = (rs) => ({ n: rs.length, concluida: rs.filter((r) => r.status === "concluida").length, falha: rs.filter((r) => r.status === "falha").length, bloqueado: rs.filter((r) => r.status === "bloqueado").length });
const infra = (r) => r.errors.some((e) => /requestfailed|ERR_|net::|Timeout|waiting failed/i.test(e));
const sucessoTecnico = (rs) => rs.filter((r) => r.success === true).length;

const out = [];
const resumo = { gerado_em: new Date().toISOString(), por_variante: {}, por_celula: {}, falhas: [], teclado: {} };

/* ---------- 10.1 contagens ---------- */
const total = status(runs);
out.push("## Contagens (planejadas × executadas)\n");
out.push("| | Planejadas | Executadas | Concluídas | Falha | Bloqueadas |");
out.push("|---|---:|---:|---:|---:|---:|");
out.push(`| **Total** | 100 | ${total.n} | ${total.concluida} | ${total.falha} | ${total.bloqueado} |`);
for (const v of VARS) { const s = status(runs.filter((r) => r.variant === v)); out.push(`| ${v} | 50 | ${s.n} | ${s.concluida} | ${s.falha} | ${s.bloqueado} |`); }
out.push("");

/* ---------- por variante ---------- */
out.push("## Por variante (todas as protopersonas)\n");
out.push("Tempos e interações: mediana (p25–p75; mín, máx) **das execuções automatizadas bem-sucedidas**; não são tempos humanos.\n");
out.push("| Variante | Sucesso técnico | Execuções com erro registrado | Tempo até identificar a linha (ms) | Tempo até acionar Editar (ms) | Tempo total (ms) | Interações |");
out.push("|---|---:|---:|---|---|---|---|");
for (const v of VARS) {
    const rs = runs.filter((r) => r.variant === v);
    const ok = rs.filter((r) => r.success === true);
    resumo.por_variante[v] = { execucoes: rs.length, sucesso: ok.length, com_erro: rs.filter((r) => r.errors.length).length, identificar_mediana_ms: med(ok.map((r) => r.time_to_identify_row_ms)), editar_mediana_ms: med(ok.map((r) => r.time_to_edit_ms)), total_mediana_ms: med(ok.map((r) => r.total_time_ms)), interacoes_mediana: med(ok.map((r) => r.interaction_count)) };
    out.push(`| ${v} | ${ok.length}/${rs.length} | ${rs.filter((r) => r.errors.length).length} | ${dist(ok.map((r) => r.time_to_identify_row_ms))} | ${dist(ok.map((r) => r.time_to_edit_ms))} | ${dist(ok.map((r) => r.total_time_ms))} | ${dist(ok.map((r) => r.interaction_count))} |`);
}
out.push("");

/* ---------- por persona × variante ---------- */
out.push("## Por protopersona e variante\n");
out.push("| Persona | Variante | Execuções | Sucesso técnico | Erros | Identificar linha, mediana (ms) | Acionar Editar, mediana (ms) | Total, mediana (ms) | Interações, mediana | Evidências |");
out.push("|---|---|---:|---:|---:|---:|---:|---:|---:|---|");
for (const p of PERSONAS) {
    for (const v of VARS) {
        const rs = runs.filter((r) => r.persona_id === p && r.variant === v);
        const ok = rs.filter((r) => r.success === true);
        const evid = [...new Set(rs.flatMap((r) => r.evidence_paths))].map((e) => `[${path.basename(e).replace(/\.png$/, "")}](evidencias/${path.basename(e)})`).join(", ");
        resumo.por_celula[`${p}|${v}`] = { n: rs.length, sucesso: ok.length, erros: rs.reduce((a, r) => a + r.errors.length, 0), identificar_ms: med(ok.map((r) => r.time_to_identify_row_ms)), editar_ms: med(ok.map((r) => r.time_to_edit_ms)), total_ms: med(ok.map((r) => r.total_time_ms)), interacoes: med(ok.map((r) => r.interaction_count)) };
        out.push(`| ${p} · ${NOMES[p]} | ${v} | ${rs.length} | ${ok.length}/${rs.length} | ${rs.reduce((a, r) => a + r.errors.length, 0)} | ${f(med(ok.map((r) => r.time_to_identify_row_ms)))} | ${f(med(ok.map((r) => r.time_to_edit_ms)))} | ${f(med(ok.map((r) => r.total_time_ms)))} | ${f(med(ok.map((r) => r.interaction_count)))} | ${evid || "—"} |`);
    }
}
out.push("");

/* ---------- ordem A→B / B→A ---------- */
out.push("## Efeito de ordem (apenas diagnóstico)\n");
out.push("| Sequência | Execuções | Sucesso técnico | Tempo total, mediana (ms) |");
out.push("|---|---:|---:|---:|");
for (const s of ["A-B", "B-A"]) { const rs = runs.filter((r) => r.sequence === s); out.push(`| ${s} | ${rs.length} | ${sucessoTecnico(rs)}/${rs.length} | ${f(med(rs.filter((r) => r.success).map((r) => r.total_time_ms)))} |`); }
out.push("");

/* ---------- P5 teclado ---------- */
out.push("## P5 · navegação por teclado\n");
out.push("| Variante | Execuções | Tab até o foco entrar na linha-alvo | Tab até o Editar | Foco visível no Editar | Tab até o campo Nome | Shift+Tab de volta até Salvar |");
out.push("|---|---:|---|---|---|---|---|");
for (const v of VARS) {
    const rs = runs.filter((r) => r.persona_id === "P5" && r.variant === v && r.teclado);
    const t = (k) => dist(rs.map((r) => r.teclado[k]));
    const nomeCampo = rs.map((r) => (r.teclado.tabs_no_formulario ?? null) !== null && r.teclado.shift_tabs_ate_salvar != null ? r.teclado.tabs_no_formulario - r.teclado.shift_tabs_ate_salvar : null);
    out.push(`| ${v} | ${rs.length} | ${t("tabs_ate_linha")} | ${t("tabs_ate_editar")} | ${rs.filter((r) => r.teclado.foco_visivel_no_editar).length}/${rs.length} | ${dist(nomeCampo)} | ${t("shift_tabs_ate_salvar")} |`);
    resumo.teclado[v] = { n: rs.length, tabs_ate_linha: med(rs.map((r) => r.teclado.tabs_ate_linha)), tabs_ate_editar: med(rs.map((r) => r.teclado.tabs_ate_editar)) };
}
out.push("");
const primeiroFoco = {};
for (const r of runs.filter((r) => r.persona_id === "P5")) { const m = (r.observed_facts.find((x) => /primeiro controle focado/.test(x)) || "").match(/primeiro controle focado na linha: ([^)]+\])/); if (m) primeiroFoco[`${r.variant}: ${m[1]}`] = (primeiroFoco[`${r.variant}: ${m[1]}`] || 0) + 1; }
out.push("Primeiro controle que recebe o foco dentro da linha-alvo: " + (Object.entries(primeiroFoco).map(([k, n]) => `${k} (${n}×)`).join("; ") || "—") + ".\n");

/* ---------- fatos estáticos ---------- */
out.push("## Fatos de layout e acessibilidade observados (por variante)\n");
out.push("| Variante | Posição da coluna Ações | Rolagem horizontal (na janela desta análise) | Candidatas ao nome exato / que contêm o texto |");
out.push("|---|---|---|---|");
for (const v of VARS) {
    const rs = runs.filter((r) => r.variant === v && r.base);
    const pos = [...new Set(rs.map((r) => `${r.base.posicao_da_coluna_acoes} de ${r.base.total_de_colunas}`))].join(", ");
    const rol = [...new Set(rs.map((r) => (r.base.rolagem_horizontal ? "sim" : "não")))].join(", ");
    out.push(`| ${v} | ${pos} (0 = primeira) | ${rol} | ${[...new Set(rs.map((r) => r.base.candidatas_exatas))].join(",")} / ${[...new Set(rs.map((r) => r.base.candidatas_que_contem_o_texto))].join(",")} |`);
}
out.push("");
const fatoP3 = runs.find((r) => r.persona_id === "P3" && r.success && r.observed_facts.some((x) => /Controles de ação/.test(x)));
if (fatoP3) out.push("Controles da coluna Ações da linha (P3, primeira rodada concluída): " + fatoP3.observed_facts.find((x) => /Controles de ação/.test(x)) + "\n");

/* ---------- confirmação ao salvar ---------- */
const toasts = {};
for (const r of runs) { const m = (r.observed_facts.find((x) => /^Confirmação ao salvar/.test(x)) || "").match(/Confirmação ao salvar: ([^.]*\.?)/); const k = m ? m[1].trim() : "(sem registro)"; toasts[k] = (toasts[k] || 0) + 1; }
out.push("Confirmação ao salvar (texto visível, nº de rodadas): " + Object.entries(toasts).map(([k, n]) => `${k} (${n}×)`).join("; ") + ".\n");

/* ---------- falhas ---------- */
out.push("## Falhas e bloqueios registrados\n");
const ruins = runs.filter((r) => r.status !== "concluida");
if (!ruins.length) out.push("Nenhuma.\n");
else {
    out.push("| Rodada | Status | Classe provável | Mensagem | Evidência |");
    out.push("|---|---|---|---|---|");
    for (const r of ruins) { resumo.falhas.push({ run_id: r.run_id, status: r.status, infra: infra(r), erros: r.errors }); out.push(`| ${r.run_id} | ${r.status} | ${infra(r) ? "ambiente de teste (rede/carregamento)" : "sistema ou script (investigar)"} | ${r.errors.slice(0, 2).join(" · ").replace(/\|/g, "/").slice(0, 200)} | ${r.evidence_paths.map((e) => `[captura](../${e.replace(/^prototeste\//, "")})`).join(", ") || "—"} |`); }
    out.push("");
}
const comErroNaoFalha = runs.filter((r) => r.status === "concluida" && r.errors.length);
out.push(`Rodadas concluídas com mensagens de erro/aviso de console registradas: ${comErroNaoFalha.length}.${comErroNaoFalha.length ? " Primeiras: " + comErroNaoFalha.slice(0, 3).map((r) => `${r.run_id} → ${r.errors[0].slice(0, 90)}`).join("; ") : ""}\n`);

/* ---------- restauração ---------- */
const restaur = runs.filter((r) => r.observed_facts.some((x) => /Estado restaurado.*confirmado/.test(x))).length;
out.push(`Estado restaurado e confirmado ao fim da rodada: ${restaur}/${runs.length}.\n`);

fs.writeFileSync(path.join(SAIDA, "tabelas.md"), out.join("\n"));
fs.writeFileSync(path.join(SAIDA, "resumo.json"), JSON.stringify(resumo, null, 2));
console.log(out.join("\n"));
