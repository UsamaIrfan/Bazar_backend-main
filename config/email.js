const sgMail = require("@sendgrid/mail");

const sendGridKey = process.env.SEND_GRID_KEY;
const sendGridSendEmailId = process.env.SEND_GRID_SEND_EMAIL_ID;

sgMail.setApiKey(sendGridKey);

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: sendGridSendEmailId,
    subject: "Welcome from team Khumar",
    text: `Welcome onboard ${name}, Hope you love the buying experience at Khumar.`,
  });
};

/**
 *
 * @param {string} email
 * @param {string} name
 * @param {number} otp
 */
const sendOtpMail = async (email, name, otp) => {
  const res = await sgMail
    .send({
      to: email,
      from: sendGridSendEmailId,
      subject: "OTP Verification | Khumar",
      text: `Hello ${name}, Your OTP verification code to create an account Khumar is ${otp}.`,
    })
    .then((res) => {
      return { success: true };
    })
    .catch((error) => {
      return { success: false, error };
    });
  return res;
};

const sendGoodbyeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: sendGridSendEmailId,
    subject: "We are sad to see you go, Team Khumar",
    text: `Goodbye ${name}, Hope you liked working with our software. If not, please tell us the reason so we can improve.`,
  });
};

module.exports = {
  sendWelcomeMail,
  sendGoodbyeMail,
  sendOtpMail,
};
