import express from "express";
import path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../database/surreal.js";

const router = express.Router();

var fileSendOptions = {
    root: path.resolve(__dirname, "..", "public")
}

router.get("/api/skin/:uuid", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.uuid}" OR username = "${req.params.uuid}"`);
    if (user) {
        res.sendFile(`/img/skin/${user.uuid}.png`, fileSendOptions, function (err) {
            if (err) {
                res.sendFile(`/img/skin/default.png`, fileSendOptions)
            }
        });
    }
    else {
        res.sendFile(`/img/skin/default.png`, fileSendOptions)
    }
});

router.get("/api/skin/head/:uuid", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.uuid}" OR username = "${req.params.uuid}"`);
    if (user) {
        res.sendFile(`/img/skin/${user.uuid}_head.png`, fileSendOptions, function (err) {
            if (err) {
                res.sendFile(`/img/skin/default_head.png`, fileSendOptions)
            }
        });
    }
    else {
        res.sendFile(`/img/skin/default_head.png`, fileSendOptions)
    }
});

export default router;