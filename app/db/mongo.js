import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.MONGO_DB);

const collectionContact = db.collection(process.env.MONGO_COLLECTION_CONTACT);
const collectionChat = db.collection(process.env.MONGO_COLLECTION_VECTOR_STORE);
const collectionKnowledge = db.collection(process.env.MONGO_COLLECTION_KNOWLEDGE);

const mongo = { client, collectionContact, collectionChat, collectionKnowledge };

export default mongo;
