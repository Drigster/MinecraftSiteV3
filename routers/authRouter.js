import express from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import jwt from 'jwt-express';

import db from "../database/surreal.js";

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    const usernameRegex = new RegExp("^[A-Za-z0-9_]{3,16}$");
    if(!req.body.username && !req.body.email && !req.body.password && !req.body.password2){
        req.session.error = "Пожалуйста заполните все поля!";
        return res.redirect("register");
    }
    const userQuery = await (db.query(`SELECT * FROM user WHERE username = "${req.body.username}"`));
    const user = userQuery[0].result;
    const emailQuery = await (db.query(`SELECT * FROM user WHERE email = "${req.body.email}"`));
    const emailCheck = emailQuery[0].result;
    if(!usernameRegex.test(req.body.username)){
        req.session.error = "Никнейм имеет недопустимые символы!";
        console.log(1);
    }
    else if(user){
        req.session.error = "Профиль с таким никнеймом уже существует!";
        console.log(2);
    }
    else if(emailCheck){
        req.session.error = "Эта почта занята!";
        console.log(3);
    }
    else if(req.body.password.length < 6){
        req.session.error = "Пароль слишком короткий(минимум: 6)!";
        console.log(4);
    }
    else if(req.body.password != req.body.password2){
        req.session.error = "Пароли не совподают!";
        console.log(5);
    }
    else{
        await db.create("user", {
            id: uuid(),
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            verfied: false,
            permissions: [
                "user"
            ]
        });
        return res.redirect("login");
    }
    req.session.save();
    res.redirect("register");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    if(!req.body.username && !req.body.password){
        req.session.error = "Пожалуйста заполните все поля!";
        return res.redirect("register");
    }
    const query = await (db.query(`SELECT * FROM user WHERE username = "${req.body.username}"`));
    const user = query[0].result[0];
    if(!user){
        req.session.error = "Пользователь не найден!";
        console.log(1);
    }
    else if(!await bcrypt.compare(req.body.password, user.password)){
        req.session.error = "Пароль не верен!";
        console.log(2);
    }
    else {
        res.jwt({
            username: req.body.username,
            email: req.body.email,
            permissions: user.permissions
        });
        return res.redirect("profile");
    }
    res.redirect("login");
});

router.get("/profile", (req, res) => {
    if(!req.jwt.valid){
        return res.redirect("login");
    }
    res.render("profile");
});

router.get("/logout", (req, res) => {
    req.jwt.revoke();
    jwt.clear();
    res.redirect("/");
});

export default router;