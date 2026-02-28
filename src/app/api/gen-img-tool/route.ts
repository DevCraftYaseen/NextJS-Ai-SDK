import { UIMessage, streamText, convertToModelMessages, tool, stepCountIs, generateImage, InferUITools, UIDataTypes } from "ai";
import { google } from "@ai-sdk/google";
import { createFiremoon } from '@firemoon/ai-provider';
import { z } from "zod"

const firemoon = createFiremoon({
    apiKey: process.env.FIREMOON_API_KEY,
});

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

const tools = {
    generateImage: tool({
        description: "Use this tool to generate images",
        inputSchema: z.object({
            prompt: z.string().describe("The Prompt to generate image for")
        }),
        execute: async ({ prompt }) => {
            try {
                const { image } = await generateImage({
                    model: firemoon.image('flux/dev'),
                    prompt,
                    aspectRatio: '16:9',
                });
                return image.base64
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                console.error("Image generation error:", errorMessage);
                
                // Check for timeout/blob fetch errors
                if (errorMessage.includes('timeout') || errorMessage.includes('Connect Timeout') || errorMessage.includes('blob.vercel-storage')) {
                    throw new Error("Image generation timed out. The AI service is experiencing high load. Please try again with a simpler prompt or wait a moment.");
                }
                
                throw new Error(`Failed to generate image: ${errorMessage}`);
            }
        },
        toModelOutput: () => {
            return {
                type: 'content',
                value: [
                    {
                        type: 'text',
                        text: 'Generated Image in Base64'
                    }
                ]
            }
        }
    })
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json();

        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            messages: await convertToModelMessages(messages),
            tools,
            stopWhen: stepCountIs(3)
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error in gen-img-tool:", error);
        
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        
        // Check for timeout / connection errors
        const isTimeout = errorMessage.includes('timeout') || 
                         errorMessage.includes('Connect Timeout') ||
                         errorMessage.includes('Fetch') ||
                         errorMessage.includes('blob.vercel-storage');
        
        if (isTimeout) {
            return Response.json({ 
                error: "Image generation timed out. The service may be experiencing high load. Please try again with a simpler prompt." 
            }, { status: 504 });
        }
        
        return Response.json({ error: errorMessage }, { status: 500 });
    }
}

