import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    // Get all users
    const users = await usersCollection.find({}).toArray();

    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status !== 'suspended' && user.status !== 'deleted').length;
    const suspendedUsers = users.filter(user => user.status === 'suspended').length;
    
    // Calculate new users this week (assuming createdAt field exists)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = users.filter(user => 
      user.createdAt && new Date(user.createdAt) > oneWeekAgo
    ).length;

    // Transform users for the table view
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unknown',
      email: user.email,
      username: user.username || '',
      status: determineUserStatus(user),
      joinDate: formatJoinDate(user.createdAt),
      lastActive: formatLastActive(user.lastLoginAt || user.updatedAt),
      role: user.role || 'user',
      loginCount: user.loginCount || 0,
      contentViews: user.contentViews || 0,
      age: user.age || null,
      branch: user.stream || user.branch || '',
      year: user.studyingYear ? user.studyingYear.replace(/\D/g, '') : '', // Extract number from "4th Year"
      collegeName: user.collegeName || ''
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      statistics: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        newThisWeek: newUsersThisWeek
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    let updateData: any = {};

    switch (action) {
      case 'suspend':
        updateData = { 
          status: 'suspended', 
          suspendedAt: new Date(),
          suspendedBy: 'admin' // You might want to get this from session
        };
        break;
      case 'activate':
        updateData = { 
          status: 'active',
          $unset: { suspendedAt: "", suspendedBy: "" }
        };
        break;
      case 'delete':
        updateData = { 
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: 'admin'
        };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await usersCollection.updateOne(
      { _id: { $oid: userId } },
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

// Helper function to determine user status
function determineUserStatus(user: any): 'active' | 'inactive' | 'suspended' {
  // Check if user is suspended first
  if (user.suspended) return 'suspended';
  
  // Get the last activity date and ensure proper conversion
  const updatedAt = user.updatedAt ? new Date(user.updatedAt) : null;
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;
  const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
  
  const lastActivityDate = updatedAt || lastLoginAt || createdAt;
  
  // If no valid date is available, consider them active (new user)
  if (!lastActivityDate || isNaN(lastActivityDate.getTime())) {
    return 'active';
  }
  
  const daysSinceLastActivity = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastActivity > 30) return 'inactive';
  return 'active';
}

// Helper function to format last active time
function formatLastActive(date: Date | string | null | undefined): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return 'Never';
  }
  
  const parsedDate = new Date(date);
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    return 'Never';
  }
  
  const now = Date.now();
  const lastActive = parsedDate.getTime();
  const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  return parsedDate.toLocaleDateString();
}

// Helper function to format join date
function formatJoinDate(date: Date | string | null | undefined): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return 'Unknown';
  }
  
  const parsedDate = new Date(date);
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    return 'Unknown';
  }
  
  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ADD new user
export async function POST(req: Request) {
  try {
    const { name, email, password, username, age, branch, year, collegeName } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and username are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("ziora");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user document
    const userData = {
      name,
      email,
      username,
      password: hashedPassword,
      ...(age && { age: parseInt(age) }),
      ...(branch && { stream: branch }), // Map to stream field
      ...(year && { studyingYear: parseInt(year) }), // Map to studyingYear field
      ...(collegeName && { collegeName }),
      createdAt: new Date(),
      updatedAt: new Date(),
      suspended: false
    };

    // Insert user
    const result = await usersCollection.insertOne(userData);

    // Return the created user (excluding password)
    const newUser = {
      id: result.insertedId.toString(),
      name,
      email,
      username,
      status: 'active' as const,
      lastActive: formatLastActive(new Date()),
      joinDate: formatJoinDate(new Date()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      branch: branch || '',
      year: year ? parseInt(year) : undefined,
      age: age ? parseInt(age) : undefined,
      collegeName: collegeName || '',
      stats: {
        loginCount: 0,
        contentViews: 0,
      }
    };

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating user' },
      { status: 500 }
    );
  }
} 