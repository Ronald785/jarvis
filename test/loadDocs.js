import loadDocs from "../app/langchain/loadDocs.js";

const docs = await loadDocs(["Oi", "Olá mundo!"]);

console.log(docs);
console.log(docs[0].metadata);
console.log(docs[1].metadata);
