export default (req, res, next) => {
    if(req.method == "GET"){
        req.app.settings.nunjucksEnv.addGlobal("error", req.session.error);
        if(req.jwt.valid){
            req.app.settings.nunjucksEnv.addGlobal("user", req.jwt.payload.user);
        }
        else{
            req.app.settings.nunjucksEnv.addGlobal("user", null);
        }
        req.session.error = null;
        req.session.save();
    }
    next();
};