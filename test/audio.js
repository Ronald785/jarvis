import audioToText from "../app/openai/audio.js";
import __dirname from "../app/utils/dirname.js";

const response = await audioToText("./test/data/audio.mp3");

console.log(response);
