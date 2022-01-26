require('dotenv').config();
const sgMail = require('@sendgrid/mail')

const sendEmail = async (to, data) => {

  const { subject, text, html } = data;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to, // Change to your recipient
    from: process.env.SENDGRID_SENDER, // Change to your verified sender
    subject,
    text,
    html
  }
  sgMail
    .send(msg)
    .then((_response) => {
      // console.log(response[0].statusCode)
      // console.log(response[0].headers)
      return { success: true }
    })
    .catch((_error) => {
      // console.error(JSON.stringify(error, null, 2))
      return { success: false }
    })

}

module.exports = { sendEmail }
