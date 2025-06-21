import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { username, otp } = await req.json();

    if (!username || !otp) {
      return NextResponse.json(
        { error: 'Username and OTP are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const adminOtpCollection = db.collection("admin_otps");
    const adminSessionsCollection = db.collection("admin_sessions");

    // Verify OTP
    const otpRecord = await adminOtpCollection.findOne({ 
      username, 
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

    // Mark OTP as verified
    await adminOtpCollection.updateOne(
      { username, otp },
      {
        $set: {
          verified: true,
          verifiedAt: new Date()
        }
      }
    );

    // Create admin session
    const sessionId = `admin_${username}_${Date.now()}`;
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await adminSessionsCollection.updateOne(
      { username },
      {
        $set: {
          sessionId,
          username,
          role: 'admin',
          isActive: true,
          loginTime: new Date(),
          expiresAt: sessionExpiry,
          lastActivity: new Date()
        }
      },
      { upsert: true }
    );

    // Clean up old OTP records for this admin
    await adminOtpCollection.deleteMany({
      username,
      verified: false
    });

    // Create admin user object that mimics a regular user login
    const adminUser = {
      _id: `admin_${Date.now()}`,
      username,
      name: 'Administrator',
      email: 'admin@ziora.com',
      role: 'admin',
      sessionId,
      loginTime: new Date(),
      permissions: ['dashboard', 'content_management', 'user_management'],
      isAdmin: true
    };

    // Create response with admin session
    const response = NextResponse.json({
      message: 'Admin login successful',
      success: true,
      admin: adminUser,
      user: adminUser // Also set as user for compatibility
    });

    // Set both admin session and user session cookies for compatibility
    response.cookies.set('admin_session', JSON.stringify(adminUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    // Set user cookie to mimic regular login
    response.cookies.set('user', JSON.stringify(adminUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Admin OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify admin OTP. Please try again.' },
      { status: 500 }
    );
  }
} 