
import { UIMessage, streamText, convertToModelMessages, tool, InferUITools, UIDataTypes , stepCountIs} from "ai";
import { createMCPClient } from "@ai-sdk/mcp"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { google } from "@ai-sdk/google"
import { z } from "zod"

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

const tools = {
    getWeather: tool({
        description: "use this to get weather data",
        inputSchema: z.object({
            city: z.string().describe("The city to get weather for")
        }),
        execute: async ({ city }) => {
            if (city == "Karachi") return "52 and sunny"
            else if (city == "Islamabad") return "35 and cloudy"
            else return "Unknown City"
        }
    })
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json()

        const httpTransport = new StreamableHTTPClientTransport(
            new URL("https://app.mockmcp.com/servers/HlbmcJLKfkUW/mcp"), {
                requestInit: {
                    headers: {
                        Authorization: process.env.MCP_AUTH_TOKEN as string
                    },
                }
            }
        )


        const mcpClient = await createMCPClient({
            transport: httpTransport
        })


        const mcpTools = await mcpClient.tools()

        const result = streamText({
            model: google('gemini-2.5-flash-lite'),
            messages: await convertToModelMessages(messages),
            tools: {...mcpTools, ...tools},
            stopWhen: stepCountIs(3),
            // Super important to close mcpClient
            onFinish: async () => {
                await mcpClient.close()
            },
            onError: async (error) => {
                await mcpClient.close()
                console.error("Error during streaming", error)
            }
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






