import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const stateCollection = db.collection("state");

    // Check if user email exists in state collection
    const userState = await stateCollection.findOne({ email });

    if (userState) {
      // User is suspended or deleted
      return NextResponse.json({
        success: true,
        suspended: true,
        status: userState.status,
        reason: userState.reason,
        suspendedAt: userState.suspendedAt,
        deletedAt: userState.deletedAt
      });
    }

    // User is not in state collection, they're active
    return NextResponse.json({
      success: true,
      suspended: false,
      status: 'active'
    });

  } catch (error) {
    console.error('Error checking user state:', error);
    return NextResponse.json(
      { success: false, error: 'Error checking user state' },
      { status: 500 }
    );
  }
} 