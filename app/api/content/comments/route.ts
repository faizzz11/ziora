import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Save a new comment
export async function POST(req: Request) {
  try {
    const { 
      author,
      content,
      subject,
      module,
      type, // 'notes' or 'videos'
      contentId, // Module/Topic ID
      year,
      semester,
      branch,
      userId,
      userEmail
    } = await req.json();

    if (!author || !content || !subject || !module || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ziora");
    const commentsCollection = db.collection("comments");

    // Create comment document
    const commentDoc = {
      author,
      content,
      subject,
      module,
      type,
      contentId,
      year,
      semester,
      branch,
      userId,
      userEmail,
      status: 'pending', // All comments start as pending for moderation
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      replies: [],
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert comment
    const result = await commentsCollection.insertOne(commentDoc);

    if (!result.acknowledged) {
      return NextResponse.json(
        { success: false, error: 'Failed to save comment' },
        { status: 500 }
      );
    }

    // Return the created comment with ID
    const savedComment = {
      id: result.insertedId.toString(),
      ...commentDoc,
      timestamp: formatTimestamp(commentDoc.timestamp)
    };

    return NextResponse.json({
      success: true,
      comment: savedComment,
      message: 'Comment saved successfully'
    });

  } catch (error) {
    console.error('Error saving comment:', error);
    return NextResponse.json(
      { success: false, error: 'Error saving comment' },
      { status: 500 }
    );
  }
}

// GET - Get comments for specific content
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'notes' or 'videos'
    const subject = searchParams.get('subject');
    const module = searchParams.get('module');
    const contentId = searchParams.get('contentId');
    const status = searchParams.get('status') || 'approved'; // Only show approved by default

    const client = await clientPromise;
    const db = client.db("ziora");
    const commentsCollection = db.collection("comments");

    // Build query
    const query: any = {};
    
    if (type) query.type = type;
    if (subject) query.subject = subject;
    if (module) query.module = module;
    if (contentId) query.contentId = contentId;
    if (status !== 'all') query.status = status;

    // Fetch comments
    const comments = await commentsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Transform comments
    const transformedComments = comments.map(comment => ({
      id: comment._id.toString(),
      author: comment.author,
      content: comment.content,
      timestamp: formatTimestamp(comment.timestamp || comment.createdAt),
      userId: comment.userId,
      replies: comment.replies || [],
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      likedBy: comment.likedBy || [],
      dislikedBy: comment.dislikedBy || [],
      status: comment.status
    }));

    return NextResponse.json({
      success: true,
      comments: transformedComments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching comments' },
      { status: 500 }
    );
  }
}

// PATCH - Update comment (like, dislike, reply)
export async function PATCH(req: Request) {
  try {
    const { commentId, action, userId, replyData } = await req.json();

    if (!commentId || !action) {
      return NextResponse.json(
        { success: false, error: 'Comment ID and action are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ziora");
    const commentsCollection = db.collection("comments");

    let updateQuery: any = {};

    switch (action) {
      case 'like':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID required for like action' },
            { status: 400 }
          );
        }
        
        // Toggle like
        const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
        
        if (!comment) {
          return NextResponse.json(
            { success: false, error: 'Comment not found' },
            { status: 404 }
          );
        }

        const hasLiked = comment.likedBy?.includes(userId);
        const hasDisliked = comment.dislikedBy?.includes(userId);

        if (hasLiked) {
          // Remove like
          updateQuery = {
            $inc: { likes: -1 },
            $pull: { likedBy: userId }
          };
        } else {
          // Add like and remove dislike if exists
          updateQuery = {
            $inc: { 
              likes: 1,
              ...(hasDisliked && { dislikes: -1 })
            },
            $addToSet: { likedBy: userId },
            ...(hasDisliked && { $pull: { dislikedBy: userId } })
          };
        }
        break;

      case 'dislike':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID required for dislike action' },
            { status: 400 }
          );
        }
        
        const commentForDislike = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
        
        if (!commentForDislike) {
          return NextResponse.json(
            { success: false, error: 'Comment not found' },
            { status: 404 }
          );
        }

        const hasDisliked2 = commentForDislike.dislikedBy?.includes(userId);
        const hasLiked2 = commentForDislike.likedBy?.includes(userId);

        if (hasDisliked2) {
          // Remove dislike
          updateQuery = {
            $inc: { dislikes: -1 },
            $pull: { dislikedBy: userId }
          };
        } else {
          // Add dislike and remove like if exists
          updateQuery = {
            $inc: { 
              dislikes: 1,
              ...(hasLiked2 && { likes: -1 })
            },
            $addToSet: { dislikedBy: userId },
            ...(hasLiked2 && { $pull: { likedBy: userId } })
          };
        }
        break;

      case 'reply':
        if (!replyData) {
          return NextResponse.json(
            { success: false, error: 'Reply data required' },
            { status: 400 }
          );
        }
        
        const newReply = {
          id: new ObjectId().toString(),
          author: replyData.author,
          content: replyData.content,
          timestamp: new Date(),
          userId: replyData.userId,
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
          replies: []
        };

        updateQuery = {
          $push: { replies: newReply }
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update comment
    const result = await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      updateQuery
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Comment ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating comment' },
      { status: 500 }
    );
  }
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Unknown time';
  }
  
  const now = Date.now();
  const commentTime = date.getTime();
  const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString();
} 