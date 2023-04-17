import express from "express";
import path from "path";
import {fileURLToPath} from "url";
import { Logger } from "./../utils/logger.js";

const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

let filePath = path.resolve(__dirname, "..", "public");

router.get("/download", async (req, res) => {
	res.download(`${filePath}/files/DisePVP.exe`, "DisePVP.exe", function (err) {
		if (err) {
			logger.log("ERROR", err);
			return res.render("error");
		}
	});
});

export default router;