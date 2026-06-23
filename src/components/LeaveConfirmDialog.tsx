import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LeaveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  description = "Os dados preenchidos serão perdidos se você voltar agora.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  description?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[340px] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja sair?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogAction
            className="w-full/2 bg-transparent text-destructive border border-destructive hover:bg-destructive/10 text-sm font-medium h-9 rounded-md"
            onClick={onConfirm}
          >
            Sair
          </AlertDialogAction>
          <AlertDialogCancel className="w-full btn-primary border-0 mt-0 !bg-ink !text-primary-foreground">
            Continuar aqui
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
