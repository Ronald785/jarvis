import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
});

export default embeddings;
