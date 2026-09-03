import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { Chip, StatusChip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import {
  eixos,
  entregasDaIniciativa,
  financeiroIniciativa,
  objetivos,
  pct,
  pendenciasIniciativa,
  moeda,
  programaPorId,
  resumoPendencias,
} from "@/lib/ppa/regras";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/iniciativas")({
  head: () => ({
    meta: [
      { title: "Iniciativas do órgão — PPA 2028–2031" },
      { name: "description", content: "Lista completa das Iniciativas do órgão no PPA 2028–2031, com status, entregas e execução financeira." },
      { property: "og:title", content: "Iniciativas do órgão — PPA 2028–2031" },
      { property: "og:description", content: "Consulte todas as Iniciativas do órgão sem passar pela tabela de Programas." },
    ],
  }),
  component: ListaIniciativas,
});

function ListaIniciativas() {
  const { state } = usePpa();
  const [busca, setBusca] = useState("");
  const [eixo, setEixo] = useState("todos");
  const [objetivo, setObjetivo] = useState("todos");
  const [status, setStatus] = useState("todos");

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return state.iniciativas
      .filter((i) => i.orgao === state.orgaoAtual)
      .map((i) => ({ i, p: programaPorId(state, i.programaId) }))
      .filter(({ i, p }) => {
        if (q && !i.nome.toLowerCase().includes(q) && !(p?.nome ?? "").toLowerCase().includes(q)) return false;
        if (eixo !== "todos" && p?.eixo !== eixo) return false;
        if (objetivo !== "todos" && p?.objetivoEstrategico !== objetivo) return false;
        if (status !== "todos" && i.status !== status) return false;
        return true;
      });
  }, [state, busca, eixo, objetivo, status]);

  const totalEntregas = linhas.reduce((s, { i }) => s + entregasDaIniciativa(state, i.id).length, 0);
  const previsto = linhas.reduce((s, { i }) => s + financeiroIniciativa(state, i.id).previsto, 0);
  const executado = linhas.reduce((s, { i }) => s + financeiroIniciativa(state, i.id).executado, 0);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight">Iniciativas</h1>
        <p className="text-xs text-muted-foreground">Todas as Iniciativas de {state.orgaoAtual}, sem navegar pela tabela de Programas.</p>
      </div>

      <BigNumbers
        itens={[
          { valor: linhas.length, rotulo: "Iniciativas" },
          { valor: totalEntregas, rotulo: "Entregas" },
          { valor: moeda(previsto), rotulo: "Previsto no PPA" },
          { valor: moeda(executado), rotulo: "Executado (SIAFIC)" },
          { valor: pct(previsto > 0 ? (executado / previsto) * 100 : null), rotulo: "% execução financeira" },
        ]}
        rodape="A execução exibida é exclusivamente financeira (SIAFIC) e não representa desempenho físico das Entregas."
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar Iniciativa" className="h-8 w-64 pl-8 text-xs" />
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-48 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="em_preenchimento">Em preenchimento</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="em_analise">Em análise</SelectItem>
            <SelectItem value="devolvida">Devolvida</SelectItem>
            <SelectItem value="validada">Validada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Iniciativa</th>
              <th className="w-64 px-3 py-2 font-medium">Programa</th>
              <th className="w-52 px-3 py-2 font-medium">Status</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Entregas</th>
              <th className="w-36 px-3 py-2 text-right font-medium">Previsto</th>
              <th className="w-32 px-3 py-2 text-right font-medium">% exec.</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ i, p }) => {
              const r = resumoPendencias(pendenciasIniciativa(state, i));
              const f = financeiroIniciativa(state, i.id);
              return (
                <tr key={i.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link to="/iniciativa/$id" params={{ id: i.id }} className="font-medium hover:underline">{i.nome}</Link>
                    <div className="text-xs text-muted-foreground">{i.unidadeResponsavel ?? "Unidade responsável não informada"}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{p?.codigo} — {p?.nome}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusChip status={i.status} />
                      {r.impeditivos > 0 && i.status === "em_preenchimento" && <Chip tom="impeditivo">{r.impeditivos} pendência{r.impeditivos > 1 ? "s" : ""}</Chip>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{entregasDaIniciativa(state, i.id).length}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{moeda(f.previsto)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{pct(f.percentual)}</td>
                </tr>
              );
            })}
            {linhas.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-muted-foreground">Nenhuma Iniciativa encontrada para os filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
