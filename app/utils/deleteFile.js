import fs from "fs";
import __dirname from "./dirname.js";

function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                // console.log(`Arquivo ${path} excluído com sucesso.`);
                resolve();
            }
        });
    });
}

export default deleteFile;
