import { createTransport } from "nodemailer";
export const sendEmail=async(to,subject,text)=>{

     const transporter=createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });



     await transporter.sendMail({
        to,
        subject,
        text,
        // from:"myid@gmail.com"
     })

}