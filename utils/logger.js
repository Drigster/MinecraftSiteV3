import { DateTime } from 'luxon';
import fs from "fs";
import path from 'path';

const logTypes = ["INFO", "ERROR", "WARN", "FATAL", "DEBUG", "HTTP"]

export class Logger {

    constructor(options = {}) {
        this.logDirectiory = options.logDirectiory || "/logs";
        this.logFilename = options.logFilename || "/%date%.log";
        this.timeFormat = options.timeFormat || "mm:ss:SSS";
        this.messageFormat = options.messageFormat || "%time% %type% - %message%";
    }

    log(type, message) {
        let returnStr = this.messageFormat;
        let typeStr = type;

        type = type.length < 5 ? type + " " : type;

        switch (type.toUpperCase()) {
            case "ERROR":
                typeStr = "\x1B[31m[" + type + "]\x1B[0m";
                break;
            case "WARN":
                typeStr = "\x1B[33m[" + type + "]\x1B[0m";
                break;
            case "HTTP":
                typeStr = "\x1B[35m[" + type + "]\x1B[0m";
                break;
            case "DEBUG":
                if(process.env.NODE_ENV !== "development" || process.env.DEBUG_LOGS !== true){
                    return
                }
                typeStr = "\x1B[34m[" + type + "]\x1B[0m";
                break;
            case "INFO":
            default:
                typeStr = "\x1B[32m[INFO ]\x1B[0m";
        }

        let timeStr = DateTime.now().toFormat(this.timeFormat);

        returnStr = returnStr.replace("%time%", timeStr);
        returnStr = returnStr.replace("%type%", typeStr);
        returnStr = returnStr.replace("%message%", message);

        if (!fs.existsSync(path.resolve(this.logDirectiory))) {
            fs.mkdirSync(path.resolve(this.logDirectiory));
        }
        fs.appendFile(path.join(this.logDirectiory, this.logFilename), returnStr + "\n", (err) => {
            if (err) { console.error(err); }
        });
        console.log(returnStr);
    }
}