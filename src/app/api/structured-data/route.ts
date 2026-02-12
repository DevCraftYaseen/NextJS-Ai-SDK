import { streamObject } from "ai";
import { recipeSchema } from "./schema";
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
    try {
        const { dish } = await req.json();
        const result = streamObject({
            model: google('gemini-2.5-flash-lite'),
            schema: recipeSchema,
            prompt: `Generate a recipe for : ${dish}`,
        })

        return result.toTextStreamResponse();
    } catch (error) {
        console.log("Error Streaming response:", error)
        return new Response("Failed To Stream response", { status: 500 })
    }
}