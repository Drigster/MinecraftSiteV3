import { Surreal } from "surrealdb.node";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Logger } from "./../utils/logger.js";

dotenv.config();
const logger = new Logger();

let db_url = process.env.DATABASE_URL;
let db_user = process.env.DATABASE_USER;
let db_pass = process.env.DATABASE_PASSWORD;

const db = new Surreal();

export async function initDB() {
	try {
		logger.log("INFO", "Initializing database...");
		if (!db_user || !db_pass || !db_url) {
			throw new Error("DB_USERNAME or DB_PASSWORD or DB_URL not set");
		}
		await db.connect(db_url)
			.then(() => {
				logger.log("INFO", "Connected to database");
			})
			.catch((err) => {
				logger.log("ERROR", "Error connecting to database: " + err);
			});
		await db.signin({
			username: db_user,
			password: db_pass,
		})
			.then(() => {
				logger.log("INFO", "Signed in to database");
			})
			.catch((err) => {
				logger.log("ERROR", "Error signing in to database: " + err);
			});

		await db.use({ ns: "dise", db: "dise" });

		const users = await db.select("user");
		if (users.length == 0) {
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
				.then(() => {
					logger.log("INFO", "Created default user");
				});
		}
	} catch (err) {
		logger.log("ERROR", err);
	}
}
export default db;
