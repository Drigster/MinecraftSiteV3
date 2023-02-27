import express from "express";
import bcrypt from "bcrypt";

import db from "../database/surreal.js";

const router = express.Router();

// authorizeUrl
router.post("/api/auth/authorize", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.login}"`);
    if (user) {
        if (await bcrypt.compare(req.body.password.password, user.password)) {
            if(user.verified){
                if (user.session) {
                    await db.query(`DELETE session WHERE user.id = ${user.id}`)
                }
                const token = getRandomString(16);
                const session = await db.create("session", {
                    token: `${token}`,
                    user: `${user.id}`,
                    expires: (Date.now() + 60 * 60 * 1000)
                });
                await db.change(`${user.id}`, {
                    session: `${session.id}`
                });
                const HttpUserSession = await fetch(`${process.env.BASE_URL}/api/user/token/${session.token}`);
                const AuthReport = {
                    "minecraftAccessToken": session.token,
                    "oauthAccessToken": session.token,
                    "oauthRefreshToken": 0,
                    "oauthExpire": 0,
                    "session": await HttpUserSession.json()
                };
                res.status(200).json(AuthReport);
            }
            else {
                res.status(200).json({ error: "auth.require2fa" });
            }
        }
        else {
            res.status(200).json({ error: "auth.wrongpassword" });
        }
    }
    else {
        res.status(404).json({ error: "auth.usernotfound" })
    }
});

router.get("/api/user/token/:sessionToken", async (req, res) => {
    const token = req.params.sessionToken;
    const session = await db.queryFirst(`SELECT * FROM session WHERE token = "${token}"`);
    const user = await db.queryFirst(`SELECT * FROM "${session.user}"`);
    if (session) {
        const HttpUser = {
            "username": user.username,
            "uuid": user.uuid,
            "accessToken": session.token,
            "permissions": {
                "perms": [
                    "launchserver.*",
                    "launcher.*"
                ],
                "roles": [
                    "PLAYER"
                ]
            },
            "assets": {
                "SKIN": {
                    "url": `${process.env.BASE_URL}/api/skin/${user.uuid}`,
                    "digest": "",
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

        res.status(200).json(HttpUserSession);
    }
    else {
        res.status(404).json({ error: "auth.usernotfound" });
    }
});

// getUserByUsernameUrl
router.get("/api/user/name/:username", async (req, res) => {
    const user = await (db.queryFirst(`SELECT * FROM user WHERE username = "${req.params.username}"`));
    const session = await db.queryFirst(`SELECT * FROM session WHERE user = "${user.id}"`);
    if (user) {
        const userData = {
            "username": user.username,
            "uuid": user.uuid,
            "accessToken": session.token,
            "permissions": {
                "perms": [
                    "launchserver.*",
                    "launcher.*"
                ],
                "roles": [
                    "PLAYER"
                ]
            },
            "assets": {
                "SKIN": {
                    "url": `${process.env.BASE_URL}/api/skin/${user.uuid}`,
                    "digest": "",
                    "metadata": {}
                },
                "CAPE": {}
            }
        };

        res.status(200).json(userData);
    }
    else {
        res.status(404).json({ error: "auth.usernotfound" });
    }
});

// getUserByLoginUrl
router.get("/api/user/login/:login", async (req, res) => {
    const userData = await fetch(`${process.env.BASE_URL}/api/user/name/${req.params.login}`);
    res.status(200).json(await userData.json());
});

// getUserByUUIDUrl
router.get("/api/user/uuid/:uuid", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.uuid}"`);
    const userData = await fetch(`${process.env.BASE_URL}/api/user/name/${user.username}`);
    res.status(200).json(await userData.json());
});

// getUserByTokenUrl
router.get("/api/user/current", async (req, res) => {
    let token = req.get("Authorization");
    token = token.split(" ");
    if (token[0] == "Bearer") {
        const session = await db.queryFirst(`SELECT * FROM session WHERE token = "${token[1]}"`);
        if (session) {
            const user = await db.queryFirst(`SELECT * FROM "${session.user}"`);
            const userData = await fetch(`${process.env.BASE_URL}/api/user/name/${user.username}`);
            const HttpUserSession = {
                "id": session.id.split(":")[1],
                "user": await userData.json(),
                "expireIn": session.expires
            };
            res.status(200).json(HttpUserSession);
        }
        else {
            res.status(404).json({ error: "auth.usernotfound" });
        }
    }
    else {
        res.status(200).json({ error: "auth.invalidtoken" })
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
    res.status(200).json(details);
});

// joinServerUrl
router.post("/api/server/joinServer", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if (user) {
        const session = await db.queryFirst(`SELECT * FROM "${user.session}"`);
        if(session && session.token == req.body.accessToken){
            await db.change(`${user.id}`, {
                serverId: req.body.serverId
            });
        }
    }
    res.status(200).json();
});

// checkServerUrl
router.post("/api/server/checkServer", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(user){
        if(user.serverId == req.body.serverId){
            const userData = await fetch(`${process.env.BASE_URL}/api/user/name/${user.username}`);
            res.status(200).json(await userData.json());
        }
        else{
            res.status(404).json({ error: "auth.usernotfound" });
        }
    }
    else{
        res.status(404).json({ error: "auth.usernotfound" });
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