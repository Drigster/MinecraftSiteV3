import express from "express";
import db from "../database/surreal.js";
import bcrypt from "bcrypt";
import { sendVerificationToken } from "../utils/utils.js";

const router = express.Router();

router.post("/api/change/username", async (req, res) => {
	const usernameRegex = /^\\w{3,16}$/;

	if(!req.jwt.payload.user.uuid){
		return res.redirect("/logout");
	}

	const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.jwt.payload.user.uuid}"`);
	if(user){
		if(user.username == req.body.newusername){
			req.session.error = "Новый никнейм не может совподать со старым!";
		}
		else if(!usernameRegex.test(req.body.newusername)){
			req.session.error = "Никнейм имеет недопустимые символы!";
		}
		else if(!(await bcrypt.compare(req.body.password, user.password))){
			req.session.error = "Пароль не верен!";
		}
		else{
			let newUser = await db.merge(user.id, {
				username: req.body.newusername
			});
			delete newUser.password;
			delete newUser.id;
			res.jwt({
				user: newUser
			});
			req.session.success = "Никнейм успешно изменён";
		}
		req.session.save();
	}
	return res.redirect("/profile");
});

router.post("/api/change/email", async (req, res) => {
	const emailRegex = /^[a-zA-Z\d]+(?:\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(?:\.[a-zA-Z\d]+)*$/;

	if(!req.jwt.payload.user.uuid){
		return res.redirect("/logout");
	}

	const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.jwt.payload.user.uuid}"`);
	if(user){
		if(user.email == req.body.newemail){
			req.session.error = "Новая почта не может совподать со старой!";
		}
		else if(!emailRegex.test(req.body.newemail)){
			req.session.error = "Почта имеет неверный формат!";
		}
		else if(!(await bcrypt.compare(req.body.password, user.password))){
			req.session.error = "Пароль не верен!";
		}
		else{
			let newUser = await db.merge(user.id, {
				email: req.body.newemail,
				verified: false
			});
			delete newUser.password;
			delete newUser.id;
			res.jwt({
				user: newUser
			});
			req.session.success = "Почта успешно изменена.";
			req.session.message = "На почту отправлена ссылка для верицикации";
			sendVerificationToken(newUser.email, "verify");
		}
		req.session.save();
	}
	return res.redirect("/profile");
});

export default router;