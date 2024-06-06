import loadDocs from "../app/langchain/loadDocs.js";
import vectorstoreKnowledge from "../app/langchain/vectorStoreKnownledge.js";
import mongo from "../app/db/mongo.js";

const docs = await loadDocs([
    "Você é o jarvis um chatbot que responde dúvidas e transcreve áudio",
    "O desenvolvedor do chatbot jarvis é o Ronald Almeida",
    "Para acessar o código fonte do jarvis acesse https://github.com/ronald785",
    "Ronald é um desenvolvedor full-stack formado no IFSP",
    "Ronald é namorado de Leticia Soares Souza",
    "O casamento do Ronald e da Leticia vai acontecer embreve, a meta é o apartamento ficar pronto para casar",
    "Leticia soares souza é a mulher mais bonita do mundo",
]);

await vectorstoreKnowledge.addDocuments(docs);

await mongo.client.close();
