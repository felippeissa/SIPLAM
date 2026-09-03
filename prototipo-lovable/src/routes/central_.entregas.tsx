import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { StatusChip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import { TERRITORIO_LABEL, moedaCurta, programaPorId, projetosDaEntrega } from "@/lib/ppa/regras";
import { linhasDaEntrega } from "@/lib/ppa/financeiro";
import { ANOS } from "@/lib/ppa/seed";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/central_/entregas")({
  head: () => ({
    meta: [
      { title: "Entregas do PPA — Área Central" },
      {
        name: "description",
        content:
          "Consulta direta a todas as Entregas do PPA 2028–2031: órgão, Iniciativa, Programa, metas, previsão e Projetos GOMAP.",
      },
      { property: "og:title", content: "Entregas do PPA — Área Central" },
      { property: "og:description", content: "Localize qualquer Entrega sem percorrer a hierarquia." },
    ],
  }),
  component: CentralEntregas,
});

function CentralEntregas() {
  const { state } = usePpa();
  const [busca, setBusca] = useState("");

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return state.entregas
      .map((e) => {
        const i = state.iniciativas.find((x) => x.id === e.iniciativaId);
        const p = i ? programaPorId(state, i.programaId) : undefined;
        const fin = linhasDaEntrega(state, e.id);
        const projetos = projetosDaEntrega(state, e.id);
        return { e, i, p, previsto: fin.reduce((s, l) => s + l.total, 0), fin, projetos };
      })
      .filter(({ e, i, p, fin, projetos }) => {
        if (!i) return false;
        if (!q) return true;
        const alvo = [
          e.nome,
          e.id,
          i.nome,
          i.orgao,
          p?.nome,
          p?.codigo,
          e.territorio.regioes.join(" "),
          projetos.map((x) => `${x.codigo} ${x.nome}`).join(" "),
          fin.map((l) => `${l.ipof.codigo} ${l.ipof.nome} ${l.fonte}`).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return alvo.includes(q);
      });
  }, [state, busca]);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Entregas do PPA</h1>
          <p className="text-xs text-muted-foreground">
            Todas as Entregas cadastradas pelos órgãos. A hierarquia é contexto, não caminho obrigatório.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Entrega, órgão, Programa, Iniciativa, região, Projeto ou IPOF"
            className="h-8 w-96 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Entrega</th>
              <th className="w-48 px-3 py-2 font-medium">Órgão</th>
              <th className="w-56 px-3 py-2 font-medium">Iniciativa</th>
              <th className="w-52 px-3 py-2 font-medium">Programa</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Meta total</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Previsto</th>
              <th className="w-44 px-3 py-2 font-medium">Situação da Iniciativa</th>
              <th className="w-24 px-3 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ e, i, p, previsto }) => {
              const metaTotal = ANOS.reduce((s, a) => s + (e.metas[a] ?? 0), 0);
              return (
                <tr key={e.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link to="/entrega/$id" params={{ id: e.id }} className="font-medium hover:underline">
                      {e.nome || "Entrega sem nome"}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">
                      {p?.codigo} › {i!.orgao} › {i!.nome}
                      {e.territorio.tipo ? ` · ${TERRITORIO_LABEL[e.territorio.tipo]}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">{i!.orgao}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{i!.nome}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{p?.nome}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{metaTotal || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{previsto ? moedaCurta(previsto) : "—"}</td>
                  <td className="px-3 py-2">
                    <StatusChip status={i!.status} />
                  </td>
                  <td className="px-3 py-2">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <Link to="/entrega/$id" params={{ id: e.id }}>
                        Abrir
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  Nenhuma Entrega encontrada para a busca informada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
