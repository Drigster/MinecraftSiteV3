import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

let transporter;
try {
    if(process.env.NODE_ENV === "development"){
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
        });
    }
    else{
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false,
            }
        });
    }
    console.log("Transport ready");
} catch (error) {
    console.log("ERROR\n");
    console.log(error);
}

export function createVerificationToken(email) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    })
    return token
}

export function verifyVerificationToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    }
    catch {
        return false
    }
}

export async function sendVerificationToken(email) {

    const token = createVerificationToken(email);

    let info = await transporter.sendMail({
        from: '"DicePVP" <auth@disepvp.ee>',
        to: email,
        subject: "Verify your account!",
        html: `<a href='${process.env.BASE_URL}/verify/${token}'>Hello world?</a>`
    });

    if(process.env.NODE_ENV === "development"){
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }
}