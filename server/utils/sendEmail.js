const nodemailer = require("nodemailer");
const { config } = require("./constants");

/**
 * Sends an email using the provided parameters.
 *
 * @param {string} email - The email address to send the email to.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The body of the email.
 * @returns {Promise} - A Promise that resolves with a success message when the email has been sent, or rejects with an error.
 */

async function sendEmail(email, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      service: config.EMAIL_SERVICE,
      port: Number(config.EMAIL_PORT),
      secure: true,
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
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error };
  }
}

module.exports = { sendEmail };
