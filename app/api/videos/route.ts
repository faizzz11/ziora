import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const videosFilePath = path.join(process.cwd(), 'data', 'videos.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subject');
    
    const fileContents = fs.readFileSync(videosFilePath, 'utf8');
    const videosData = JSON.parse(fileContents);
    
    if (subjectName) {
      return NextResponse.json(videosData[subjectName] || { modules: [] });
    }
    
    return NextResponse.json(videosData);
  } catch (error) {
    console.error('Error reading videos:', error);
    return NextResponse.json({ error: 'Failed to read videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, videos } = await request.json();
    
    const fileContents = fs.readFileSync(videosFilePath, 'utf8');
    const videosData = JSON.parse(fileContents);
    
    videosData[subject] = videos;
    
    fs.writeFileSync(videosFilePath, JSON.stringify(videosData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Videos updated successfully' });
  } catch (error) {
    console.error('Error updating videos:', error);
    return NextResponse.json({ error: 'Failed to update videos' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { subject, moduleId, moduleData, topicId, topicData } = await request.json();
    
    const fileContents = fs.readFileSync(videosFilePath, 'utf8');
    const videosData = JSON.parse(fileContents);
    
    if (!videosData[subject]) {
      videosData[subject] = { modules: [] };
    }
    
    if (moduleData) {
      // Update or add module
      const moduleIndex = videosData[subject].modules.findIndex((mod: any) => mod.id === moduleId);
      if (moduleIndex !== -1) {
        videosData[subject].modules[moduleIndex] = { ...videosData[subject].modules[moduleIndex], ...moduleData };
      } else {
        videosData[subject].modules.push({ id: moduleId, ...moduleData });
      }
    }
    
    if (topicData && moduleId) {
      // Update or add topic within a module
      const moduleIndex = videosData[subject].modules.findIndex((mod: any) => mod.id === moduleId);
      if (moduleIndex !== -1) {
        const module = videosData[subject].modules[moduleIndex];
        if (!module.topics) module.topics = [];
        
        const topicIndex = module.topics.findIndex((topic: any) => topic.id === topicId);
        if (topicIndex !== -1) {
          module.topics[topicIndex] = { ...module.topics[topicIndex], ...topicData };
        } else {
          module.topics.push({ id: topicId, ...topicData });
        }
      }
    }
    
    fs.writeFileSync(videosFilePath, JSON.stringify(videosData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Video data updated successfully' });
  } catch (error) {
    console.error('Error updating video data:', error);
    return NextResponse.json({ error: 'Failed to update video data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { subject, moduleId, topicId } = await request.json();
    
    const fileContents = fs.readFileSync(videosFilePath, 'utf8');
    const videosData = JSON.parse(fileContents);
    
    if (videosData[subject]) {
      if (topicId && moduleId) {
        // Delete topic
        const moduleIndex = videosData[subject].modules.findIndex((mod: any) => mod.id === moduleId);
        if (moduleIndex !== -1) {
          const module = videosData[subject].modules[moduleIndex];
          module.topics = module.topics.filter((topic: any) => topic.id !== topicId);
        }
      } else if (moduleId) {
        // Delete module
        videosData[subject].modules = videosData[subject].modules.filter((mod: any) => mod.id !== moduleId);
      }
    }
    
    fs.writeFileSync(videosFilePath, JSON.stringify(videosData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Video data deleted successfully' });
  } catch (error) {
    console.error('Error deleting video data:', error);
    return NextResponse.json({ error: 'Failed to delete video data' }, { status: 500 });
  }
} 