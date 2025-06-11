import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const experimentsFilePath = path.join(process.cwd(), 'data', 'experiments.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subject');
    
    const fileContents = fs.readFileSync(experimentsFilePath, 'utf8');
    const experimentsData = JSON.parse(fileContents);
    
    if (subjectName) {
      return NextResponse.json(experimentsData[subjectName] || []);
    }
    
    return NextResponse.json(experimentsData);
  } catch (error) {
    console.error('Error reading experiments:', error);
    return NextResponse.json({ error: 'Failed to read experiments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, experiments } = await request.json();
    
    const fileContents = fs.readFileSync(experimentsFilePath, 'utf8');
    const experimentsData = JSON.parse(fileContents);
    
    experimentsData[subject] = experiments;
    
    fs.writeFileSync(experimentsFilePath, JSON.stringify(experimentsData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Experiments updated successfully' });
  } catch (error) {
    console.error('Error updating experiments:', error);
    return NextResponse.json({ error: 'Failed to update experiments' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { subject, experimentNo, experimentData } = await request.json();
    
    const fileContents = fs.readFileSync(experimentsFilePath, 'utf8');
    const experimentsData = JSON.parse(fileContents);
    
    if (experimentsData[subject]) {
      const experimentIndex = experimentsData[subject].findIndex((exp: any) => exp.experimentNo === experimentNo);
      if (experimentIndex !== -1) {
        experimentsData[subject][experimentIndex] = { ...experimentsData[subject][experimentIndex], ...experimentData };
      } else {
        experimentsData[subject].push(experimentData);
      }
    } else {
      experimentsData[subject] = [experimentData];
    }
    
    fs.writeFileSync(experimentsFilePath, JSON.stringify(experimentsData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Experiment updated successfully' });
  } catch (error) {
    console.error('Error updating experiment:', error);
    return NextResponse.json({ error: 'Failed to update experiment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { subject, experimentNo } = await request.json();
    
    const fileContents = fs.readFileSync(experimentsFilePath, 'utf8');
    const experimentsData = JSON.parse(fileContents);
    
    if (experimentsData[subject]) {
      experimentsData[subject] = experimentsData[subject].filter((exp: any) => exp.experimentNo !== experimentNo);
    }
    
    fs.writeFileSync(experimentsFilePath, JSON.stringify(experimentsData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Experiment deleted successfully' });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    return NextResponse.json({ error: 'Failed to delete experiment' }, { status: 500 });
  }
} 