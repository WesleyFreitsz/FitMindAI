import OpenAI from "openai";

// Using OpenAI blueprint: blueprint:javascript_openai
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function parseFoodInput(text: string): Promise<ParsedFood[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Você é um assistente de nutrição. Analise o texto e extraia todos os alimentos mencionados com suas quantidades. 
          Retorne um JSON array com objetos no formato: { "name": "nome do alimento", "portion": número, "unit": "unidade (g, ml, unidade, etc)" }.
          Sempre normalize para unidades padrão (g, ml, unidade). Se não houver quantidade, use 100g como padrão.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"foods":[]}');
    return result.foods || [];
  } catch (error) {
    console.error("Error parsing food input:", error);
    return [];
  }
}

export async function estimateFoodNutrition(foodName: string, portion: number, unit: string): Promise<FoodNutrition | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em nutrição. Estime os valores nutricionais do alimento solicitado.
          Retorne um JSON com: { "name": "nome", "calories": número, "protein": número, "carbs": número, "fat": número, "portion": número, "unit": "unidade" }.
          Todos os valores de macronutrientes devem ser em gramas. Seja preciso com as estimativas.`,
        },
        {
          role: "user",
          content: `Estime os valores nutricionais para: ${portion}${unit} de ${foodName}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || 'null');
  } catch (error) {
    console.error("Error estimating nutrition:", error);
    return null;
  }
}

export async function chatWithAI(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Você é o FitMind AI, um assistente inteligente de nutrição e fitness. 
          Ajude o usuário com perguntas sobre alimentação, treino, calorias e saúde. 
          Seja amigável, preciso e motivador. Responda em português.`,
        },
        ...messages,
      ],
    });

    return response.choices[0].message.content || "Desculpe, não consegui processar sua mensagem.";
  } catch (error) {
    console.error("Error in AI chat:", error);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}
