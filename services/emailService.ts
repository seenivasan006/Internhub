import nodemailer from 'nodemailer';

const createTransporter = () => {
    const isSecure = process.env.SMTP_PORT === '465';
    
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: isSecure, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 15000,
        socketTimeout: 30000,
        debug: true,
        logger: true
    });
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    console.log(`📧 Attempting to send custom email to ${to}...`);
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.SMTP_FROM || 'internhub.org@gmail.com',
        to,
        subject,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ FAILED to send email:', error);
        throw error;
    }
};
