import chat from "../app/openai/chat.js";

const response = await chat.create({
    model: "gpt-3.5-turbo-0125",
    messages: [{ role: "user", content: "oi" }],
});

console.log(response.choices[0].message.content);
