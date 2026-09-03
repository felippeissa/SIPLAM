import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { usePpa } from "@/lib/ppa/store";
import { buscaGlobal } from "@/lib/ppa/regras";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function BuscaGlobal() {
  const { state } = usePpa();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const central = pathname.startsWith("/central");
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAberto((v) => !v);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const resultados = useMemo(
    () => buscaGlobal(state, termo, central ? undefined : state.orgaoAtual),
    [state, termo, central],
  );

  const grupos = ["Programa", "Iniciativa", "Entrega", "Indicador", "Projeto GOMAP", "Ação Orçamentária", "IPOF"] as const;

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex h-8 w-72 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground hover:bg-accent/50"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar no PPA...</span>
        <kbd className="ml-auto rounded border px-1 text-[10px]">Ctrl K</kbd>
      </button>
      <CommandDialog open={aberto} onOpenChange={setAberto}>
        <CommandInput
          value={termo}
          onValueChange={setTermo}
          placeholder="Buscar Programa, Iniciativa, Entrega, Indicador, Projeto GOMAP, Ação Orçamentária ou IPOF..."
        />
        <CommandList>
          <CommandEmpty>
            {termo.trim().length < 2 ? "Digite ao menos 2 caracteres." : "Nenhum componente encontrado."}
          </CommandEmpty>
          {grupos.map((g) => {
            const itens = resultados.filter((r) => r.tipo === g);
            if (itens.length === 0) return null;
            return (
              <CommandGroup key={g} heading={g === "IPOF" ? "IPOFs" : g === "Ação Orçamentária" ? "Ações Orçamentárias" : `${g}s`}>
                {itens.map((r) => (
                  <CommandItem
                    key={`${g}-${r.id}`}
                    value={`${r.titulo} ${r.contexto} ${r.id}`}
                    onSelect={() => {
                      setAberto(false);
                      setTermo("");
                      navigate({ to: r.to, params: r.params, search: r.search } as never);
                    }}
                    className="flex-col items-start gap-0.5"
                  >
                    <span className="text-sm">{r.titulo}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {r.tipo} · {r.contexto}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
