import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAlarms, useCreateAlarm, useUpdateAlarm, useDeleteAlarm } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';

export default function AlarmList() {
  const { data: alarms, isLoading } = useAlarms();
  const createAlarm = useCreateAlarm();
  const updateAlarm = useUpdateAlarm();
  const deleteAlarm = useDeleteAlarm();
  const { toast } = useToast();
  
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [open, setOpen] = useState(false);

  const handleAddAlarm = async () => {
    if (newTime && newLabel) {
      try {
        await createAlarm.mutateAsync({
          time: newTime,
          label: newLabel,
          enabled: true,
        });
        setNewTime('');
        setNewLabel('');
        setOpen(false);
        toast({
          title: 'Alarme criado',
          description: 'Seu alarme foi configurado com sucesso',
        });
      } catch (error) {
        toast({
          title: 'Erro ao criar alarme',
          description: 'Não foi possível criar o alarme',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleAlarm = async (id: string, enabled: boolean) => {
    try {
      await updateAlarm.mutateAsync({ id, data: { enabled: !enabled } });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o alarme',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    try {
      await deleteAlarm.mutateAsync(id);
      toast({
        title: 'Alarme removido',
        description: 'O alarme foi excluído com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o alarme',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alarmes
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-alarm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Alarme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  data-testid="input-alarm-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Descrição</Label>
                <Input
                  id="label"
                  placeholder="Ex: Hora de ir pra academia"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  data-testid="input-alarm-label"
                />
              </div>
              <Button 
                onClick={handleAddAlarm} 
                className="w-full" 
                disabled={createAlarm.isPending}
                data-testid="button-save-alarm"
              >
                {createAlarm.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alarme
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !alarms || alarms.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum alarme configurado
          </p>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={alarm.enabled}
                  onCheckedChange={() => toggleAlarm(alarm.id, alarm.enabled)}
                  data-testid={`switch-alarm-${alarm.id}`}
                />
                <div>
                  <p className={`font-mono text-lg font-semibold ${alarm.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {alarm.time}
                  </p>
                  <p className={`text-sm ${alarm.enabled ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                    {alarm.label}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteAlarm(alarm.id)}
                disabled={deleteAlarm.isPending}
                data-testid={`button-delete-alarm-${alarm.id}`}
              >
                {deleteAlarm.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
