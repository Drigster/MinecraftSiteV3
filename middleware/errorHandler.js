import { Logger } from './../utils/logger.js';

const logger = new Logger();

export default (err, req, res, next) => {
    logger.log("ERROR", err.stack)
    res.render("error", {status: 500, message: 'Что-то сломалось :)'});
};