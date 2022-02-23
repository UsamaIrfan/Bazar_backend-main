import Otp from "twilio";

const sendOtp = async (to, data) => {
    const { subject, text, html } = data;
    const client = Otp(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
        to,
        from: process.env.TWILIO_SENDER,
        subject,
        text,
        html
    })
    Otp.send(message)
        .then((_response) => {
            return { success: true }
        })
        .catch((_error) => {
            return { success: false };
        })

};

export default { sendOtp };