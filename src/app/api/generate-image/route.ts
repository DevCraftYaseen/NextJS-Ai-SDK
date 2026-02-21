import { createFiremoon } from '@firemoon/ai-provider';
import { generateImage } from 'ai';

const firemoon = createFiremoon({
    apiKey: process.env.FIREMOON_API_KEY,
});

export async function POST(req: Request) {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
        return Response.json({ error: "Prompt is required and must be a string" }, { status: 400 });
    }

    // Limit prompt length to prevent excessively long generation times
    if (prompt.length > 1000) {
        return Response.json({ error: "Prompt is too long. Please keep it under 1000 characters for reliable generation." }, { status: 400 });
    }

    try {
        const { image } = await generateImage({
            model: firemoon.image('flux/dev'),
            prompt,
            aspectRatio: '16:9',
        });

        return Response.json(image.base64)
    } catch (error) {
        console.error("Error generating image:", error);
        
        // Detect timeout specifically
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const isTimeout = errorMessage.toLowerCase().includes('timeout') || 
                          errorMessage.toLowerCase().includes('timed out') ||
                          errorMessage.toLowerCase().includes('function invocation limit');
        
        if (isTimeout) {
            return Response.json({ 
                error: "Image generation timed out. Complex prompts may take longer. Try simplifying your prompt or breaking it into smaller parts." 
            }, { status: 504 });
        }
        
        return Response.json({ error: "Failed To Generate Image" }, { status: 500 });
    }
}

