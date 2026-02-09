import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt,
        });

        return Response.json({ text })
        
    } catch (error) {
        console.log("Error Generating text:", error)
        return Response.json({
            error: "Failed To generate text"
        })
    }
}

