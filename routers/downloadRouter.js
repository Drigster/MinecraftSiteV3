import express from "express";
import path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

let filePath = path.resolve(__dirname, "..", "public");

router.get("/download", async (req, res) => {
    res.download(`${filePath}/files/DisePVP.exe`, "DisePVP.exe", function (err) {
        if (err) {
            console.log(err);
            return res.render("error")
        }
    });
});

export default router;