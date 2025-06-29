import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { page, userEmail } = await req.json();
    
    if (!userEmail) {
      // User not logged in, no tracking needed
      return NextResponse.json({ success: true, message: 'Not logged in' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    // Update content views and last active time
    const result = await usersCollection.updateOne(
      { email: userEmail },
      {
        $inc: { contentViews: 1 }, // Increment content views
        $set: { 
          updatedAt: new Date(), // Update last active time
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Page visit tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking page visit:', error);
    return NextResponse.json(
      { success: false, error: 'Error tracking page visit' },
      { status: 500 }
    );
  }
} 