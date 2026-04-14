import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function testEmail() {
    try {
        console.log("Testing auth with:", process.env.SMTP_USER);
        await transporter.verify();
        console.log("SMTP Connection verified successfully!");

        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@internhub.com',
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email - InternHub',
            text: `This is a test email to verify SMTP configuration.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Test email sent success:", info.messageId);
        process.exit(0);
    } catch (err) {
        console.error("SMTP error:", err);
        process.exit(1);
    }
}

testEmail();
