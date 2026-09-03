import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ppa/shell";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { QuadroFinanceiro } from "@/components/ppa/financeiro";
import { usePpa } from "@/lib/ppa/store";
import { eixos, moedaCurta, objetivos, programaPorId } from "@/lib/ppa/regras";
import { linhasFinanceiras, type Dimensao } from "@/lib/ppa/financeiro";
import { ANOS } from "@/lib/ppa/seed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/central_/analises/financeira")({
  head: () => ({
    meta: [
      { title: "Análise Financeira do PPA — Área Central" },
      {
        name: "description",
        content:
          "Previsão financeira plurianual do PPA 2028–2031 por fonte, órgão, Programa, Iniciativa ou Entrega, derivada das Ações Orçamentárias.",
      },
      { property: "og:title", content: "Análise Financeira — PPA 2028–2031" },
      { property: "og:description", content: "Mesmos dados, agregados por diferentes dimensões." },
    ],
  }),
  component: AnaliseFinanceira,
});

const DIMENSOES: { id: Dimensao; nome: string; detalhe: Dimensao }[] = [
  { id: "fonte", nome: "Por Fonte de recursos", detalhe: "orgao" },
  { id: "orgao", nome: "Por Órgão", detalhe: "fonte" },
  { id: "programa", nome: "Por Programa", detalhe: "orgao" },
  { id: "iniciativa", nome: "Por Iniciativa", detalhe: "entrega" },
  { id: "entrega", nome: "Por Entrega", detalhe: "ipof" },
];

function AnaliseFinanceira() {
  const { state } = usePpa();
  const [dimensao, setDimensao] = useState<Dimensao>("fonte");
  const [ano, setAno] = useState("todos");
  const [eixo, setEixo] = useState("todos");
  const [objetivo, setObjetivo] = useState("todos");
  const [programa, setPrograma] = useState("todos");
  const [orgao, setOrgao] = useState("todos");
  const [fonte, setFonte] = useState("todas");

  const todas = useMemo(() => linhasFinanceiras(state), [state]);
  const fontes = useMemo(() => [...new Set(todas.map((l) => l.fonte))].sort(), [todas]);
  const orgaos = useMemo(() => [...new Set(todas.map((l) => l.orgao))].sort(), [todas]);

  const linhas = useMemo(
    () =>
      todas
        .filter((l) => {
          const p = programaPorId(state, l.programaId);
          if (eixo !== "todos" && p?.eixo !== eixo) return false;
          if (objetivo !== "todos" && p?.objetivoEstrategico !== objetivo) return false;
          if (programa !== "todos" && l.programaId !== programa) return false;
          if (orgao !== "todos" && l.orgao !== orgao) return false;
          if (fonte !== "todas" && l.fonte !== fonte) return false;
          return true;
        })
        .map((l) =>
          ano === "todos"
            ? l
            : {
                ...l,
                anos: Object.fromEntries(ANOS.map((a) => [a, a === ano ? (l.anos[a] ?? 0) : 0])),
                total: l.anos[ano] ?? 0,
              },
        )
        .filter((l) => l.total > 0),
    [todas, state, eixo, objetivo, programa, orgao, fonte, ano],
  );

  const total = linhas.reduce((s, l) => s + l.total, 0);
  const cfg = DIMENSOES.find((d) => d.id === dimensao)!;

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight">Análise Financeira</h1>
        <p className="text-xs text-muted-foreground">
          Previsão do PPA derivada das Ações Orçamentárias vinculadas às Entregas. Nunca soma o valor global de Projetos GOMAP.
        </p>
      </div>

      <BigNumbers
        itens={[
          { valor: moedaCurta(total), rotulo: "Previsto no recorte" },
          { valor: new Set(linhas.map((l) => l.fonte)).size, rotulo: "Fontes de recursos" },
          { valor: new Set(linhas.map((l) => l.orgao)).size, rotulo: "Órgãos" },
          { valor: new Set(linhas.map((l) => l.ipof.id)).size, rotulo: "IPOFs identificados" },
          { valor: new Set(linhas.map((l) => l.entregaId)).size, rotulo: "Entregas com recursos" },
        ]}
        rodape="A mudança de dimensão apenas reagrega os mesmos dados; não há base separada por visão."
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select value={dimensao} onValueChange={(v) => setDimensao(v as Dimensao)}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIMENSOES.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">2028–2031</SelectItem>
            {ANOS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={eixo}
          onValueChange={(v) => {
            setEixo(v);
            setObjetivo("todos");
          }}
        >
          <SelectTrigger className="h-8 w-52 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Eixos</SelectItem>
            {eixos(state.programas).map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={objetivo} onValueChange={setObjetivo}>
          <SelectTrigger className="h-8 w-64 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Objetivos Estratégicos</SelectItem>
            {objetivos(state.programas, eixo).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={programa} onValueChange={setPrograma}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Programas</SelectItem>
            {state.programas.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.codigo} — {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={orgao} onValueChange={setOrgao}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os órgãos</SelectItem>
            {orgaos.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fonte} onValueChange={setFonte}>
          <SelectTrigger className="h-8 w-52 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as fontes</SelectItem>
            {fontes.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QuadroFinanceiro
        linhas={linhas}
        dimensao={dimensao}
        detalhe={cfg.detalhe}
        vazio="Nenhum recurso vinculado no recorte selecionado."
      />
    </AppShell>
  );
}
