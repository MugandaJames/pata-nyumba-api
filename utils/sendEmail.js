const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"Real Estate System" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        })
    } catch (error) {
        console.error("Email Error:", error);
        throw error;
    }
}

const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;


    const html = `
       <div style="font-family: Arial, sans-serif; max-width:600px; margin: 0 auto;">
          <h2> Welcome to Real Estate System, ${user.firstName}!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}"
             style="background-color: #4CAF50; color:white; padding: 14px 20px;
                   text-decoration: none; border-radius: 4px; display: inline-block;">
             Verify Email
          </a>
          <p>This link expires in <strong>24 hours.</strong></p>
          <p>If you did not create an account, ignore this email.</p>
        </div> 
    `;

    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html,
    });
};


const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;


    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.firstName}, you requested to reset password.</p>
        <a href = "${resetUrl}"
           style = "background-color: #008CBA; color: white; padding: 14px 20px;
                text-decoration: none; border-radius: 4px; display: inline-block;">
            
            Reset Password
        </a>
        <p> This link expires in <strong>10 minutes.</strong></p>
        <p> If you did not request this, ignore this email.</p>
      </div>
    `;
    
    await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html,
    });
};




const sendApprovalEmail = async (user) => {
    const isApproved = user.approvalStatus === 'approved';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2>Account ${isApproved ? 'Approved' : 'Rejected'}</h2>
         <p>Hi ${user.firstName}, </p>
         ${isApproved
            ? `<p>Your account has been <strong>Approved</strong> You can now log in.</p>`
            : `<p>Your account has been <strong>Rejected.</strong>Contact support for more information.</p>`
        }
      </div>
    `;

    await sendEmail({
        to: user.email,
        subject: `Account ${isApproved ? 'Approved' : 'Rejected'}`,
        html,
    });
};



module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApprovalEmail,
};