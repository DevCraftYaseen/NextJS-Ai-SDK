import { streamText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()
        const result = streamText({
            model: google('gemini-2.5-flash-lite'),
            messages: [
                {
                    role: "system",
                    content: "You are a helpful coding assistant. Keep responses under 2 sentences and focus on usefull and required information only."
                },
            ],
            prompt,
        });

        // result.usage.then((usage) => {
        //     console.log({
        //         inputTokens: usage.inputTokens,
        //         outputTokens: usage.outputTokens,
        //         totalTokens: usage.totalTokens,
        //     })
        // })

        // In AI SDK v6, useCompletion uses the UI message stream protocol by default.
        // toUIMessageStreamResponse() converts the streamText result into this protocol,
        // sending structured chunks that useCompletion parses into the `completion` string.
        // Note: toTextStreamResponse() does NOT work here — it sends raw text that
        // the v6 useCompletion hook can't parse, resulting in a blank response.
        return result.toUIMessageStreamResponse()
        
    } catch (error) {
        console.log("Error Streaming text:", error)
        return new Response("Failed To Stream text", {status: 500})
    }
}

