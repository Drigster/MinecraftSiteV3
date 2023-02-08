import Surreal from "surrealdb.js";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";

dotenv.config();

let db_url = process.env.DATABASE_URL;
let db_user = process.env.DATABASE_USER;
let db_pass = process.env.DATABASE_PASSWORD;

const db = new Surreal(db_url);

db.queryFirst = queryFirst;

async function queryFirst(queryString) {
    try {
        const query = await db.query(queryString);
        return query[0].result[0];
    } catch {
        return {}
    }
}

export async function initDB() {
    try {
        console.log("Initializing database...");
        if (!db_user || !db_pass) {
            throw new Error("DB_USERNAME or DB_PASSWORD not set")
        }
        await db.connect(db_url)
        .then(() => {
            console.log("Connected to database");
        })
        .catch((err) => {
            console.log("Error connecting to database", err);
        });
        await db.signin({
            user: db_user,
            pass: db_pass,
        })
        .then((res) => {
            console.log("Signed in to database", res);
        })
        .catch((err) => {
            console.log("Error signing in to database", err);
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
                console.log("Created default user", res);
            });
        }
    } catch (err) {
        console.error(err);
    }
}
export default db;
