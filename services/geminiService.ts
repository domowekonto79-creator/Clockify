
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedEntry, ReportSummary } from "../types";

export const summarizeWorkActivities = async (entries: ProcessedEntry[]): Promise<ReportSummary> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Klucz API Gemini nie został skonfigurowany w zmiennych środowiskowych.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const activitiesList = entries
    .map(e => `[${e.project}] ${e.description} (${e.durationHours.toFixed(2)}h)`)
    .join('\n');

  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Please summarize the following work activities from the current month into a professional monthly report summary in Polish language. 
    Focus on clarity, professional tone, and grouping similar tasks.
    
    Activities:
    ${activitiesList}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          professionalSummary: {
            type: Type.STRING,
            description: "A high-level paragraph summarizing the overall work done.",
          },
          keyAchievements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 main bullet points of achievements.",
          }
        },
        required: ["professionalSummary", "keyAchievements"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    professionalSummary: data.professionalSummary || "Nie udało się wygenerować podsumowania.",
    keyAchievements: data.keyAchievements || [],
    totalHours: totalHours
  };
};
