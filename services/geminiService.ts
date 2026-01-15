
import { GoogleGenAI, Type } from "@google/genai";
import { Endpoint, HealthReport } from "../types";

export const getAIHealthAnalysis = async (endpoints: Endpoint[]): Promise<HealthReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const endpointSummary = endpoints.map(e => ({
    name: e.name,
    status: e.status,
    latency: e.avgLatency,
    uptime: e.uptime,
    type: e.type
  }));

  const prompt = `Analyze the health of the following network endpoints and provide a professional status report. 
  Focus on identifying risks, suggesting performance improvements, and summarizing the overall connectivity state.
  
  Data: ${JSON.stringify(endpointSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise executive summary of system health." },
            riskLevel: { type: Type.STRING, description: "One of: Low, Medium, High" },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of actionable steps."
            }
          },
          required: ["summary", "riskLevel", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as HealthReport;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "Unable to generate AI report at this time. Manual inspection required.",
      riskLevel: "Medium",
      recommendations: ["Manually verify offline endpoints", "Check authentication service logs"]
    };
  }
};
