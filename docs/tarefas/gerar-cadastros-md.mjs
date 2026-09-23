/**
 * Despeja o conteúdo dos Cadastros Estratégicos em markdown.
 *
 * Lê o estado do próprio protótipo, para o documento não divergir da tela.
 */
import fs from "node:fs";

const mem = {};
global.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => (mem[k] = v), removeItem: (k) => delete mem[k] };

const st = await import("./assets/js/dados/store.js");
st.reiniciar();
const e = st.obterEstado();

const ppa = e.ppas.find((p) => p.situacao === "elaboracao");
const doPlano = (r) => !r.ppaId || r.ppaId === ppa.id;

// Todo cruzamento é dentro do plano: os dois PPAs têm registros de mesmo nome, e
// varrer a base inteira faria cada um aparecer duas vezes.
const causas = e.causas.filter(doPlano);
const problemas = e.problemas.filter(doPlano);
const diagnosticos = e.diagnosticos.filter(doPlano);
const subcausas = e.subcausas.filter(doPlano);

const linhas = [];
const L = (s = "") => linhas.push(s);
const lista = (itens, vazio = "—") =>
    itens.length ? itens.map((i) => `- ${i}`).join("\n") : `_${vazio}_`;

const situacoes = {
    elaboracao: "Em elaboração",
    submetido: "Submetido para aprovação",
    aprovado: "Aprovado",
    reprovado: "Reprovado",
    vigente: "Vigente",
    encerrado: "Encerrado",
};

/* ---------- cabeçalho ---------- */

L("# Cadastros Estratégicos — conteúdo do protótipo");
L();
L(`Extraído do estado do SIPLAM em ${new Date().toLocaleDateString("pt-BR")}.`);
L();
L("Os dados são de **demonstração**: números plausíveis, na ordem de grandeza certa, para que as");
L("telas possam ser lidas e discutidas. Nada aqui é dado oficial do Estado de Goiás.");
L();
L("Cada registro traz, além dos próprios campos, **com que ele se relaciona** — é o vínculo que");
L("dá sentido ao cadastro, e é onde erro de modelagem aparece.");
L();
L("---");
L();

/* ---------- PPA ---------- */

L("## PPA");
L();
for (const p of [...e.ppas].sort((a, b) => Number(a.primeiroAno) - Number(b.primeiroAno))) {
    L(`### ${p.nome}`);
    L();
    L(`**Vigência:** ${p.primeiroAno}–${p.ultimoAno}`);
    L();
    L(`**Situação:** ${situacoes[p.situacao] ?? p.situacao}`);
    L();
    L(`**Processo SEI:** ${p.processoSei || "—"}`);
    L();
    L(`**Descrição:** ${p.descricao || "—"}`);
    L();
    const prog = e.programas.filter((x) => x.ppaId === p.id).length;
    const ini = e.iniciativas.filter((i) => e.programas.some((x) => x.id === i.programaId && x.ppaId === p.id)).length;
    L(`**Conteúdo:** ${prog} Programas · ${ini} Iniciativas`);
    L();
}
L("---");
L();

/* ---------- Eixos ---------- */

L("## Eixos");
L();
for (const eixo of e.eixos.filter(doPlano).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))) {
    const objetivos = e.objetivos.filter((o) => o.eixoId === eixo.id);
    L(`### ${eixo.nome}`);
    L();
    L(`**Descrição:** ${eixo.descricao || "—"}`);
    L();
    L("**Objetivos estratégicos**");
    L();
    L(lista(objetivos.map((o) => o.nome), "Nenhum objetivo vinculado."));
    L();
}
L("---");
L();

/* ---------- Objetivos ---------- */

L("## Objetivos Estratégicos");
L();
for (const o of e.objetivos.filter(doPlano).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))) {
    const eixo = e.eixos.find((x) => x.id === o.eixoId);
    const programas = e.programas.filter((p) => p.ppaId === ppa.id && p.objetivoEstrategico === o.nome);
    L(`### ${o.nome}`);
    L();
    L(`**Eixo:** ${eixo?.nome ?? "—"}`);
    L();
    L(`**Descrição:** ${o.descricao || "—"}`);
    L();
    L("**Programas**");
    L();
    L(lista(programas.map((p) => `${p.codigo} — ${p.nome}`), "Nenhum Programa vinculado."));
    L();
}
L("---");
L();

/* ---------- Programas ---------- */

