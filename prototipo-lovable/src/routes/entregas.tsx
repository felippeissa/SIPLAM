import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { Chip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import {
  COMPORTAMENTOS,
  TERRITORIO_LABEL,
  recursosDaEntrega,
  eixos,
  executadoDaEntrega,
  moeda,
  objetivos,
  pct,
  programaPorId,
  resumoPendencias,
  pendenciasEntrega,
} from "@/lib/ppa/regras";
import { ANOS } from "@/lib/ppa/seed";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/entregas")({
  head: () => ({
    meta: [
      { title: "Entregas do órgão — PPA 2028–2031" },
      { name: "description", content: "Todas as Entregas cadastradas pelo órgão no PPA 2028–2031, com metas anuais, vinculação orçamentária e execução financeira." },
      { property: "og:title", content: "Entregas do órgão — PPA 2028–2031" },
      { property: "og:description", content: "Lista direta de Entregas com metas anuais e vínculos financeiros." },
    ],
  }),
  component: ListaEntregas,
});

function ListaEntregas() {
  const { state } = usePpa();
  const [busca, setBusca] = useState("");
  const [eixo, setEixo] = useState("todos");
  const [objetivo, setObjetivo] = useState("todos");

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return state.entregas
      .map((e) => {
        const i = state.iniciativas.find((x) => x.id === e.iniciativaId);
        const p = i ? programaPorId(state, i.programaId) : undefined;
        return { e, i, p };
      })
      .filter(({ e, i, p }) => {
        if (!i || i.orgao !== state.orgaoAtual) return false;
        if (q && !e.nome.toLowerCase().includes(q) && !i.nome.toLowerCase().includes(q)) return false;
        if (eixo !== "todos" && p?.eixo !== eixo) return false;
        if (objetivo !== "todos" && p?.objetivoEstrategico !== objetivo) return false;
        return true;
      });
  }, [state, busca, eixo, objetivo]);

  const previsto = linhas.reduce((s, { e }) => s + recursosDaEntrega(state, e.id), 0);
  const executado = linhas.reduce((s, { e }) => s + executadoDaEntrega(e.id), 0);
  const territorializadas = linhas.filter(({ e }) => e.territorio.tipo !== null).length;

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight">Entregas</h1>
        <p className="text-xs text-muted-foreground">Todas as Entregas de {state.orgaoAtual}, com acesso direto ao detalhe.</p>
      </div>

      <BigNumbers
        itens={[
          { valor: linhas.length, rotulo: "Entregas" },
          { valor: territorializadas, rotulo: "Com território definido" },
          { valor: moeda(previsto), rotulo: "Previsto no PPA" },
          { valor: moeda(executado), rotulo: "Executado (SIAFIC)" },
          { valor: pct(previsto > 0 ? (executado / previsto) * 100 : null), rotulo: "% execução financeira" },
        ]}
        rodape="Valores derivados das Ações Orçamentárias vinculadas a cada Entrega; execução financeira do SIAFIC, sem leitura de desempenho físico."
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar Entrega" className="h-8 w-64 pl-8 text-xs" />
        </div>
        <Select value={eixo} onValueChange={(v) => { setEixo(v); setObjetivo("todos"); }}>
          <SelectTrigger className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Eixos</SelectItem>
            {eixos(state.programas).map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={objetivo} onValueChange={setObjetivo}>
          <SelectTrigger className="h-8 w-72 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Objetivos Estratégicos</SelectItem>
            {objetivos(state.programas, eixo).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Entrega</th>
              <th className="w-56 px-3 py-2 font-medium">Iniciativa</th>
              <th className="w-28 px-3 py-2 font-medium">Unidade</th>
              {ANOS.map((a) => <th key={a} className="w-20 px-2 py-2 text-right font-medium">{a}</th>)}
              <th className="w-28 px-3 py-2 font-medium">Território</th>
              <th className="w-36 px-3 py-2 text-right font-medium">Previsto</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ e, i, p }) => {
              const r = resumoPendencias(pendenciasEntrega(state, e));
              const comp = COMPORTAMENTOS.find((c) => c.id === e.comportamento);
              return (
                <tr key={e.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link to="/entrega/$id" params={{ id: e.id }} className="font-medium hover:underline">{e.nome}</Link>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{p?.codigo} · {comp ? comp.nome : "comportamento não definido"}</span>
                      {r.impeditivos > 0 && <Chip tom="impeditivo">{r.impeditivos} pendência{r.impeditivos > 1 ? "s" : ""}</Chip>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{i?.nome}</td>
                  <td className="px-3 py-2 text-xs">{e.unidadeMedida || "—"}</td>
                  {ANOS.map((a) => (
                    <td key={a} className="px-2 py-2 text-right tabular-nums">
                      {e.metas[a] === null || e.metas[a] === undefined ? <span className="text-muted-foreground">—</span> : e.metas[a]}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-xs">{e.territorio.tipo ? TERRITORIO_LABEL[e.territorio.tipo] : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{moeda(recursosDaEntrega(state, e.id))}</td>
                </tr>
              );
            })}
            {linhas.length === 0 && (
              <tr><td colSpan={6 + ANOS.length} className="px-3 py-8 text-center text-xs text-muted-foreground">Nenhuma Entrega encontrada para os filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
