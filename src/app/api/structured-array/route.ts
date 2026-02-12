import { streamObject } from "ai";
import { pokemonSchema } from "./schema";
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
    try {
        const { type } = await req.json();
        const result = streamObject({
            model: google('gemini-2.5-flash-lite'),
            output: 'array',
            schema: pokemonSchema,
            prompt: `Generate a list of 5 : ${type} type pokemon.`,
        })

        return result.toTextStreamResponse();
    } catch (error) {
        console.log("Error Streaming response:", error)
        return new Response("Failed To Stream response", { status: 500 })
    }
}