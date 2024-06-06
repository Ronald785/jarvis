import "dotenv/config";
import db from "./mongo.js";
import { ObjectId } from "mongodb";

async function getOrCreateContact(myNumber, number, name) {
    try {
        await db.client.connect();

        const existingDoc = await db.collectionContact.findOne({ myNumber, number });

        if (existingDoc) {
            existingDoc.userExist = true;
            return existingDoc;
        } else {
            const newDoc = {
                _id: new ObjectId(),
                myNumber,
                number,
                name,
                createdAt: new Date(),
                messages: [],
            };

            await db.collectionContact.insertOne(newDoc);
            newDoc.userExist = false;

            return newDoc;
        }
    } catch (err) {
        console.error(`Error- getOrCreateContact: `, err);
        return [];
    } finally {
        await db.client.close();
    }
}

async function updateOneDocument(query, data) {
    try {
        await db.client.connect();
        const response = await db.collectionContact.updateOne(query, data);
        return response;
    } catch (err) {
        console.error("ERROR - updateOneDocument: ", err);
    } finally {
        await db.client.close();
    }
}

const operations = { getOrCreateContact, updateOneDocument };

export default operations;
