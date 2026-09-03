import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ANOS } from "@/lib/ppa/seed";
import { moeda, moedaCurta } from "@/lib/ppa/regras";
import { DIMENSAO_LABEL, quadro, type Dimensao, type LinhaFinanceira } from "@/lib/ppa/financeiro";
import { cn } from "@/lib/utils";

interface Props {
  linhas: LinhaFinanceira[];
  dimensao?: Dimensao;
  /** Dimensão usada ao expandir cada linha. */
  detalhe?: Dimensao;
  curto?: boolean;
  vazio?: string;
}

/** Quadro plurianual calculado a partir das apropriações — nunca digitado pelo usuário. */
export function QuadroFinanceiro({
  linhas,
  dimensao = "fonte",
  detalhe = "ipof",
  curto = true,
  vazio = "Nenhum recurso apropriado.",
}: Props) {
  const [abertas, setAbertas] = useState<string[]>([]);
  const q = quadro(linhas, dimensao);
  const fmt = curto ? moedaCurta : moeda;

  if (q.linhas.length === 0) return <p className="text-xs text-muted-foreground">{vazio}</p>;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-1.5 font-medium">{DIMENSAO_LABEL[dimensao]}</th>
            {ANOS.map((a) => (
              <th key={a} className="w-28 px-3 py-1.5 text-right font-medium">
                {a}
              </th>
            ))}
            <th className="w-32 px-3 py-1.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {q.linhas.map((l) => {
            const aberta = abertas.includes(l.chave);
            const sub = quadro(l.linhas, detalhe);
            return (
              <Fragment key={l.chave}>
                <tr className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setAbertas((a) => (a.includes(l.chave) ? a.filter((x) => x !== l.chave) : [...a, l.chave]))}
                      className="flex items-center gap-1.5 text-left hover:underline"
                      aria-label={aberta ? "Recolher" : "Expandir"}
                    >
                      <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", aberta && "rotate-90")} />
                      {l.chave}
                    </button>
                  </td>
                  {ANOS.map((a) => (
                    <td key={a} className="px-3 py-2 text-right tabular-nums">
                      {l.anos[a] ? fmt(l.anos[a]!) : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{fmt(l.total)}</td>
                </tr>
                {aberta &&
                  sub.linhas.map((s) => (
                    <tr key={`${l.chave}-${s.chave}`} className="border-b bg-muted/20 text-xs last:border-0">
                      <td className="py-1.5 pl-10 pr-3 text-muted-foreground">{s.chave}</td>
                      {ANOS.map((a) => (
                        <td key={a} className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                          {s.anos[a] ? fmt(s.anos[a]!) : "—"}
                        </td>
                      ))}
                      <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{fmt(s.total)}</td>
                    </tr>
                  ))}
              </Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/40 text-xs font-medium">
            <td className="px-3 py-2">Total</td>
            {ANOS.map((a) => (
              <td key={a} className="px-3 py-2 text-right tabular-nums">
                {q.totais[a] ? fmt(q.totais[a]!) : "—"}
              </td>
            ))}
            <td className="px-3 py-2 text-right tabular-nums">{fmt(q.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
