const Otp = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const crypto = require("crypto");

// const sendOtp = async (to, data) => {
//   const { subject, text, html } = data;
//   const client = Otp(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
//   const message = await client.messages.create({
//     to,
//     from: process.env.TWILIO_PHONE_NUMBER,
//     subject,
//     text,
//     html,
//   });
//   Otp.send(message)
//     .then((_response) => {
//       return { success: true };
//     })
//     .catch((_error) => {
//       return { success: false };
//     });
// };

const sendTwilioOtpSMS = async (to, data) => {
  await client.messages
    .create({
      body: data.body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    .then((message) => {
      return { success: true };
    })
    .catch((error) => {
      return { success: false, error };
    });
};

module.exports = { sendTwilioOtpSMS };
