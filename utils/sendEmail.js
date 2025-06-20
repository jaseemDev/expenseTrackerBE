import nodemailer from "nodemailer";

export const sendEmail = (toEmail, message) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cfe4a3ec13085a",
      pass: "658d3e932cf64f",
    },
  });
  const mailOptions = {
    from: "your-email@gmail.com",
    to: toEmail,
    subject: "Password Reset",
    text: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
