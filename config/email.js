const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD, // generated ethereal password
  },
});

const sendDoctorVerifyEmail = async (admin, doctor) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: admin.email,
      subject: `New doctor registeration request | ${doctor.name}`,
      html: `
      <h2>A new doctor with the name ${
        doctor.name
      } has requested to join the clinic</h2>
      <p>Please login to the app and approve or decline to this sign-up request.</p>
      <style type="text/css">
        .tg  {border-collapse:collapse;border-spacing:0;}
        .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
          overflow:hidden;padding:10px 5px;word-break:normal;}
        .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
          font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
        .tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
        .tg .tg-0lax{text-align:left;vertical-align:top}
      </style>
      <table class="tg">
        <thead>
          <tr>
            <th class="tg-0pky">Info type</th>
            <th class="tg-0lax">Info details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="tg-0lax">Email</td>
            <td class="tg-0lax">${doctor.email}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Product</td>
            <td class="tg-0lax">${doctor.name}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Designation</td>
            <td class="tg-0lax">${doctor.designation}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Clinic</td>
            <td class="tg-0lax">${doctor.clinicAddress}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Has Clinic</td>
            <td class="tg-0lax">${doctor.hasClinic ? "Yes" : "No"}</td>
          </tr>
          ${
            doctor.city !== ""
              ? `<tr>
            <td class="tg-0lax">City</td>
            <td class="tg-0lax">${doctor.city}</td>
          </tr>`
              : ""
          }
          ${
            doctor.address !== ""
              ? `<tr>
            <td class="tg-0lax">Address</td>
            <td class="tg-0lax">${doctor.address}</td>
          </tr>`
              : ""
          }
          ${
            doctor.country !== ""
              ? `<tr>
            <td class="tg-0lax">Country</td>
            <td class="tg-0lax">${doctor.country}</td>
          </tr>`
              : ""
          }
        </tbody>
      </table>
      <p>Regards, <br /> Doctor Agent</p>
  `,
    })
    .then(() => {
      return true;
    })
    .catch((error) => {
      return false;
    });
};

module.exports = {
  sendWelcomeMail,
  sendGoodbyeMail,
  sendOtpMail,
  transporter,
  sendDoctorVerifyEmail,
};
