import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function predictEffectiveDose(params: {
  ctdiVol: number;
  dlp: number;
  examType: string;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a medical physicist specializing in radiation dosimetry.
    Estimate the effective dose (in mSv) for a CT scan with the following parameters:
    - Exam Type: ${params.examType}
    - CTDIvol: ${params.ctdiVol} mGy
    - DLP: ${params.dlp} mGy·cm

    Provide a realistic estimate based on ICRP 103 k-factors for Rwanda's regional standards.
    Also provide a confidence score (0-100) and a brief clinical insight (max 20 words).
    Return only a JSON object like:
    {
      "dose": 4.2,
      "confidence": 94,
      "insight": "High dose for this protocol, check for over-scanning."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Prediction error:", error);
    // Fallback simple calc
    return {
      dose: (params.dlp * 0.015).toFixed(2),
      confidence: 70,
      insight: "Estimated using standard conversion factor."
    };
  }
}
