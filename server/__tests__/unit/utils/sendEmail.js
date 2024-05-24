const nodemailer = require("nodemailer");
const { sendEmail } = require("../../../utils/sendEmail");

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

const transporter = { sendMail: jest.fn() };
nodemailer.createTransport.mockReturnValue(transporter);

describe("sendEmail", () => {
  it("should be able to send email", async () => {
    process.env.EMAIL_HOST = "host";
    process.env.EMAIL_SERVICE = "service";
    process.env.EMAIL_PORT = "587";
    process.env.EMAIL_USER = "user";
    process.env.EMAIL_PASS = "pass";

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test Body"
    );
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "host",
      service: "service",
      port: 587,
      secure: true,
      auth: {
        user: "user",
        pass: "pass",
      },
    });
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: "user",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Body",
    });
    expect(result).toEqual({ success: true });
  });
    
  it("should return { success: false, error: error } when there is an error", async () => {
    process.env.EMAIL_HOST = "host";
    process.env.EMAIL_SERVICE = "service";
    process.env.EMAIL_PORT = "587";
    process.env.EMAIL_USER = "user";
    process.env.EMAIL_PASS = "pass";

    transporter.sendMail.mockImplementation(() => {
      throw new Error("Test Error");
    });
      
    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test Body"
    );
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "host",
      service: "service",
      port: 587,
      secure: true,
      auth: {
        user: "user",
        pass: "pass",
      },
    });
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: "user",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Body",
    });
    expect(result).toEqual({ success: false, error: new Error("Test Error") });
  });
});
