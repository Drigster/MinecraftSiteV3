import express from "express";
import nunjucks from "nunjucks";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jwt-express";
import { DateTime } from "luxon";
import fileUpload from "express-fileupload";
import fs from "fs";
import http from "http";
import https from "https";

import { initDB } from "./database/surreal.js";

import FlashMessages from "./middleware/NunjucksGlobals.js";
import Timer from "./middleware/timer.js";
import Logs from "./middleware/logs.js";
import Servers from "./middleware/servers.js";
import ErrorHandler from "./middleware/errorHandler.js";
import authRouter from "./routers/authRouter.js";
import apiRouter from "./routers/apiRouter.js";
import skinRouter from "./routers/skinRouter.js";
import changeRouter from "./routers/changeRouter.js";
import recoveryRouter from "./routers/recoveryRouter.js";
import downloadRouter from "./routers/downloadRouter.js";
import adminRouter from "./routers/adminRouter.js";
import serversRouter from "./routers/serversRouter.js";

import { Logger } from "./utils/logger.js";

const app = express();
const logger = new Logger();
dotenv.config();
initDB();

app.set("views", "./views");
app.set("view engine", "njk");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(cookieParser());
app.use(jwt.init(process.env.JWT_SECRET, { cookie: "jwt",  }));

const env = nunjucks.configure("views", {
	autoescape: true,
	express: app
});

env.addFilter("contains", function(array, str) {
	return array.includes(str);
});

env.addFilter("dateString", function(str) {
	if(parseInt(str) < 1){
		return "Отсутствует";
	}
	const date = DateTime.fromMillis(parseInt(str));
	return date.setLocale("ru").toLocaleString(DateTime.DATETIME_SHORT);
});

app.use(Timer);
app.use(FlashMessages);
app.use(Logs);
app.use(Servers);
	
app.get("/", (req, res) => {
	return res.render("index");
});

app.use("/", authRouter);
app.use("/", apiRouter);
app.use("/", skinRouter);
app.use("/", changeRouter);
app.use("/", recoveryRouter);
app.use("/", downloadRouter);
app.use("/", adminRouter);
app.use("/", serversRouter);

app.get("*", (req, res) => {
	return res.render("error");
});

app.use(ErrorHandler);

var httpServer;
var httpsServer;
if(process.env.NODE_ENV === "development"){
	httpServer = http.createServer(app);
}
else{
	if(fs.existsSync("src/cert/privkey.pem")){
		var privateKey  = fs.readFileSync("src/cert/privkey.pem", "utf8");
		var certificate = fs.readFileSync("src/cert/cert.pem", "utf8");
		var credentials = {key: privateKey, cert: certificate};
		httpsServer = https.createServer(credentials, app);
	}
	else{
		logger.log("WARN", "Certificate not found, falling back to HTTP");
	}
	httpServer = http.createServer(app);
}
httpServer.listen(process.env.HTTP_PORT, () => {
	logger.log("INFO", `Http server is running on http://localhost:${process.env.HTTP_PORT}`);
});
if(httpsServer){
	httpsServer.listen(process.env.HTTPS_PORT, () => {
		logger.log("INFO", `Https server is running on port: ${process.env.HTTPS_PORT}`);
	});
}