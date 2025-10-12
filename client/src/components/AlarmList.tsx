import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export default function AlarmList() {
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: '1', time: '07:00', label: 'Café da manhã', enabled: true },
    { id: '2', time: '18:00', label: 'Hora de ir pra academia', enabled: true },
  ]);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [open, setOpen] = useState(false);

  const handleAddAlarm = () => {
    if (newTime && newLabel) {
      setAlarms([
        ...alarms,
        {
          id: Date.now().toString(),
          time: newTime,
          label: newLabel,
          enabled: true,
        },
      ]);
      setNewTime('');
      setNewLabel('');
      setOpen(false);
    }
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
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
              <Button onClick={handleAddAlarm} className="w-full" data-testid="button-save-alarm">
                Salvar Alarme
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {alarms.length === 0 ? (
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
                  onCheckedChange={() => toggleAlarm(alarm.id)}
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
                onClick={() => deleteAlarm(alarm.id)}
                data-testid={`button-delete-alarm-${alarm.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
