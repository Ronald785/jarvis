import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function audioToText(path) {
    const translation = await openai.audio.transcriptions.create({
        file: fs.createReadStream(path),
        model: "whisper-1",
    });

    return translation.text;
}

export default audioToText;
