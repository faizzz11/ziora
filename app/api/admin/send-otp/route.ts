import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Get admin emails from environment variables
const ADMIN_EMAILS = [
  process.env.EMAIL_USER1,
  process.env.EMAIL_USER2,
  process.env.EMAIL_USER3
].filter(Boolean) as string[]; // Filter out any undefined values

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Validate admin credentials using environment variables
    if (username !== process.env.ADMIN_ID || password !== process.env.ADMIN_PASS) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const adminOtpCollection = db.collection("admin_otps");
    const adminsCollection = db.collection("admins");

    // Store admin emails in MongoDB if they don't exist
    for (const email of ADMIN_EMAILS) {
      await adminsCollection.updateOne(
        { email },
        {
          $set: {
            email,
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP in database with expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    await adminOtpCollection.updateOne(
      { username },
      {
        $set: {
          username,
          otp,
          expiresAt,
          createdAt: new Date(),
          verified: false,
          adminEmails: ADMIN_EMAILS
        }
      },
      { upsert: true }
    );

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send OTP to all admin emails
    const emailPromises = ADMIN_EMAILS.map(async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Admin Access OTP - Ziora Dashboard",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Ziora Admin</h1>
              <p style="color: #d1d5db; margin: 5px 0 0 0;">Administrative Access Portal</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Admin Dashboard Access Request</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
                <strong>Security Alert:</strong><br><br>
                Someone is requesting access to the Ziora Admin Dashboard. 
                If this was you, use the verification code below to complete the login process.
              </p>
              
              <div style="background: white; border: 3px solid #ef4444; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                <h3 style="color: #1f2937; margin-bottom: 15px;">🚨 Admin Verification Code</h3>
                <div style="font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 8px; font-family: monospace; margin: 15px 0;">
                  ${otp}
                </div>
                <p style="color: #6b7280; margin-top: 15px; font-size: 14px;">⏰ This code expires in 10 minutes</p>
              </div>
              
              <div style="background: #fee2e2; border: 2px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="color: #991b1b; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important Security Notice:</strong><br>
                  • Only authorized administrators should have access to this code<br>
                  • If you didn't request admin access, please contact the system administrator immediately<br>
                  • Never share this OTP with anyone<br>
                  • This is a high-privilege access request
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #4b5563; font-size: 14px;">
                  <strong>Requested by:</strong> Admin User (${username})<br>
                  <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                  <strong>IP Access:</strong> Admin Dashboard Login
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin-top: 25px;">
                Best regards,<br>
                <strong>Ziora Security System</strong>
              </p>
            </div>
            
            <div style="background: #1f2937; padding: 15px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                🔒 © 2024 Ziora Educational Platform • Admin Security Protocol
              </p>
            </div>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return NextResponse.json({
      message: 'OTP sent successfully to all admin emails',
      success: true,
      adminEmailCount: ADMIN_EMAILS.length
    });

  } catch (error) {
    console.error('Admin OTP send error:', error);
    return NextResponse.json(
      { error: 'Failed to send admin OTP. Please try again.' },
      { status: 500 }
    );
  }
} 