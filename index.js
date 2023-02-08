import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jwt-express';
import { DateTime } from 'luxon';

import { initDB } from "./database/surreal.js";
import FlashMessages from './middleware/NunjucksGlobals.js';
import authRouter from "./routers/authRouter.js";
import apiRouter from "./routers/apiRouter.js";
import skinRouter from "./routers/skinRouter.js";
import changeRouter from "./routers/changeRouter.js";


const app = express();
dotenv.config();
initDB();

app.set('views', './views');
app.set('view engine', 'njk');

app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(cookieParser());
app.use(jwt.init(process.env.JWT_SECRET, { cookie: "jwt",  }))

const env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

env.addFilter('contains', function(array, str) {
    return array.includes(str);
});

env.addFilter('dateString', function(str) {
	if(parseInt(str) < 1){
		return "Отсутствует";
	}
	const date = DateTime.fromMillis(parseInt(str));
    return date.setLocale('ru').toLocaleString(DateTime.DATETIME_SHORT);
});

app.use(FlashMessages);

app.get("/", (req, res) => {
	res.render("index");
});

app.use("/", authRouter);
app.use("/", apiRouter);
app.use("/", skinRouter);
app.use("/", changeRouter);

app.listen(process.env.PORT, () => {
  	console.log(`Example app running on http://localhost:${process.env.PORT}`);
});