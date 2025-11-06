const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendWelcomeEmail = async (email) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to Our Newsletter! 🎉</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive:</p>
          <ul>
            <li>Latest product updates</li>
            <li>Exclusive offers and discounts</li>
            <li>Fashion tips and trends</li>
            <li>Early access to sales</li>
          </ul>
          <p>We're excited to have you as part of our community!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you wish to unsubscribe, simply reply to this email with "UNSUBSCRIBE".
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

module.exports = {
  sendWelcomeEmail
};