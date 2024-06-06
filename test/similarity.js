import vectorstoreKnowledge from "../app/langchain/vectorStoreKnownledge.js";
import mongo from "../app/db/mongo.js";

const response = await vectorstoreKnowledge.similaritySearch("jarvis", 3);

console.log(response);

await mongo.client.close();
