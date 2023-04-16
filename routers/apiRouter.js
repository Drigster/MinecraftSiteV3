import express from "express";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";

import db from "../database/surreal.js";
import { Logger } from '../utils/logger.js';

const logger = new Logger();
const router = express.Router();

// authorizeUrl
router.post("/api/auth/authorize", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.login}"`);
    if (user) {
        if (await bcrypt.compare(req.body.password.password, user.password)) {
            if(user.verified && !user.extras?.banned){
                if (user.session) {
                    logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} session exists, deleting!`);
                    await db.query(`DELETE session WHERE user.id = ${user.id}`);
                }
                const token = getRandomString(16);
                const session = await db.create("session", {
                    token: `${token}`,
                    user: `${user.id}`,
                    expires: (Date.now() + 60 * 60 * 1000)
                });
                logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} session created: ${session.id}!`);
                if(user.extras?.fakeUsername){
                    const fakeUser = await db.queryFirst(`SELECT * FROM user WHERE username = "${user.extras.fakeUsername}"`);
                    logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} is faked to ${user.extras.fakeUsername}!`);
                    if(fakeUser){
                        await db.change(`${fakeUser.id}`, {
                            session: `${session.id}`
                        });
                    }
                    else{
                        await db.change(`${user.id}`, {
                            session: `${session.id}`,
                            info: {
                                lastPlayed: Date.now()
                            },
                        });
                    }
                }
                else {
                    await db.change(`${user.id}`, {
                        session: `${session.id}`,
                        info: {
                            lastPlayed: Date.now()
                        },
                    });
                    logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} assigned session!`);
                }
                const HttpUserSession = await fetch(`${req.protocol}://${req.hostname}/api/user/token/${session.token}`);
                const AuthReport = {
                    "minecraftAccessToken": session.token,
                    "oauthAccessToken": session.token,
                    "oauthRefreshToken": 0,
                    "oauthExpire": 0,
                    "session": await HttpUserSession.json()
                };
                logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} returning AuthReport: ${JSON.stringify(AuthReport)}`);
                return res.status(200).json(AuthReport);
            }
            else {
                logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} is blocked!`)
                return res.status(200).json({ error: "auth.userblocked" });
            }
        }
        else {
            logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} wrong password!`)
            return res.status(200).json({ error: "auth.wrongpassword" });
        }
    }
    else {
        logger.log("DEBUG", `[/api/auth/authorize] User ${req.body.login} not found!`)
        return res.status(404).json({ error: "auth.usernotfound" })
    }
});

router.get("/api/user/token/:sessionToken", async (req, res) => {
    const token = req.params.sessionToken;
    const session = await db.queryFirst(`SELECT * FROM session WHERE token = "${token}"`);
    const user = await db.queryFirst(`SELECT * FROM "${session.user}"`);
    if (session) {
        const login = user.extras?.fakeUsername ? user.extras.fakeUsername : user.username;
        await db.change(`${user.id}`, {
            extras: {
                fakeUsername: null
            }
        });
        const response = await fetch(`${req.protocol}://${req.hostname}/api/skin/${user.uuid}`);
        const md5Hash = CryptoJS.MD5(response).toString();
        const digest = CryptoJS.enc.Base64.parse(md5Hash).toString();
        console.log(digest);
        const HttpUser = {
            "username": login,
            "uuid": user.uuid,
            "accessToken": session.token,
            "permissions": {
                "perms": [],
                "roles": [
                    "PLAYER"
                ]
            },
            "assets": {
                "SKIN": {
                    "url": `${req.protocol}://${req.hostname}/api/skin/${user.uuid}.png`,
                    "digest": digest,
                    "metadata": {}
                },
                "CAPE": {}
            }
        };
        const HttpUserSession = {
            "id": session.id.split(":")[1],
            "user": HttpUser,
            "expireIn": session.expires
        };
        logger.log("DEBUG", `[/api/user/token/:sessionToken] Session ${token} returning HttpUserSession: ${JSON.stringify(HttpUserSession)}`);
        return res.status(200).json(HttpUserSession);
    }
    else {
        logger.log("DEBUG", `[/api/user/token/:sessionToken] Session ${token} not found!`);
        return res.status(404).json({ error: "auth.usernotfound" });
    }
});

