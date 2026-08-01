import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { inventory, cuisinePreference = "Global" } = await req.json();

    const inventoryList = (inventory || []).map((item: any) => `${item.quantity} ${item.unit} of ${item.name} (${item.category})`).join(", ");

    const prompt = `You are a master global chef and pantry inventory optimizer.
Available fridge & pantry ingredients: [${inventoryList}].
Cuisine preference requested: ${cuisinePreference}.

Generate 6 diverse, delicious, exhaustive global recipes (spanning Italian, Japanese, Mexican, French, Indian, Thai, Mediterranean, etc.) that can be prepared using these available ingredients and standard household pantry basics (salt, pepper, oil, water).
For each recipe, calculate:
1. matchPercentage: percentage (0-100) of core ingredients already in the available inventory.
2. availableIngredients: list of ingredients used that are present in the inventory.
3. missingIngredients: list of ingredients needed that are missing from the inventory.
4. instructions: step-by-step cooking method.
5. calories: estimated calories per serving.
6. difficulty: 'Easy', 'Medium', or 'Chef Level'.
7. prepTime: e.g. '25 mins'.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              cuisine: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              difficulty: { type: Type.STRING, description: "Easy, Medium, or Chef Level" },
              matchPercentage: { type: Type.NUMBER },
              availableIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              calories: { type: Type.NUMBER },
              description: { type: Type.STRING }
            },
            required: ["id", "title", "cuisine", "prepTime", "difficulty", "matchPercentage", "availableIngredients", "missingIngredients", "instructions", "calories", "description"]
          }
        }
      }
    });

    const recipes = JSON.parse(response.text || "[]");
    return NextResponse.json({ recipes });
  } catch (error: any) {
    console.error("Recipe generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recipes" }, { status: 500 });
  }
}
