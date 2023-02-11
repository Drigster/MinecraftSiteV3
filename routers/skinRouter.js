import express from "express";
import path from "path";
import {fileURLToPath} from 'url';
import Jimp from "jimp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../database/surreal.js";

const router = express.Router();

var fileSendOptions = {
    root: path.resolve(__dirname, "..", "public")
}

const fileUploadPath = path.resolve(__dirname, "..", "public", "img", "skin")

router.get("/api/skin/:uuid", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.uuid}" OR username = "${req.params.uuid}"`);
    if (user) {
        res.sendFile(`/img/skin/${user.uuid}.png`, fileSendOptions, function (err) {
            if (err) {
                res.sendFile(`/img/skin/default.png`, fileSendOptions)
            }
        });
    }
    else {
        res.sendFile(`/img/skin/default.png`, fileSendOptions)
    }
});

router.get("/api/skin/head/:uuid", async (req, res) => {
    const user = await db.queryFirst(`SELECT * FROM user WHERE uuid = "${req.params.uuid}" OR username = "${req.params.uuid}"`);
    if (user) {
        res.sendFile(`/img/skin/${user.uuid}_head.png`, fileSendOptions, function (err) {
            if (err) {
                res.sendFile(`/img/skin/default_head.png`, fileSendOptions)
            }
        });
    }
    else {
        res.sendFile(`/img/skin/default_head.png`, fileSendOptions)
    }
});

router.post("/api/upload/skin", async (req, res) => {
    if(!req.jwt.payload.user.uuid){
        return res.redirect("/logout");
    }
    if(req.files && req.files.skin){
        if(await req.files.skin.mimetype == "image/png"){
            let filePath = path.resolve(fileUploadPath, req.jwt.payload.user.uuid + ".png");
            req.files.skin.mv(filePath, (err) => {
                if(err){
                    console.log("File upload error: " + err);
                    console.log("User: " + req.jwt.payload.user.username);
                    req.session.error = "Ошибка сервера, попробуйте позже!";
                }
    
                req.session.success = "Скин успешно изменён";
                
                Jimp.read(filePath, (err, skin) => {
                    if (err) {
                        console.log("Head create error: " + err);
                        console.log("User: " + req.jwt.payload.user.username);
                        req.session.error = "Ошибка создания аватара, попробуйте позже!";
                    }
                    skin.crop(8, 8, 8, 8)
                        .resize(128, 128, Jimp.RESIZE_NEAREST_NEIGHBOR)
                        .write(path.resolve(fileUploadPath, req.jwt.payload.user.uuid + "_head.png")); // save
                });
            });
        }
        else{
            req.session.error = "Формат файла может быть только PNG!";
        }
    }
    else{
        req.session.error = "Файл не найден!";
    }

    res.redirect("/profile")
});

router.post("/api/delete/skin", async (req, res) => {
    if(!req.jwt.payload.user.uuid){
        return res.redirect("/logout");
    }
    if(req.files && req.files.skin){
        if(await req.files.skin.mimetype == "image/png"){
            let filePath = path.resolve(fileUploadPath, req.jwt.payload.user.uuid + ".png");
            req.files.skin.mv(filePath, (err) => {
                if(err){
                    console.log("File upload error: " + err);
                    console.log("User: " + req.jwt.payload.user.username);
                    req.session.error = "Ошибка сервера, попробуйте позже!";
                }
                
                req.session.success = "Скин успешно изменён";
                
                Jimp.read(filePath, (err, skin) => {
                    if (err) {
                        console.log("Head create error: " + err);
                        console.log("User: " + req.jwt.payload.user.username);
                        req.session.error = "Ошибка создания аватара, попробуйте позже!";
                    }
                    skin.crop(8, 8, 8, 8)
                        .resize(128, 128, Jimp.RESIZE_NEAREST_NEIGHBOR)
                        .write(path.resolve(fileUploadPath, req.jwt.payload.user.uuid + "_head.png")); // save
                });
            });
        }
        else{
            req.session.error = "Формат файла может быть только PNG!";
        }
    }
    else{
        req.session.error = "Файл не найден!";
    }

    res.redirect("/profile")
});

export default router;