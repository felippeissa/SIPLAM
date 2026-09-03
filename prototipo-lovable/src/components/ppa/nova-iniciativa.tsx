import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PROGRAMAS } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";

export function NovaIniciativaDialog({
  programaId,
  open,
  onOpenChange,
}: {
  programaId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addIniciativa } = usePpa();
  const navigate = useNavigate();
  const programa = PROGRAMAS.find((p) => p.id === programaId);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [causas, setCausas] = useState<string[]>([]);

  const toggle = (id: string) => setCausas((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Nova Iniciativa</DialogTitle>
          <DialogDescription className="text-xs">
            {programa?.codigo} — {programa?.nome}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Nome da Iniciativa
            </label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Ampliação da rede pública de alimentação" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Detalhamento
            </label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Público-alvo
            </label>
            <Input value={publicoAlvo} onChange={(e) => setPublicoAlvo(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Causas e subcausas enfrentadas
            </div>
            <div className="space-y-2 rounded-md border p-3">
              {programa?.causas.map((c) => (
                <div key={c.id}>
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox checked={causas.includes(c.id)} onCheckedChange={() => toggle(c.id)} className="mt-0.5" />
                    <span>{c.texto}</span>
                  </label>
                  {c.subcausas.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {c.subcausas.map((s) => (
                        <label key={s.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Checkbox checked={causas.includes(s.id)} onCheckedChange={() => toggle(s.id)} className="mt-0.5" />
                          <span>{s.texto}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={!nome.trim()}
            onClick={() => {
              const id = addIniciativa({ programaId, nome: nome.trim(), descricao, publicoAlvo, causas });
              onOpenChange(false);
              navigate({ to: "/iniciativa/$id", params: { id } });
            }}
          >
            Criar Iniciativa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
