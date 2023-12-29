import express from "express";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";

import db from "../database/surreal.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();
const router = express.Router();

// authorizeUrl
router.post("/api/auth/authorize", async (req, res) => {
	const user = (await db.query(`SELECT * FROM user WHERE username = "${req.body.login}"`))[0];
	if (user) {
		if (await bcrypt.compare(req.body.password, user.password)) {
			if(user.verified && !user.extras?.banned){
				if (user.session) {
					logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} session exists, deleting!`);
					await db.query(`DELETE session WHERE user.id = ${user.id}`);
				}
				const token = getRandomString(16);
				const session = (await db.create("session", {
					token: `${token}`,
					user: `${user.id}`,
					expires: (Date.now() + 60 * 60 * 1000)
				}))[0];
				logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} session created: ${session.id}!`);
				if(user.extras?.fakeUsername){
					const fakeUser = (await db.query(`SELECT * FROM user WHERE username = "${user.extras.fakeUsername}"`))[0];
					logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} is faked to ${user.extras.fakeUsername}!`);
					if(fakeUser){
						await db.merge(`${fakeUser.id}`, {
							session: `${session.id}`
						});
					}
					else{
						await db.merge(`${user.id}`, {
							session: `${session.id}`,
							info: {
								lastPlayed: Date.now()
							},
						});
					}
				}
				else {
					await db.merge(`${user.id}`, {
						session: `${session.id}`,
						info: {
							lastPlayed: Date.now()
						},
					});
					logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} assigned session!`);
				}
				const UserSession = await (await fetch(`${req.protocol}://${req.hostname}/api/user/token/${session.token}`)).json();
				logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} returning UserSession: ${JSON.stringify(UserSession)}`);
				return res.status(200).json(UserSession);
			}
			else {
				logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} is blocked!`);
				return res.json({ error: "Пользователь не верефицирован или заблокирован!", code: 403 });
			}
		}
		else {
			logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} wrong password!`);
			return res.json({ error: "Пароль не верен!", code: 400 });
		}
	}
	else {
		logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} not found!`);
		return res.json({ error: "Пользователь не найден", code: 400 });
	}
});

router.get("/api/user/token/:sessionToken", async (req, res) => {
	const token = req.params.sessionToken;
	const session = (await db.query(`SELECT * FROM session WHERE token = "${token}"`))[0];
	const user = (await db.query(`SELECT * FROM "${session.user}"`))[0];
	if (session) {
		const login = user.extras?.fakeUsername ? user.extras.fakeUsername : user.username;
		await db.merge(`${user.id}`, {
			extras: {
				fakeUsername: null
			}
		});
		const response = await fetch(`${req.protocol}://${req.hostname}/api/skin/${user.uuid}`);
		const md5Hash = CryptoJS.MD5(response).toString();
		const digest = CryptoJS.enc.Base64.parse(md5Hash).toString();
		const HttpUser = {
			"username": login,
			"uuid": user.uuid,
			"permissions": [],
			"roles": [
				"PLAYER"
			],
			"assets": {
				"SKIN": {
					"url": `${req.protocol}://${req.hostname}/api/skin/${user.uuid}.png`,
					"digest": digest,
					"metadata": {}
				}
			}
		};
		const UserSession = {
			"id": session.id.split(":")[1],
			"accessToken": session.token,
			"refreshToken": 0,
			"user": HttpUser,
			"expire": session.expires
		};
		logger.log("DEBUG", `[/api/user/token/:sessionToken] Session ${token} returning UserSession: ${JSON.stringify(UserSession)}`);
		return res.status(200).json(UserSession);
	}
	else {
		logger.log("DEBUG", `[/api/user/token/:sessionToken] Session ${token} not found!`);
		return res.json({ error: "Пользователь не найден", code: 400 });
	}
});

