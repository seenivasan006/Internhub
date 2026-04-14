import nodemailer from 'nodemailer';

export const sendOTP = async (email: string, otp: string, type: 'signup' | 'reset' = 'signup') => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const subject = type === 'signup' ? 'InternHub - Verify your email' : 'InternHub - Password Reset OTP';
    const message = type === 'signup'
        ? `For signing up for InternHub, your OTP is: ${otp}`
        : `To change your password, your OTP is: ${otp}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@internhub.com',
        to: email,
        subject,
        text: `${message}\nThis code will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
};

export const sendMail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@internhub.com',
        to,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
};
