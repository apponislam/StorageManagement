import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
    host: config.email_host,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.email_user,
        pass: config.email_password,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({
        from: `"Storage Managemet" <${config.email_from}>`,
        to,
        subject,
        html,
    });
};
