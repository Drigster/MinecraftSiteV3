import express from "express";
import db from "../database/surreal.js";
import bcrypt from "bcrypt";
import jwt from "jwt-express";
import dotenv from "dotenv";
import verifier from "captcha-verifier";

import { sendRecoveryToken, sendUsername, sendVerificationToken, verifyVerificationToken } from "../utils/utils.js";

dotenv.config();
verifier.config({
	reCaptchaV3SecretKey: process.env.CAPTCHA_SECRET, // string
	reCaptchaV3PassingScore: 0.4, // optional. Number. 0.4 by default
});

const router = express.Router();

router.get("/recovery", (req, res) => {
	return res.render("recovery", { siteKey: process.env.CAPTCHA_SITE });
});

router.post("/recovery", async (req, res) => {
	const [success] = await verifier.reCaptchaV3(req.body["g-recaptcha-response"], req.ip);

	if (!success) {
		req.session.error = "Каптча не пройдена!";
		return res.redirect("register");
	}

	const user = (await db.query(`SELECT * FROM user WHERE email = "${req.body.email}"`))[0];
	if(!user){
		req.session.error = "Аккаунт с данной почтой не найден!";
		return res.redirect("/recovery");
	}
	if(req.body.password != undefined){
		sendVerificationToken(req.body.email, "recovery/password");
		return res.render("info", { title: "Востановление пароль", message: "Для продолжения перейдите по ссылке отправленой вам на почту" });
	}
	else if(req.body.username != undefined){
		sendUsername(req.body.email);
		return res.render("info", { title: "Востановление никнейма", message: "Вам на почту было отправлено письмо с вашим никнеймом" });
	}
	else{
		req.session.error = "Ошибка, попробуйте ешё раз!";
		return res.redirect("/recovery");
	}
});

router.get("/recovery/password/request", (req, res) => {
	if(!jwt.valid()){
		return res.redirect("/logout");
	}
	sendRecoveryToken(req.jwt.payload.user.email, "recovery/password");
	return res.render("info", { title: "Востановление пароль", message: "Для продолжения перейдите по ссылке отправленой вам на почту" });
});

router.get("/recovery/verify/request", (req, res) => {
	if(!jwt.valid()){
		return res.redirect("/logout");
	}
	sendVerificationToken(req.jwt.payload.user.email, "verify");
	return res.render("info", { title: "Верефикация", message: "Для продолжения перейдите по ссылке отправленой вам на почту" });
});

router.get("/recovery/password/:token", (req, res) => {
	const verifyToken = verifyVerificationToken(req.params.token);
	if(!verifyToken){
		return res.render("info", { title: "Ошибка!", message: "Токен истёк или не верен. Попробуйте повторить востановление пароля." });
	}
	return res.render("passwordRecovery");
});

router.post("/recovery/password/:token", async (req, res) => {
	const verifyToken = verifyVerificationToken(req.params.token);
	if(!verifyToken){
		return res.render("info", { title: "Ошибка!", message: "Токен истёк или не верен. Попробуйте повторить востановление пароля." });
	}
	else{
		const user = (await db.query(`SELECT * FROM user WHERE email = "${verifyToken.email}"`))[0];
		if(!user){
			return res.render("info", { title: "Ошибка!", message: "Токен истёк или не верен. Попробуйте повторить востановление пароля." });
		}
		if(req.body.newpassword.length < 6){
			req.session.error = "Новый пароль слишком короткий(минимум: 6)!";
		}
		else if(req.body.newpassword != req.body.newpassword2){
			req.session.error = "Пароли не совподают!";
		}
		else{
			await db.merge(user.id, {
				password: await bcrypt.hash(req.body.newpassword, 10)
			});
			req.jwt.revoke();
			jwt.clear();
			return res.render("info", { title: "Пароль успешно изменён!", message: "Теперь вы можете войти в аккаунт." });
		}
		req.session.save();
		return res.redirect(`/recovery/password/${req.params.token}`);
	}
});

export default router;