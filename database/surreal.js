import Surreal from "surrealdb.js";

let db_url = process.env.DATABASE_URL;
let db_user = process.env.DATABASE_USER;
let db_pass = process.env.DATABASE_PASSWORD;

const db = new Surreal(db_url);

export async function initDB() {
    try {
        console.log("Initializing database...");
        if (!db_user || !db_pass || !db_url) {
            throw new Error("DB_USERNAME or DB_PASSWORD not set")
        }
        await db
            .connect(db_url)
            .then(() => {
                console.log("Connected to database");
            })
            .catch((err) => {
                console.log("Error connecting to database", err);
            });
        
        await db
            .signin({
                user: db_user,
                pass: db_pass,
            })
            .then((res) => {
                console.log("Signed in to database", res);
            })
            .catch((err) => {
                console.log("Error signing in to database", err);
            });
    } catch (err) {
        console.error(err);
    }
}
export default db;
