import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
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
        { error: 'Invalid or expired OTP. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      success: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
} 