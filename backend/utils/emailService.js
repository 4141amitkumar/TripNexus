const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp) => {
  try {
    // Nodemailer transport configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Aap koi bhi email service use kar sakte hain
      auth: {
        user: process.env.EMAIL_USER, // process.env.EMAIL_USER - Isko .env file me add karein
        pass: process.env.EMAIL_PASS, // process.env.EMAIL_PASS - Isko .env file me add karein (App Password for Gmail)
      },
    });

    const mailOptions = {
      from: `"TripNexus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for TripNexus Verification',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
          <h2>Welcome to TripNexus!</h2>
          <p>Aapka One-Time Password (OTP) hai:</p>
          <h1 style="font-size: 3rem; letter-spacing: 0.5rem; margin: 20px; color: #007bff;">${otp}</h1>
          <p>Yeh OTP 10 minutes ke liye valid hai.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Email bhejne me error aa gaya.');
  }
};

module.exports = { sendOtpEmail };
