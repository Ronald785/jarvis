import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import embeddings from "./embeddings.js";
import mongo from "../db/mongo.js";

const vectorstoreKnowledge = new MongoDBAtlasVectorSearch(embeddings, {
    collection: mongo.collectionKnowledge,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
});

export default vectorstoreKnowledge;
