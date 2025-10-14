import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AlarmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  onStop: () => void;
  onSnooze: () => void;
}

export default function AlarmModal({
  open,
  onOpenChange,
  label,
  onStop,
  onSnooze,
}: AlarmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onStop}>Parar</Button>
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <Button onClick={onSnooze} variant="outline">
              Adiar (5 min)
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
