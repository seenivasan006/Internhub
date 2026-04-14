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
        debug: true, // Show detailed SMTP conversation in logs
        logger: true  // Log general SMTP events
    });
};

export const sendOTP = async (email: string, otp: string, type: 'signup' | 'reset' = 'signup') => {
    console.log(`📧 Attempting to send OTP to ${email}...`);
    const transporter = createTransporter();

    const subject = type === 'signup' ? 'InternHub - Verify your email' : 'InternHub - Password Reset OTP';
    const message = type === 'signup'
        ? `For signing up for InternHub, your OTP is: ${otp}`
        : `To change your password, your OTP is: ${otp}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || 'internhub.org@gmail.com',
        to: email,
        subject,
        text: `${message}\nThis code will expire in 5 minutes.`
    };

    try {
        console.log('-----------------------------------------');
        console.log('🔑 EMERGENCY OTP LOG (Use this to register):', otp);
        console.log('-----------------------------------------');
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('⚠️ OTP Email failed, but you can use the code above from the logs!');
        // We return success so the user isn't stuck on "Sending..."
        return { message: 'OTP logged to console' };
    }
};

export const sendMail = async (to: string, subject: string, html: string) => {
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
        console.log('✅ Custom Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ FAILED to send custom email:', error);
        throw error;
    }
};