// getUserByUsernameUrl
router.get("/api/user/name/:username", async (req, res) => {
    const user = await (db.queryFirst(`SELECT * FROM user WHERE username = "${req.params.username}"`));
    if (user) {
        const session = await db.queryFirst(`SELECT * FROM session WHERE user = "${user.id}"`);
        const response = await fetch(`${req.protocol}://${req.hostname}/api/skin/${user.uuid}`);
        const md5Hash = CryptoJS.MD5(response).toString();
        const digest = CryptoJS.enc.Base64.parse(md5Hash).toString();
        console.log(digest);
        const userData = {
            "username": user.username,
            "uuid": user.uuid,
            "accessToken": session.token,
            "permissions": {
                "perms": [],
                "roles": [
                    "PLAYER"
                ]
            },
            "assets": {
                "SKIN": {
                    "url": `${req.protocol}://${req.hostname}/api/skin/${user.uuid}.png`,
                    "digest": digest,
                    "metadata": {}
                },
                "CAPE": {}
            }
        };
        logger.log("DEBUG", `[/api/user/name/:username] User ${req.params.username} returning UserData: ${JSON.stringify(userData)}`);

        return res.status(200).json(userData);
    }
    else {
        logger.log("DEBUG", `[/api/user/name/:username] User ${req.params.username} not found!`);
        return res.status(404).json({ error: "auth.usernotfound" });
    }
});

// getUserByLoginUrl
router.get("/api/user/login/:login", async (req, res) => {
    const userData = await fetch(`${req.protocol}://${req.hostname}/api/user/name/${req.params.login}`);
    logger.log("DEBUG", `[/api/user/login/:login] User ${req.params.login} returning UserData: ${JSON.stringify(await userData.json())}`);
    return res.status(200).json(await userData.json());
});

// getUserByUUIDUrl
router.get("/api/user/uuid/:uuid", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.uuid}"`);
    if(user){
        const userData = await (await fetch(`${req.protocol}://${req.hostname}/api/user/name/${user.username}`)).json();
        logger.log("DEBUG", `[/api/user/uuid/:uuid] User ${req.params.uuid} returning UserData: ${JSON.stringify(userData)}`);
        return res.status(200).json(userData);
    }
    else {
        logger.log("DEBUG", `[/api/user/uuid/:uuid] User ${req.params.uuid} not found!`);
        return res.status(404).json({ error: "auth.usernotfound" });
    }
});

// getUserByTokenUrl
router.get("/api/user/current", async (req, res) => {
    let token = req.get("Authorization");
    token = token.split(" ");
    if (token[0] == "Bearer") {
        const session = await db.queryFirst(`SELECT * FROM session WHERE token = "${token[1]}"`);
        if (session) {
            const user = await db.queryFirst(`SELECT * FROM "${session.user}"`);
            const userData = await fetch(`${req.protocol}://${req.hostname}/api/user/name/${user.username}`);
            const HttpUserSession = {
                "id": session.id.split(":")[1],
                "user": await userData.json(),
                "expireIn": session.expires
            };
            await db.change(`${user.id}`, {
                session: `${session.id}`,
                info: {
                    lastPlayed: Date.now()
                },
            });
            logger.log("DEBUG", `[/api/user/current] Session with token ${token[1]} returning HttpUserSession: ${JSON.stringify(HttpUserSession)}`);
            return res.status(200).json(HttpUserSession);
        }
        else {
            logger.log("DEBUG", `[/api/user/current] Session with token ${token[1]} not found!`);
            return res.status(404).json({ error: "auth.usernotfound" });
        }
    }
    else {
        logger.log("DEBUG", `[/api/user/current] Token is expected!`);
        return res.status(200).json({ error: "auth.invalidtoken" })
    }
});

// getAuthDetails
router.get("/api/auth/details", async (req, res) => {
    const details = {
        "details": [
            {
                "type": "password"
            }
        ]
    }
    logger.log("DEBUG", `[/api/auth/details] Returning AuthDetails: ${JSON.stringify(details)}`);
    return res.status(200).json(details);
});

// joinServerUrl
router.post("/api/server/joinServer", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if (user) {
        const session = await db.queryFirst(`SELECT * FROM "${user.session}"`);
        if(session && (session.token == req.body.accessToken)){
            let newUser = await db.change(`${user.id}`, {
                serverId: req.body.serverId
            });
            logger.log("DEBUG", `[/api/server/joinServer] User ${req.body.username} added serverId!`);
        }
    }
    else{
        logger.log("DEBUG", `[/api/server/joinServer] User ${req.body.username} not found!`);
    }
    return res.status(200).json();
});

// checkServerUrl
router.post("/api/server/checkServer", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(user){
        if(user.serverId == req.body.serverId){
            const userData = await (await fetch(`${req.protocol}://${req.hostname}/api/user/name/${user.username}`)).json();
            logger.log("DEBUG", `[/api/server/checkServer] User ${req.body.username} returning UserData: ${JSON.stringify(userData)}`);
            return res.status(200).json(userData);
        }
        else{
            logger.log("DEBUG", `[/api/server/checkServer] User ${req.body.username} server Ids are different: ${user.serverId} != ${req.body.serverId}!`);
            return res.status(404).json({ error: "auth.usernotfound" });
        }
    }
    else{
        logger.log("DEBUG", `[/api/server/checkServer] User ${req.body.username} not found!`);
        return res.status(404).json({ error: "auth.usernotfound" });
    }
});

const getRandomString = (length = 8) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
};

export default router;