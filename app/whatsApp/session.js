import "dotenv/config";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import services from "../db/services.js";
import mongo from "../db/mongo.js";

import __dirname from "../utils/dirname.js";
import deleteFile from "../utils/deleteFile.js";
import bufferToMP3 from "../utils/bufferToMP3.js";

import chat from "../openai/chat.js";
import createTemplate from "../openai/template.js";
import audioToText from "../openai/audio.js";

import loadDocs from "../langchain/loadDocs.js";
import vectorStoreKnowledge from "../langchain/vectorStoreKnowledge.js";
import vectorStoreChat from "../langchain/vectorStoreChat.js";
import maxTokens from "../langchain/maxTokens.js";

const { Client, LocalAuth } = pkg;

class Session {
    clientData = null;

    constructor(myNumber, allowedNumbers) {
        this.myNumber = myNumber;
        this.allowedNumbers = allowedNumbers;
    }

    async initialize() {
        const authStrategy = this.createAuthStrategy();
        const puppeteer = this.getPuppeteerOptions();

        this.clientData = new Client({
            qrMaxRetries: 5,
            authStrategy,
            puppeteer,
            webVersionCache: {
                type: "remote",
                remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
            },
        });

        this.clientData.initialize();

        this.attachEventListeners();
    }

    sendPrivateMessage(numberOfContact, message) {
        this.clientData.sendMessage(numberOfContact + "@c.us", message);
    }

    createAuthStrategy() {
        return new LocalAuth({
            clientId: this.myNumber,
            dataPath: __dirname + `/sessions/${this.myNumber}`,
        });
    }

    getPuppeteerOptions() {
        return {
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-extensions",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
                "--disable-gpu",
            ],
            executablePath: "/usr/bin/google-chrome-stable",
        };
    }

    attachEventListeners() {
        this.clientData.on("qr", (qr) => this.displayQR(qr));
        this.clientData.on("ready", () => this.onClientReady());
        this.clientData.on("message", (message) => this.onMessage(message));
    }

    displayQR(qr) {
        qrcode.generate(qr, { small: true });
    }

    onClientReady() {
        console.log("Client is ready!");
    }

    async onMessage(message) {
        const { contact, contactChat } = await this.getContactInfo(message);

        if (!this.isAllowedContact(contact.number)) {
            await this.sendUnauthorizedMessage(contactChat, contact.number);
            return;
        }

        const handledMessage = await this.handleIncomingMessage(message);

        if (!handledMessage.allowed) {
            await this.sendUnsupportedMessage(contactChat, contact.number);
            return;
        }

        contactChat.sendStateTyping();

        const contactDoc = await services.getOrCreateContact(this.myNumber, contact.number, contactChat.name);

        try {
            await this.handledMessageType(handledMessage, contactDoc);
        } catch (error) {
            console.log(error);
        }
    }

    async getContactInfo(message) {
        const [contact, contactChat] = await Promise.all([message.getContact(), message.getChat()]);
        return { contact, contactChat };
    }

    isAllowedContact(contactNumber) {
        return this.allowedNumbers.includes(contactNumber);
    }

    async sendUnauthorizedMessage(contactChat, contactNumber) {
        await contactChat.sendStateTyping();
        this.sendPrivateMessage(contactNumber, "Você não tem permissão para usufruir da IA");
    }

    async sendUnsupportedMessage(contactChat, contactNumber) {
        await contactChat.sendStateTyping();
        this.sendPrivateMessage(contactNumber, "Formato de mensagem não suportado pela IA");
    }

    async handleIncomingMessage(message) {
        const response = {
            type: null,
            allowed: false,
        };

        if (message.type === "chat") {
            response.text = message.body;
            response.type = "text";
            response.allowed = true;
        } else if (message.type == "ptt" || message.type == "audio") {
            const mediaResponse = await this.processMedia(message);
            return mediaResponse;
        }
        return response;
    }

    async processMedia(message) {
        const response = {
            type: message.type,
            allowed: false,
        };

        const media = await message.downloadMedia();
        var buffer = Buffer.from(media.data, "base64");

        try {
            const { filename, path } = await bufferToMP3(buffer);
            response.allowed = true;
            response.filename = filename;
            response.path = path;
        } catch (error) {
            console.error("Error processing media:", error);
        }
        return response;
    }

    async handledMessageType(handledMessage, contactDoc) {
        switch (handledMessage.type) {
            case "text":
                await this.handleTextMessage(handledMessage.text, contactDoc);
                break;
            case "ptt":
                await this.handlePttMessage(handledMessage.path, contactDoc);
                break;
            case "audio":
                await this.handleAudioMessage(handledMessage.path, contactDoc.number);
                break;
            default:
                console.error("Unsupported message type:", handledMessage.type);
        }
    }

    async handleTextMessage(question, contactDoc) {
        const { info, relevant, lastMessages } = await processQuestion(question, contactDoc);

        const template = createTemplate(contactDoc.name, info, relevant, lastMessages);

        const messages = [
            { role: "system", content: template },
            { role: "user", content: question },
        ];

        const response = await chat.create({
            model: "gpt-3.5-turbo-0125",
            messages,
        });

        const responseAI = response.choices[0].message.content;

        this.sendPrivateMessage(contactDoc.number, responseAI);
        await updateDataChat(question, responseAI, contactDoc);
    }

    async handlePttMessage(path, contactDoc) {
        const question = await audioToText(path);

        const { info, relevant, lastMessages } = await processQuestion(question, contactDoc);

        const template = createTemplate(contactDoc.name, info, relevant, lastMessages);

        const messages = [
            { role: "system", content: template },
            { role: "user", content: question },
        ];

        const response = await chat.create({
            model: "gpt-3.5-turbo-0125",
            messages,
        });

        const responseAI = response.choices[0].message.content;

        this.sendPrivateMessage(contactDoc.number, responseAI);
        await updateDataChat(question, responseAI, contactDoc);
        await deleteFile(path);
    }

    async handleAudioMessage(path, contactNumber) {
        const audioTranscription = await audioToText(path);

        this.sendPrivateMessage(contactNumber, "Transcrição do Áudio: \n" + audioTranscription);
        await deleteFile(path);
    }
}

