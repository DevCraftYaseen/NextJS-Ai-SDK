
import { UIMessage, streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json()

        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages: [
                {
                    role: "system",
                    content: "You are a helpful coding assistant. Keep responses under 3 sentences and focus on practical examples."
                    // content: "You are a helpful clerk. You create a unique id, guess an age and give a nick name based on the username. You just reply what they need in the shortest possible way"
                },
                // {
                //     role: "user",
                //     content: "give me 1 unique data with name Yaseen Khan"
                // }, 
                // {
                //     role: "assistant",
                //     content: "{'id': 1, 'name': 'Yaseen Khan', 'age' : 21, 'nickName': 'YKhan'}"
                // },
                ... await convertToModelMessages(messages)
            ]
        });

        return result.toUIMessageStreamResponse()

    } catch (error) {
        console.log("Error Chatting:", error)
        return new Response("Failed To Chat", { status: 500 })
    }
}






