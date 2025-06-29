import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const stateCollection = db.collection("state");

    // Fetch all suspended/deleted users
    const suspendedUsers = await stateCollection
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      users: suspendedUsers,
      count: suspendedUsers.length
    });

  } catch (error) {
    console.error('Error fetching suspended users:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching suspended users' },
      { status: 500 }
    );
  }
}

// Remove user from state collection (restore access)
export async function DELETE(req: Request) {
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

    // Remove user from state collection
    const result = await stateCollection.deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found in state collection' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from state collection successfully'
    });

  } catch (error) {
    console.error('Error removing user from state collection:', error);
    return NextResponse.json(
      { success: false, error: 'Error removing user from state collection' },
      { status: 500 }
    );
  }
} 