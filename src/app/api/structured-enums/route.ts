import { generateObject } from "ai";
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        const result = generateObject({
            model: google('gemini-2.5-flash-lite'),
            output: 'enum',
            enum: ['positive', 'negative', 'neutral'],
            prompt: `Cliassify the sentiment in this ${text}`,
        })

        return (await result).toJsonResponse();
    } catch (error) {
        console.log("Error Streaming response:", error)
        return new Response("Failed To Stream response", { status: 500 })
    }
}