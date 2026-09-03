import { Fragment, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MoreVertical, Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { Chip, StatusChip } from "@/components/ppa/ui";
import { PROGRAMAS } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";
import { STATUS_CURTO, entregasDaIniciativa } from "@/lib/ppa/regras";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/central")({
  head: () => ({
    meta: [
      { title: "Área Central — análise das contribuições ao PPA 2028–2031" },
      {
        name: "description",
        content:
          "Visão da Área Central: Programas, órgãos participantes e Iniciativas enviadas para análise, validação ou devolução.",
      },
      { property: "og:title", content: "Área Central — PPA 2028–2031" },
      { property: "og:description", content: "Acompanhe participação dos órgãos e analise Iniciativas." },
    ],
  }),
  component: CentralPage,
});

function CentralPage() {
  const { state } = usePpa();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [abertos, setAbertos] = useState<string[]>(["pg-saude"]);
  const [orgaosAbertos, setOrgaosAbertos] = useState<string[]>([]);
  const [cobertura, setCobertura] = useState<string | null>(null);

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return PROGRAMAS.filter((p) => !q || p.nome.toLowerCase().includes(q) || p.codigo.includes(q))
      .map((p) => {
        const inis = state.iniciativas.filter((i) => i.programaId === p.id);
        const orgaos = [...new Set(inis.map((i) => i.orgao))];
        return {
          programa: p,
          inis,
          orgaos,
          emAnalise: inis.filter((i) => i.status === "em_analise").length,
          devolvidas: inis.filter((i) => i.status === "devolvida").length,
          validadas: inis.filter((i) => i.status === "validada").length,
          enviadas: inis.filter((i) => i.status === "enviada").length,
        };
      })
      .filter((l) => (filtro === "com_analise" ? l.emAnalise + l.enviadas > 0 : filtro === "com_devolucao" ? l.devolvidas > 0 : true));
  }, [state, busca, filtro]);

  const toggle = (id: string) => setAbertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const toggleOrgao = (k: string) =>
    setOrgaosAbertos((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const programaCobertura = PROGRAMAS.find((p) => p.id === cobertura);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Programas do PPA 2028–2031</h1>
          <p className="text-xs text-muted-foreground">
            Participação dos órgãos e situação das Iniciativas encaminhadas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por código ou nome"
              className="h-8 w-64 pl-8 text-xs"
            />
          </div>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="h-8 w-56 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Programas</SelectItem>
              <SelectItem value="com_analise">Com Iniciativas aguardando análise</SelectItem>
              <SelectItem value="com_devolucao">Com Iniciativas devolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8" />
              <th className="w-20 px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Programa</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Órgãos</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Iniciativas</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Em análise</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Devolvidas</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Validadas</th>
              <th className="w-24 px-3 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const aberto = abertos.includes(l.programa.id);
              const porOrgao = l.orgaos.map((o) => ({
                orgao: o,
                inis: l.inis.filter((i) => i.orgao === o),
              }));
              return (
                <Fragment key={l.programa.id}>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="pl-2">
                      <button
                        onClick={() => toggle(l.programa.id)}
                        aria-label={aberto ? "Recolher" : "Expandir"}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", aberto && "rotate-90")} />
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{l.programa.codigo}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{l.programa.nome}</div>
                      <div className="text-xs text-muted-foreground">{l.programa.eixo}</div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.orgaos.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.inis.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.emAnalise + l.enviadas}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.devolvidas}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.validadas}</td>
                    <td className="px-3 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Ações do Programa">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem asChild>
                            <Link to="/programa/$id" params={{ id: l.programa.id }}>
                              Visualizar Programa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setCobertura(l.programa.id)}>
                            Cobertura causal
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => !aberto && toggle(l.programa.id)}>
                            Ver órgãos participantes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  {aberto && (
                    <tr className="border-b bg-muted/20">
                      <td />
                      <td colSpan={8} className="px-3 py-3">
                        {porOrgao.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Nenhum órgão cadastrou Iniciativas neste Programa.
                          </span>
                        ) : (
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                                <th className="w-8" />
                                <th className="py-1 font-medium">Órgão</th>
                                <th className="w-28 py-1 text-right font-medium">Iniciativas</th>
                                <th className="w-28 py-1 text-right font-medium">Entregas</th>
                                <th className="py-1 font-medium">Situação resumida</th>
                              </tr>
                            </thead>
                            <tbody>
                              {porOrgao.map(({ orgao, inis }) => {
                                const k = `${l.programa.id}|${orgao}`;
                                const ab = orgaosAbertos.includes(k);
                                const ents = inis.reduce((s, i) => s + entregasDaIniciativa(state, i.id).length, 0);
                                const resumo = Object.entries(
                                  inis.reduce<Record<string, number>>((acc, i) => {
                                    acc[STATUS_CURTO[i.status]] = (acc[STATUS_CURTO[i.status]] ?? 0) + 1;
                                    return acc;
                                  }, {}),
                                )
                                  .map(([s, n]) => `${n} ${s.toLowerCase()}`)
                                  .join(" · ");
                                return (
                                  <Fragment key={k}>
                                    <tr className="border-t border-border/60">
                                      <td>
                                        <button
                                          onClick={() => toggleOrgao(k)}
                                          aria-label={ab ? "Recolher órgão" : "Expandir órgão"}
                                          className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                                        >
                                          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", ab && "rotate-90")} />
                                        </button>
                                      </td>
                                      <td className="py-2 font-medium">{orgao}</td>
                                      <td className="py-2 text-right tabular-nums">{inis.length}</td>
                                      <td className="py-2 text-right tabular-nums">{ents}</td>
                                      <td className="py-2 text-xs text-muted-foreground">{resumo}</td>
                                    </tr>
                                    {ab && (
                                      <tr>
                                        <td />
                                        <td colSpan={4} className="pb-3">
                                          <table className="w-full border-collapse text-sm">
                                            <thead>
                                              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <th className="py-1 font-medium">Iniciativa</th>
                                                <th className="w-52 py-1 font-medium">Status</th>
                                                <th className="w-24 py-1 text-right font-medium">Entregas</th>
                                                <th className="w-32 py-1 font-medium">Atualização</th>
                                                <th className="w-36 py-1 font-medium">Analista</th>
                                                <th className="w-28 py-1 font-medium">Ações</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {inis.map((i) => (
                                                <tr key={i.id} className="border-t border-border/50">
                                                  <td className="py-2 pr-3">↳ {i.nome}</td>
                                                  <td className="py-2 pr-3">
                                                    <StatusChip status={i.status} />
                                                  </td>
                                                  <td className="py-2 pr-3 text-right tabular-nums">
                                                    {entregasDaIniciativa(state, i.id).length}
                                                  </td>
                                                  <td className="py-2 pr-3 text-xs text-muted-foreground">{i.atualizadoEm}</td>
                                                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                                                    {i.analista ?? "—"}
                                                  </td>
                                                  <td className="py-2">
                                                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                                                      <Link to="/central/iniciativa/$id" params={{ id: i.id }}>
                                                        {i.status === "enviada"
                                                          ? "Analisar"
                                                          : i.status === "em_analise"
                                                            ? "Continuar análise"
                                                            : "Visualizar"}
                                                      </Link>
                                                    </Button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!cobertura} onOpenChange={(v) => !v && setCobertura(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Cobertura causal — {programaCobertura?.codigo} {programaCobertura?.nome}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Causas e subcausas com Iniciativas relacionadas. Não confundir com participação dos órgãos.
          </p>
          <ul className="space-y-2">
            {programaCobertura?.causas.flatMap((c) => [c, ...c.subcausas.map((s) => ({ ...s, sub: true }))]).map((c) => {
              const rel = state.iniciativas.filter(
                (i) => i.programaId === programaCobertura.id && i.causas.includes(c.id),
              );
              const orgaos = [...new Set(rel.map((i) => i.orgao))];
              return (
                <li
                  key={c.id}
                  className={cn("flex items-start justify-between gap-3 border-b pb-2 text-sm", "sub" in c && "ml-5")}
                >
                  <span>{c.texto}</span>
                  {rel.length === 0 ? (
                    <Chip tom="alerta">Nenhuma Iniciativa</Chip>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {orgaos.length} órgão(s) · {rel.length} Iniciativa(s)
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
