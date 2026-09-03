import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment, useState, type ReactNode } from "react";
import {
  Boxes,
  Building2,
  Coins,
  GitBranch,
  Gauge,
  LayoutGrid,
  ListChecks,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  Target,
} from "lucide-react";
import { usePpa } from "@/lib/ppa/store";
import { cn } from "@/lib/utils";
import { BuscaGlobal } from "./busca-global";
import { Atena } from "./atena";

interface ItemMenu {
  to: string;
  rotulo: string;
  icone: typeof Gauge;
  exato?: boolean;
  grupo?: string;
}

const MENU_SETORIAL: ItemMenu[] = [
  { to: "/", rotulo: "Programas", icone: LayoutGrid, exato: true },
  { to: "/iniciativas", rotulo: "Iniciativas", icone: ListChecks },
  { to: "/entregas", rotulo: "Entregas", icone: Boxes },
  { to: "/indicadores", rotulo: "Indicadores", icone: Target },
];

const MENU_CENTRAL: ItemMenu[] = [
  { to: "/central", rotulo: "Visão Geral", icone: Gauge, exato: true },
  { to: "/central/entregas", rotulo: "Entregas", icone: Boxes },
  { to: "/central/orgaos", rotulo: "Órgãos participantes", icone: Building2 },
  { to: "/central/analises/causas", rotulo: "Por Causas", icone: Network, grupo: "Análises" },
  { to: "/central/analises/financeira", rotulo: "Financeira", icone: Coins, grupo: "Análises" },
  { to: "/central/analises/projetos", rotulo: "Projetos", icone: GitBranch, grupo: "Análises" },
  { to: "/central/analises/ipofs", rotulo: "IPOFs", icone: Receipt, grupo: "Análises" },
  { to: "/central/programas", rotulo: "Administração de Programas", icone: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { state, reset } = usePpa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const central = pathname.startsWith("/central");
  const [recolhido, setRecolhido] = useState(false);
  const menu = central ? MENU_CENTRAL : MENU_SETORIAL;

  return (
    <div className="min-h-screen bg-background text-[13px]">
      <header className="sticky top-0 z-30 border-b bg-card no-print">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">PPA 2028–2031</span>
            <span className="text-xs text-muted-foreground">Estado de Goiás</span>
          </Link>

          <div className="flex items-center rounded-md border p-0.5">
            <Link
              to="/"
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                central ? "text-muted-foreground hover:bg-accent" : "bg-primary text-primary-foreground",
              )}
            >
              Visão Setorial
            </Link>
            <Link
              to="/central"
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                central ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              Visão Área Central
            </Link>
          </div>

          <BuscaGlobal />

          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {central ? (
                <>
                  <span className="text-foreground">{state.analista}</span> · Área Central
                </>
              ) : (
                <>
                  <span className="text-foreground">{state.usuario}</span> · {state.orgaoAtual}
                </>
              )}
            </span>
            <button
              onClick={() => {
                if (confirm("Reiniciar o protótipo com os dados de demonstração?")) reset();
              }}
              className="underline-offset-2 hover:underline"
            >
              Reiniciar protótipo
            </button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside
          className={cn(
            "no-print sticky top-[49px] h-[calc(100vh-49px)] shrink-0 border-r bg-card transition-all",
            recolhido ? "w-[52px]" : "w-56",
          )}
        >
          <nav className="flex flex-col gap-0.5 p-2">
            {menu.map((m, idx) => {
              const ativo = m.exato ? pathname === m.to : pathname.startsWith(m.to);
              const Icone = m.icone;
              const abreGrupo = !!m.grupo && menu[idx - 1]?.grupo !== m.grupo;
              return (
                <Fragment key={m.to}>
                  {abreGrupo && !recolhido && (
                    <div className="mt-3 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {m.grupo}
                    </div>
                  )}
                  {abreGrupo && recolhido && <div className="my-2 border-t" />}
                <Link
                  to={m.to as never}
                  title={m.rotulo}
                  className={cn(
                    "flex items-center gap-2.5 rounded px-2 py-1.5 text-xs transition-colors",
                    ativo ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60",
                  )}
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  {!recolhido && <span className="truncate">{m.rotulo}</span>}
                </Link>
                </Fragment>
              );
            })}
          </nav>
          <button
            onClick={() => setRecolhido((v) => !v)}
            className="mt-1 flex w-full items-center gap-2.5 px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label={recolhido ? "Expandir menu" : "Recolher menu"}
          >
            {recolhido ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!recolhido && <span>Recolher menu</span>}
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
      <Atena />
    </div>
  );
}
