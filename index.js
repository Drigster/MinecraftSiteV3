import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

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

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get("/", (req, res) => {
	res.render("index");
});

app.listen(process.env.PORT, () => {
  	console.log(`Example app running on http://localhost:${process.env.PORT}`);
});