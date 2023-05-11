import { Logger } from "./../utils/logger.js";

const logger = new Logger();

export default (err, req, res, next) => {
	logger.log("ERROR", err);
	if(process.env.NODE_ENV === "development"){
		return next(err);
	}
	return res.render("error", { error: err });
};