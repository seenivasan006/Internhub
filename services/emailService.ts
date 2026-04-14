import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@internhub.com',
        to,
        subject,
        html,
    });

    console.log('📧 Email sent:', info.messageId);
};