L("## Programas");
L();
for (const p of e.programas.filter((x) => x.ppaId === ppa.id).sort((a, b) => a.codigo.localeCompare(b.codigo))) {
    const inis = e.iniciativas.filter((i) => i.programaId === p.id);
    L(`### ${p.codigo} — ${p.nome}`);
    L();
    L(`**Eixo:** ${p.eixo}`);
    L();
    L(`**Objetivo estratégico:** ${p.objetivoEstrategico}`);
    L();
    L(`**Órgão coordenador:** ${p.orgaoCoordenador ?? "—"}`);
    L();
    L(`**Problema central:** ${p.problema || "—"}`);
    L();
    L(`**População afetada:** ${p.populacaoAfetada || "—"}`);
    L();
    L(`**Objetivo do Programa:** ${p.objetivo || "—"}`);
    L();
    L(`**Resultado esperado:** ${p.resultadoEsperado || "—"}`);
    L();
    L("**Evidências**");
    L();
    L(lista(p.evidencias ?? []));
    L();
    L("**Causas**");
    L();
    L(lista((p.causas ?? []).map((c) => c.texto)));
    L();
    L("**Consequências**");
    L();
    L(lista(p.consequencias ?? []));
    L();
    L("**Indicadores de resultado**");
    L();
    L(
        lista(
            (p.indicadores ?? []).map(
                (i) => `${i.nome} — ${i.unidade ?? "—"} · linha de base ${i.linhaBase ?? "—"} · meta ${i.meta ?? "—"}`
            )
        )
    );
    L();
    L("**Iniciativas**");
    L();
    L(lista(inis.map((i) => `${i.nome} — ${i.orgao}`), "Nenhuma contribuição recebida."));
    L();
}
L("---");
L();

/* ---------- Causas ---------- */

L("## Causas");
L();
for (const c of causas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))) {
    const subs = (c.subcausaIds ?? []).map((id) => subcausas.find((s) => s.id === id)).filter(Boolean);
    const explicados = problemas.filter((p) => (p.causaIds ?? []).includes(c.id));
    L(`### ${c.nome}`);
    L();
    L(`**Justificativa:** ${c.justificativa || "—"}`);
    L();
    L(`**Evidência:** ${c.evidencia || "—"}`);
    L();
    L("**Subcausas**");
    L();
    L(lista(subs.map((s) => s.nome), "Nenhuma subcausa vinculada."));
    L();
    L("**Problemas que ela explica**");
    L();
    L(lista(explicados.map((p) => p.nome), "Nenhum problema vinculado."));
    L();
}
L("---");
L();

/* ---------- Subcausas ---------- */

L("## Subcausas");
L();
for (const s of subcausas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))) {
    const detalhadas = causas.filter((c) => (c.subcausaIds ?? []).includes(s.id));
    L(`### ${s.nome}`);
    L();
    L(`**Justificativa:** ${s.justificativa || "—"}`);
    L();
    L(`**Evidência:** ${s.evidencia || "—"}`);
    L();
    L(`**Causas que ela detalha** (${detalhadas.length})`);
    L();
    L(lista(detalhadas.map((c) => c.nome), "Nenhuma causa a utiliza."));
    L();
}
L("---");
L();

/* ---------- Problemas ---------- */

L("## Problemas");
L();
for (const p of problemas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))) {
    const suasCausas = (p.causaIds ?? []).map((id) => causas.find((c) => c.id === id)).filter(Boolean);
    const seusDiagnosticos = diagnosticos.filter((d) => (d.problemaIds ?? []).includes(p.id));
    L(`### ${p.nome}`);
    L();
    L(`**Descrição:** ${p.descricao || "—"}`);
    L();
    L("**Causas**");
    L();
    L(lista(suasCausas.map((c) => c.nome), "Nenhuma causa vinculada."));
    L();
    L("**Diagnósticos que o caracterizam**");
    L();
    L(lista(seusDiagnosticos.map((d) => d.nome), "Nenhum diagnóstico vinculado."));
    L();
}
L("---");
L();

/* ---------- Indicadores ---------- */

L("## Indicadores");
L();
for (const i of e.indicadores.filter(doPlano)) {
    L(`### ${i.nome}`);
    L();
    L(`**Descrição:** ${i.descricao || "—"}`);
    L();
    L(`**Fórmula:** ${i.formula || "—"}`);
    L();
    L(`**Polaridade:** ${i.polaridade || "—"}`);
    L();
    L(`**Periodicidade de monitoramento:** ${i.periodicidade || "—"}`);
    L();
    L(`**Unidade de medida:** ${i.unidade || "—"}`);
    L();
    L(`**Fonte:** ${i.fonte || "—"}${i.site ? ` · ${i.site}` : ""}`);
    L();
    L(`**Abrangência:** ${i.abrangencia || "—"}`);
    L();
    L(`**Linha de base:** ${i.linhaBase || "—"}${i.dataLinhaBase ? ` em ${i.dataLinhaBase.split("-").reverse().join("/")}` : ""}`);
    L();
    L("**Órgãos responsáveis**");
    L();
    L(lista(i.orgaos ?? []));
    L();
    L(`**Situação:** ${i.situacao || "—"}`);
    L();
}

fs.writeFileSync("docs/cadastros-estrategicos.md", linhas.join("\n") + "\n", "utf8");
console.log("escrito: docs/cadastros-estrategicos.md");
console.log(
    `ppas ${e.ppas.length} · eixos ${e.eixos.filter(doPlano).length} · objetivos ${e.objetivos.filter(doPlano).length} · programas ${e.programas.filter((x) => x.ppaId === ppa.id).length} · causas ${causas.length} · subcausas ${subcausas.length} · problemas ${problemas.length} · indicadores ${e.indicadores.filter(doPlano).length}`
);
