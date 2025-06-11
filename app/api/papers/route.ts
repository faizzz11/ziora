import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const papersFilePath = path.join(process.cwd(), 'data', 'papers.json');

// Ensure the papers.json file exists
if (!fs.existsSync(papersFilePath)) {
  fs.writeFileSync(papersFilePath, JSON.stringify({}, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subject');
    
    const fileContents = fs.readFileSync(papersFilePath, 'utf8');
    const papersData = JSON.parse(fileContents);
    
    if (subjectName) {
      return NextResponse.json(papersData[subjectName] || { papers: [] });
    }
    
    return NextResponse.json(papersData);
  } catch (error) {
    console.error('Error reading papers:', error);
    return NextResponse.json({ error: 'Failed to read papers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, paper, papers } = body;
    
    const fileContents = fs.readFileSync(papersFilePath, 'utf8');
    const papersData = JSON.parse(fileContents);
    
    if (!papersData[subject]) {
      papersData[subject] = { papers: [] };
    }
    
    if (papers) {
      // Update entire papers array
      papersData[subject] = { papers };
    } else if (paper) {
      // Add single paper
      papersData[subject].papers.push(paper);
    }
    
    fs.writeFileSync(papersFilePath, JSON.stringify(papersData, null, 2));
    
    return NextResponse.json({ success: true, message: papers ? 'Papers updated successfully' : 'Paper added successfully' });
  } catch (error) {
    console.error('Error updating papers:', error);
    return NextResponse.json({ error: 'Failed to update papers' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { subject, paperId, paperData } = await request.json();
    
    const fileContents = fs.readFileSync(papersFilePath, 'utf8');
    const papersData = JSON.parse(fileContents);
    
    if (!papersData[subject]) {
      papersData[subject] = { papers: [] };
    }
    
    const paperIndex = papersData[subject].papers.findIndex((p: any) => p.id === paperId);
    if (paperIndex !== -1) {
      papersData[subject].papers[paperIndex] = {
        ...papersData[subject].papers[paperIndex],
        ...paperData
      };
    }
    
    fs.writeFileSync(papersFilePath, JSON.stringify(papersData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Paper updated successfully' });
  } catch (error) {
    console.error('Error updating paper:', error);
    return NextResponse.json({ error: 'Failed to update paper' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { subject, paperId } = await request.json();
    
    const fileContents = fs.readFileSync(papersFilePath, 'utf8');
    const papersData = JSON.parse(fileContents);
    
    if (papersData[subject]) {
      papersData[subject].papers = papersData[subject].papers.filter((p: any) => p.id !== paperId);
    }
    
    fs.writeFileSync(papersFilePath, JSON.stringify(papersData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return NextResponse.json({ error: 'Failed to delete paper' }, { status: 500 });
  }
} 