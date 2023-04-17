import { Logger } from "./../utils/logger.js";

const logger = new Logger();

export default (req, res, next) => {
	logger.log("HTTP", `${req.ip} ${req.method} ${req.originalUrl}`);
	next();
};