async function processQuestion(question, contactDoc) {
    const userExist = contactDoc.userExist;
    const allMessages = contactDoc.messages;
    const _id = contactDoc._id;

    let info = "";
    let relevant = "";
    let lastMessages = "";

    info = await loadEmbeddingsInfo(question);

    if (userExist) {
        const vectorStore = vectorStoreChat(_id);

        const [relevantDocs, lastMessagesDocs] = await Promise.all([
            loadRelevantDocs(vectorStore, question),
            loadLastMessages(allMessages),
        ]);

        const [splittedRelevant, splittedLastMessages] = await Promise.all([
            maxTokens(relevantDocs),
            maxTokens(lastMessagesDocs),
        ]);

        relevant = splittedRelevant;
        lastMessages = splittedLastMessages;
    }

    return { info, relevant, lastMessages };
}

async function loadEmbeddingsInfo(question) {
    let info = "";
    await mongo.client.connect();

    const infoDocs = await vectorStoreKnowledge.similaritySearch(question, 4);

    await mongo.client.close();

    if (infoDocs && infoDocs.length > 0) {
        info = infoDocs.map((doc) => doc.pageContent).join("\n");
    }

    return info;
}

async function loadRelevantDocs(vectorStore, question) {
    let relevant = "";

    await mongo.client.connect();

    const relevantDocs = await vectorStore.similaritySearch(question, 8);

    await mongo.client.close();

    if (relevantDocs && relevantDocs.length > 0) {
        relevant = relevantDocs.map((doc) => doc.pageContent).join("\n");
    }

    return relevant;
}

async function loadLastMessages(allMessages) {
    let lastMessages = "";

    if (allMessages && allMessages.length > 0) {
        const messagesToConsider = allMessages.slice(-8);
        lastMessages = messagesToConsider.map((message) => message.data).join("\n");
    }

    return lastMessages;
}

async function updateDataChat(question, response, contactDoc) {
    const userExist = contactDoc.userExist;
    const allMessages = contactDoc.messages;
    const _id = contactDoc._id;

    const newDocs = [
        { data: question, type: "user" },
        { data: response, type: "ai" },
    ];
    const newData = {
        $set: { messages: userExist ? allMessages.concat(newDocs) : newDocs },
    };

    const docs = await loadDocs(newDocs);

    await mongo.client.connect();

    const vectorStore = vectorStoreChat(_id);

    await Promise.all([vectorStore.addDocuments(docs), services.updateOneDocument({ _id }, newData)]);

    await mongo.client.close();
}

export default Session;
