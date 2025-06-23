import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, subject, message } = await req.json();

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const contactCollection = db.collection("contact_messages");
    const usersCollection = db.collection("users");

    // Try to find user by email to get their ID
    let userId = null;
    try {
      const user = await usersCollection.findOne({ email });
      if (user) {
        userId = user._id;
      }
    } catch (error) {
      // If user lookup fails, continue without userId
      console.log('User lookup failed, continuing without userId:', error);
    }

    // Create contact message document
    const contactMessage = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      userId: userId, // Will be null if user not found
      status: 'new', // new, in_progress, resolved
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    // Insert contact message
    const result = await contactCollection.insertOne(contactMessage);

    return NextResponse.json(
      { 
        message: 'Message sent successfully',
        contactId: result.insertedId,
        hasUserAccount: userId !== null
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Error sending message. Please try again.' },
      { status: 500 }
    );
  }
}

// GET method to retrieve contact messages (for admin purposes)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const contactCollection = db.collection("contact_messages");

    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get messages with pagination
    const messages = await contactCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await contactCollection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    return NextResponse.json(
      { error: 'Error retrieving messages' },
      { status: 500 }
    );
  }
} 