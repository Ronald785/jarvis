import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { ObjectId } from "mongodb";
import __dirname from "../utils/dirname.js";

async function convertBufferToMP3(buffer) {
    return new Promise((resolve, reject) => {
        const filename = new ObjectId() + ".mp3";
        const outputPath = __dirname + "/audios/" + filename;

        const tempFilePath = __dirname + "/audios/" + new ObjectId() + "_temp" + ".mp3";
        fs.writeFileSync(tempFilePath, buffer);

        ffmpeg(tempFilePath)
            .toFormat("mp3")
            .audioBitrate("16k")
            .audioFrequency(8000)
            .audioChannels(1)
            .on("error", (err) => {
                fs.unlinkSync(tempFilePath);
                reject(err);
            })
            .on("end", () => {
                fs.unlinkSync(tempFilePath);
                resolve({ filename, path: outputPath });
            })
            .saveToFile(outputPath);
    });
}

export default convertBufferToMP3;