// getUserByUsernameUrl
router.get("/api/user/name/:username", async (req, res) => {
	const user = await (await db.query(`SELECT * FROM user WHERE username = "${req.params.username}"`))[0];
	if (user) {
		const response = await fetch(`${req.protocol}://${req.hostname}/api/skin/${user.uuid}`);
		const md5Hash = CryptoJS.MD5(response).toString();
		const digest = CryptoJS.enc.Base64.parse(md5Hash).toString();
		const userData = {
			"username": user.username,
			"uuid": user.uuid,
			"permissions": [],
			"roles": [
				"PLAYER"
			],
			"assets": {
				"SKIN": {
					"url": `${req.protocol}://${req.hostname}/api/skin/${user.uuid}.png`,
					"digest": digest,
					"metadata": {}
				}
			}
		};
		logger.log("DEBUG", `[/api/user/name/:username] User ${req.params.username} returning UserData: ${JSON.stringify(userData)}`);

		return res.status(200).json(userData);
	}
	else {
		logger.log("DEBUG", `[/api/user/name/:username] User ${req.params.username} not found!`);
		return res.json({ error: "Пользователь не найден", code: 400 });
	}
});

// getUserByUUIDUrl
router.get("/api/user/uuid/:uuid", async (req, res) => {
	const user = (await db.query(`SELECT * FROM user WHERE uuid = "${req.params.uuid}"`))[0];
	if(user){
		const userData = await (await fetch(`${req.protocol}://${req.hostname}/api/user/name/${user.username}`)).json();
		logger.log("DEBUG", `[/api/user/uuid/:uuid] User ${req.params.uuid} returning UserData: ${JSON.stringify(userData)}`);
		return res.status(200).json(userData);
	}
	else {
		logger.log("DEBUG", `[/api/user/uuid/:uuid] User ${req.params.uuid} not found!`);
		return res.json({ error: "Пользователь не найден", code: 400 });
	}
});

// getUserByTokenUrl
router.post("/api/user/current", async (req, res) => {
	const UserSession = await (await fetch(`${req.protocol}://${req.hostname}/api/user/token/${req.body.accessToken}`)).json();
	logger.log("DEBUG", `[/api/user/current] Token ${req.body.accessToken} returning UserSession: ${JSON.stringify(UserSession)}`);
	return res.status(200).json(UserSession);
});

// joinServerUrl
router.post("/api/server/joinServer", async (req, res) => {
	const user = (await db.query(`SELECT * FROM user WHERE uuid = "${req.body.uuid}"`))[0];
	if (user) {
		const session = (await db.query(`SELECT * FROM "${user.session}"`))[0];
		if(session && (session.token == req.body.accessToken)){
			await db.merge(`${user.id}`, {
				serverId: req.body.serverId
			});
			logger.log("DEBUG", `[/api/server/joinServer] User ${user.username} added serverId!`);
		}
	}
	else{
		logger.log("DEBUG", `[/api/server/joinServer] User ${user.username} not found!`);
	}
	return res.status(200).json({});
});

// checkServerUrl
router.post("/api/server/checkServer", async (req, res) => {
	const user = (await db.query(`SELECT * FROM user WHERE username = "${req.body.username}"`))[0];
	if(user){
		if(user.serverId == req.body.serverId){
			const userData = await (await fetch(`${req.protocol}://${req.hostname}/api/user/name/${user.username}`)).json();
			logger.log("DEBUG", `[/api/server/checkServer] User ${user.username} returning UserData: ${JSON.stringify(userData)}`);
			return res.status(200).json(userData);
		}
		else{
			logger.log("DEBUG", `[/api/server/checkServer] User ${user.username} server Ids are different: ${user.serverId} != ${req.body.serverId}!`);
			return res.json({ error: "Пользователь не найден", code: 400 });
		}
	}
	else{
		logger.log("DEBUG", `[/api/server/checkServer] User ${req.body.username} not found!`);
		return res.json({ error: "Пользователь не найден", code: 400 });
	}
});

const getRandomString = (length = 8) => {
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	let str = "";
	for (let i = 0; i < length; i++) {
		str += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return str;
};

export default router;