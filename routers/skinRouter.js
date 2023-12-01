import express from "express";
import path from "path";
import {fileURLToPath} from "url";
import Jimp from "jimp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../database/surreal.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();
const router = express.Router();

var fileSendOptions = {
	root: path.resolve(__dirname, "..", "public")
};

const fileUploadPath = path.resolve(__dirname, "..", "public", "img", "skin");

router.get("/api/skin/:user", getUserSkin);

async function getUserSkin(req, res) {
	if(req.params.user.endsWith(".png")){
		req.params.user = req.params.user.replace(".png", "");
	}
	const user = (await db.query(`SELECT * FROM user WHERE uuid = "${req.params.user}" OR username = "${req.params.user}"`))[0];
	if (user) {
		res.sendFile(`/img/skin/${user.uuid}.png`, fileSendOptions, function (err) {
			if (err) {
				res.sendFile("/img/skin/default.png", fileSendOptions);
			}
		});
	}
	else {
		res.sendFile("/img/skin/default.png", fileSendOptions);
	}
}

router.get("/api/skin/head/:user", getUserHeadSkin);

async function getUserHeadSkin(req, res) {
	if(req.params.user.endsWith(".png")){
		req.params.user = req.params.user.replace(".png", "");
	}
	const user = (await db.query(`SELECT * FROM user WHERE uuid = "${req.params.user}" OR username = "${req.params.user}"`))[0];
	if (user) {
		res.sendFile(`/img/skin/${user.uuid}_head.png`, fileSendOptions, function (err) {
			if (err) {
				res.sendFile("/img/skin/default_head.png", fileSendOptions);
			}
		});
	}
	else {
		res.sendFile("/img/skin/default_head.png", fileSendOptions);
	}
}

router.post("/api/upload/skin", async (req, res) => {
	if(!req.jwt.payload.user.uuid){
		return res.redirect("/logout");
	}
	if(req.files && req.files.skin){
		if(await req.files.skin.mimetype == "image/png"){
			let filePath = path.resolve(fileUploadPath, req.jwt.payload.user.uuid + ".png");
			req.files.skin.mv(filePath, (err) => {
				if(err){
					logger.log("ERROR", "File upload error: " + err);
					logger.log("ERROR", "User: " + req.jwt.payload.user.username);
					req.session.error = "Ошибка сервера, попробуйте позже!";
				}
    
				req.session.success = "Скин успешно изменён";
                
				Jimp.read(filePath, (err, skin) => {
					if (err) {
						logger.log("ERROR", "Head create error: " + err);
						logger.log("ERROR", "User: " + req.jwt.payload.user.username);
						req.session.error = "Ошибка создания аватара, попробуйте позже!";
					}
					skin.crop(8, 8, 8, 8)
						.resize(128, 128, Jimp.RESIZE_NEAREST_NEIGHBOR)
						.write(path.resolve(fileUploadPath, req.jwt.payload.user.uuid + "_head.png")); // save
				});
			});
		}
		else{
			req.session.error = "Формат файла может быть только PNG!";
		}
	}
	else{
		req.session.error = "Файл не найден!";
	}

	return res.redirect("/profile");
});

router.post("/api/delete/skin", async (req, res) => {
	if(!req.jwt.payload.user.uuid){
		return res.redirect("/logout");
	}
	if(req.files && req.files.skin){
		if(await req.files.skin.mimetype == "image/png"){
			let filePath = path.resolve(fileUploadPath, req.jwt.payload.user.uuid + ".png");
			req.files.skin.mv(filePath, (err) => {
				if(err){
					logger.log("ERROR", "File upload error: " + err);
					logger.log("ERROR", "User: " + req.jwt.payload.user.username);
					req.session.error = "Ошибка сервера, попробуйте позже!";
				}
                
				req.session.success = "Скин успешно изменён";
                
				Jimp.read(filePath, (err, skin) => {
					if (err) {
						logger.log("ERROR", "Head create error: " + err);
						logger.log("ERROR", "User: " + req.jwt.payload.user.username);
						req.session.error = "Ошибка создания аватара, попробуйте позже!";
					}
					skin.crop(8, 8, 8, 8)
						.resize(128, 128, Jimp.RESIZE_NEAREST_NEIGHBOR)
						.write(path.resolve(fileUploadPath, req.jwt.payload.user.uuid + "_head.png")); // save
				});
			});
		}
		else{
			req.session.error = "Формат файла может быть только PNG!";
		}
	}
	else{
		req.session.error = "Файл не найден!";
	}

	return res.redirect("/profile");
});

export default router;