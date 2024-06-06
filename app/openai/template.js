function createTemplate(name, info, relevant, last_messages) {
    const day = getCurrentDate();
    const template = `
        Sistema: 
        Você é o Jarvis, um chatbot que responde dúvidas.
        Quando for responder escreva somente a resposta final, não escreva "Resposta: ..."

        Dia de hoje: ${day}
        Nome do usuário: ${name}

        Informações do chatbot: 
        ${info}

        Bate papo Relevante:
        ${relevant}

        Ultimas mensagens pelo usuário e o chatbot: 
        ${last_messages}
    `;

    return template;
}

function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
}

export default createTemplate;
