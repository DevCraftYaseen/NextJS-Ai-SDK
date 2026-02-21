// app/api/transcribe/route.ts
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer()
    const unintArray = new Uint8Array(arrayBuffer)

    const { text } = await generateText({
      model: google('gemini-2.5-flash'), 
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              // Because it is an LLM, your prompt controls the transcription format
              text: 'Process this audio file and generate a highly accurate, detailed transcription. Identify distinct speakers if applicable.' 
            },
            { 
              // Native v6 file attachment standard
              type: 'file', 
              data: unintArray,
              mediaType: file.type 
            },
          ],
        },
      ],
    });

    return Response.json({ transcript: text });

  } catch (error) {
    console.error("Transcription Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}