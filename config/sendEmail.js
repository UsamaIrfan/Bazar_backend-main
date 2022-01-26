const sgMail = require('@sendgrid/mail')


const sendEmail = async (to, data) => {

  const { subject, text, html } = data;

  sgMail.setApiKey("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")

  const msg = {
    to: "syedfaizan.dev@gmail.com", // Change to your recipient
    from: "khareedlo@tecizeverything.com", // Change to your verified sender
    subject,
    text,
    html
  }
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      console.log(response[0].headers)
    })
    .catch((error) => {
      console.error(JSON.stringify(error, null, 2))
    })


}

module.exports = { sendEmail }

