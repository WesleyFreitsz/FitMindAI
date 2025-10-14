import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2, Loader2, Music, Play, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAlarms,
  useCreateAlarm,
  useUpdateAlarm,
  useDeleteAlarm,
} from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import useSound from "use-sound";
import AlarmModal from "./AlarmModal";

const alarmSounds = [
  {
    name: "Alarme Padrão",
    file: "/alarms_sounds/digital-alarm-clock-151920.mp3",
  },
  {
    name: "Alarme Eletrônico",
    file: "/alarms_sounds/electronic-alarm-clock-151927.mp3",
  },
  { name: "Toque 1", file: "/alarms_sounds/ringtone-020-365650.mp3" },
  { name: "Toque 2", file: "/alarms_sounds/ringtone-06-153265.mp3" },
  { name: "Alarme Curto", file: "/alarms_sounds/alarme-342932.mp3" },
];

export default function AlarmList() {
  const { data: alarms, isLoading } = useAlarms();
  const createAlarm = useCreateAlarm();
  const updateAlarm = useUpdateAlarm();
  const deleteAlarm = useDeleteAlarm();
  const { toast } = useToast();

  const [newTime, setNewTime] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSound, setNewSound] = useState(alarmSounds[0].file);
  const [open, setOpen] = useState(false);

  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    label: string;
    sound: string;
  } | null>(null);

  const [triggeredAlarms, setTriggeredAlarms] = useState<Set<string>>(
    new Set()
  );
  const lastCheckedMinute = useRef<string | null>(null);

  // --- Lógica de Alarme Principal ---
  const [play, { stop, sound }] = useSound(activeAlarm?.sound || "", {
    loop: true,
  });

  // --- Lógica de Pré-visualização ---
  const [previewSound, setPreviewSound] = useState<string | null>(null);
  const [playPreview, { stop: stopPreview }] = useSound(previewSound || "", {
    interrupt: true,
    onend: () => setPreviewSound(null),
  });

  // Garante que o AudioContext seja iniciado por uma interação do usuário
  useEffect(() => {
    const unlockAudio = () => {
      if (sound && sound.ctx.state === "suspended") {
        sound.ctx.resume().then(() => {
          console.log("AudioContext resumed successfully!");
        });
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [sound]);

  useEffect(() => {
    if (previewSound) {
      playPreview();
    } else {
      stopPreview();
    }
  }, [previewSound, playPreview, stopPreview]);

  const handlePreviewSound = (soundFile: string) => {
    if (previewSound === soundFile) {
      setPreviewSound(null);
    } else {
      setPreviewSound(soundFile);
    }
  };

  const handleStop = useCallback(() => {
    stop();
    setActiveAlarm(null);
  }, [stop]);

  // Lógica de verificação de alarme
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      if (lastCheckedMinute.current !== currentTime) {
        setTriggeredAlarms(new Set());
        lastCheckedMinute.current = currentTime;
      }

      alarms?.forEach((alarm) => {
        if (
          alarm.enabled &&
          alarm.time === currentTime &&
          !activeAlarm &&
          !triggeredAlarms.has(alarm.id) // <<-- Correção do Loop Infinito
        ) {
          setActiveAlarm(alarm);
          setTriggeredAlarms((prev) => new Set(prev).add(alarm.id));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, activeAlarm, triggeredAlarms]);

  useEffect(() => {
    let alarmTimeout: NodeJS.Timeout | undefined;
    if (activeAlarm) {
      play();
      alarmTimeout = setTimeout(handleStop, 5 * 60 * 1000); // 5 minutos
    }
    return () => {
      if (alarmTimeout) {
        clearTimeout(alarmTimeout);
      }
    };
  }, [activeAlarm, play, handleStop]);

  const handleSnooze = useCallback(() => {
    stop();
    const snoozedAlarm = activeAlarm;
    setActiveAlarm(null);

    // Não adiciona novamente ao triggeredAlarms, pois a soneca é temporária
    setTimeout(() => {
      setActiveAlarm(snoozedAlarm);
    }, 5 * 60 * 1000); // 5 minutes
  }, [stop, activeAlarm]);

  const handleAddAlarm = async () => {
    if (newTime && newLabel) {
      try {
        await createAlarm.mutateAsync({
          time: newTime,
          label: newLabel,
          enabled: true,
          sound: newSound,
        });
        setNewTime("");
        setNewLabel("");
        setNewSound(alarmSounds[0].file);
        setOpen(false);
        toast({
          title: "Alarme criado",
          description: "Seu alarme foi configurado com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro ao criar alarme",
          description: "Não foi possível criar o alarme",
          variant: "destructive",
        });
      }
    }
  };

  const toggleAlarm = async (alarm: any) => {
    try {
      await updateAlarm.mutateAsync({
        id: alarm.id,
        data: { enabled: !alarm.enabled },
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o alarme",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    try {
      await deleteAlarm.mutateAsync(id);
      toast({
        title: "Alarme removido",
        description: "O alarme foi excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o alarme",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
                <div className="space-y-2">
                  <Label htmlFor="sound">Som do Alarme</Label>
                  <Select value={newSound} onValueChange={setNewSound}>
                    <SelectTrigger id="sound" data-testid="select-alarm-sound">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alarmSounds.map((sound) => (
                        <SelectItem
                          key={sound.file}
                          value={sound.file}
                          onSelect={(e) => {
                            if (
                              e.target instanceof HTMLElement &&
                              e.target.closest("button")
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="flex-1">{sound.name}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 ml-2"
                              onClick={() => handlePreviewSound(sound.file)}
                            >
                              {previewSound === sound.file ? (
                                <Square className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddAlarm}
                  className="w-full"
                  disabled={createAlarm.isPending}
                  data-testid="button-save-alarm"
                >
                  {createAlarm.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
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
                    onCheckedChange={() => toggleAlarm(alarm)}
                    data-testid={`switch-alarm-${alarm.id}`}
                  />
                  <div>
                    <p
                      className={`font-mono text-lg font-semibold ${
                        alarm.enabled
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {alarm.time}
                    </p>
                    <p
                      className={`text-sm ${
                        alarm.enabled
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {alarm.label}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Music className="h-3 w-3" />
                      <span>
                        {alarmSounds.find((s) => s.file === alarm.sound)
                          ?.name || "Padrão"}
                      </span>
                    </div>
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
      {activeAlarm && (
        <AlarmModal
          open={!!activeAlarm}
          onOpenChange={() => {}}
          label={activeAlarm.label}
          onStop={handleStop}
          onSnooze={handleSnooze}
        />
      )}
    </>
  );
}
