import { GoogleGenAI } from '@google/genai';

// Initialize the official Google Gen AI client
const ai = new GoogleGenAI({}); // Automatically picks up process.env.GEMINI_API_KEY

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // Call Gemini and force the output modality to AUDIO
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              // Available Google voices: Puck, Charon, Kore, Fenrir, Aoede
              voiceName: "Aoede", 
            }
          }
        }
      }
    });

    // Extract the raw base64 audio data from the response structure
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned from the model.");
    }

    // Convert Base64 to a standard Buffer
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Return the Buffer directly to the client as an MP3 stream
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error("TTS Generation Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}