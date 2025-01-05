import nodemailer from 'nodemailer'

// Sendmail config
export const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    })
    await transporter.sendMail({ from: process.env.USER, to: email, subject, text })
  } catch (error) {
    console.log(error)
  }
}