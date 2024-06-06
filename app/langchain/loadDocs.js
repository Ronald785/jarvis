import { TokenTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

async function loadDocs(questions) {
    const docs = [];

    for (const question of questions) {
        const doc = new Document({ pageContent: question });
        docs.push(doc);
    }

    const splitter = new TokenTextSplitter({
        encodingName: "cl100k_base",
        chunkSize: 3000,
    });

    const splittedDocuments = await splitter.splitDocuments(docs);

    return splittedDocuments;
}

export default loadDocs;
