import { GoogleGenAI, Type } from "@google/genai";
import { MedicineDetails } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- 1. Medicine Analysis (Vision + Reasoning) ---
export const analyzeMedicineImage = async (base64Image: string): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    You are an expert pharmacist AI. Analyze this medicine image with high precision. 
    1. **Identify** the Brand Name, Generic Name, Dosage, and Strength explicitly.
    2. **Prioritize accuracy**. If the image is slightly blurry, use internal image enhancement reasoning.
    3. **Structure the output** in professional Markdown.
    
    ## 💊 Medicine Identification
    *   **Brand Name:** [Name]
    *   **Generic Name:** [Composition]
    *   **Strength/Dosage:** [e.g. 500mg]

    ## 📋 Clinical Summary
    *   **Purpose:** [What is it used for?]
    *   **Dosage Guide:** [General usage instructions]
    *   **Key Side Effects:** [Common ones]
    *   **Critical Warnings:** [Important contraindications or interactions]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Analysis failed:", error);
    return "Error analyzing medicine. Please try again.";
  }
};

// --- 2. Chat with Doctor ---
export const chatWithMedicalAssistant = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are Medicinal AI, a safe, professional, and empathetic medical assistant. You clarify medical information but NEVER provide a diagnosis or replace a doctor. Always include a disclaimer for serious symptoms.",
    }
  });

  const result = await chat.sendMessageStream({ message: newMessage });
  return result;
};

// --- 3. Google Search Grounding ---
export const searchMedicalInfo = async (query: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response;
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};

// --- 4. Hospital Finder ---
export const findNearbyMedicalConnect = async (latitude: number, longitude: number, query: string = "hospitals") => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the best ${query} nearby. Prioritize those with high ratings and emergency services. List them with brief details.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        }
      }
    });
    return response;
  } catch (error) {
    console.error("Maps search failed:", error);
    throw error;
  }
};

// --- 5. Symptom Triage (Reasoning) ---
export const analyzeSymptoms = async (symptoms: string) => {
  const ai = getAiClient();
  const prompt = `
    Act as a medical triage assistant. Analyze these symptoms: "${symptoms}".
    Determine the urgency: EMERGENCY, URGENT CARE, or HOME CARE.
    Provide a bulleted list of potential causes (non-diagnostic) and immediate advice.
    Strictly maintain a calm, professional tone. 
    Start the response with the Urgency Level in bold caps.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text;
};

// --- 6. Drug Interaction Checker ---
export const checkInteractions = async (drugs: string[]) => {
  const ai = getAiClient();
  const prompt = `
    Analyze the interactions between these drugs: ${drugs.join(', ')}.
    List any known interactions, their severity (Mild, Moderate, Severe), and mechanism.
    If no interactions are found, state that clearly.
    Use Markdown tables or bullet points.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text;
};

// --- 7. Vitals Parser (JSON Extraction) ---
export const parseVitals = async (text: string) => {
  const ai = getAiClient();
  const prompt = `
    Extract health vitals from this text: "${text}".
    Return ONLY a JSON array with objects containing: 'type' (e.g. BP, HR, Glucose), 'value', and 'unit'.
    If no vitals found, return empty array.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return response.text;
};

// --- 8. First Aid Guide ---
export const getFirstAidInstructions = async (query: string) => {
  const ai = getAiClient();
  const prompt = `
    Provide immediate, step-by-step first aid instructions for: "${query}".
    Use bold numbering for steps. Keep it extremely concise and actionable.
    Add a warning if 911 should be called immediately.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text;
};

// --- 9. Wellness Analysis ---
export const analyzeWellness = async (mood: string, journal: string) => {
  const ai = getAiClient();
  const prompt = `
    User Mood: ${mood}.
    Journal Entry: "${journal}".
    Provide a short, empathetic response, a relevant mindfulness tip, and a motivational quote.
    Keep it warm and supportive.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text;
};

// --- 10. Educational Video Generation (Veo) ---
export const generateEducationalVideo = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  // Return URL with key for direct playback
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

// --- 11. Medical Diagram Generation (Gemini Image) ---
export const generateMedicalDiagram = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed.");
};