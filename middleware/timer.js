import { DateTime } from 'luxon';
import dotenv from 'dotenv';

dotenv.config();

export default (req, res, next) => {
    if(process.env.NODE_ENV === "development"){
        next();
    }
    else if(req.originalUrl.includes("/api")){
        next();
    }
    else{
        let setDate = DateTime.local(2023, 2, 17, 17, 0);
        let deltaDate = setDate.diff(DateTime.now(), ['days', 'hours', 'minutes', 'seconds']);
        if((deltaDate.days > 0) || (deltaDate.hours > 0) || (deltaDate.minutes > 0) || (deltaDate.seconds > 0)){
            const data = {
                day: deltaDate.days, 
                hour: deltaDate.hours, 
                minute: deltaDate.minutes, 
                second: Math.round(deltaDate.seconds)
            }
            return res.render("timer", data);
        }
        else{
            next();
        }
    }
};