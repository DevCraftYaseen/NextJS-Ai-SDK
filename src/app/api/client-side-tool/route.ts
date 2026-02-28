import { UIMessage, streamText, convertToModelMessages, tool, stepCountIs, generateImage, InferUITools, UIDataTypes } from "ai";
import { google } from "@ai-sdk/google";
import { createFiremoon } from '@firemoon/ai-provider';
import { z } from "zod"
import ImageKit from "imagekit";

const firemoon = createFiremoon({
    apiKey: process.env.FIREMOON_API_KEY,
});

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

const uploadImage = async (image: string) => {
    const imagekit = new ImageKit({
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
    });

    const response = await imagekit.upload({
        file: image,
        fileName: "generated-image.jpg"
    })

    return response.url
}



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

                const imageUrl = await uploadImage(image.base64)

                return imageUrl
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error("Image generation error:", errorMessage);

                // Check for various timeout/retry error patterns
                const isTimeoutError =
                    errorMessage.includes('timeout') ||
                    errorMessage.includes('Connect Timeout') ||
                    errorMessage.includes('blob.vercel-storage') ||
                    errorMessage.includes('firemoon.studio') ||
                    errorMessage.includes('Failed after') ||
                    errorMessage.includes('Cannot connect to API') ||
                    errorMessage.includes('fetch image from URL');

                if (isTimeoutError) {
                    throw new Error("IMAGE_TIMEOUT_ERROR");
                }

                throw new Error(`IMAGE_GENERATION_FAILED: ${errorMessage}`);
            }
        }
    }),
    removeBackground: tool({
        description: "Use this tool to remove background of an image. When the user refers to a recent image (e.g., 'the toy image', 'that image', 'the previous image'), look at the conversation history to find the most recently generated image URL and use that.",
        inputSchema: z.object({
            imageUrl: z.string().describe("URL of the image to process. Use the URL from the most recent generateImage tool result if the user refers to a recent image.")
        }),
        outputSchema: z.string().describe("The Transformed image Url")
    }),
    changeBackground: tool({
        description: "Use this tool to change background of an image. When the user refers to a recent image (e.g., 'the toy image', 'that image', 'the previous image'), look at the conversation history to find the most recently generated image URL and use that.",
        inputSchema: z.object({
            imageUrl: z.string().describe("URL of the image to process. Use the URL from the most recent generateImage tool result if the user refers to a recent image."),
            backgroundPrompt: z.string().describe("Description of the new background")
        }),
        outputSchema: z.string().describe("The Transformed image Url")
    }),
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json();

        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            system: "You are a helpful AI assistant for image generation and editing. When a user refers to a recent image they just created (using phrases like 'the toy image', 'that image', 'the previous image', 'the last image'), look at the conversation history to find the URL from the most recent generateImage tool result and use that URL automatically. Do not ask the user to provide the URL again.",
            messages: await convertToModelMessages(messages),
            tools,
            stopWhen: stepCountIs(3)
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Error in client-side-tool:", error);

        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

        // Check for timeout / connection errors (including from tool execution)
        const isTimeout =
            errorMessage.includes('IMAGE_TIMEOUT_ERROR') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('Connect Timeout') ||
            errorMessage.includes('Cannot connect to API') ||
            errorMessage.includes('firemoon.studio') ||
            errorMessage.includes('Failed after') ||
            errorMessage.includes('fetch image from URL') ||
            errorMessage.includes('blob.vercel-storage');

        if (isTimeout) {
            return Response.json({
                error: "Image generation timed out. The Firemoon service is experiencing connectivity issues. Please try again in a moment."
            }, { status: 504 });
        }

        return Response.json({ error: errorMessage }, { status: 500 });
    }
}

