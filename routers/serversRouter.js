import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { Logger } from "./../utils/logger.js";
import db from "../database/surreal.js";

const router = express.Router();
const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileUploadPath = path.resolve(__dirname, "..", "public", "img", "server");

router.get("/server/:name", async (req, res) => {
	const server = await db.queryFirst(`SELECT * FROM server WHERE name = "${req.params.name}"`);
	if(server){
		const serverModsRaw = await db.queryFirst(`SELECT mods.link, mods.name, mods.type FROM ${server.id}`);
		const serverMods = [];
		for(let i = 0; i < serverModsRaw.mods.name.length; i++) {
			if(serverModsRaw.mods.name[i] == null){
				continue;
			}
			const name = serverModsRaw.mods.name[i];
			const link = serverModsRaw.mods.link[i];
			const type = serverModsRaw.mods.type[i];
			serverMods.push({
				name,
				link,
				type
			});
		}
		server.mods = serverMods;
		const mods = await db.select("mod");
		server.mods.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
		mods.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
		
		if(server){
			return res.render("server", { server, mods });
		}
		else {
			return res.render("error");
		}
	} else {
		return res.render("error");
	}
});

router.post("/server/add", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	
	let err = false;

	if(req.files && req.files.icon){
		if(await req.files.icon.mimetype == "image/png"){
			let filePath = path.resolve(fileUploadPath, req.body.name + ".png");
			req.files.icon.mv(filePath, (err) => {
				if(err){
					req.session.error = "Ошибка сервера, попробуйте позже!";
					err = true;
				}
			});
		}
		else{
			req.session.error = "Формат файла может быть только PNG!";
			err = true;
		}
	}
	else{
		req.session.error = "Картинка сервера не найдена!";
		err = true;
	}
	
	if(!err){
		await db.create("server", {
			name: req.body.name,
			version: req.body.version,
			description: req.body.description,
			status: 0,
			mods: [],
			ip: req.body.ip,
			port: req.body.port,
			icon: `/img/server/${req.body.name}.png`
		});
		req.session.success = "Сервер успешно создан!";
	}
	return res.redirect("/admin");
});

router.post("/server/addMod", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	if(req.body.modName != undefined) {
		const server = await db.queryFirst(`SELECT * FROM server WHERE name = "${req.body.server}"`);
		const mod = await db.queryFirst(`SELECT * FROM mod WHERE name = "${req.body.modName}"`);
		logger.log(server);
		logger.log(server.mods);
		server.mods.push(mod.id);
		await db.change("server", {
			mods: server.mods
		});
		return res.redirect(`/server/${server.name}`);
	}
	else if(req.body.name != undefined) {
		const server = await db.queryFirst(`SELECT * FROM server WHERE name = "${req.body.server}"`);
		const mod = await db.create("mod", {
			name: req.body.name,
			link: req.body.link,
			type: req.body.type
		});
		server.mods.push(mod.id);
		await db.change("server", {
			mods: server.mods
		});
		return res.redirect(`/server/${server.name}`);
	}
	else {
		console.log(JSON.stringify(req.body));
		return res.send("error");
	}
});

router.post("/mod/add", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	await db.create("mod", {
		name: req.body.name,
		link: req.body.link
	});
	return res.redirect("/admin");
});

router.get("/mods", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	const mods = await db.select("mod");
	return res.render("mods", { mods });
});

export default router;