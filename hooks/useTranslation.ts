
import { useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

export const useTranslation = () => {
  const translateText = useCallback(async (text: string, targetLanguage: string): Promise<TranslationResult | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text into ${targetLanguage}. 
        Identify the source language. 
        Ensure you preserve the original intent, tone, and casual conversational context. 
        If the original uses slang, translate it to equivalent slang in the target language.
        
        Text: "${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: {
                type: Type.STRING,
                description: "The translated version of the input text."
              },
              detectedLanguage: {
                type: Type.STRING,
                description: "The name of the detected source language (e.g., 'Spanish', 'Japanese')."
              }
            },
            required: ["translatedText", "detectedLanguage"]
          }
        }
      });

      const textOutput = response.text || '{}';
      const result = JSON.parse(textOutput);
      return result as TranslationResult;
    } catch (error) {
      console.error("[YOLO Translation] Error:", error);
      return null;
    }
  }, []);

  return { translateText };
};
