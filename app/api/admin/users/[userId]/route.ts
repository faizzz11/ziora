import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// UPDATE user (suspend, activate, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { action } = await req.json();
    const { userId } = params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");
    const stateCollection = db.collection("state");

    // Validate user ID
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // First, get the user data to access their email
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let updateData: any = { updatedAt: new Date() };

    // Determine what to update based on action
    if (action === 'update_profile') {
      // Handle profile update
      const { name, email, age, branch, year, collegeName, username } = await req.json();
      
      updateData = {
        ...(name && { name }),
        ...(email && { email }),
        ...(age && { age: parseInt(age) }),
        ...(branch && { stream: branch }), // Map to stream field in DB
        ...(year && { studyingYear: year }), // Map to studyingYear field in DB
        ...(collegeName && { collegeName }),
        ...(username && { username }),
        updatedAt: new Date()
      };
    } else {
      switch (action) {
        case 'suspend':
          updateData.suspended = true;
          updateData.status = 'suspended';
          
          // Add user email to state collection with suspended status
          await stateCollection.updateOne(
            { email: user.email },
            {
              $set: {
                email: user.email,
                status: 'suspended',
                reason: 'Account suspended by admin',
                suspendedAt: new Date(),
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
          break;
        case 'activate':
          updateData.suspended = false;
          updateData.status = 'active';
          
          // Remove user from state collection when activated
          await stateCollection.deleteOne({ email: user.email });
          break;
        case 'deactivate':
          updateData.status = 'inactive';
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }
    }

    // Update user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");
    const stateCollection = db.collection("state");

    // Validate user ID
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // First, get the user data to access their email before deletion
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Add user email to state collection with deleted status
    await stateCollection.updateOne(
      { email: user.email },
      {
        $set: {
          email: user.email,
          status: 'deleted',
          reason: 'Account deleted by admin',
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Delete user from users collection
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting user' },
      { status: 500 }
    );
  }
}

// GET single user
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    // Validate user ID
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Fetch user (excluding password)
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching user' },
      { status: 500 }
    );
  }
} 