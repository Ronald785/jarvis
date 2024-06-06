import "dotenv/config";
import Session from "./app/whatsApp/session.js";

const session = new Session(process.env.MY_NUMBER, [
    process.env.ALLOWED_NUMBER_RONALD,
    process.env.ALLOWED_NUMBER_LETICIA,
    process.env.ALLOWED_NUMBER_JACKELINE,
]);

session.initialize();
