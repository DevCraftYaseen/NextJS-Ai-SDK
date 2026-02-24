
import { UIMessage, streamText, convertToModelMessages, tool, InferUITools, UIDataTypes , stepCountIs} from "ai";
import { google } from "@ai-sdk/google"
import { z } from "zod"

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

const tools = {
    
    getLocation: tool({
        description: "Call this when you want to know location of a person/user or famous object",
        inputSchema: z.object({
            input: z.string().describe("The person/user or famous object to get location of")
        }),
        execute: async ({input}) => {
            if (input == "Minar-e-Pakistan") {
                return "Lahore"
            } else if (input == "Imran Khan") {
                return "Islamabad"
            } else {
                return "Unknown Input"
            }
        }
    }),
    getWeather: tool({
        description: "use this to get weather data",
        inputSchema: z.object({
            city: z.string().describe("The city to get weather for")
        }),
        execute: async ({ city }) => {
            if (city == "Lahore") return "52 and sunny"
            else if (city == "Islamabad") return "35 and cloudy"
            else return "Unknown City"
        }
    }),
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json()

        const result = streamText({
            model: google('gemini-2.5-flash-lite'),
            messages: await convertToModelMessages(messages),
            tools,
            stopWhen: stepCountIs(4)
        });

        return result.toUIMessageStreamResponse()

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






