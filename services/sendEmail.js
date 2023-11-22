const nodemailer = require("nodemailer");

/**
 * Sends an email using the provided parameters.
 *
 * @param {string} email - The email address to send the email to.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The body of the email.
 * @returns {Promise} - A Promise that resolves when the email has been sent, or rejects with an error.
 */

module.exports = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      service: process.env.EMAIL_SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.EMAIL_SECURE),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};