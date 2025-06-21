import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");
    const otpCollection = db.collection("password_reset_otps");

    // Verify OTP
    const otpRecord = await otpCollection.findOne({ 
      email, 
      otp, 
      verified: false,
      expiresAt: { $gt: new Date() } // Check if OTP hasn't expired
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password
    await usersCollection.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    // Mark OTP as verified and remove it
    await otpCollection.updateOne(
      { email, otp },
      {
        $set: {
          verified: true,
          verifiedAt: new Date()
        }
      }
    );

    // Clean up old OTP records for this email
    await otpCollection.deleteMany({
      email,
      verified: false
    });

    return NextResponse.json({
      message: 'Password reset successfully',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
} 