import { Link } from "@tanstack/react-router";

export interface Elo {
  rotulo: string;
  to?: string;
  params?: Record<string, string>;
}

export function Contexto({ elos }: { elos: Elo[] }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {elos.map((e, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/60">›</span>}
          {e.to ? (
            <Link to={e.to} params={e.params as never} className="hover:underline">
              {e.rotulo}
            </Link>
          ) : (
            <span className="text-foreground">{e.rotulo}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
