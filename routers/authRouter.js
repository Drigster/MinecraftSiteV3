import express from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import jwt from 'jwt-express';
import { SkinViewer } from "skinview3d";

import db from "../database/surreal.js";
import { sendVerificationToken, verifyVerificationToken } from "../utils/utils.js";

const router = express.Router();

router.get("/register", (req, res) => {
    return res.render("register");
});

router.post("/register", async (req, res) => {
    const usernameRegex = new RegExp("^[A-Za-z0-9_]{3,16}$");
    if(!req.body.username && !req.body.email && !req.body.password && !req.body.password2){
        req.session.error = "Пожалуйста заполните все поля!";
        return res.redirect("register");
    }
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    const emailCheck = await db.queryFirst(`SELECT * FROM user WHERE email = "${req.body.email}"`);
    
    if(!usernameRegex.test(req.body.username)){
        req.session.error = "Никнейм имеет недопустимые символы!";
    }
    else if(user){
        req.session.error = "Профиль с таким никнеймом уже существует!";
    }
    else if(emailCheck){
        req.session.error = "Эта почта занята!";
    }
    else if(req.body.password.length < 6){
        req.session.error = "Пароль слишком короткий(минимум: 6)!";
    }
    else if(req.body.password != req.body.password2){
        req.session.error = "Пароли не совподают!";
    }
    else{
        await db.create("user", {
            uuid: uuid(),
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            email: req.body.email,
            verfied: false,
            permissions: [
                "user"
            ],
            info: {
                regDate: Date.now(),
                lastPlayed: -1
            }
        });
        sendVerificationToken(req.body.email, "verify");
        return res.redirect("login");
    }
    req.session.save();
    return res.redirect("register");
});

router.get("/login", (req, res) => {
    return res.render("login");
});

router.post("/login", async (req, res) => {
    if(!req.body.username && !req.body.password){
        req.session.error = "Пожалуйста заполните все поля!";
        return res.redirect("register");
    }
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(!user){
        req.session.error = "Пользователь не найден!";
    }
    else if(!await bcrypt.compare(req.body.password, user.password)){
        req.session.error = "Пароль не верен!";
    }
    else {
        delete user.password;
        delete user.id;
        res.jwt({
            user
        });
        return res.redirect("profile");
    }
    return res.redirect("login");
});

router.get("/profile", (req, res) => {
    if(!req.jwt.valid){
        return res.redirect("login");
    }
    return res.render("profile", { SkinViewer: SkinViewer });
});

router.get("/profile/:user", async (req, res) => {
    if(!req.jwt.payload.user.permissions.includes("admin")){
        return res.render("error");
    }
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.user}" OR username = "${req.params.user}"`);
    if(user){
        return res.render("profile", { SkinViewer: SkinViewer, viewUser: user });
    }
    else {
        return res.render("error");
    }
});

router.get("/logout", (req, res) => {
    req.jwt.revoke();
    jwt.clear();
    return res.redirect("/");
});

router.get("/verify/:token", async (req, res) => {
    const verifyToken = verifyVerificationToken(req.params.token);
    if(!verifyToken){
        return res.render("info", { title: "Ошибка!", message: "Токен истёк или не верен. Попробуйте повторить верефикацию." });
    }
    else{
        const user = await db.queryFirst(`SELECT * FROM user WHERE email = "${verifyToken.email}"`);
        if(user){
            const newUser = await db.change(user.id, {
                verified: true
            })
            res.jwt({
                user: newUser
            });
            return res.render("info", { title: "Почта верифицирована", message: "Тепепь вы можете играть на сервере" });
        }
        else{
            return res.render("info", { title: "Пользователь не найден", message: "Возможно изменилась почта?" });
        }
    }
});

router.get("/admin", async (req, res) => {
    if(!req.jwt.valid){
        return res.render("error");
    }
    if(!req.jwt.payload.user.permissions.includes("admin")){
        return res.render("error", { error: { status: 418, message: "I'm a Teapot" } });
    }
    const users = await db.select("user");
    users.sort((a, b) => parseInt(a.info.regDate) - parseFloat(b.info.regDate));
    return res.render("admin", { users });
});

router.post("/admin/ban", async (req, res) => {
    if(!req.jwt.payload.user.permissions.includes("admin")){
        return res.render("error");
    }
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(user){
        const newUser = await db.change(user.id, {
            extras: {
                banned: true
            }
        })
    }
    return res.redirect("/profile/" + req.body.username);
});

router.post("/admin/unban", async (req, res) => {
    if(!req.jwt.payload.user.permissions.includes("admin")){
        return res.render("error");
    }
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(user){
        const newUser = await db.change(user.id, {
            extras: {
                banned: false
            }
        })
    }
    return res.redirect("/profile/" + req.body.username);
});

router.post("/admin/verify", async (req, res) => {
    if(!req.jwt.payload.user.permissions.includes("admin")){
        return res.render("error");
    } 
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(user){
        const newUser = await db.change(user.id, {
            verified: true
        })
    }
    return res.redirect("/profile/" + req.body.username);
});

router.post("/admin/fake", async (req, res) => {
    if(!req.jwt.payload.user.permissions.includes("admin")){
        return res.render("error");
    } 
    const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
    if(user){
        const newUser = await db.change(user.id, {
            extras: {
                fakeUsername: req.body.fakeUsername
            }
        })
    }
    return res.redirect("/profile/" + req.body.username);
});

export default router;