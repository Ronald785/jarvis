import { TokenTextSplitter } from "langchain/text_splitter";

async function splitText(text) {
    const splitter = new TokenTextSplitter({
        encodingName: "cl100k_base",
        chunkSize: 3000,
    });

    const splittedText = await splitter.createDocuments([text]);

    return splittedText;
}

async function maxTokens(text) {
    const splittedText = await splitText(text);

    const docs = [];

    for (const doc of splittedText) {
        docs.push(doc.pageContent);
    }

    const doc = docs[0];

    return doc;
}

export default maxTokens;
