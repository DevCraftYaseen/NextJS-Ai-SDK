import { createFiremoon } from '@firemoon/ai-provider';
import { generateImage } from 'ai';

const firemoon = createFiremoon({
    apiKey: process.env.FIREMOON_API_KEY,
});

export async function POST(req: Request) {
    const { prompt } = await req.json();

    try {
        const { image } = await generateImage({
            model: firemoon.image('flux/dev'),
            prompt,
            aspectRatio: '16:9',
        });

        return Response.json(image.base64)
    } catch (error) {
        console.log("Error generating image:", error);
        return Response.json({ error: "Failed To Generate Image" }, { status: 500 });
    }
}

