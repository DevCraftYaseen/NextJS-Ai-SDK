import { UIMessage, streamText, convertToModelMessages, tool, InferUITools, UIDataTypes, stepCountIs } from "ai";
import { google } from "@ai-sdk/google"
import { z } from "zod"

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>
const base_url = "http://api.weatherapi.com/v1"

const tools = {
    getWeather: tool({
        description: "use this to get weather data",
        inputSchema: z.object({
            city: z.string().describe("The city to get weather for")
        }),
        execute: async ({ city }) => {
            try {
                const response = await fetch(`${base_url}/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`)

                const data = await response.json()

                const weatherData = {
                    location: {
                        name: data.location.name,
                        country: data.location.country,
                        localtime: data.location.localtime,
                    },
                    current: {
                        temp_c: data.current.temp_c,
                        condition: {
                            text: data.current.condition.text,
                            code: data.current.condition.code,

                        },
                    }
                };

                return weatherData

            } catch (error) {
                console.error("Error fetching weather api")
            }
        }
    })
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: ChatMessage[] } = await req.json()

        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages: await convertToModelMessages(messages),
            tools,
            stopWhen: stepCountIs(2)
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
