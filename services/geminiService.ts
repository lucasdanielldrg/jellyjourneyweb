import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getJellyMotivation = async (phaseName: string, completedDays: number): Promise<string> => {
  if (!apiKey) {
    return "Don't wobble! Keep going! (Configure API Key for AI tips)";
  }

  let phaseContext = "";
  if (phaseName.includes("Detox")) {
    phaseContext = "Provide a motivational tip specifically about starting strong and overcoming initial resistance/cravings.";
  } else if (phaseName.includes("Adaptation")) {
    phaseContext = "Provide a tip specifically about building consistent habits and making the routine stick.";
  } else if (phaseName.includes("Lifestyle")) {
    phaseContext = "Provide a strategy or encouragement specifically for long-term maintenance and keeping the weight off.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a cute, bouncy, energetic Gelatin mascot named "Jelly". 
      The user is on the "${phaseName}" of their weight loss journey and has completed ${completedDays} days in total.
      ${phaseContext}
      Make the response very short (max 20 words), funny, and encouraging. Incorporate gelatin/wobbling puns if appropriate.
      Use emojis.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });
    return response.text || "Keep wobbling forward! 🍮";
  } catch (error) {
    console.error("Error fetching motivation:", error);
    return "You're doing great! Keep it up! 🍮";
  }
};