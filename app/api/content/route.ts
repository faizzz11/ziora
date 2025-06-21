import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// MongoDB collection name for hierarchical content
const COLLECTION_NAME = 'academic_content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    const branch = searchParams.get('branch');
    const subject = searchParams.get('subject');
    const contentType = searchParams.get('contentType'); // notes, video-lecs, pyq, etc.

    if (!year || !semester || !branch || !subject || !contentType) {
      return NextResponse.json(
        { error: 'Missing required parameters: year, semester, branch, subject, contentType' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection(COLLECTION_NAME);

    // Create the query path
    const queryPath = `${year}.sem-${semester}.${branch}.${subject}.${contentType}`;
    
    // Find the document and get the specific content
    const result = await collection.findOne({}, { projection: { [queryPath]: 1 } });
    
    // Extract the nested content
    const content = result && getNestedValue(result, queryPath.split('.'));
    
    return NextResponse.json({
      success: true,
      content: content || { modules: [] } // Default structure for empty content
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, semester, branch, subject, contentType, content } = body;

    if (!year || !semester || !branch || !subject || !contentType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: year, semester, branch, subject, contentType, content' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection(COLLECTION_NAME);

    // Create the update path
    const updatePath = `${year}.sem-${semester}.${branch}.${subject}.${contentType}`;
    
    // Use upsert to create the hierarchical structure if it doesn't exist
    const result = await collection.updateOne(
      {}, // Empty filter to work with single document approach
      {
        $set: {
          [updatePath]: content,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Content saved successfully',
      result
    });

  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, semester, branch, subject, contentType, content } = body;

    if (!year || !semester || !branch || !subject || !contentType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection(COLLECTION_NAME);

    const updatePath = `${year}.sem-${semester}.${branch}.${subject}.${contentType}`;
    
    const result = await collection.updateOne(
      {},
      {
        $set: {
          [updatePath]: content,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      result
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, semester, branch, subject, contentType } = body;

    if (!year || !semester || !branch || !subject || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection(COLLECTION_NAME);

    const deletePath = `${year}.sem-${semester}.${branch}.${subject}.${contentType}`;
    
    const result = await collection.updateOne(
      {},
      {
        $unset: {
          [deletePath]: ""
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
      result
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
} 