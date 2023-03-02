import Surreal from "surrealdb.js";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import { Logger } from './../utils/logger.js';

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
        return {}
    }
}

async function queryAll(queryString) {
    try {
        const query = await db.query(queryString);
        return query[0].result;
    } catch {
        return {}
    }
}

export async function initDB() {
    try {
        logger.log("INFO", "Initializing database...");
        if (!db_user || !db_pass) {
            throw new Error("DB_USERNAME or DB_PASSWORD not set")
        }
        await db.connect(db_url)
        .then(() => {
            logger.log("INFO", "Connected to database");
        })
        .catch((err) => {
            logger.log("ERROR", "Error connecting to database", err);
        });
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
        
        await db.use("dice", "dice");

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
    } catch (err) {
        logger.log("ERROR", err);
    }
}
export default db;
