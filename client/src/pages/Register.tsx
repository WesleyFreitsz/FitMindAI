import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const activityLevels = [
  {
    value: "sedentario",
    label: "Sedentário",
    description: "Pouco ou nenhum exercício.",
  },
  {
    value: "leve",
    label: "Levemente Ativo",
    description: "Exercício leve 1-3 dias/semana.",
  },
  {
    value: "moderado",
    label: "Moderadamente Ativo",
    description: "Exercício moderado 3-5 dias/semana.",
  },
  {
    value: "intenso",
    label: "Muito Ativo",
    description: "Exercício intenso 6-7 dias/semana.",
  },
  {
    value: "muito_intenso",
    label: "Extremamente Ativo",
    description: "Exercício muito intenso e trabalho físico.",
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "" as number | "",
    sex: "",
    weight: "" as number | "",
    height: "" as number | "",
    goal: "",
    activityLevel: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        email: formData.email.toLowerCase(),
        age: Number(formData.age) || 0,
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
      };
      await register(submissionData);
      navigate("/");
    } catch (err: any) {
      setError(
        err.message ||
          "Não foi possível criar a conta. Talvez o e-mail já esteja em uso."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crie sua Conta</CardTitle>
          <CardDescription>
            Preencha os campos para começar a usar o FitMind AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select
                  value={formData.sex}
                  onValueChange={handleSelectChange("sex")}
                  disabled={isLoading}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Objetivo Principal</Label>
              <Select
                value={formData.goal}
                onValueChange={handleSelectChange("goal")}
                disabled={isLoading}
              >
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perder">Perder Gordura</SelectItem>
                  <SelectItem value="manter">Manter Peso</SelectItem>
                  <SelectItem value="ganhar">Ganhar Massa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Nível de Atividade</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={handleSelectChange("activityLevel")}
                disabled={isLoading}
              >
                <SelectTrigger id="activityLevel">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <p className="font-medium">{level.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar Conta"
              )}
            </Button>
            <Button
              variant="link"
              className="w-full"
              type="button"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              Já tem uma conta? Faça login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
