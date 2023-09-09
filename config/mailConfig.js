"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    //   host: "server72.web-hosting.com",
    host: "jogglecryp.com",
    port: 465,
    secure: true,
    auth: {
        user: 'test@jogglecryp.com',
        pass: 'test123.com'
    }
});

// async..await is not allowed in global scope, must use a wrapper
async function MailSender(mailTo, message, subject) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: 'test@jogglecryp.com', // sender address
        to: mailTo, // list of receivers
        subject: subject, // Subject line
        // text: message, // plain text body
        html: message, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //
    // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
    //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
    //       <https://github.com/forwardemail/preview-email>
    //
}

// MailSender().catch(console.error);

module.exports = MailSender
