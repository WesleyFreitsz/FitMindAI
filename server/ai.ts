import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { User } from "@shared/schema";

// Pega a chave do ambiente que configuramos
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set - AI features will be disabled");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Configurações do modelo para garantir a saída em JSON
const generationConfig = {
  temperature: 0.7,
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const model = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig,
  safetySettings,
});

// Tipos de dados para clareza
interface ParsedFood {
  name: string;
  portion: number;
  unit: string;
}

interface FoodNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number;
  unit: string;
}

interface ParsedWorkout {
  type: "food" | "workout" | "question";
  workouts?: {
    name: string;
    duration: number; // em minutos
    intensity: "leve" | "moderado" | "intenso";
    caloriesBurned: number;
  }[];
  foods?: ParsedFood[];
  followUpQuestion?: string;
  answer?: string;
}

export async function parseUserInput(
  text: string,
  user: User
): Promise<ParsedWorkout> {
  if (!model) {
    return {
      type: "question",
      answer: "AI features are disabled. Please configure GEMINI_API_KEY.",
    };
  }

  const prompt = `
    Você é um assistente de nutrição e fitness especialista chamado FitMind AI. Sua principal função é analisar a entrada do usuário e categorizá-la em uma de três intenções: 'food' (registro de comida), 'workout' (registro de treino), ou 'question' (pergunta geral).

    Seu processo é o seguinte:

    1.  **Análise de Intenção**:
        * Se o texto parece um registro de alimentos (ex: "comi 200g de frango"), a intenção é 'food'.
        * Se o texto descreve uma atividade física (ex: "corri por 30 minutos"), a intenção é 'workout'.
        * Caso contrário, a intenção é 'question'.

    2.  **Extração e Processamento para 'workout'**:
        * Extraia cada exercício com 'name' (nome), 'duration' (duração em minutos), e 'intensity' ('leve', 'moderado', 'intenso').
        * Se a intensidade não for fornecida, estime com base na atividade (ex: musculação = moderado, caminhada leve = leve).
        * **Cálculo de Calorias**: Use a fórmula MET para estimar as calorias queimadas: \`Calorias = MET * Peso do Usuário (kg) * Duração (horas)\`.
        * O peso do usuário é ${user.weight} kg.
        * Valores de MET para referência: Musculação (geral) = 5.0, Corrida (5km/h) = 8.0, Cardio (geral) = 7.0, Caminhada (leve) = 3.5. Se não souber o MET, use uma estimativa razoável.
        * **Informação Faltando**: Se informações cruciais como a duração estiverem faltando, não calcule. Em vez disso, defina \`"followUpQuestion": "Por quanto tempo você realizou [nome do exercício]?"\` para que o sistema possa pedir mais detalhes ao usuário.

    3.  **Extração para 'food'**:
        * Extraia todos os alimentos com 'name' (nome), 'portion' (quantidade numérica) e 'unit' (unidade, ex: 'g', 'ml', 'unidade'). Normalize as unidades sempre que possível.

    4.  **Formato de Saída (JSON OBRIGATÓRIO)**: Retorne APENAS o objeto JSON.
        * **Para treinos**: \`{"type": "workout", "workouts": [{"name": "Musculação", "duration": 60, "intensity": "moderado", "caloriesBurned": 380}]}\`
        * **Para treinos com dados faltantes**: \`{"type": "workout", "followUpQuestion": "Por quanto tempo você treinou musculação?"}\`
        * **Para comidas**: \`{"type": "food", "foods": [{"name": "Peito de Frango", "portion": 200, "unit": "g"}]}\`
        * **Para perguntas**: \`{"type": "question"}\`

    Entrada do usuário: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonResponse = JSON.parse(response.text());
    return jsonResponse;
  } catch (error) {
    console.error("Erro ao analisar a entrada do usuário com Gemini:", error);
    return {
      type: "question",
      answer: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}

export async function estimateFoodNutrition(
  foodName: string,
  portion: number,
  unit: string
): Promise<FoodNutrition | null> {
  if (!model) {
    return null;
  }

  const prompt = `
      Você é um especialista em nutrição. Estime os valores nutricionais do alimento solicitado.
      Retorne um JSON com: { "name": "nome do alimento", "calories": número, "protein": número, "carbs": número, "fat": número, "portion": número, "unit": "unidade" }.
      Todos os valores de macronutrientes devem ser em gramas. Seja o mais preciso possível.
      Alimento: "${portion}${unit} de ${foodName}"
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Erro ao estimar nutrição com Gemini:", error);
    return null;
  }
}

export async function chatWithAI(
  messages: { role: "user" | "assistant"; content: string }[],
  user: User
): Promise<string> {
  if (!genAI) {
    return "AI features are disabled. Please configure GEMINI_API_KEY.";
  }

  const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Modelo para chat, sem modo JSON forçado

  // Converte o histórico de mensagens para o formato do Gemini
  let history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Garante que o histórico sempre comece com uma mensagem do usuário
  const firstUserMessageIndex = history.findIndex((msg) => msg.role === "user");
  if (firstUserMessageIndex > -1) {
    history = history.slice(firstUserMessageIndex);
  } else {
    history = [];
  }

  const lastMessage = messages[messages.length - 1];

  const systemInstruction = `Você é o FitMind AI, um assistente inteligente de nutrição e fitness com uma personalidade motivadora e amigável.
  Seu objetivo é ajudar o usuário a atingir suas metas de saúde.
  - Responda em português do Brasil.
  - Use emojis de forma moderada para criar um tom mais humano e encorajador (ex: 💪,🥗,🚀).
  - Seja proativo, oferecendo dicas e sugestões.
  - Informações do usuário: Peso=${user.weight}kg, Altura=${user.height}cm, Objetivo=${user.goal}. Use esses dados para personalizar suas respostas.
  - Mantenha as respostas concisas e diretas.`;

  try {
    const chat = chatModel.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }],
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Erro no chat com Gemini:", error);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}
