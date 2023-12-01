import db from "../database/surreal.js";

export default async (req, res, next) => {
	if(req.method == "GET"){
		const servers = await db.select("server");
		req.app.settings.nunjucksEnv.addGlobal("servers", servers);
	}
	next();
};