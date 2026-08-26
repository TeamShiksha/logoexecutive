const axios = require("axios");
const { getIsProduction } = require("./constants");

/**
 * Sends an email using the configured email service.
 *
 * @param {Object} options
 * @param {number} options.id - Template ID to identify the email template.
 * @param {string} options.subject - Email subject.
 * @param {string} options.recipient - Recipient email address.
 * @param {Object} options.body - Dynamic content to populate the email template.
 * @param {Array<string>} [options.cc] - Optional CC email addresses.
 * @param {Array<string>} [options.bcc] - Optional BCC email addresses.
 *
 * @throws {Error} If email sending fails.
 */
async function sendEmail({ id, subject, recipient, body, cc = [], bcc = [] }) {
  const payload = { id, subject, recipient, body, cc, bcc };

  const isProduction = getIsProduction();
  if (!isProduction) {
    console.warn(`Development Mode\n${JSON.stringify(payload, null, 2)}`);
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.EMAIL_SERVICE_URL}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.EMAIL_SERVICE_AUTH_TOKEN,
        },
      }
    );
    console.info("Email sent successfully:", response.data);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    const emailError = new Error("Failed to send email");
    emailError.cause = error;
    emailError.statusCode = 502;
    throw emailError;
  }
}

module.exports = sendEmail;
