import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { compare } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { usernameOrEmail, password } = await req.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    // Find user by username or email
    const user = await usersCollection.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      );
    }

    // Update login count and last active time
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $inc: { loginCount: 1 }, // Increment login count
        $set: { 
          updatedAt: new Date(), // Update last active time
          lastLoginAt: new Date()
        }
      }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

    // Set cookie
    response.cookies.set('user', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error during login' },
      { status: 500 }
    );
  }
} 