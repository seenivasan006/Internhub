import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OTP } from '../models/OTP';
import { sendOTP } from '../services/mailService';
import { sendEmail } from '../services/emailService';
import { requireAuth } from '../middleware/auth';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

const setCookie = (res: Response, token: string) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
};

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate 6 digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store OTP (temporarily using password field inside OTP document for passing along, or wait - we can just store the pending user in a temp collection or require them to register again. Actually, let's keep it simple: Create user but set is_verified: false, OR only create user AFTER OTP success. Since schema doesn't have is_verified, we can only create the user AFTER OTP.
    // Wait, if we register, where do we keep the hashed password? Let's just create the user with onboarding_completed = false, and maybe an is_verified check, OR we pass the details during OTP verification.)
    // Let's create a pending user in cache, or just pass password during verify.
    return res.status(400).json({ error: 'OTP flow needs client to send password again, or we store it temporarily.' });
});

// Since we need to adjust standard OTP flow, let's just make /register send the OTP, and /verify-otp actually create the user.
router.post('/send-otp', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    await OTP.deleteMany({ email }); // Clear old
    await OTP.create({
        email,
        otp: otpCode, // In prod, we should hash this too, but plaintext for now is fine since TTL handles it
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
    });

    try {
        await sendOTP(email, otpCode, 'signup');
        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

router.post('/verify-register', async (req: Request, res: Response) => {
    const { email, otp, password, full_name, securityQuestions } = req.body;

    if (!securityQuestions || securityQuestions.length !== 3) {
        return res.status(400).json({ error: '3 security questions are required' });
    }

    const otpRecord = await OTP.findOne({ email, otp, type: 'register' });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    // Hash security question answers
    const hashedQuestions = await Promise.all(securityQuestions.map(async (q: any) => ({
        question: q.question,
        answer: await bcrypt.hash(q.answer.toLowerCase().trim(), 10)
    })));

    const user = await User.create({
        email,
        password: hashedPassword,
        full_name,
        preferred_language: 'English',
        skills: [],
        securityQuestions: hashedQuestions,
        onboarding_completed: false
    });

    await OTP.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user._id.toString());
    setCookie(res, token);

    res.json({
        message: 'Registered successfully. Please sign in.',
        redirect: '/login'
    });
});

router.post('/register-provider', async (req: Request, res: Response) => {
    const { email, password, full_name, providerProfile } = req.body;

    if (!email || !password || !full_name || !providerProfile) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            full_name,
            role: 'provider',
            approved: false, // Must be approved by admin
            providerProfile: {
                companyName: providerProfile.companyName || '',
                companyWebsite: providerProfile.companyWebsite || '',
                contactEmail: providerProfile.contactEmail || '',
                description: providerProfile.description || '',
                logo: providerProfile.logo || ''
            },
            onboarding_completed: true // Providers skip student onboarding
        });

        res.status(201).json({
            message: 'Provider registration successful. Your account is pending admin approval.',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                approved: user.approved
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: 'User not found, please register first' });
    if (!user.password) return res.status(400).json({ error: 'This account uses Google login. Please sign in with Google.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id.toString());
    setCookie(res, token);

    try {
    // Send Login Alert in background (don't block the response)
    sendEmail(
        user.email,
        'Login Alert - InternHub',
        `
          <h2>Login Successful</h2>
          <p>Hello ${user.full_name || user.email},</p>
          <p>You have successfully logged into InternHub.</p>
          <p>If this was not you, please reset your password immediately.</p>
        `
    ).catch(err => console.error('Failed to send login alert email:', err));
    } catch (err) {
        console.error('Failed to send login alert email:', err);
    }

    res.json({
        message: 'Logged in',
        redirect: user.onboarding_completed ? '/dashboard' : '/onboarding'
    });
});

router.post('/google', async (req: Request, res: Response) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload?.email) throw new Error('No email found');

        const { isRegister } = req.body; // isRegister flag

        let user = await User.findOne({ email: payload.email });

        if (isRegister) {
            // User is trying to register with Google
            if (user) {
                return res.status(400).json({ error: 'User already exists. Please sign in.' });
            }

            // Create new user if they don't exist
            user = await User.create({
                email: payload.email,
                full_name: payload.name || 'Google User',
                googleId: payload.sub,
                preferred_language: 'English',
                skills: [],
                onboarding_completed: false
            });
        }

        if (!user) {
            return res.status(404).json({
                error: 'Account not found. Please register first.',
                requireRegistration: true
            });
        }

        // Link Google ID if not already linked
        if (!user.googleId || user.googleId !== payload.sub) {
            user.googleId = payload.sub;
            await user.save();
        }

        // If user has a password, we MUST ask for it (Security Requirement)
        if (user.password) {
            return res.json({
                message: 'Password required to complete Google login',
                requirePassword: true,
                email: user.email
            });
        }

        const token = generateToken(user._id.toString());
        setCookie(res, token);

        res.json({
            message: 'Logged in successfully',
            redirect: user.onboarding_completed ? '/dashboard' : '/onboarding'
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

router.post('/google-verify', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ error: 'Invalid operation' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        const token = generateToken(user._id.toString());
        setCookie(res, token);

        res.json({
            message: 'Logged in successfully',
            redirect: user.onboarding_completed ? '/dashboard' : '/onboarding'
        });
    } catch (err) {
        console.error('Google Verify Error:', err);
        res.status(500).json({ error: 'Verification failed' });
    }
});

router.get('/me', async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const userObj = user.toObject();
        const hasPassword = !!userObj.password;
        delete userObj.password;

        res.json({ user: { ...userObj, hasPassword } });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

router.post('/set-password', requireAuth, async (req: Request, res: Response) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = (req as any).user;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        res.json({ message: 'Password set successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to set password' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// INTERNHUB_PHASE2_UPDATE: Multi-Method Recovery Flow
router.post('/check-user', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return only questions, not answers
    const questions = user.securityQuestions.map(q => q.question);
    res.json({ questions });
});

router.post('/verify-questions', async (req: Request, res: Response) => {
    const { email, answers } = req.body;
    if (!email || !answers || answers.length !== 3) {
        return res.status(400).json({ error: 'Missing email or answers' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify each answer
    for (let i = 0; i < user.securityQuestions.length; i++) {
        const isMatch = await bcrypt.compare(
            answers[i].toLowerCase().trim(),
            user.securityQuestions[i].answer
        );
        if (!isMatch) return res.status(400).json({ error: 'Security answers do not match. Please try again.' });
    }

    // Success - generate a temporary reset token valid for 15 mins
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({ resetToken });
});

router.post('/send-reset-otp', async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    await OTP.deleteMany({ email, type: 'reset' });
    await OTP.create({
        email,
        otp: otpCode,
        type: 'reset',
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    try {
        await sendOTP(email, otpCode);
        res.json({ message: 'Reset OTP sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

router.post('/verify-reset-otp', async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp, type: 'reset' });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });
    res.json({ resetToken });
});

router.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't tell them if user exists or not, just say "if it exists we sent it"
            return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
        }

        // Generate token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

        // Send Email
        await sendEmail(
            user.email,
            'InternHub Password Reset',
            `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb;">InternHub Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset your InternHub password.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>The link will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">You can also return to the login page here: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Login Page</a></p>
                <p style="font-size: 12px; color: #666;">InternHub Team</p>
            </div>
            `
        );

        res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
});

router.post('/reset-password', async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        // Hash new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
