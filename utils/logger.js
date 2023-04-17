import { DateTime } from "luxon";
import fs from "fs";
import path from "path";

// logTypes = INFO, ERROR, WARN, FATAL, DEBUG, HTTP

export class Logger {
	constructor(options = {}) {
		this.logDirectiory = options.logDirectiory || "logs";
		this.logFilename = options.logFilename || "%date%.log";
		this.dateFormat = options.dateFormat || "yyyy-LL-dd";
		this.timeFormat = options.timeFormat || "hh:mm:ss.SSS";
		this.messageFormat = options.messageFormat || "%time% %c[%type%]%d - %message%";
	}

	log(type, message) {
		let fileStr = this.messageFormat;
		let consoleStr = this.messageFormat;

		let timeStr = DateTime.now().toFormat(this.timeFormat);
		let dateStr = DateTime.now().toFormat(this.dateFormat);

		let typeColorAnsi = "";
		let defaultColorAnsi = "\x1B[0m";

		type = type.toUpperCase();

		switch (type) {
		case "ERROR":
			typeColorAnsi = "\x1B[31m";
			break;
		case "FATAL":
			typeColorAnsi = "\x1B[31m";
			consoleStr = "\x1B[41m";
			break;
		case "WARN":
			typeColorAnsi = "\x1B[33m";
			break;
		case "HTTP":
			typeColorAnsi = "\x1B[35m";
			break;
		case "DEBUG":
			if(process.env.NODE_ENV == "production" && process.env.DEBUG_LOGS == false){
				return;
			}
			typeColorAnsi = "\x1B[34m";
			break;
		case "INFO":
		default:
			typeColorAnsi = "\x1B[32m";
			type = "INFO";
		}

		type = type.length < 5 ? type + " " : type;

		consoleStr = consoleStr.replace("%time%", timeStr);
		consoleStr = consoleStr.replace("%date%", dateStr);
		consoleStr = consoleStr.replace("%type%", type);
		consoleStr = consoleStr.replace("%c", typeColorAnsi);
		consoleStr = consoleStr.replace("%d", defaultColorAnsi);
		consoleStr = consoleStr.replace("%message%", message);
        
		fileStr = fileStr.replace("%time%", timeStr);
		fileStr = fileStr.replace("%date%", dateStr);
		fileStr = fileStr.replace("%type%", type);
		fileStr = fileStr.replace("%c", "");
		fileStr = fileStr.replace("%d", "");
		fileStr = fileStr.replace("%message%", message);

		this.logDirectiory = this.logDirectiory.replace("%date%", dateStr);
		this.logFilename = this.logFilename.replace("%date%", dateStr);

		if (!fs.existsSync(path.resolve(this.logDirectiory))) {
			fs.mkdirSync(path.resolve(this.logDirectiory));
		}
		fs.appendFile(path.join(this.logDirectiory, this.logFilename), fileStr + "\n", (err) => {
			if (err) { console.error(err); }
		});
		console.log(consoleStr);
	}
}