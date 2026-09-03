import { Fragment, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { Chip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import { moedaCurta, programaPorId } from "@/lib/ppa/regras";
import { acoesDoIpof, fontesDoIpof, linhasFinanceiras, todosIpofs, totalDoIpof, totalDoIpofAno } from "@/lib/ppa/financeiro";
import { ANOS } from "@/lib/ppa/seed";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/central_/analises/ipofs")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? (s["q"] as string) : "" }),
  head: () => ({
    meta: [
      { title: "IPOFs no PPA — Área Central" },
      {
        name: "description",
        content:
          "Onde cada IPOF é refletido no PPA 2028–2031: Ações, fontes, programação por exercício e Entregas financiadas.",
      },
      { property: "og:title", content: "IPOFs no PPA — Área Central" },
      { property: "og:description", content: "Ações, fontes e Entregas financiadas por cada IPOF." },
    ],
  }),
  component: AnaliseIpofs,
});

function AnaliseIpofs() {
  const { q } = Route.useSearch();
  const { state } = usePpa();
  const [busca, setBusca] = useState(q);
  const [abertos, setAbertos] = useState<string[]>([]);

  const linhasFin = useMemo(() => linhasFinanceiras(state), [state]);
  const catalogo = useMemo(() => todosIpofs(), []);

  const filtrados = catalogo.filter(({ ipof, orgao, projeto }) => {
    const t = busca.trim().toLowerCase();
    return (
      !t ||
      `${ipof.codigo} ${ipof.nome} ${fontesDoIpof(ipof).join(" ")} ${acoesDoIpof(ipof)
        .map((a) => `${a.codigo} ${a.nome}`)
        .join(" ")} ${orgao} ${projeto?.codigo ?? ""}`
        .toLowerCase()
        .includes(t)
    );
  });

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">IPOFs</h1>
          <p className="text-xs text-muted-foreground">
            Unidade de programação financeira do SIAFIC. Expanda para ver Ações, programação por exercício e as Entregas
            financiadas.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Código, nome, fonte, órgão ou Projeto"
            className="h-8 w-72 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8" />
              <th className="px-3 py-2 font-medium">IPOF</th>
              <th className="w-52 px-3 py-2 font-medium">Órgão</th>
              <th className="w-44 px-3 py-2 font-medium">Fontes</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Valor SIAFIC</th>
              <th className="w-32 px-3 py-2 text-right font-medium">No PPA</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Fora do PPA</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Entregas</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(({ ipof, projeto, orgao }) => {
              const rel = linhasFin.filter((l) => l.ipof.id === ipof.id);
              const apropriado = rel.reduce((s, l) => s + l.total, 0);
              const oficialTotal = totalDoIpof(ipof);
              const saldo = oficialTotal - apropriado;
              const aberto = abertos.includes(ipof.id);
              const perc = oficialTotal > 0 ? (apropriado / oficialTotal) * 100 : 0;
              return (
                <Fragment key={ipof.id}>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="pl-2">
                      <button
                        onClick={() =>
                          setAbertos((a) => (a.includes(ipof.id) ? a.filter((x) => x !== ipof.id) : [...a, ipof.id]))
                        }
                        aria-label={aberto ? "Recolher IPOF" : "Expandir IPOF"}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", aberto && "rotate-90")} />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{ipof.nome}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {ipof.codigo} · {projeto ? projeto.codigo : "sem Projeto"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">{orgao}</td>
                    <td className="px-3 py-2 text-xs">{fontesDoIpof(ipof).join(", ")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{moedaCurta(oficialTotal)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {apropriado ? moedaCurta(apropriado) : "—"}
                      {perc >= 90 && (
                        <Chip tom="alerta" className="ml-1">
                          {perc.toFixed(0)}%
                        </Chip>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{moedaCurta(saldo)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{new Set(rel.map((l) => l.entregaId)).size}</td>
                  </tr>
                  {aberto && (
                    <tr className="border-b bg-muted/20">
                      <td />
                      <td colSpan={7} className="px-3 py-3">
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                          Ações Orçamentárias deste IPOF
                        </div>
                        <p className="mb-3 text-xs text-muted-foreground">
                          {acoesDoIpof(ipof)
                            .map((a) => `${a.codigo} — ${a.nome}`)
                            .join(" · ")}
                        </p>

                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                          Programação por exercício
                        </div>
                        <table className="mb-3 w-full max-w-2xl border-collapse text-xs">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-1 font-medium">Ano</th>
                              <th className="py-1 text-right font-medium">Valor SIAFIC</th>
                              <th className="py-1 text-right font-medium">No PPA</th>
                              <th className="py-1 text-right font-medium">Fora do PPA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ANOS.map((a) => {
                              const oficial = totalDoIpofAno(ipof, a);
                              const usado = rel.reduce((s, l) => s + (l.anos[a] ?? 0), 0);
                              return (
                                <tr key={a} className="border-t">
                                  <td className="py-1">{a}</td>
                                  <td className="py-1 text-right tabular-nums">{moedaCurta(oficial)}</td>
                                  <td className="py-1 text-right tabular-nums">{usado ? moedaCurta(usado) : "—"}</td>
                                  <td className="py-1 text-right tabular-nums">{moedaCurta(oficial - usado)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                          Entregas financiadas (via Ações)
                        </div>
                        {rel.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhuma Ação deste IPOF está vinculada a Entregas do PPA.
                          </p>
                        ) : (
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-1 font-medium">Entrega</th>
                                <th className="py-1 font-medium">Ação</th>
                                <th className="py-1 font-medium">Iniciativa</th>
                                <th className="py-1 font-medium">Programa</th>
                                <th className="py-1 font-medium">Órgão</th>
                                {ANOS.map((a) => (
                                  <th key={a} className="py-1 text-right font-medium">
                                    {a}
                                  </th>
                                ))}
                                <th className="py-1 text-right font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rel.map((l) => {
                                const pr = programaPorId(state, l.programaId);
                                return (
                                  <tr key={l.id} className="border-t">
                                    <td className="py-1 pr-2">
                                      <Link to="/entrega/$id" params={{ id: l.entregaId }} className="hover:underline">
                                        {l.entrega}
                                      </Link>
                                    </td>
                                    <td className="py-1 pr-2 text-muted-foreground">{l.acao.codigo}</td>
                                    <td className="py-1 pr-2 text-muted-foreground">{l.iniciativa}</td>
                                    <td className="py-1 pr-2 text-muted-foreground">{pr?.codigo}</td>
                                    <td className="py-1 pr-2 text-muted-foreground">{l.orgao}</td>
                                    {ANOS.map((a) => (
                                      <td key={a} className="py-1 text-right tabular-nums">
                                        {l.anos[a] ? moedaCurta(l.anos[a]!) : "—"}
                                      </td>
                                    ))}
                                    <td className="py-1 text-right font-medium tabular-nums">{moedaCurta(l.total)}</td>
                                  </tr>
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
    </AppShell>
  );
}
