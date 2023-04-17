import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import db from "../database/surreal.js";
import { buildVerification } from "./email.js";
import { Logger } from "./logger.js";

dotenv.config();
const logger = new Logger();

let transporter;
try {
	if(process.env.NODE_ENV === "development"){
		let testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});
	}
	else{
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD
			},
			tls: {
				rejectUnauthorized: false,
			}
		});
	}
	logger.log("INFO", "Transport ready");
} catch (error) {
	logger.log("ERROR", error);
}

export function createVerificationToken(email) {
	const token = jwt.sign({ email }, process.env.JWT_SECRET, {
		expiresIn: "15m"
	});
	return token;
}

export function verifyVerificationToken(token) {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	}
	catch {
		return false;
	}
}

export async function sendVerificationToken(email) {
	const token = createVerificationToken(email);

	let info = await transporter.sendMail({
		from: "\"DicePVP\" <auth@disepvp.ee>",
		to: email,
		subject: "Verify your account!",
		html: buildVerification(token),
		headers: {
			"X-Entity-Ref-ID": Math.random().toString().substring(2)
		}

	});

	if(process.env.NODE_ENV === "development"){
		logger.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}

export async function sendUsername(email) {
	const user = await db.queryFirst(`SELECT * FROM user WHERE email = "${email}"`);

	let info = await transporter.sendMail({
		from: "\"DicePVP\" <auth@disepvp.ee>",
		to: email,
		subject: "Verify your account!",
		html: `${user.username}`
	});

	if(process.env.NODE_ENV === "development"){
		logger.log("DEBUG", "Preview URL: " + nodemailer.getTestMessageUrl(info));
	}
}