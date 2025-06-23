import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all contact messages with filtering and pagination (Admin only)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
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

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
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

    // Get status counts
    const statusCounts = await contactCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const statusStats = {
      all: totalCount,
      new: 0,
      in_progress: 0,
      resolved: 0
    };

    statusCounts.forEach(stat => {
      if (stat._id) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count;
      }
    });

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statusStats
    });

  } catch (error) {
    console.error('Get admin contact messages error:', error);
    return NextResponse.json(
      { error: 'Error retrieving contact messages' },
      { status: 500 }
    );
  }
}

// PUT to update contact message status
export async function PUT(req: Request) {
  try {
    const { contactId, status, adminNotes } = await req.json();

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const contactCollection = db.collection("contact_messages");

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // Update contact message
    const result = await contactCollection.updateOne(
      { _id: new ObjectId(contactId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Contact message updated successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Update contact message error:', error);
    return NextResponse.json(
      { error: 'Error updating contact message' },
      { status: 500 }
    );
  }
}

// DELETE contact message
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const contactCollection = db.collection("contact_messages");

    // Delete contact message
    const result = await contactCollection.deleteOne({ 
      _id: new ObjectId(contactId) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact message error:', error);
    return NextResponse.json(
      { error: 'Error deleting contact message' },
      { status: 500 }
    );
  }
} 