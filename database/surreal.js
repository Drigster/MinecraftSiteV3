import Surreal from "surrealdb.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Logger } from "./../utils/logger.js";

dotenv.config();
const logger = new Logger();

let db_url = process.env.DATABASE_URL;
let db_user = process.env.DATABASE_USER;
let db_pass = process.env.DATABASE_PASSWORD;

const db = new Surreal(db_url);

db.queryFirst = queryFirst;
db.queryAll = queryAll;

async function queryFirst(queryString) {
	try {
		const query = await db.query(queryString);
		return query[0].result[0];
	} catch {
		return {};
	}
}

async function queryAll(queryString) {
	try {
		const query = await db.query(queryString);
		return query[0].result;
	} catch {
		return {};
	}
}

export async function initDB() {
	try {
		logger.log("INFO", "Initializing database...");
		if (!db_user || !db_pass) {
			throw new Error("DB_USERNAME or DB_PASSWORD not set");
		}
		await db.signin({
			user: db_user,
			pass: db_pass,
		})
		.then((res) => {
			logger.log("INFO", "Signed in to database", res);
		})
		.catch((err) => {
			logger.log("ERROR", "Error signing in to database", err);
		});

		await db.use({ns: 'dice', db: 'dice'});

		const users = await db.select("user");
		if(users.length == 0){
			await db.create("user", {
				uuid: "7943cf5b-6d20-462a-9eac-d5dc70d2456a",
				username: "admin",
				password: await bcrypt.hashSync("admin", 10),
				email: "test@test.test",
				verified: true,
				permissions: [
					"user",
					"moderator",
					"admin"
				],
				info: {
					regDate: Date.now(),
					lastPlayed: -1
				}
			})
				.then((res) => {
					logger.log("INFO", "Created default user", res);
				});
		}
		if(users.length < 5){
			await db.create("user", {
				uuid: "acc7e195-b04e-44a6-9621-76fce732e29e",
				username: "test1",
				password: await bcrypt.hashSync("test1", 10),
				email: "test1@test.test",
				verified: true,
				permissions: [
					"user",
				],
				info: {
					regDate: Date.now(),
					lastPlayed: -1
				}
			})
			await db.create("user", {
				uuid: "2b59383f-8ede-4772-a258-d97237443036",
				username: "test2",
				password: await bcrypt.hashSync("test2", 10),
				email: "test2@test.test",
				verified: true,
				permissions: [
					"user",
				],
				info: {
					regDate: Date.now(),
					lastPlayed: -1
				}
			})
			await db.create("user", {
				uuid: "d6cfc5f0-cbc3-42f1-a625-3d74b0e0c09c",
				username: "test3",
				password: await bcrypt.hashSync("test3", 10),
				email: "test3@test.test",
				verified: true,
				permissions: [
					"user",
				],
				info: {
					regDate: Date.now(),
					lastPlayed: -1
				}
			})
			await db.create("user", {
				uuid: "af3b613c-5e39-4f71-90af-c2763e140438",
				username: "test4",
				password: await bcrypt.hashSync("test4", 10),
				email: "test4@test.test",
				verified: true,
				permissions: [
					"user",
				],
				info: {
					regDate: Date.now(),
					lastPlayed: -1
				}
			})
		}
	} catch (err) {
		logger.log("ERROR", err);
	}
}
export default db;
