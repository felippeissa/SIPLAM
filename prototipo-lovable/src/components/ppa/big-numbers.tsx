import type { ReactNode } from "react";

export function BigNumbers({ itens, rodape }: { itens: { valor: ReactNode; rotulo: string }[]; rodape?: ReactNode }) {
  return (
    <div className="mb-4 rounded-md border bg-card">
      <div className="flex flex-wrap divide-x divide-border">
        {itens.map((i) => (
          <div key={i.rotulo} className="min-w-[132px] flex-1 px-4 py-2.5">
            <div className="text-xl font-semibold tabular-nums leading-tight">{i.valor}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{i.rotulo}</div>
          </div>
        ))}
      </div>
      {rodape && <div className="border-t px-4 py-1.5 text-[11px] text-muted-foreground">{rodape}</div>}
    </div>
  );
}
