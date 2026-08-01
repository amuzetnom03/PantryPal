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
    const { imageBase64, mimeType = "image/jpeg", textQuery } = await req.json();

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64,
        }
      });
    }
    parts.push({
      text: textQuery || "Analyze this supermarket receipt or barcode image and extract all purchased grocery items with their item name, quantity, unit (e.g. pcs, kg, liters, pack), category (Produce, Dairy, Meat, Pantry, Beverages, Spices, Bakery, Frozen), estimated shelf life in days from today, and estimated price."
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the grocery item" },
              quantity: { type: Type.NUMBER, description: "Quantity purchased" },
              unit: { type: Type.STRING, description: "Unit of measurement like pcs, kg, liters, pack" },
              category: { type: Type.STRING, description: "Produce, Dairy, Meat, Pantry, Beverages, Spices, Bakery, or Frozen" },
              expiryDays: { type: Type.NUMBER, description: "Estimated shelf life in days from today" },
              price: { type: Type.NUMBER, description: "Estimated price in USD" }
            },
            required: ["name", "quantity", "unit", "category", "expiryDays", "price"]
          }
        }
      }
    });

    const items = JSON.parse(response.text || "[]");
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Scan receipt error:", error);
    return NextResponse.json({ error: error.message || "Failed to scan receipt" }, { status: 500 });
  }
}
