import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function BotaoDocumento({
  rotulo,
  titulo,
  children,
  variant = "outline",
}: {
  rotulo: string;
  titulo: string;
  children: ReactNode;
  variant?: "outline" | "ghost" | "default";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant={variant} className="h-7 text-xs" onClick={() => setOpen(true)}>
        {rotulo}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle className="text-sm">{titulo}</DialogTitle>
          </DialogHeader>
          <div data-print className="space-y-4 rounded-md border bg-card p-6 text-sm">
            <div className="border-b pb-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Plano Plurianual 2028–2031 · Estado de Goiás
              </div>
              <h3 className="text-base font-semibold">{titulo}</h3>
            </div>
            {children}
            <p className="border-t pt-3 text-[11px] text-muted-foreground">
              Documento gerado pelo protótipo em {new Date().toLocaleDateString("pt-BR")}. Conteúdo de demonstração.
            </p>
          </div>
          <div className="flex justify-end gap-2 no-print">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={() => window.print()}>
              Imprimir / Salvar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
