import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jwt-express';
import authRouter from "./routers/authRouter.js";
import { initDB } from "./database/surreal.js";
import FlashMessages from './middleware/NunjucksGlobals.js';

const app = express();
dotenv.config();
initDB();

app.set('views', './views');
app.set('view engine', 'html');

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

app.use(FlashMessages);

app.get("/", (req, res) => {
	res.render("index");
});

app.use("/", authRouter);

app.listen(process.env.PORT, () => {
  	console.log(`Example app running on http://localhost:${process.env.PORT}`);
});