
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedEntry, ReportSummary } from "../types";

export const summarizeWorkActivities = async (entries: ProcessedEntry[]): Promise<ReportSummary> => {
  // Always use {apiKey: process.env.API_KEY} for initialization as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activitiesList = entries
    .map(e => `[${e.project}] ${e.description} (${e.durationHours.toFixed(2)}h)`)
    .join('\n');

  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Please summarize the following work activities from the current month into a professional monthly report summary. 
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

  // Extract text using the .text property (not a method)
  const data = JSON.parse(response.text || "{}");
  
  return {
    professionalSummary: data.professionalSummary || "No summary generated.",
    keyAchievements: data.keyAchievements || [],
    totalHours: totalHours
  };
};
