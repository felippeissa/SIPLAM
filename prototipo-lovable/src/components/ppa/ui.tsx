import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_CURTO } from "@/lib/ppa/regras";
import type { StatusIniciativa } from "@/lib/ppa/types";

const TOM: Record<string, string> = {
  ok: "bg-ok-soft text-ok",
  alerta: "bg-warn-soft text-warn",
  impeditivo: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutro: "bg-neutral-soft text-muted-foreground",
};

export function Chip({ tom = "neutro", children, className }: { tom?: keyof typeof TOM; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        TOM[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TOM: Record<StatusIniciativa, keyof typeof TOM> = {
  em_preenchimento: "neutro",
  enviada: "info",
  em_analise: "info",
  devolvida: "alerta",
  validada: "ok",
};

export function StatusChip({ status }: { status: StatusIniciativa }) {
  return <Chip tom={STATUS_TOM[status]}>{STATUS_CURTO[status]}</Chip>;
}

export function Secao({ titulo, acao, children }: { titulo: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-md border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h2>
        {acao}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{rotulo}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
