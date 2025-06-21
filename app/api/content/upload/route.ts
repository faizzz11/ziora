import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const COLLECTION_NAME = 'academic_content';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const year = formData.get('year') as string;
    const semester = formData.get('semester') as string;
    const branch = formData.get('branch') as string;
    const subject = formData.get('subject') as string;
    const contentType = formData.get('contentType') as string; // video-lecs, notes, etc.
    const moduleId = formData.get('moduleId') as string;
    const topicId = formData.get('topicId') as string;
    
    // Handle video file upload (if any)
    const videoFile = formData.get('video') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string; // URL for external videos
    
    if (!year || !semester || !branch || !subject || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection(COLLECTION_NAME);

    // Create the content structure
    const newTopic = {
      id: topicId || `topic-${Date.now()}`,
      title: title || 'New Video Topic',
      videoUrl: videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: description || 'Video description here',
      duration: '15:30', // Default duration
      uploadedAt: new Date()
    };

    // Build the update path
    const updatePath = `${year}.sem-${semester}.${branch}.${subject}.${contentType}`;
    
    // Get existing content
    const existingDoc = await collection.findOne({}, { projection: { [updatePath]: 1 } });
    const existingContent = existingDoc && getNestedValue(existingDoc, updatePath.split('.'));
    
    let updatedContent;
    if (existingContent && existingContent.modules) {
      // Add to existing modules
      const moduleIndex = existingContent.modules.findIndex((m: any) => m.id === moduleId);
      if (moduleIndex >= 0) {
        // Add to existing module
        existingContent.modules[moduleIndex].topics.push(newTopic);
      } else {
        // Create new module
        existingContent.modules.push({
          id: moduleId || `module-${Date.now()}`,
          name: `Module ${existingContent.modules.length + 1}`,
          topics: [newTopic]
        });
      }
      updatedContent = existingContent;
    } else {
      // Create new content structure
      updatedContent = {
        modules: [{
          id: moduleId || `module-${Date.now()}`,
          name: 'Module 1',
          topics: [newTopic]
        }]
      };
    }

    // Save to MongoDB
    await collection.updateOne(
      {},
      {
        $set: {
          [updatePath]: updatedContent,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Video content uploaded successfully',
      topic: newTopic
    });

  } catch (error) {
    console.error('Error uploading video content:', error);
    return NextResponse.json(
      { error: 'Failed to upload video content' },
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