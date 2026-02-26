
import { UIMessage, streamText, convertToModelMessages, tool, InferUITools, UIDataTypes , stepCountIs} from "ai";
import { google } from "@ai-sdk/google"


export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

const tools = {
    google_search: google.tools.googleSearch({})
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json()

        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages: await convertToModelMessages(messages),
            tools,
            stopWhen: stepCountIs(3)
        });

        return result.toUIMessageStreamResponse({sendSources: true})

    } catch (error) {
        console.log("Error Chatting:", error);
        
        // Check for rate limit / quota exceeded errors
        const errorMessage = error instanceof Error ? error.message : "";
        const isRateLimit = errorMessage.includes('quota') || 
                           errorMessage.includes('rate limit') ||
                           errorMessage.includes('exceeded');
        
        if (isRateLimit) {
            return Response.json({ 
                error: "API quota exceeded. Please wait a minute before trying again, or upgrade your plan for higher limits." 
            }, { status: 429 });
        }
        
        return Response.json({ error: "Failed To Chat" }, { status: 500 });
    }
}






