import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import embeddings from "./embeddings.js";
import mongo from "../db/mongo.js";

const vectorStoreChat = (id) => {
    return new MongoDBAtlasVectorSearch(embeddings, {
        collection: mongo.collectionChat,
        indexName: "vector_index_chat",
        textKey: id,
        embeddingKey: "embedding",
    });
};

export default vectorStoreChat;
