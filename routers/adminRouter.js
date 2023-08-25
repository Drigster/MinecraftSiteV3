import express from "express";
import { SkinViewer } from "skinview3d";

import db from "../database/surreal.js";

const router = express.Router();

router.get("/admin", async (req, res) => {
	if(!req.jwt.valid){
		return res.render("error");
	}
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error", { error: { status: 418, message: "I'm a Teapot" } });
	}
	const users = await db.select("user");
	users.sort((a, b) => parseInt(a.info.regDate) - parseFloat(b.info.regDate));
	const servers = await db.select("server");
	return res.render("admin", { users, servers });
});

router.post("/admin/ban", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
	if(user){
		await db.merge(user.id, {
			extras: {
				banned: true
			}
		});
	}
	return res.redirect("/profile/" + req.body.username);
});

router.post("/admin/unban", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
	if(user){
		await db.merge(user.id, {
			extras: {
				banned: false
			}
		});
	}
	return res.redirect("/profile/" + req.body.username);
});

router.post("/admin/verify", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	} 
	const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
	if(user){
		await db.merge(user.id, {
			verified: true
		});
	}
	return res.redirect("/profile/" + req.body.username);
});

router.post("/admin/fake", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	} 
	const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
	if(user){
		await db.merge(user.id, {
			extras: {
				fakeUsername: req.body.fakeUsername
			}
		});
	}
	return res.redirect("/profile/" + req.body.username);
});

router.get("/profile/:user", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.user}" OR username = "${req.params.user}"`);
	if(user){
		return res.render("adminProfile", { SkinViewer: SkinViewer, user: user });
	}
	else {
		return res.render("error");
	}
});

export default router;