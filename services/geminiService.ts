
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedEntry, ReportSummary } from "../types";

// Summarize work activities into a professional Polish report using Gemini
export const summarizeWorkActivities = async (entries: ProcessedEntry[]): Promise<ReportSummary> => {
  // Use process.env.API_KEY directly as per strict guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const activitiesList = entries
    .map(e => `[${e.project}] ${e.description} (${e.durationHours.toFixed(2)}h)`)
    .join('\n');

  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);

  // Generate content using the specified Gemini 3 Flash model for summarization tasks
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

  // Extract text directly from response.text property (getter)
  const data = JSON.parse(response.text || "{}");
  
  return {
    professionalSummary: data.professionalSummary || "Nie udało się wygenerować podsumowania.",
    keyAchievements: data.keyAchievements || [],
    totalHours: totalHours
  };
};
