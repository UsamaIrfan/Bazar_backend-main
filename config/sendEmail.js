const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendEmail = async (to, data) => {

  const { subject, text, html } = data;


  const msg = {
    to: "syedfaizan.dev@gmail.com", // Change to your recipient
    from: process.env.SENDGRID_EMAIL, // Change to your verified sender
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

module.exports ={sendEmail}

