const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const moment = require("moment");

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

const sendEmailVerification = async (user, token) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: `We welcome you onboard | ${user.name}`,
      html: `
      <h2>Initial E-mail address verification | ${user.name}</h2>
      <p>We are pleased to have you onboard with doctor agent. Please verify your with the email link below.</p>
      <a href="${process.env.REDIRECT_BASE_LINK}/user/verify-email?token=${token}&user=${user._id}"><button type="button">Verify Email</button></a>

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

const sendDoctorEmail = async (user) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: `We welcome you onboard | ${user.name}`,
      html: `
      <h2>Account pending approval | ${user.name}</h2>
      <p>We are pleased to have you onboard with doctor agent. Our admins and moderators will look into your account details and verify your account.</p>
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

const doctorAccountVerifiedEmail = async (user) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: `Your account has been approved | ${user.name} - Doctor Agent`,
      html: `
      <h2>We are thrilled to tell you that your account has been approved | ${user.name}</h2>
      <p>We are pleased to have you onboard with doctor agent. You can login into your account with the details your entered while creating the account.</p>
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

const newAppointmentEmailToDoctor = async (doctor, user, appointment) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: doctor.email,
      subject: `New appointment | ${user.name} - Doctor Agent`,
      html: `
      <h2>A new appoitnment has been scheduled by ${user.name}</h2>
      <p>Details</p>
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
            <td class="tg-0lax">Patient Name</td>
            <td class="tg-0lax">${user.name}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Doctor Name</td>
            <td class="tg-0lax">${doctor.name}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Patient Email</td>
            <td class="tg-0lax">${user.email}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Doctor Email</td>
            <td class="tg-0lax">${doctor.email}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Services</td>
            <td class="tg-0lax">${appointment.services.map(
              (serv) => `${serv.name}, `
            )}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Time</td>
            <td class="tg-0lax">${moment(appointment.time).format(
              "hh:mm a"
            )}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Day</td>
            <td class="tg-0lax">${moment(appointment.time).format("dddd")}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Date</td>
            <td class="tg-0lax">${moment(appointment.time).format(
              "MMM Do YY"
            )}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Doctor Designation</td>
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


const newAppointmentEmailToPatient = async (doctor, user, appointment) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: `Appointment Scheduled | ${doctor.name} - Doctor Agent`,
      html: `
      <h2>Your appointment has been scheduled with the Dr. ${doctor.name}</h2>
      <p>Details</p>
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
            <td class="tg-0lax">Patient Name</td>
            <td class="tg-0lax">${user.name}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Doctor Name</td>
            <td class="tg-0lax">${doctor.name}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Patient Email</td>
            <td class="tg-0lax">${user.email}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Doctor Email</td>
            <td class="tg-0lax">${doctor.email}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Services</td>
            <td class="tg-0lax">${appointment.services.map(
              (serv) => `${serv.name}, `
            )}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Time</td>
            <td class="tg-0lax">${moment(appointment.time).format(
              "hh:mm a"
            )}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Day</td>
            <td class="tg-0lax">${moment(appointment.time).format("dddd")}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Date</td>
            <td class="tg-0lax">${moment(appointment.time).format(
              "MMM Do YY"
            )}</td>
          </tr>
          <tr>
            <td class="tg-0lax">Doctor Designation</td>
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

const sendForgetPasswordEmail = async (user, token) => {
  await transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: `Reset your password | ${user.name}`,
      html: `
      <h2>That's pretty silly of you to forget your password</h2>
      <p>But we have got you covered and we understand and care for you. Please click on below link to reset your password.</p>
      <a href="${process.env.REDIRECT_BASE_LINK}/user/reset-password?token=${token}&email=${user.email}"><button type="button">Reset Password</button></a>
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
  sendEmailVerification,
  sendForgetPasswordEmail,
  sendDoctorEmail,
  doctorAccountVerifiedEmail,
  newAppointmentEmailToDoctor,
  newAppointmentEmailToPatient,
};
